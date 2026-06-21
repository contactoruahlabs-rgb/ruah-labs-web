// RUAH LABS — API Server (Mercado Pago + órdenes)
// Puerto: 3001  |  Iniciar: node scripts/api-server.cjs

const express = require('express');
const fs      = require('fs');
const path    = require('path');
const bcrypt  = require('bcrypt');
var _crypto = require('crypto');

// ─── Cargar .env.local ───────────────────────────────────────────────────────
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(function(line) {
    var eq = line.indexOf('=');
    if (eq > 0) {
      var k = line.slice(0, eq).trim();
      var v = line.slice(eq + 1).trim();
      if (k && !process.env[k]) process.env[k] = v;
    }
  });
}

var MP_TOKEN          = process.env.MERCADOPAGO_ACCESS_TOKEN || '';
var SITE_URL          = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:8000';
var IS_DEV            = !MP_TOKEN.startsWith('APP_USR-');
var MP_WEBHOOK_SECRET = process.env.MERCADOPAGO_WEBHOOK_SECRET || '';
var _processedPayments = new Set();

// ─── Transbank Webpay Plus ────────────────────────────────────────────────────
var _tb = null;
try { _tb = require('transbank-sdk'); } catch(e) { console.warn('[TB] transbank-sdk no disponible'); }
var TB_COMMERCE_CODE = process.env.TRANSBANK_COMMERCE_CODE || '';
var TB_API_KEY       = process.env.TRANSBANK_API_KEY       || '';
var TB_IS_PROD       = !!(TB_COMMERCE_CODE && TB_API_KEY);
var API_BASE         = process.env.API_BASE_URL || 'https://patient-benevolence-production.up.railway.app';
// Órdenes pendientes: token_ws → datos (expiran en 30 min)
var _pendingTB = new Map();
setInterval(function() {
  var now = Date.now();
  _pendingTB.forEach(function(v, k) { if (v._exp < now) _pendingTB.delete(k); });
}, 5 * 60 * 1000);
function tbTx() {
  if (!_tb) throw new Error('transbank-sdk no instalado');
  var env  = TB_IS_PROD ? _tb.Environment.Production     : _tb.Environment.Integration;
  var code = TB_IS_PROD ? TB_COMMERCE_CODE               : _tb.IntegrationCommerceCodes.WEBPAY_PLUS;
  var key  = TB_IS_PROD ? TB_API_KEY                     : _tb.IntegrationApiKeys.WEBPAY_PLUS;
  return new _tb.WebpayPlus.Transaction(new _tb.Options(code, key, env));
}
var ADMIN_LOGIN_EMAIL = 'contacto.ruahlabs@gmail.com';
// Cache de tokens ya validados (2 min) — evita pegarle a Supabase en cada request.
// SEGURIDAD: la única forma de ser admin es un JWT válido de Supabase Auth.
// Se eliminó el bypass por llave estática (x-admin-key == ADMIN_API_KEY): un solo
// string filtrable concedía control total. Ahora la firma del JWT es obligatoria.
var _adminTokCache = {}; // token -> validUntil(ms)
async function isAdmin(token) {
  if (!token) return false;
  var now = Date.now();
  if (_adminTokCache[token] && now < _adminTokCache[token]) return true;
  try {
    // Validar el JWT contra Supabase Auth: esto verifica la FIRMA y la expiración.
    // (Decodificar el payload localmente NO es seguro: un atacante puede falsificarlo.)
    var r = await sbRequest('GET', SB_URL + '/auth/v1/user', {
      'apikey': SB_SVC,
      'Authorization': 'Bearer ' + token,
    });
    if (r.status === 200 && r.data && r.data.email === ADMIN_LOGIN_EMAIL) {
      _adminTokCache[token] = now + 2 * 60 * 1000;
      // Limpieza simple para que el cache no crezca sin límite
      if (Object.keys(_adminTokCache).length > 50) {
        Object.keys(_adminTokCache).forEach(function(t) { if (_adminTokCache[t] < now) delete _adminTokCache[t]; });
      }
      return true;
    }
  } catch(e) { console.error('[isAdmin] error:', e.message); }
  return false;
}

// Cloudinary — CLOUDINARY_URL siempre tiene prioridad sobre vars separadas
var CLD_CLOUD  = process.env.CLOUDINARY_CLOUD_NAME  || 'dh05zwrbp';
var CLD_KEY    = process.env.CLOUDINARY_API_KEY      || '';
var CLD_SECRET = process.env.CLOUDINARY_API_SECRET   || '';
if (process.env.CLOUDINARY_URL) {
  var _cldUrl = process.env.CLOUDINARY_URL.replace('cloudinary://', '');
  var _cldAt  = _cldUrl.indexOf('@');
  if (_cldAt > 0) {
    var _cldColon = _cldUrl.indexOf(':');
    CLD_KEY    = _cldUrl.slice(0, _cldColon);
    CLD_SECRET = _cldUrl.slice(_cldColon + 1, _cldAt);
    CLD_CLOUD  = _cldUrl.slice(_cldAt + 1) || CLD_CLOUD;
  }
}

// Club password (bcrypt) — puede arrancar desde CLUB_PASSWORD en texto plano
var CLUB_PWD_HASH = process.env.CLUB_PASSWORD_HASH || '';
if (!CLUB_PWD_HASH && process.env.CLUB_PASSWORD) {
  bcrypt.hash(process.env.CLUB_PASSWORD, 10).then(function(h) {
    CLUB_PWD_HASH = h;
    console.log('✅ CLUB_PASSWORD_HASH generado (cópialo en Railway):', h);
  });
}

// Respuesta de error genérica: registra el detalle real en el log del servidor
// pero NUNCA lo expone al cliente (evita fuga de errores internos / DB).
function srvErr(res, err, code) {
  console.error('[srv-error]', (err && err.message) || err);
  if (!res.headersSent) res.status(code || 500).json({ error: 'Error del servidor. Intenta más tarde.' });
}

// Validación básica de formato de email
function isValidEmail(e) {
  return typeof e === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) && e.length <= 254;
}

// Escape HTML para emails (evita inyección en plantillas HTML)
function esc(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function cap(str) {
  return String(str || '').toLowerCase().replace(/(?:^|\s)\S/g, function(c){ return c.toUpperCase(); });
}
function formatDate(iso) {
  try {
    var d = new Date(iso);
    var days   = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
    var months = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
    return days[d.getDay()] + ' ' + d.getDate() + ' de ' + months[d.getMonth()] + ' ' + d.getFullYear() +
           ' · ' + String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0') + ' hrs';
  } catch(e) { return iso || '—'; }
}
function formatPM(pmId, pmType) {
  var brand = { visa:'Visa', master:'Mastercard', redcompra:'Redcompra', amex:'American Express', debvisa:'Visa Débito', debmaster:'Mastercard Débito', debitocc:'Débito' }[pmId] || cap(pmId || '');
  var type  = pmType === 'debit_card' ? ' Débito' : pmType === 'credit_card' ? ' Crédito' : pmType === 'bank_transfer' ? ' Transferencia' : '';
  var result = (brand + (brand && type && !brand.toLowerCase().includes(type.trim().toLowerCase()) ? type : '')).trim();
  return result || 'MercadoPago';
}
function buildOrderInfo(orderId, opts, firstName, lastName, cart) {
  var qty  = (cart || []).reduce(function(s, it){ return s + (it.qty || 1); }, 0);
  var addr = [opts.address, opts.address2].filter(Boolean).join(', ');
  if (opts.city)   addr += (addr ? ', ' : '') + cap(opts.city);
  if (opts.region) addr += (addr ? ', ' : '') + opts.region;
  var rows = [
    ['N° de Orden',    orderId || '—'],
    ['Fecha y hora',   formatDate(opts.purchaseDate)],
    ['Cliente',        [firstName, lastName].filter(Boolean).join(' ') || '—'],
    ['Dirección',      addr || '—'],
    ['Teléfono',       opts.phone || '—'],
    ['Método de pago', opts.paymentMethod || 'MercadoPago'],
    ['Despacho',       opts.shippingName || '—'],
    ['Cantidad',       qty + (qty === 1 ? ' producto' : ' productos')],
  ];
  return rows.map(function(r) {
    return '<tr>' +
      '<td style="padding:7px 20px 7px 0;color:#888;font-size:11px;letter-spacing:1px;white-space:nowrap;vertical-align:top;border-bottom:1px solid #1e1e1e;">' + esc(r[0].toUpperCase()) + '</td>' +
      '<td style="padding:7px 0;color:#fff;font-size:13px;vertical-align:top;border-bottom:1px solid #1e1e1e;">' + esc(String(r[1])) + '</td>' +
    '</tr>';
  }).join('');
}

if (!MP_TOKEN || MP_TOKEN === 'YOUR_MERCADOPAGO_ACCESS_TOKEN') {
  console.warn('⚠️  MERCADOPAGO_ACCESS_TOKEN no configurado en .env.local');
}

// ─── Helper fetch → MP API ────────────────────────────────────────────────────
function mpPost(endpoint, body) {
  return fetch('https://api.mercadopago.com' + endpoint, {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + MP_TOKEN,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  }).then(function(r) {
    return r.json().then(function(b) { return { status: r.status, body: b }; });
  });
}

// Consulta un pago en MercadoPago (verifica que sea real y aprobado)
function mpGetPayment(paymentId) {
  return fetch('https://api.mercadopago.com/v1/payments/' + encodeURIComponent(paymentId), {
    headers: { 'Authorization': 'Bearer ' + MP_TOKEN },
  }).then(function(r) {
    return r.json().then(function(b) { return { status: r.status, body: b }; });
  });
}

// ─── Express ─────────────────────────────────────────────────────────────────
var app = express();
// Railway pone exactamente 1 proxy delante. Con esto req.ip es la IP real del
// cliente (el último hop de confianza) y NO un X-Forwarded-For falsificable.
app.set('trust proxy', 1);
app.use('/api/content', express.json({ limit: '4mb' })); // solo admin-content necesita 4MB
app.use(express.json({ limit: '256kb' }));

// ─── CORS ─────────────────────────────────────────────────────────────────────
var ALLOWED_ORIGINS = [
  SITE_URL,
  'https://ruahlabs.cl',
  'https://www.ruahlabs.cl',
  'https://ruah-labs-web.contacto-ruahlabs.workers.dev',
  'http://localhost:8000',
  'http://localhost:3000',
].filter(function(o) { return !!o; });

// Orígenes extra desde env (coma-separados), por si cambia el subdominio de Cloudflare
(process.env.EXTRA_ORIGINS || '').split(',').forEach(function(o) {
  o = o.trim(); if (o) ALLOWED_ORIGINS.push(o);
});

function isAllowedOrigin(origin) {
  return ALLOWED_ORIGINS.indexOf(origin) !== -1;
}

app.use(function(req, res, next) {
  var origin = req.headers.origin || '';
  if (isAllowedOrigin(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  } else if (!origin) {
    // same-origin o server-to-server
    res.setHeader('Access-Control-Allow-Origin', SITE_URL || 'null');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,x-admin-key');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// ─── Rate limiter simple (en memoria) ────────────────────────────────────────
var _rlStore = {};
setInterval(function() {
  var cutoff = Date.now() - 15 * 60 * 1000;
  Object.keys(_rlStore).forEach(function(k) { if (_rlStore[k].start < cutoff) delete _rlStore[k]; });
}, 5 * 60 * 1000);

function rateLimit(key, maxReqs, windowMs) {
  return function(req, res, next) {
    // req.ip viene de Express con trust proxy=1 → IP real, no spoofeable vía XFF.
    var ip = req.ip || req.socket.remoteAddress || 'anon';
    var k  = key + ':' + ip;
    var now = Date.now();
    if (!_rlStore[k] || now - _rlStore[k].start > windowMs) {
      _rlStore[k] = { count: 1, start: now };
    } else {
      _rlStore[k].count++;
    }
    if (_rlStore[k].count > maxReqs) {
      return res.status(429).json({ error: 'Demasiados intentos. Espera unos minutos.' });
    }
    next();
  };
}

// ─── Helpers de precios ───────────────────────────────────────────────────────
var DEFAULT_SHIP_FEES = { std: 4990, express: 9990, pickup: 0 };
var VALID_DISCOUNT_CODES = { 'BIENVENIDO10': 10 };

function getContentPrices() {
  if (!SB_URL || !SB_SVC) return Promise.resolve({ prices: {}, shipping: DEFAULT_SHIP_FEES });
  return sbFetch('GET', 'content', { query: 'key=eq.main&select=data&limit=1' })
    .then(function(r) {
      var row = Array.isArray(r.data) ? r.data[0] : null;
      if (!row || !row.data) return { prices: {}, shipping: DEFAULT_SHIP_FEES };
      var items = ((row.data.products && row.data.products.items) || [])
        .concat((row.data.cuadros && row.data.cuadros.products) || []);
      var prices = {};
      items.forEach(function(p) {
        if (p.id) prices[p.id] = parseInt(String(p.price || '0').replace(/[^0-9]/g, ''), 10) || 0;
      });
      var s = row.data.checkout && row.data.checkout.shippingFees;
      var shipping = {
        std:     (s && typeof s.std     === 'number') ? s.std     : DEFAULT_SHIP_FEES.std,
        express: (s && typeof s.express === 'number') ? s.express : DEFAULT_SHIP_FEES.express,
        pickup:  (s && typeof s.pickup  === 'number') ? s.pickup  : DEFAULT_SHIP_FEES.pickup,
      };
      return { prices, shipping };
    })
    .catch(function() { return { prices: {}, shipping: DEFAULT_SHIP_FEES }; });
}

// ─── POST /api/checkout/create-preference ────────────────────────────────────
app.post('/api/checkout/create-preference', rateLimit('checkout', 10, 60 * 1000), function(req, res) {
  var cart           = req.body.cart           || [];
  var info           = req.body.info           || {};
  var shippingMethod = req.body.shippingMethod || 'std';
  var discount       = req.body.discount       || null;

  if (!cart.length) return res.status(400).json({ error: 'Carrito vacío' });

  getContentPrices().then(function(result) {
    var priceMap = result.prices;
    var fees     = result.shipping;
    // Shipping fee validado en servidor (ignoramos lo que manda el frontend)
    var shipFee  = fees.hasOwnProperty(shippingMethod) ? fees[shippingMethod] : fees.std;

    // SEGURIDAD (fail-closed): el precio SIEMPRE sale de la DB del servidor.
    // Si no hay precios (DB caída/vacía) NO confiamos en el precio del cliente
    // — rechazamos el pago en vez de arriesgar un subpago.
    if (Object.keys(priceMap).length === 0) {
      console.error('[create-preference] sin precios en DB — pago rechazado (fail-closed)');
      return res.status(503).json({ error: 'No se pudieron validar los precios. Intenta de nuevo en unos minutos.' });
    }

    var items = cart.map(function(it) {
      var price = priceMap[it.id];
      if (price === undefined) {
        console.warn('[create-preference] producto no encontrado en DB:', it.id);
        return null; // rechazar ítem desconocido
      }
      return {
        id:          String(it.id),
        title:       it.name || 'Producto RUAH LABS',
        quantity:    Math.max(1, parseInt(it.qty, 10) || 1),
        unit_price:  price,
        currency_id: 'CLP',
      };
    }).filter(Boolean);

    if (items.length !== cart.length) {
      return res.status(400).json({ error: 'Precio o producto inválido' });
    }

    // Descuento validado en servidor (el cliente no puede falsificar el monto)
    var discPct = (discount && VALID_DISCOUNT_CODES[String(discount).toUpperCase()]) || 0;
    if (discPct > 0) {
      var subTot  = items.reduce(function(s, it) { return s + it.unit_price * it.quantity; }, 0);
      var discAmt = Math.round(subTot * discPct / 100);
      if (discAmt > 0) {
        items.push({ id: 'descuento', title: 'Descuento ' + String(discount).toUpperCase(), quantity: 1, unit_price: -discAmt, currency_id: 'CLP' });
      }
    }

    if (shipFee > 0) {
      items.push({ id: 'shipping', title: 'Envío', quantity: 1, unit_price: shipFee, currency_id: 'CLP' });
    }

    var prefBody = {
      items:     items,
      statement_descriptor: 'RUAH LABS',
      external_reference:   'RUAH-' + Date.now(),
      metadata: { discount_code: discount },
    };

    if (SITE_URL && !SITE_URL.includes('localhost')) {
      prefBody.back_urls = {
        success: SITE_URL + '/?payment=success',
        failure: SITE_URL + '/?payment=failure',
        pending: SITE_URL + '/?payment=pending',
      };
      prefBody.auto_return = 'approved';
    }

    return mpPost('/checkout/preferences', prefBody).then(function(r) {
      if (r.status >= 400) {
        console.error('[MP]', r.status, JSON.stringify(r.body));
        return res.status(r.status).json({ error: r.body.message || 'MP error' });
      }
      var init = IS_DEV ? r.body.sandbox_init_point : r.body.init_point;
      res.json({ init_point: init, preference_id: r.body.id });
    });
  }).catch(function(err) {
    console.error('[MP Network Error]', err.message);
    srvErr(res, err);
  });
});

// ─── POST /api/checkout/create-transaction (Transbank Webpay Plus) ───────────
app.post('/api/checkout/create-transaction', rateLimit('checkout', 10, 60 * 1000), function(req, res) {
  if (!_tb) return res.status(503).json({ error: 'Pasarela Transbank no disponible' });
  var cart           = req.body.cart           || [];
  var info           = req.body.info           || {};
  var shippingMethod = req.body.shippingMethod || 'std';
  var shippingName   = req.body.shippingName   || 'Envío';
  var discount       = req.body.discount       || null;
  var totalGrams     = parseInt(req.body.totalGrams) || 0;
  var weightCat      = req.body.weightCat      || null;

  if (!cart.length) return res.status(400).json({ error: 'Carrito vacío' });

  getContentPrices().then(function(result) {
    var priceMap = result.prices;
    var fees     = result.shipping;
    var shipFee  = fees.hasOwnProperty(shippingMethod) ? fees[shippingMethod] : fees.std;

    if (Object.keys(priceMap).length === 0) {
      console.error('[create-transaction] sin precios en DB');
      return res.status(503).json({ error: 'No se pudieron validar los precios.' });
    }

    var items = cart.map(function(it) {
      var price = priceMap[it.id];
      if (price === undefined) return null;
      return { id: String(it.id), title: it.name || 'Producto', quantity: Math.max(1, parseInt(it.qty, 10) || 1), unit_price: price };
    }).filter(Boolean);

    if (items.length !== cart.length) return res.status(400).json({ error: 'Precio o producto inválido' });

    var subtotal = items.reduce(function(s, it) { return s + it.unit_price * it.quantity; }, 0);
    var discPct  = (discount && VALID_DISCOUNT_CODES[String(discount).toUpperCase()]) || 0;
    var discAmt  = discPct > 0 ? Math.round(subtotal * discPct / 100) : 0;
    var total    = Math.max(50, subtotal - discAmt + shipFee);

    var buyOrder  = 'RL' + _crypto.randomBytes(4).toString('hex').toUpperCase().slice(0, 6);
    var sessionId = 'S'  + _crypto.randomBytes(8).toString('hex');
    var returnUrl = API_BASE + '/api/checkout/transbank-return';

    tbTx().create(buyOrder, sessionId, total, returnUrl)
      .then(function(r) {
        _pendingTB.set(r.token, {
          _exp:           Date.now() + 30 * 60 * 1000,
          buyOrder:       buyOrder,
          email:          (info.email    || '').trim().toLowerCase(),
          firstName:      cap(info.firstName || ''),
          lastName:       cap(info.lastName  || ''),
          phone:          info.phone    || '',
          address:        info.address  || '',
          address2:       info.address2 || '',
          city:           info.city     || '',
          region:         info.region   || '',
          cart:           cart,
          items:          items,
          subtotal:       subtotal,
          discount:       discount ? String(discount).toUpperCase() : null,
          discountAmount: discAmt,
          shippingMethod: shippingMethod,
          shippingName:   shippingName,
          shippingFee:    shipFee,
          total:          total,
          totalGrams:     totalGrams,
          weightCat:      weightCat,
        });
        console.log('[TB create]', buyOrder, 'total:', total);
        res.json({ token: r.token, url: r.url });
      })
      .catch(function(err) {
        console.error('[TB create error]', err.message);
        res.status(500).json({ error: 'Error al iniciar pago: ' + err.message });
      });
  }).catch(function(err) {
    console.error('[TB prices error]', err.message);
    res.status(500).json({ error: 'Error interno' });
  });
});

// ─── POST /api/checkout/transbank-return ─────────────────────────────────────
app.post('/api/checkout/transbank-return', express.urlencoded({ extended: false }), function(req, res) {
  var token = req.body.token_ws;

  if (!token) {
    console.warn('[TB return] sin token_ws — usuario canceló');
    return res.redirect(SITE_URL + '/?payment=failure');
  }

  tbTx().commit(token).then(function(r) {
    if (r.response_code !== 0) {
      _pendingTB.delete(token);
      console.warn('[TB commit] rechazado, response_code:', r.response_code);
      return res.redirect(SITE_URL + '/?payment=failure');
    }

    var p = _pendingTB.get(token) || {};
    _pendingTB.delete(token);

    var _ch = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    var orderId = 'RL';
    for (var _i = 0; _i < 4; _i++) orderId += _ch[_crypto.randomBytes(1)[0] % _ch.length];

    saveOrder({
      order_id:        orderId,
      payment_id:      p.buyOrder || r.buy_order,
      payment_method:  'Transbank Webpay',
      status:          'approved',
      buyer_email:     p.email    || '',
      buyer_name:      ((p.firstName || '') + ' ' + (p.lastName || '')).trim(),
      buyer_phone:     p.phone    || '',
      shipping_method: p.shippingMethod || null,
      shipping_name:   p.shippingName   || null,
      shipping_fee:    p.shippingFee    || 0,
      address:         p.address  || null,
      address2:        p.address2 || null,
      city:            p.city     || null,
      region:          p.region   || null,
      items:           p.items    || [],
      subtotal:        p.subtotal || r.amount,
      discount_code:   p.discount || null,
      discount_amount: p.discountAmount || 0,
      total:           r.amount,
      total_grams:     p.totalGrams || null,
      weight_cat:      p.weightCat  || null,
      mp_external_ref: r.buy_order,
    });

    // Redirigir inmediatamente al frontend — email/club se procesa async
    res.redirect(SITE_URL + '/?payment=success');

    if (!p.email) return;

    var rawPass = generatePassword();
    bcrypt.hash(rawPass, 10).then(function(hash) {
      return sbFetch('POST', 'club_credentials', {
        body: { name: ((p.firstName || '') + ' ' + (p.lastName || '')).trim(), email: p.email, password_hash: hash, notes: 'Comprador automático', must_change_password: true },
      }).then(function(clubRes) {
        var created = clubRes.status < 400;
        var emailOpts = {
          discount: p.discount, discountAmount: p.discountAmount || 0,
          shippingFee: p.shippingFee || 0, shippingName: p.shippingName || 'Envío',
          total: r.amount, phone: p.phone || '',
          address: p.address || '', address2: p.address2 || '',
          city: p.city || '', region: p.region || '',
          purchaseDate: new Date().toISOString(), paymentMethod: 'Transbank Webpay',
        };
        var passDisplay = created ? rawPass : '(ya tienes acceso al club)';
        var html = renderWelcomeTemplate(p.firstName, p.lastName, p.email, p.cart || p.items, passDisplay, orderId, emailOpts)
                || buildWelcomeEmail(p.firstName, p.lastName, p.email, p.cart || p.items, passDisplay, orderId, emailOpts);
        sendEmail(p.email, '✓ RUAH LABS · Tu pedido está en camino + acceso al Club', html)
          .catch(function(e) { console.error('[TB email]', e.message); });
        console.log('[TB return]', p.email, '| Club:', created ? 'creado' : 'existía', '| Orden:', orderId);
      });
    }).catch(function(e) { console.error('[TB club+email]', e.message); });
  }).catch(function(err) {
    console.error('[TB commit error]', err.message);
    res.redirect(SITE_URL + '/?payment=failure');
  });
});

// ─── POST /api/checkout/validate-discount ────────────────────────────────────
app.post('/api/checkout/validate-discount', rateLimit('discount', 20, 60 * 1000), function(req, res) {
  var code = String(req.body.code || '').trim().toUpperCase();
  if (!code) return res.status(400).json({ valid: false, message: 'Código vacío' });
  var pct = VALID_DISCOUNT_CODES[code];
  if (!pct) return res.json({ valid: false, message: 'Código no válido' });
  res.json({ valid: true, percent: pct });
});

// ─── Supabase REST helper (service role — bypass RLS) ────────────────────────
var SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://txrpxzsqqomdlnxmyvxn.supabase.co';
var SB_SVC = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '';

// Cliente Supabase para Realtime Broadcast (cambios en vivo para todos)
var _sbClient = null;
function getSbClient() {
  if (!_sbClient && SB_URL && SB_SVC) {
    var { createClient } = require('@supabase/supabase-js');
    var ws = require('ws');
    _sbClient = createClient(SB_URL, SB_SVC, {
      realtime: { params: { eventsPerSecond: 10 }, transport: ws }
    });
  }
  return _sbClient;
}

function broadcastContent(data) {
  var client = getSbClient();
  if (!client) return;
  client.channel('content-main').send({
    type: 'broadcast',
    event: 'content-updated',
    payload: { data: data }
  }).catch(function(){});
}

function sbRequest(method, path, headers, body) {
  return new Promise(function(resolve, reject) {
    var https = require('https');
    var url   = new URL(path);
    var data  = body ? JSON.stringify(body) : null;
    var opts  = {
      hostname: url.hostname,
      port:     443,
      path:     url.pathname + (url.search || ''),
      method:   method,
      headers:  Object.assign({ 'Content-Type': 'application/json' }, headers),
    };
    if (data) opts.headers['Content-Length'] = Buffer.byteLength(data);
    var req = https.request(opts, function(res) {
      var chunks = [];
      res.on('data', function(c) { chunks.push(c); });
      res.on('end', function() {
        try { resolve({ status: res.statusCode, data: JSON.parse(Buffer.concat(chunks).toString()) }); }
        catch(e) { resolve({ status: res.statusCode, data: null }); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

function sbFetch(method, table, opts) {
  var url = SB_URL + '/rest/v1/' + table;
  if (opts && opts.query) url += '?' + opts.query;
  var headers = {
    'apikey':        SB_SVC,
    'Authorization': 'Bearer ' + SB_SVC,
    'Prefer':        (opts && opts.prefer) || (method === 'POST' ? 'return=representation' : ''),
  };
  return sbRequest(method, url, headers, opts && opts.body ? opts.body : undefined);
}

// Guarda un pedido en Supabase. ON CONFLICT DO NOTHING por payment_id único:
// si welcome y webhook disparan para el mismo pago, solo el primero inserta.
function saveOrder(record) {
  return sbFetch('POST', 'orders', {
    body:   record,
    prefer: 'return=minimal,resolution=ignore-duplicates',
  }).catch(function(e) { console.error('[orders] insert error:', e.message); });
}

// Generador de contraseña segura
function generatePassword() {
  var words = ['fuego','gracia','shalom','ruah','vida','luz','fe','amor','paz','monte','agua','roca','cielo','viento','tierra'];
  var w1  = words[_crypto.randomBytes(1)[0] % words.length];
  var w2  = words[_crypto.randomBytes(1)[0] % words.length];
  var n   = String(1000 + (_crypto.randomBytes(2).readUInt16BE(0) % 9000));
  var sym = ['!','@','#','$','*'][_crypto.randomBytes(1)[0] % 5];
  return w1 + '.' + w2 + n + sym;
}

// Hash dummy para igualar el tiempo de respuesta cuando el usuario NO existe
// (evita enumeración de cuentas por timing). Se compara igual que un hash real.
var DUMMY_HASH = bcrypt.hashSync('ruah-dummy-timing-equalizer', 10);

// ─── POST /api/club/login ─────────────────────────────────────────────────────
app.post('/api/club/login', rateLimit('login', 5, 15 * 60 * 1000), function(req, res) {
  var email = (req.body.email || '').trim().toLowerCase();
  var pass  = req.body.password || '';
  var ua    = req.headers['user-agent'] || '';

  if (!email || !pass) return res.status(400).json({ error: 'Faltan credenciales' });

  sbFetch('GET', 'club_credentials', { query: 'email=eq.' + encodeURIComponent(email) + '&select=*&limit=1' })
    .then(function(r) {
      var member = Array.isArray(r.data) ? r.data[0] : null;

      if (!member || !member.is_active) {
        // Comparar contra un hash dummy para que el tiempo sea igual que con un
        // usuario real (no revelar por timing si el email existe).
        return bcrypt.compare(pass, DUMMY_HASH).then(function() {
          sbFetch('POST', 'club_access_log', { body: { email: email, action: 'login_fail', user_agent: ua } });
          return res.status(401).json({ error: 'Credenciales incorrectas' });
        });
      }

      return bcrypt.compare(pass, member.password_hash).then(function(match) {
        if (!match) {
          sbFetch('POST', 'club_access_log', { body: { email: email, action: 'login_fail', user_agent: ua } });
          return res.status(401).json({ error: 'Credenciales incorrectas' });
        }

        // Actualizar last_login
        sbFetch('PATCH', 'club_credentials', {
          query: 'email=eq.' + encodeURIComponent(email),
          body:  { last_login_at: new Date().toISOString() },
        });
        // Log acceso OK
        sbFetch('POST', 'club_access_log', { body: { email: email, action: 'login_ok', user_agent: ua } });

        res.json({
          ok:                   true,
          name:                 member.name,
          email:                member.email,
          must_change_password: member.must_change_password,
        });
      });
    })
    .catch(function(err) { srvErr(res, err); });
});

// ─── POST /api/club/change-password ──────────────────────────────────────────
app.post('/api/club/change-password', rateLimit('chpwd', 10, 15 * 60 * 1000), function(req, res) {
  var email    = (req.body.email    || '').trim().toLowerCase();
  var oldPass  = req.body.oldPassword || '';
  var newPass  = req.body.newPassword || '';
  var ua       = req.headers['user-agent'] || '';

  if (!email || !oldPass || !newPass) return res.status(400).json({ error: 'Faltan campos' });
  if (newPass.length < 8)             return res.status(400).json({ error: 'Mínimo 8 caracteres' });

  sbFetch('GET', 'club_credentials', { query: 'email=eq.' + encodeURIComponent(email) + '&select=*&limit=1' })
    .then(function(r) {
      var member = Array.isArray(r.data) ? r.data[0] : null;
      if (!member) return res.status(404).json({ error: 'Usuario no encontrado' });

      return bcrypt.compare(oldPass, member.password_hash).then(function(match) {
        if (!match) return res.status(401).json({ error: 'Contraseña actual incorrecta' });

        return bcrypt.hash(newPass, 10).then(function(hash) {
          return sbFetch('PATCH', 'club_credentials', {
            query: 'email=eq.' + encodeURIComponent(email),
            body:  { password_hash: hash, must_change_password: false },
          }).then(function() {
            sbFetch('POST', 'club_access_log', { body: { email: email, action: 'password_changed', user_agent: ua } });
            res.json({ ok: true });
          });
        });
      });
    })
    .catch(function(err) { srvErr(res, err); });
});

// ─── POST /api/club/members (admin: crear miembro) ───────────────────────────
app.post('/api/club/members', async function(req, res) {
  if (!await isAdmin(req.headers['x-admin-key'])) return res.status(403).json({ error: 'No autorizado' });

  var name  = (req.body.name  || '').trim();
  var email = (req.body.email || '').trim().toLowerCase();
  var notes = (req.body.notes || '').trim();

  if (!name || !email) return res.status(400).json({ error: 'Nombre y email requeridos' });

  var rawPass = generatePassword();
  bcrypt.hash(rawPass, 10).then(function(hash) {
    return sbFetch('POST', 'club_credentials', {
      body: { name: name, email: email, password_hash: hash, notes: notes, must_change_password: true },
    }).then(function(r) {
      if (r.status >= 400) { console.error('[sb-error]', r.status, r.data); return res.status(r.status >= 500 ? 502 : 400).json({ error: 'No se pudo completar la operación.' }); }
      res.json({ ok: true, email: email, password: rawPass, name: name });
    });
  }).catch(function(err) { srvErr(res, err); });
});

// ─── GET /api/club/members (admin: listar) ────────────────────────────────────
app.get('/api/club/members', async function(req, res) {
  if (!await isAdmin(req.headers['x-admin-key'])) return res.status(403).json({ error: 'No autorizado' });
  sbFetch('GET', 'club_credentials', {
    query: 'select=id,name,email,is_active,must_change_password,created_at,last_login_at,notes&order=created_at.desc',
  }).then(function(r) { res.json(r.data); })
    .catch(function(err) { srvErr(res, err); });
});

// ─── GET /api/club/access-log (admin: ver log) ───────────────────────────────
app.get('/api/club/access-log', async function(req, res) {
  if (!await isAdmin(req.headers['x-admin-key'])) return res.status(403).json({ error: 'No autorizado' });
  sbFetch('GET', 'club_access_log', {
    query: 'select=*&order=created_at.desc&limit=200',
  }).then(function(r) { res.json(r.data); })
    .catch(function(err) { srvErr(res, err); });
});

// ─── DELETE /api/club/members/:email (admin: desactivar) ─────────────────────
app.delete('/api/club/members/:email', async function(req, res) {
  if (!await isAdmin(req.headers['x-admin-key'])) return res.status(403).json({ error: 'No autorizado' });
  var email = decodeURIComponent(req.params.email);
  sbFetch('PATCH', 'club_credentials', {
    query: 'email=eq.' + encodeURIComponent(email),
    body:  { is_active: false },
  }).then(function() { res.json({ ok: true }); })
    .catch(function(err) { srvErr(res, err); });
});

// ─── Email via Resend ─────────────────────────────────────────────────────────
var RESEND_KEY   = process.env.RESEND_API_KEY || '';
var FROM_EMAIL   = process.env.RESEND_FROM_EMAIL || 'noreply@ruahlabs.cl';
var FROM_NAME    = process.env.RESEND_FROM_NAME  || 'RUAH LABS';
var ADMIN_EMAIL  = process.env.ADMIN_NOTIFICATION_EMAIL || 'hola@ruahlabs.cl';

function sendEmail(to, subject, html) {
  if (!RESEND_KEY || RESEND_KEY === 'YOUR_RESEND_API_KEY') {
    console.log('[EMAIL SIMULADO] Para:', to, '| Asunto:', subject);
    return Promise.resolve({ simulated: true });
  }
  return fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + RESEND_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: FROM_NAME + ' <' + FROM_EMAIL + '>', to: [to], subject: subject, html: html }),
  }).then(function(r) { return r.json(); });
}

// Carga templates/welcome.html y reemplaza {{VARIABLES}} con los datos reales.
// Si el archivo no existe, cae en buildWelcomeEmail (HTML hardcodeado de respaldo).
var SITE_DOMAIN = process.env.NEXT_PUBLIC_APP_URL || 'https://ruahlabs.cl';
function renderWelcomeTemplate(firstName, lastName, email, cart, password, orderId, opts) {
  var templatePath = path.join(__dirname, '..', 'templates', 'welcome.html');
  if (!fs.existsSync(templatePath)) return null; // fallback al HTML hardcodeado
  var html = fs.readFileSync(templatePath, 'utf8');
  var firstItem    = (cart && cart[0]) || {};
  var firstPrice   = parseInt(String(firstItem.price || '0').replace(/[^0-9]/g, ''), 10) || 0;
  var subtotal     = (cart || []).reduce(function(s, it) { return s + (parseInt(String(it.price || '0').replace(/[^0-9]/g, ''), 10) || 0) * (it.qty || 1); }, 0);
  var discountAmt  = (opts && opts.discountAmount)  || 0;
  var shippingFee  = (opts && opts.shippingFee)     || 0;
  var shippingName = (opts && opts.shippingName)    || 'Envío';
  var total        = (opts && opts.total)           || (subtotal - discountAmt + shippingFee);
  var discountCode = (opts && opts.discount)        || '';

  var itemsHtml = (cart || []).map(function(it) {
    var p = parseInt(String(it.price || '0').replace(/[^0-9]/g, ''), 10) || 0;
    var lineTotal = p * (it.qty || 1);
    return '<tr>' +
      '<td style="padding:10px 0;border-bottom:1px solid #2a2a2a;color:#fff;font-size:14px;">' +
        esc(it.name) + (it.size ? ' · Talla ' + esc(it.size) : '') +
        (it.qty > 1 ? ' <span style="color:#666;">×' + it.qty + '</span>' : '') +
        (it.verse ? '<br><span style="color:#666;font-size:12px;">' + esc(it.verse) + '</span>' : '') +
      '</td>' +
      '<td style="padding:10px 0;border-bottom:1px solid #2a2a2a;color:#ECA10C;text-align:right;font-size:14px;white-space:nowrap;">CLP $' + lineTotal.toLocaleString('es-CL') + '</td>' +
    '</tr>';
  }).join('');

  var receiptRows =
    '<tr><td style="padding:8px 0;color:#aaa;font-size:13px;">Subtotal</td><td style="padding:8px 0;color:#fff;text-align:right;font-size:13px;">CLP $' + subtotal.toLocaleString('es-CL') + '</td></tr>' +
    (discountAmt > 0 ? '<tr><td style="padding:8px 0;color:#4caf50;font-size:13px;">Descuento ' + esc(discountCode) + '</td><td style="padding:8px 0;color:#4caf50;text-align:right;font-size:13px;">− CLP $' + discountAmt.toLocaleString('es-CL') + '</td></tr>' : '') +
    '<tr><td style="padding:8px 0;color:#aaa;font-size:13px;">' + esc(shippingName) + '</td><td style="padding:8px 0;color:#fff;text-align:right;font-size:13px;">' + (shippingFee === 0 ? 'GRATIS' : 'CLP $' + shippingFee.toLocaleString('es-CL')) + '</td></tr>' +
    '<tr><td style="padding:12px 0 0;color:#ECA10C;font-size:15px;font-weight:bold;border-top:1px solid #333;">TOTAL</td><td style="padding:12px 0 0;color:#ECA10C;text-align:right;font-size:15px;font-weight:bold;border-top:1px solid #333;">CLP $' + total.toLocaleString('es-CL') + '</td></tr>';

  return html
    .replace(/\{\{FIRST_NAME\}\}/g,      esc(firstName || ''))
    .replace(/\{\{LAST_NAME\}\}/g,       esc(lastName || ''))
    .replace(/\{\{EMAIL\}\}/g,           esc(email || ''))
    .replace(/\{\{PASSWORD\}\}/g,        esc(password || ''))
    .replace(/\{\{ORDER_ID\}\}/g,        esc(orderId || ''))
    .replace(/\{\{PRODUCT_NAME\}\}/g,    esc(firstItem.name || ''))
    .replace(/\{\{PRODUCT_SPECS\}\}/g,   (function() {
      var lines = [
        firstItem.material  ? 'Material: '   + firstItem.material  : '',
        firstItem.estampado ? 'Estampado: '  + firstItem.estampado : '',
        firstItem.fit       ? 'Fit: '        + firstItem.fit       : '',
        firstItem.origen    ? 'Origen: '     + firstItem.origen    : '',
      ].filter(Boolean).join('\n');
      return esc(lines);
    })())
    .replace(/\{\{PRODUCT_PRICE\}\}/g,   'CLP $' + firstPrice.toLocaleString('es-CL'))
    .replace(/\{\{ORDER_INFO\}\}/g,      buildOrderInfo(orderId, opts || {}, firstName, lastName, cart))
    .replace(/\{\{ORDER_ITEMS\}\}/g,     itemsHtml)
    .replace(/\{\{RECEIPT_ROWS\}\}/g,    receiptRows)
    .replace(/\{\{TOTAL\}\}/g,           'CLP $' + total.toLocaleString('es-CL'))
    .replace(/\{\{SITE_URL\}\}/g,        SITE_DOMAIN);
}

function buildWelcomeEmail(firstName, lastName, email, cart, password, orderId, opts) {
  var subtotal    = (cart || []).reduce(function(s, it) { return s + (parseInt(String(it.price || '0').replace(/[^0-9]/g, ''), 10) || 0) * (it.qty || 1); }, 0);
  var discountAmt = (opts && opts.discountAmount) || 0;
  var shippingFee = (opts && opts.shippingFee)    || 0;
  var shippingNm  = (opts && opts.shippingName)   || 'Envío';
  var total       = (opts && opts.total)          || (subtotal - discountAmt + shippingFee);
  var discCode    = (opts && opts.discount)        || '';

  var items = (cart || []).map(function(it) {
    var price = parseInt(String(it.price || '0').replace(/[^0-9]/g, ''), 10) || 0;
    var lineTotal = price * (it.qty || 1);
    return '<tr>' +
      '<td style="padding:10px 0;border-bottom:1px solid #2a2a2a;color:#fff;font-size:14px;">' +
        esc(it.name) + (it.size ? ' · Talla ' + esc(it.size) : '') +
        (it.qty > 1 ? ' <span style="color:#666;">×' + it.qty + '</span>' : '') +
      '</td>' +
      '<td style="padding:10px 0;border-bottom:1px solid #2a2a2a;color:#ECA10C;text-align:right;font-size:14px;">CLP $' + lineTotal.toLocaleString('es-CL') + '</td>' +
    '</tr>';
  }).join('');

  var receiptRows =
    '<tr><td style="padding:8px 0;color:#aaa;font-size:13px;">Subtotal</td><td style="padding:8px 0;color:#fff;text-align:right;font-size:13px;">CLP $' + subtotal.toLocaleString('es-CL') + '</td></tr>' +
    (discountAmt > 0 ? '<tr><td style="padding:8px 0;color:#4caf50;font-size:13px;">Descuento ' + esc(discCode) + '</td><td style="padding:8px 0;color:#4caf50;text-align:right;font-size:13px;">− CLP $' + discountAmt.toLocaleString('es-CL') + '</td></tr>' : '') +
    '<tr><td style="padding:8px 0;color:#aaa;font-size:13px;">' + esc(shippingNm) + '</td><td style="padding:8px 0;color:#fff;text-align:right;font-size:13px;">' + (shippingFee === 0 ? 'GRATIS' : 'CLP $' + shippingFee.toLocaleString('es-CL')) + '</td></tr>' +
    '<tr><td style="padding:12px 0 0;color:#ECA10C;font-size:15px;font-weight:bold;border-top:1px solid #333;">TOTAL</td><td style="padding:12px 0 0;color:#ECA10C;text-align:right;font-size:15px;font-weight:bold;border-top:1px solid #333;">CLP $' + total.toLocaleString('es-CL') + '</td></tr>';

  return '<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="margin:0;padding:0;background:#0a0a0a;font-family:Arial,sans-serif;">' +
    '<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 20px;">' +
    '<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;">' +

    // Banner
    '<tr><td style="padding:0;line-height:0;">' +
    '<img src="https://res.cloudinary.com/dh05zwrbp/image/upload/v1781996767/BANNER_BRIEF_Mesa_de_trabajo_1_blvduz.jpg" width="600" alt="RUAH LABS" style="display:block;width:100%;max-width:600px;border:0;">' +
    '</td></tr>' +

    // Saludo
    '<tr><td style="background:#111;padding:32px 40px 16px;border:1px solid #222;border-top:none;">' +
    '<p style="margin:0;color:#ECA10C;font-size:11px;letter-spacing:3px;">CONFIRMACIÓN DE COMPRA · ' + esc(orderId || '') + '</p>' +
    '<h2 style="margin:12px 0;color:#fff;font-size:22px;">Hola, ' + esc(firstName) + '.</h2>' +
    '<p style="margin:0;color:#aaa;font-size:15px;line-height:1.6;">Tu pedido fue recibido y estamos preparando tu prenda con cuidado.<br>Cada pieza de RUAH LABS lleva una historia — la tuya empieza hoy.</p>' +
    '</td></tr>' +

    // Items
    '<tr><td style="background:#111;padding:0 40px 8px;border-left:1px solid #222;border-right:1px solid #222;">' +
    '<table width="100%" cellpadding="0" cellspacing="0">' +
    '<tr><td colspan="2" style="padding-bottom:8px;color:#ECA10C;font-size:11px;letter-spacing:3px;border-bottom:1px solid #333;padding-bottom:8px;">DETALLE DEL PEDIDO</td></tr>' +
    items +
    '</table></td></tr>' +

    // Receipt (subtotal / descuento / envío / total)
    '<tr><td style="background:#111;padding:0 40px 24px;border-left:1px solid #222;border-right:1px solid #222;">' +
    '<table width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px;">' +
    receiptRows +
    '</table></td></tr>' +

    // Protocolo 1x1
    '<tr><td style="background:#111;padding:0 40px 24px;border-left:1px solid #222;border-right:1px solid #222;">' +
    '<div style="background:#0d1a0d;border-left:3px solid #ECA10C;padding:14px 16px;">' +
    '<p style="margin:0 0 4px;color:#ECA10C;font-size:11px;letter-spacing:3px;">PROTOCOLO 1×1</p>' +
    '<p style="margin:0;color:#aaa;font-size:13px;line-height:1.6;">Esta compra activa una donación de prendas a alguien en situación de calle. Tu fe se convierte en acción concreta.</p>' +
    '</div></td></tr>' +

    // Club
    '<tr><td style="background:#111;padding:0 40px 24px;border-left:1px solid #222;border-right:1px solid #222;">' +
    '<div style="background:#0d0d0b;border:1px solid #ECA10C;padding:24px;">' +
    '<p style="margin:0 0 4px;color:#ECA10C;font-size:11px;letter-spacing:3px;">ACCESO AL CLUB</p>' +
    '<p style="margin:0 0 16px;color:#aaa;font-size:13px;line-height:1.6;">Por comprar en RUAH LABS tienes acceso exclusivo al Club Secreto — rutas de entrega nocturna, canal directo con nosotros.</p>' +
    '<p style="margin:0 0 4px;color:#aaa;font-size:13px;">Email: <span style="color:#fff;">' + esc(email) + '</span></p>' +
    '<p style="margin:0 0 16px;color:#aaa;font-size:13px;">Contraseña temporal: <strong style="color:#ECA10C;font-size:16px;letter-spacing:2px;">' + esc(password) + '</strong></p>' +
    '<p style="margin:0 0 8px;color:#aaa;font-size:12px;">Para ingresar: ve a <strong style="color:#fff;">ruahlabs.cl</strong> · haz <strong style="color:#ECA10C;">triple click</strong> en el logo.</p>' +
    '<p style="margin:0;color:#666;font-size:11px;">Te pediremos que cambies la contraseña la primera vez que ingreses.</p>' +
    '</div></td></tr>' +

    // CTA
    '<tr><td style="background:#111;padding:0 40px 32px;border-left:1px solid #222;border-right:1px solid #222;border-bottom:1px solid #222;text-align:center;">' +
    '<a href="https://ruahlabs.cl" style="display:inline-block;background:#ECA10C;color:#000;padding:14px 36px;text-decoration:none;font-weight:bold;font-size:13px;letter-spacing:2px;">INGRESAR AL CLUB →</a>' +
    '</td></tr>' +

    // Footer
    '<tr><td style="padding:16px 0;text-align:center;">' +
    '<p style="margin:0;color:#444;font-size:11px;letter-spacing:2px;">RUAH LABS · FE PUESTA EN ACCIÓN · ruahlabs.cl</p>' +
    '</td></tr>' +

    '</table></td></tr></table></body></html>';
}

// ─── POST /api/checkout/welcome ───────────────────────────────────────────────
app.post('/api/checkout/welcome', rateLimit('welcome', 5, 60 * 1000), async function(req, res) {
  var email        = (req.body.email     || '').trim().toLowerCase();
  var firstName    = cap((req.body.firstName || '').trim());
  var lastName     = cap((req.body.lastName  || '').trim());
  var cart         = req.body.cart || [];
  var orderId      = req.body.orderId || ('RUAH-' + Date.now().toString().slice(-8));
  var paymentId    = (req.body.payment_id || '').trim();
  var phone        = (req.body.phone     || '').trim();
  var address      = req.body.address    || '';
  var address2     = req.body.address2   || '';
  var city         = req.body.city       || '';
  var region       = req.body.region     || '';
  var purchaseDate = req.body.purchaseDate || new Date().toISOString();
  var paymentMethod = 'MercadoPago';
  var emailOpts    = {
    discount:       req.body.discount       || null,
    discountAmount: parseInt(req.body.discountAmount) || 0,
    shippingFee:    parseInt(req.body.shippingFee)    || 0,
    shippingName:   req.body.shippingName   || 'Envío',
    total:          parseInt(req.body.total)          || 0,
    phone:          phone,
    address:        address, address2: address2, city: city, region: region,
    purchaseDate:   purchaseDate,
    paymentMethod:  paymentMethod,
  };

  if (!email) return res.status(400).json({ error: 'Email requerido' });

  // Dedup: si el webhook ya procesó este pago, no enviar un segundo correo.
  if (paymentId && _processedPayments.has(paymentId)) {
    return res.json({ ok: true, club_created: false, email_sent: false, note: 'webhook_handled' });
  }
  if (paymentId) _processedPayments.add(paymentId);

  // Verificar que el pago existe y está aprobado en MercadoPago antes de enviar
  // nada. Sin esto, el endpoint sería un emisor abierto de correo con tu dominio.
  // En modo dev (token de prueba) se omite para poder testear.
  if (!IS_DEV) {
    if (!paymentId) return res.status(402).json({ error: 'Pago no verificado' });
    try {
      var pay = await mpGetPayment(paymentId);
      var ok = pay.status === 200 && pay.body && pay.body.status === 'approved';
      if (!ok) {
        console.warn('[Welcome] pago no aprobado o inexistente:', paymentId, pay.body && pay.body.status);
        return res.status(402).json({ error: 'Pago no aprobado' });
      }
      // Usar el email del pagador real cuando MP lo entrega (evita suplantación)
      var payerEmail = pay.body.payer && pay.body.payer.email;
      if (payerEmail) email = String(payerEmail).trim().toLowerCase();
      paymentMethod = formatPM((pay.body.payment_method_id || '').toLowerCase(), pay.body.payment_type_id || '');
      emailOpts.paymentMethod = paymentMethod;
    } catch(e) {
      console.error('[Welcome] error verificando pago:', e.message);
      return res.status(502).json({ error: 'No se pudo verificar el pago' });
    }
  }

  // Persistir pedido en base de datos
  var _subtotal = Math.max(0, (emailOpts.total || 0) - (emailOpts.shippingFee || 0) + (emailOpts.discountAmount || 0));
  saveOrder({
    order_number:    orderId,
    payment_id:      paymentId || null,
    payment_method:  paymentMethod,
    payment_status:  'approved',
    customer_email:  email,
    customer_name:   (firstName + ' ' + lastName).trim(),
    customer_phone:  phone,
    shipping_method: req.body.shippingMethod || 'std',
    shipping_name:   emailOpts.shippingName  || null,
    shipping_fee:    emailOpts.shippingFee   || 0,
    shipping_street: address  || null,
    shipping_apt:    address2 || null,
    shipping_city:   city     || null,
    shipping_region: region   || null,
    items:           cart,
    subtotal:        _subtotal,
    discount_code:   emailOpts.discount      || null,
    discount_amount: emailOpts.discountAmount || 0,
    total:           emailOpts.total         || 0,
    total_grams:     parseInt(req.body.totalGrams) || null,
    weight_cat:      req.body.weightCat      || null,
    mp_external_ref: req.body.mp_external_ref || null,
    paid_at:         new Date().toISOString(),
  });

  var rawPass = generatePassword();

  bcrypt.hash(rawPass, 10).then(function(hash) {
    // Crear o actualizar miembro del club (upsert por email)
    return sbFetch('POST', 'club_credentials', {
      body: { name: firstName + ' ' + lastName, email: email, password_hash: hash, notes: 'Comprador automático', must_change_password: true },
    }).then(function(r) {
      // Si ya existe (409 conflict), solo loguear — no sobreescribir contraseña
      var created = r.status < 400;
      var passToSend = rawPass;

      if (!created) {
        // Ya era miembro — no cambiar contraseña, solo enviar email de compra
        passToSend = null;
      }

      // Construir y enviar email
      var subject = '✓ RUAH LABS · Tu pedido está en camino + acceso al Club';
      var html = renderWelcomeTemplate(firstName, lastName, email, cart, passToSend || '(ya tienes acceso al club)', orderId, emailOpts) || buildWelcomeEmail(firstName, lastName, email, cart, passToSend || '(ya tienes acceso al club)', orderId, emailOpts);

      return sendEmail(email, subject, html).then(function(emailResult) {
        console.log('[Welcome]', email, '| Club:', created ? 'creado' : 'ya existía', '| Email:', RESEND_KEY ? 'enviado' : 'simulado');
        res.json({ ok: true, club_created: created, email_sent: !!RESEND_KEY });
      });
    });
  }).catch(function(err) {
    console.error('[Welcome Error]', err.message);
    srvErr(res, err);
  });
});

// ─── POST /api/webhooks/mercadopago ──────────────────────────────────────────
// Recibe notificaciones server-to-server de MercadoPago (independiente del
// redirect del cliente). Cubre el caso donde el comprador cierra la pestaña
// antes de que el navegador vuelva a ruahlabs.cl.
app.post('/api/webhooks/mercadopago', function(req, res) {
  // Responder 200 de inmediato: MP reintenta si no recibe respuesta en < 5s.
  res.sendStatus(200);

  // Verificar firma HMAC-SHA256 (solo si el secret está configurado en Railway)
  var xSig   = req.headers['x-signature']  || '';
  var xReqId = req.headers['x-request-id'] || '';
  if (MP_WEBHOOK_SECRET && xSig) {
    var tsMatch  = xSig.match(/ts=(\d+)/);
    var v1Match  = xSig.match(/v1=([a-f0-9]+)/);
    if (!tsMatch || !v1Match) { console.warn('[wh] firma malformada, ignorado'); return; }
    var dataId  = (req.body && req.body.data && req.body.data.id) ? String(req.body.data.id) : '';
    var msg     = 'id:' + dataId + ';request-id:' + xReqId + ';ts:' + tsMatch[1] + ';';
    var expHash = require('crypto').createHmac('sha256', MP_WEBHOOK_SECRET).update(msg).digest('hex');
    if (expHash !== v1Match[1]) { console.warn('[wh] firma inválida, ignorado'); return; }
  } else if (!MP_WEBHOOK_SECRET) {
    console.warn('[wh] MERCADOPAGO_WEBHOOK_SECRET sin configurar — verificación omitida');
  }

  var body      = req.body || {};
  var paymentId = String((body.data && body.data.id) || '');
  if (body.type !== 'payment' || !paymentId) return;

  // Dedup: el redirect del cliente puede haber procesado este pago primero
  if (_processedPayments.has(paymentId)) { console.log('[wh] ya procesado:', paymentId); return; }
  _processedPayments.add(paymentId);
  if (_processedPayments.size > 1000) _processedPayments.clear();

  mpGetPayment(paymentId).then(function(pay) {
    if (pay.status !== 200 || !pay.body || pay.body.status !== 'approved') {
      console.log('[wh] pago no aprobado:', paymentId, pay.body && pay.body.status);
      return;
    }
    var payment    = pay.body;
    var payerEmail = (payment.payer && payment.payer.email) ? payment.payer.email.trim().toLowerCase() : '';
    var payerFirst = cap((payment.payer && payment.payer.first_name) || '');
    var payerLast  = cap((payment.payer && payment.payer.last_name)  || '');
    if (!payerEmail) { console.warn('[wh] pago sin email:', paymentId); return; }

    // Enriquecer items del pago con specs completas (verse, material, etc.) desde la DB
    sbFetch('GET', 'content', { query: 'key=eq.main&select=data&limit=1' }).then(function(r) {
      var row = Array.isArray(r.data) ? r.data[0] : null;
      var allProducts = [];
      if (row && row.data) {
        allProducts = allProducts
          .concat((row.data.products && row.data.products.items)  || [])
          .concat((row.data.cuadros  && row.data.cuadros.products) || []);
      }
      var mpItems = (payment.additional_info && payment.additional_info.items) || [];
      var cart = mpItems
        .filter(function(it) { return it.id && it.id !== 'shipping'; })
        .map(function(it) {
          var p = allProducts.find(function(x) { return x.id === it.id; }) || {};
          return { id: it.id, name: it.title || p.name || '', price: String(it.unit_price || 0),
            qty: parseInt(it.quantity, 10) || 1, verse: p.verse || '',
            material: p.material || '', estampado: p.estampado || '',
            fit: p.fit || '', tallas: p.tallas || '', origen: p.origen || '' };
        });

      var _ch = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      var orderId = 'RL';
      for (var _i = 0; _i < 4; _i++) orderId += _ch[_crypto.randomBytes(1)[0] % _ch.length];

      // Persistir pedido (fallback: solo si welcome no lo procesó antes)
      saveOrder({
        order_number:    orderId,
        payment_id:      paymentId,
        payment_method:  'MercadoPago',
        payment_status:  'approved',
        customer_email:  payerEmail,
        customer_name:   (payerFirst + ' ' + payerLast).trim(),
        items:           cart,
        total:           parseInt(payment.transaction_amount) || 0,
        subtotal:        parseInt(payment.transaction_amount) || 0,
        mp_external_ref: payment.external_reference || null,
        paid_at:         new Date().toISOString(),
      });

      var rawPass = generatePassword();
      bcrypt.hash(rawPass, 10).then(function(hash) {
        sbFetch('POST', 'club_credentials', {
          body: { name: (payerFirst + ' ' + payerLast).trim(), email: payerEmail,
                  password_hash: hash, notes: 'MP webhook #' + paymentId, must_change_password: true },
        }).then(function(cr) {
          var created    = cr.status < 400;
          var passToSend = created ? rawPass : '(ya tienes acceso al club)';
          var subject    = '✓ RUAH LABS · Tu pedido está en camino + acceso al Club';
          var html       = renderWelcomeTemplate(payerFirst, payerLast, payerEmail, cart, passToSend, orderId)
                        || buildWelcomeEmail(payerFirst, payerLast, payerEmail, cart, passToSend, orderId);
          sendEmail(payerEmail, subject, html)
            .then(function() { console.log('[wh] ✅', payerEmail, '| pago:', paymentId, '| club:', created ? 'creado' : 'ya existía'); })
            .catch(function(e) { console.error('[wh] email error:', e.message); });
        }).catch(function(e) { console.error('[wh] sb error:', e.message); });
      }).catch(function(e) { console.error('[wh] bcrypt error:', e.message); });
    }).catch(function(e) { console.error('[wh] content error:', e.message); });
  }).catch(function(e) { console.error('[wh] mp get error:', e.message); });
});

// ─── POST /api/club/signup ───────────────────────────────────────────────────
app.post('/api/club/signup', rateLimit('signup', 12, 60 * 1000), function(req, res) {
  var email      = (req.body.email      || '').trim().toLowerCase();
  var route_id   = (req.body.route_id   || '').trim();
  var route_name = (req.body.route_name || '').trim();
  if (!email || !route_id) return res.status(400).json({ error: 'Faltan datos' });
  if (!isValidEmail(email)) return res.status(400).json({ error: 'Email inválido' });
  sbFetch('POST', 'club_signups', { body: { email, route_id, route_name } })
    .then(function(r) {
      if (r.status >= 400) { console.error('[sb-error]', r.status, r.data); return res.status(r.status >= 500 ? 502 : 400).json({ error: 'No se pudo completar la operación.' }); }
      res.json({ ok: true });
    }).catch(function(err) { srvErr(res, err); });
});

// ─── DELETE /api/club/signup ─────────────────────────────────────────────────
app.delete('/api/club/signup', rateLimit('signup-del', 12, 60 * 1000), function(req, res) {
  var email    = (req.body.email    || '').trim().toLowerCase();
  var route_id = (req.body.route_id || '').trim();
  if (!email || !route_id) return res.status(400).json({ error: 'Faltan datos' });
  if (!isValidEmail(email)) return res.status(400).json({ error: 'Email inválido' });
  fetch(SB_URL + '/rest/v1/club_signups?email=eq.' + encodeURIComponent(email) + '&route_id=eq.' + encodeURIComponent(route_id), {
    method: 'DELETE',
    headers: { 'apikey': SB_SVC, 'Authorization': 'Bearer ' + SB_SVC },
  }).then(function() { res.json({ ok: true }); })
    .catch(function(err) { srvErr(res, err); });
});

// ─── GET /api/club/signups (admin) ───────────────────────────────────────────
app.get('/api/club/signups', async function(req, res) {
  if (!await isAdmin(req.headers['x-admin-key'])) return res.status(403).json({ error: 'No autorizado' });
  sbFetch('GET', 'club_signups', { query: 'select=*&order=created_at.desc' })
    .then(function(r) { res.json(r.data); })
    .catch(function(err) { srvErr(res, err); });
});

// ─── GET /api/v (version check) ─────────────────────────────────────────────
app.get('/api/v', function(req, res) { res.json({ v: 4, auth: 'jwt-local' }); });

// ─── POST /api/test/welcome-email (solo admin, para verificar Resend) ────────
app.post('/api/test/welcome-email', async function(req, res) {
  if (!await isAdmin(req.headers['x-admin-key'])) return res.status(403).json({ error: 'No autorizado' });
  var to = (req.body.to || '').trim();
  if (!to) return res.status(400).json({ error: 'Falta campo to' });
  var rawPass = generatePassword();
  try {
    var hash = await bcrypt.hash(rawPass, 10);
    await sbFetch('POST', 'club_credentials', {
      body: { name: 'Test RUAH', email: to, password_hash: hash, notes: 'Test manual', must_change_password: true },
    });
  } catch(e) { /* ya existe — no sobreescribir */ }
  var testCart = [{ name: 'Buzo Selah', verse: 'SAL. 46:10', price: '42990' }];
  var html = renderWelcomeTemplate('Test', 'RUAH', to, testCart, rawPass, 'RUAH-TEST-001') || buildWelcomeEmail('Test', 'RUAH', to, testCart, rawPass, 'RUAH-TEST-001');
  sendEmail(to, '✓ RUAH LABS · Tu pedido está en camino + acceso al Club', html)
    .then(function(r) { res.json({ ok: true, resend: r, password_preview: rawPass }); })
    .catch(function(e) { res.status(500).json({ error: e.message }); });
});

// ─── GET /api/content ────────────────────────────────────────────────────────
app.get('/api/content', function(req, res) {
  sbFetch('GET', 'content', { query: 'key=eq.main&limit=1' })
    .then(function(r) {
      var row = Array.isArray(r.data) ? r.data[0] : null;
      res.json({ data: row ? row.data : null });
    })
    .catch(function(err) { srvErr(res, err); });
});

// ─── POST /api/content ───────────────────────────────────────────────────────
app.post('/api/content', async function(req, res) {
  if (!await isAdmin(req.headers['x-admin-key'])) return res.status(403).json({ error: 'No autorizado' });
  var data = req.body.data;
  if (!data || typeof data !== 'object') return res.status(400).json({ error: 'data requerida' });
  // SEGURIDAD: el blob de contenido se sirve público. Nunca persistir secretos.
  if (data.brand) { delete data.brand.adminPasswordHash; delete data.brand.clubPasswordHash; }
  // PATCH actualiza el row existente (nunca conflictúa).
  // Si no existiera el row, el PATCH afecta 0 filas y retorna 204 igual —
  // en ese caso hacemos POST para insertarlo.
  sbRequest('PATCH', SB_URL + '/rest/v1/content?key=eq.main', {
    'apikey': SB_SVC, 'Authorization': 'Bearer ' + SB_SVC,
    'Prefer': 'return=minimal',
  }, { data: data })
  .then(function(r) {
    if (r.status >= 300) { console.error('[sb-error] content save', r.status, r.data); res.status(r.status >= 500 ? 502 : 400).json({ error: 'No se pudo guardar el contenido.' }); return; }
    broadcastContent(data);
    res.json({ ok: true });
  }).catch(function(err) { srvErr(res, err); });
});

// ─── POST /api/images/sign — Firma para upload seguro a Cloudinary ───────────
app.post('/api/images/sign', rateLimit('cld-sign', 30, 60 * 1000), async function(req, res) {
  if (!await isAdmin(req.headers['x-admin-key'])) return res.status(403).json({ error: 'No autorizado' });
  if (!CLD_KEY || !CLD_SECRET) return res.status(500).json({ error: 'Cloudinary no configurado en el servidor' });

  var timestamp = Math.round(Date.now() / 1000);
  var folder    = 'ruahlabs';
  var toSign    = 'folder=' + folder + '&timestamp=' + timestamp + CLD_SECRET;
  var signature = require('crypto').createHash('sha256').update(toSign).digest('hex');

  res.json({ cloudName: CLD_CLOUD, apiKey: CLD_KEY, timestamp: timestamp, signature: signature, folder: folder });
});

// ─── POST /api/club/verify-password — Verifica contraseña global del Club ───
app.post('/api/club/verify-password', rateLimit('club-verify', 8, 15 * 60 * 1000), function(req, res) {
  var pwd = req.body.password || '';
  if (!pwd) return res.status(400).json({ ok: false });
  if (!CLUB_PWD_HASH) return res.status(503).json({ error: 'CLUB_PASSWORD_HASH no configurado' });
  bcrypt.compare(pwd, CLUB_PWD_HASH).then(function(match) {
    res.json({ ok: match });
  }).catch(function() { res.status(500).json({ ok: false }); });
});

// ─── Health ──────────────────────────────────────────────────────────────────
app.get('/api/health', function(_req, res) {
  res.json({ ok: true, mp_configured: !!(MP_TOKEN && MP_TOKEN !== 'YOUR_MERCADOPAGO_ACCESS_TOKEN'), sandbox: IS_DEV });
});

app.listen(3001, function() {
  console.log('✅ API Server corriendo en http://localhost:3001');
  console.log('   MP configurado:', !!(MP_TOKEN && MP_TOKEN !== 'YOUR_MERCADOPAGO_ACCESS_TOKEN'));
  console.log('   Modo:', IS_DEV ? 'SANDBOX (TEST)' : 'PRODUCCIÓN');
  console.log('   Site URL:', SITE_URL);
  console.log('   Supabase URL:', SB_URL ? '✅ ' + SB_URL : '❌ NO CONFIGURADO');
  console.log('   Supabase SVC key:', SB_SVC ? '✅ configurada (' + SB_SVC.slice(0,12) + '...)' : '❌ NO CONFIGURADA');
  console.log('   Admin auth:', 'Supabase JWT (' + ADMIN_LOGIN_EMAIL + ')');
  console.log('   Cloudinary key:', CLD_KEY ? '✅ ' + CLD_KEY : '❌ NO CONFIGURADA');
});
