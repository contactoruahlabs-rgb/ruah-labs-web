// RUAH LABS — API Server (Mercado Pago + órdenes)
// Puerto: 3001  |  Iniciar: node scripts/api-server.cjs

const express = require('express');
const fs      = require('fs');
const path    = require('path');
const bcrypt  = require('bcrypt');

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

var MP_TOKEN   = process.env.MERCADOPAGO_ACCESS_TOKEN || '';
var SITE_URL   = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:8000';
var IS_DEV     = !MP_TOKEN.startsWith('APP_USR-');
var ADMIN_KEY  = process.env.ADMIN_API_KEY || '';
var ADMIN_EMAIL = 'contacto.ruahlabs@gmail.com';
// Cache last validated JWT for 2 min to avoid hammering Supabase Auth
var _adminTokenCache = { token: null, validUntil: 0 };
async function isAdmin(token) {
  if (!token) return false;
  if (ADMIN_KEY && token === ADMIN_KEY) return true;
  try {
    var now = Date.now();
    if (_adminTokenCache.token === token && now < _adminTokenCache.validUntil) return true;
    // Validate JWT via Supabase Auth
    var r = await sbRequest('GET', SB_URL + '/auth/v1/user', {
      'apikey': SB_SVC,
      'Authorization': 'Bearer ' + token,
    });
    if (r.status === 200 && r.data && r.data.email === ADMIN_EMAIL) {
      _adminTokenCache = { token, validUntil: now + 2 * 60 * 1000 };
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

// Escape HTML para emails (evita inyección en plantillas HTML)
function esc(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
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

// ─── Express ─────────────────────────────────────────────────────────────────
var app = express();
app.use(express.json({ limit: '4mb' })); // contenido del sitio (productos) puede ser grande

// ─── CORS ─────────────────────────────────────────────────────────────────────
var ALLOWED_ORIGINS = [SITE_URL, 'http://localhost:8000', 'http://localhost:3000']
  .filter(function(o) { return !!o; });

function isAllowedOrigin(origin) {
  if (ALLOWED_ORIGINS.indexOf(origin) !== -1) return true;
  // Permitir cualquier subdominio de workers.dev y pages.dev (Cloudflare)
  if (/\.workers\.dev$/.test(origin) || /\.pages\.dev$/.test(origin)) return true;
  return false;
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
    var ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'anon';
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
var VALID_SHIP_FEES = { std: 4990, express: 9990, pickup: 0 };

function getContentPrices() {
  if (!SB_URL || !SB_SVC) return Promise.resolve({});
  return sbFetch('GET', 'content', { query: 'key=eq.main&select=data&limit=1' })
    .then(function(r) {
      var row = Array.isArray(r.data) ? r.data[0] : null;
      if (!row || !row.data) return {};
      var items = ((row.data.products && row.data.products.items) || [])
        .concat((row.data.cuadros && row.data.cuadros.products) || []);
      var map = {};
      items.forEach(function(p) {
        if (p.id) map[p.id] = parseInt(String(p.price || '0').replace(/[^0-9]/g, ''), 10) || 0;
      });
      return map;
    })
    .catch(function() { return {}; });
}

// ─── POST /api/checkout/create-preference ────────────────────────────────────
app.post('/api/checkout/create-preference', rateLimit('checkout', 10, 60 * 1000), function(req, res) {
  var cart           = req.body.cart           || [];
  var info           = req.body.info           || {};
  var shippingMethod = req.body.shippingMethod || 'std';
  var discount       = req.body.discount       || null;

  if (!cart.length) return res.status(400).json({ error: 'Carrito vacío' });

  // Shipping fee validado en servidor (ignoramos lo que manda el frontend)
  var shipFee = VALID_SHIP_FEES.hasOwnProperty(shippingMethod) ? VALID_SHIP_FEES[shippingMethod] : 4990;

  getContentPrices().then(function(priceMap) {
    var hasDB = Object.keys(priceMap).length > 0;

    var items = cart.map(function(it) {
      var price;
      if (hasDB) {
        price = priceMap[it.id];
        if (price === undefined) {
          console.warn('[create-preference] producto no encontrado en DB:', it.id);
          return null; // rechazar ítem desconocido
        }
      } else {
        // Sin contenido en DB: aceptar precio del frontend con mínimo de seguridad
        price = parseInt(String(it.price).replace(/[^0-9]/g, ''), 10) || 0;
        if (price < 1000) {
          console.warn('[create-preference] precio sospechoso para', it.id, ':', price);
          return null;
        }
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

    if (shipFee > 0) {
      items.push({ id: 'shipping', title: 'Envío', quantity: 1, unit_price: shipFee, currency_id: 'CLP' });
    }

    var prefBody = {
      items:     items,
      payer: {
        name:  (info.firstName || '') + ' ' + (info.lastName || ''),
        email: info.email || '',
        phone: { number: info.phone || '' },
      },
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
    res.status(500).json({ error: err.message });
  });
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
    'Prefer':        method === 'POST' ? 'return=representation' : '',
  };
  return sbRequest(method, url, headers, opts && opts.body ? opts.body : undefined);
}

// Generador de contraseña segura
function generatePassword() {
  var words = ['fuego','gracia','shalom','ruah','vida','luz','fe','amor','paz','monte','agua','roca','cielo','viento','tierra'];
  var w1 = words[Math.floor(Math.random() * words.length)];
  var w2 = words[Math.floor(Math.random() * words.length)];
  var n  = String(Math.floor(Math.random() * 9000) + 1000);
  var sym = ['!','@','#','$','*'][Math.floor(Math.random() * 5)];
  return w1 + '.' + w2 + n + sym;
}

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
        // Log intento fallido
        sbFetch('POST', 'club_access_log', { body: { email: email, action: 'login_fail', user_agent: ua } });
        return res.status(401).json({ error: 'Credenciales incorrectas' });
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
    .catch(function(err) { res.status(500).json({ error: err.message }); });
});

// ─── POST /api/club/change-password ──────────────────────────────────────────
app.post('/api/club/change-password', function(req, res) {
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
    .catch(function(err) { res.status(500).json({ error: err.message }); });
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
      if (r.status >= 400) return res.status(r.status).json({ error: r.data });
      res.json({ ok: true, email: email, password: rawPass, name: name });
    });
  }).catch(function(err) { res.status(500).json({ error: err.message }); });
});

// ─── GET /api/club/members (admin: listar) ────────────────────────────────────
app.get('/api/club/members', async function(req, res) {
  if (!await isAdmin(req.headers['x-admin-key'])) return res.status(403).json({ error: 'No autorizado' });
  sbFetch('GET', 'club_credentials', {
    query: 'select=id,name,email,is_active,must_change_password,created_at,last_login_at,notes&order=created_at.desc',
  }).then(function(r) { res.json(r.data); })
    .catch(function(err) { res.status(500).json({ error: err.message }); });
});

// ─── GET /api/club/access-log (admin: ver log) ───────────────────────────────
app.get('/api/club/access-log', async function(req, res) {
  if (!await isAdmin(req.headers['x-admin-key'])) return res.status(403).json({ error: 'No autorizado' });
  sbFetch('GET', 'club_access_log', {
    query: 'select=*&order=created_at.desc&limit=200',
  }).then(function(r) { res.json(r.data); })
    .catch(function(err) { res.status(500).json({ error: err.message }); });
});

// ─── DELETE /api/club/members/:email (admin: desactivar) ─────────────────────
app.delete('/api/club/members/:email', async function(req, res) {
  if (!await isAdmin(req.headers['x-admin-key'])) return res.status(403).json({ error: 'No autorizado' });
  var email = decodeURIComponent(req.params.email);
  sbFetch('PATCH', 'club_credentials', {
    query: 'email=eq.' + encodeURIComponent(email),
    body:  { is_active: false },
  }).then(function() { res.json({ ok: true }); })
    .catch(function(err) { res.status(500).json({ error: err.message }); });
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

function buildWelcomeEmail(firstName, lastName, email, cart, password, orderId) {
  var items = (cart || []).map(function(it) {
    var price = parseInt(String(it.price).replace(/[^0-9]/g, ''), 10) || 0;
    return '<tr><td style="padding:8px 0;border-bottom:1px solid #222;color:#fff;font-size:14px;">' + esc(it.name) + (it.verse ? ' · ' + esc(it.verse) : '') + '</td><td style="padding:8px 0;border-bottom:1px solid #222;color:#ECA10C;text-align:right;font-size:14px;">CLP $' + price.toLocaleString('es-CL') + '</td></tr>';
  }).join('');

  return '<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="margin:0;padding:0;background:#0a0a0a;font-family:Arial,sans-serif;">' +
    '<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 20px;">' +
    '<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#111;border:1px solid #222;">' +

    // Header
    '<tr><td style="background:#000;padding:32px 40px;border-bottom:2px solid #ECA10C;">' +
    '<p style="margin:0;color:#ECA10C;font-size:11px;letter-spacing:4px;">RUAH LABS</p>' +
    '<h1 style="margin:8px 0 0;color:#fff;font-size:28px;font-weight:900;letter-spacing:-0.5px;">FE PUESTA<br>EN ACCIÓN.</h1>' +
    '</td></tr>' +

    // Saludo
    '<tr><td style="padding:32px 40px 16px;">' +
    '<p style="margin:0;color:#ECA10C;font-size:11px;letter-spacing:3px;">CONFIRMACIÓN DE COMPRA · ' + esc(orderId || '') + '</p>' +
    '<h2 style="margin:12px 0;color:#fff;font-size:22px;">Gracias, ' + esc(firstName) + '.</h2>' +
    '<p style="margin:0;color:#aaa;font-size:15px;line-height:1.6;">Tu pedido fue recibido y estamos preparando tu prenda con cuidado.<br>Cada pieza de RUAH LABS lleva una historia — la tuya empieza hoy.</p>' +
    '</td></tr>' +

    // Items
    '<tr><td style="padding:0 40px 24px;">' +
    '<table width="100%" cellpadding="0" cellspacing="0">' +
    '<tr><td colspan="2" style="padding-bottom:8px;color:#ECA10C;font-size:11px;letter-spacing:3px;">TU PEDIDO</td></tr>' +
    items +
    '</table></td></tr>' +

    // Protocolo 1x1
    '<tr><td style="padding:0 40px 24px;">' +
    '<div style="background:#0d1a0d;border:1px solid #1a3a1a;padding:16px;border-left:3px solid #ECA10C;">' +
    '<p style="margin:0 0 4px;color:#ECA10C;font-size:11px;letter-spacing:3px;">PROTOCOLO 1×1</p>' +
    '<p style="margin:0;color:#aaa;font-size:13px;line-height:1.6;">Esta compra activa una donación de prendas a alguien en situación de calle. Tu fe se convierte en acción concreta.</p>' +
    '</div></td></tr>' +

    // Club
    '<tr><td style="padding:0 40px 24px;">' +
    '<div style="background:#1a1200;border:1px solid #ECA10C;padding:24px;">' +
    '<p style="margin:0 0 4px;color:#ECA10C;font-size:11px;letter-spacing:3px;">RUAH LABS CLUB</p>' +
    '<h3 style="margin:8px 0;color:#fff;font-size:18px;">Ahora eres parte del movimiento.</h3>' +
    '<p style="margin:0 0 16px;color:#aaa;font-size:13px;line-height:1.6;">Por comprar en RUAH LABS tienes acceso exclusivo al Club — rutas de entrega nocturna, reuniones privadas y canal directo con nosotros.</p>' +
    '<p style="margin:0 0 8px;color:#ECA10C;font-size:11px;letter-spacing:2px;">TUS CREDENCIALES DE ACCESO</p>' +
    '<p style="margin:0 0 4px;color:#aaa;font-size:13px;">Email: <span style="color:#fff;">' + esc(email) + '</span></p>' +
    '<p style="margin:0 0 16px;color:#aaa;font-size:13px;">Contraseña temporal: <strong style="color:#ECA10C;font-size:16px;letter-spacing:2px;">' + esc(password) + '</strong></p>' +
    '<p style="margin:0;color:#666;font-size:12px;">⚠️ Por seguridad, te pediremos que la cambies la primera vez que ingreses.</p>' +
    '</div></td></tr>' +

    // Instrucciones
    '<tr><td style="padding:0 40px 32px;">' +
    '<p style="margin:0 0 8px;color:#ECA10C;font-size:11px;letter-spacing:3px;">CÓMO INGRESAR AL CLUB</p>' +
    '<ol style="margin:0;padding-left:20px;color:#aaa;font-size:13px;line-height:2;">' +
    '<li>Ve a <strong style="color:#fff;">ruahlabs.cl</strong></li>' +
    '<li>Haz <strong style="color:#ECA10C;">triple click</strong> en el logo RUAH LABS</li>' +
    '<li>Ingresa tu email y la contraseña temporal</li>' +
    '<li>Elige tu nueva contraseña y entra</li>' +
    '</ol></td></tr>' +

    // Footer
    '<tr><td style="padding:24px 40px;border-top:1px solid #222;background:#000;">' +
    '<p style="margin:0;color:#444;font-size:11px;letter-spacing:2px;">RUAH LABS · FE PUESTA EN ACCIÓN · ruahlabs.cl</p>' +
    '</td></tr>' +

    '</table></td></tr></table></body></html>';
}

// ─── POST /api/checkout/welcome ───────────────────────────────────────────────
app.post('/api/checkout/welcome', rateLimit('welcome', 5, 60 * 1000), function(req, res) {
  var email     = (req.body.email     || '').trim().toLowerCase();
  var firstName = (req.body.firstName || '').trim();
  var lastName  = (req.body.lastName  || '').trim();
  var cart      = req.body.cart || [];
  var orderId   = req.body.orderId || ('RUAH-' + Date.now().toString().slice(-8));

  if (!email) return res.status(400).json({ error: 'Email requerido' });

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
      var html = buildWelcomeEmail(firstName, lastName, email, cart, passToSend || '(ya tienes acceso al club)', orderId);

      return sendEmail(email, subject, html).then(function(emailResult) {
        console.log('[Welcome]', email, '| Club:', created ? 'creado' : 'ya existía', '| Email:', RESEND_KEY ? 'enviado' : 'simulado');
        res.json({ ok: true, club_created: created, email_sent: !!RESEND_KEY });
      });
    });
  }).catch(function(err) {
    console.error('[Welcome Error]', err.message);
    res.status(500).json({ error: err.message });
  });
});

// ─── POST /api/club/signup ───────────────────────────────────────────────────
app.post('/api/club/signup', function(req, res) {
  var email      = (req.body.email      || '').trim().toLowerCase();
  var route_id   = (req.body.route_id   || '').trim();
  var route_name = (req.body.route_name || '').trim();
  if (!email || !route_id) return res.status(400).json({ error: 'Faltan datos' });
  sbFetch('POST', 'club_signups', { body: { email, route_id, route_name } })
    .then(function(r) {
      if (r.status >= 400) return res.status(r.status).json({ error: r.data });
      res.json({ ok: true });
    }).catch(function(err) { res.status(500).json({ error: err.message }); });
});

// ─── DELETE /api/club/signup ─────────────────────────────────────────────────
app.delete('/api/club/signup', function(req, res) {
  var email    = (req.body.email    || '').trim().toLowerCase();
  var route_id = (req.body.route_id || '').trim();
  if (!email || !route_id) return res.status(400).json({ error: 'Faltan datos' });
  fetch(SB_URL + '/rest/v1/club_signups?email=eq.' + encodeURIComponent(email) + '&route_id=eq.' + encodeURIComponent(route_id), {
    method: 'DELETE',
    headers: { 'apikey': SB_SVC, 'Authorization': 'Bearer ' + SB_SVC },
  }).then(function() { res.json({ ok: true }); })
    .catch(function(err) { res.status(500).json({ error: err.message }); });
});

// ─── GET /api/club/signups (admin) ───────────────────────────────────────────
app.get('/api/club/signups', async function(req, res) {
  if (!await isAdmin(req.headers['x-admin-key'])) return res.status(403).json({ error: 'No autorizado' });
  sbFetch('GET', 'club_signups', { query: 'select=*&order=created_at.desc' })
    .then(function(r) { res.json(r.data); })
    .catch(function(err) { res.status(500).json({ error: err.message }); });
});

// ─── GET /api/content ────────────────────────────────────────────────────────
app.get('/api/content', function(req, res) {
  sbFetch('GET', 'content', { query: 'key=eq.main&limit=1' })
    .then(function(r) {
      var row = Array.isArray(r.data) ? r.data[0] : null;
      res.json({ data: row ? row.data : null });
    })
    .catch(function(err) { res.status(500).json({ error: err.message }); });
});

// ─── POST /api/content ───────────────────────────────────────────────────────
app.post('/api/content', async function(req, res) {
  if (!await isAdmin(req.headers['x-admin-key'])) return res.status(403).json({ error: 'No autorizado' });
  var data = req.body.data;
  if (!data || typeof data !== 'object') return res.status(400).json({ error: 'data requerida' });
  // PATCH actualiza el row existente (nunca conflictúa).
  // Si no existiera el row, el PATCH afecta 0 filas y retorna 204 igual —
  // en ese caso hacemos POST para insertarlo.
  sbRequest('PATCH', SB_URL + '/rest/v1/content?key=eq.main', {
    'apikey': SB_SVC, 'Authorization': 'Bearer ' + SB_SVC,
    'Prefer': 'return=minimal',
  }, { data: data })
  .then(function(r) {
    if (r.status >= 300) { res.status(r.status).json({ error: r.data }); return; }
    broadcastContent(data);
    if (data.brand) _adminTokenCache = { token: null, validUntil: 0 };
    res.json({ ok: true });
  }).catch(function(err) { res.status(500).json({ error: err.message }); });
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
  console.log('   Admin key:', ADMIN_KEY ? '✅ configurada' : '❌ NO CONFIGURADA');
  console.log('   Cloudinary key:', CLD_KEY ? '✅ ' + CLD_KEY : '❌ NO CONFIGURADA');
});
