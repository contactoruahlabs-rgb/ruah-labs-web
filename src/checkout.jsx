/* global React */
// ============================================================
// RUAH LABS — Checkout 2.0
// Layout estilo página única (Kaya Unite UX) con branding RUAH LABS
// ============================================================

// ── Starken ──────────────────────────────────────────────────
const STARKEN_ZONES = {
  'Metropolitana':      'rm',
  'Valparaíso':         'cs', 'O\'Higgins': 'cs', 'Maule': 'cs',
  'Ñuble':              'cs', 'Biobío':     'cs', 'Araucanía': 'cs',
  'Los Ríos':           'cs', 'Los Lagos':  'cs',
  'Coquimbo':           'cs', 'Atacama':    'cs',
  'Arica y Parinacota': 'norte', 'Tarapacá': 'norte', 'Antofagasta': 'norte',
  'Aysén':              'austral', 'Magallanes': 'austral',
};
const STARKEN_ETA = {
  rm: '1-2 días hábiles', cs: '2-3 días hábiles',
  norte: '3-5 días hábiles', austral: '4-6 días hábiles',
};
// Precios por defecto (ya incluyen embalaje ~$990). Editables desde el admin.
const STARKEN_DEFAULT = {
  domicilio: {
    rm:     { xs:3900, s:4900, m:5500, l:6200 },
    cs:     { xs:4900, s:6100, m:7900, l:9900 },
    norte:  { xs:5800, s:9700, m:14700,l:17400 },
    austral:{ xs:5990, s:10100,m:15000,l:18300 },
  },
  sucursal: {
    rm:     { xs:3700, s:4700, m:5300, l:5900 },
    cs:     { xs:4800, s:5900, m:7600, l:9400 },
    norte:  { xs:5500, s:9300, m:14000,l:16600 },
    austral:{ xs:5800, s:9700, m:14400,l:17400 },
  },
};

function parseWeightBySizes(str) {
  const out = {};
  if (!str) return out;
  String(str).split(',').forEach(p => {
    const [sz, w] = p.trim().split(':');
    if (sz && w) out[sz.trim().toUpperCase()] = parseInt(w.trim()) || 0;
  });
  return out;
}
function calcCartWeight(cart, content) {
  const prods = [
    ...(content?.products?.items || []),
    ...(content?.cuadros?.products || []),
  ];
  return (cart || []).reduce((sum, it) => {
    const p = prods.find(x => x.id === it.id);
    let w = 400;
    if (p) {
      if (it.size && p.weightBySizes) {
        const bsz = parseWeightBySizes(p.weightBySizes);
        w = bsz[String(it.size).toUpperCase()] || p.weightDefault || 400;
      } else {
        w = p.weightDefault || 400;
      }
    }
    return sum + w * (it.qty || 1);
  }, 0);
}
function starkenCat(grams) {
  if (grams <= 500)  return 'xs';
  if (grams <= 3000) return 's';
  if (grams <= 6000) return 'm';
  return 'l';
}

const RETIRO_OPTION = {
  id: 'pickup',
  name: 'Retiro en taller',
  eta: 'Rigoberto Jara 0171 · Lun–Vie 10:00–19:00',
  price: 0,
};

function parsePrice(p) {
  return parseInt(String(p || '0').replace(/[^\d]/g, ''), 10) || 0;
}
function fmtCLP(n) {
  return new Intl.NumberFormat('es-CL').format(Math.max(0, Math.round(n || 0)));
}

// ============================================================
// MAIN
// ============================================================
function Checkout({ open, cart, content, onClose, onUpdateCart }) {
  const [info, setInfo] = React.useState({
    email: '', firstName: '', lastName: '',
    address: '', address2: '', city: '', region: '', postal: '', phone: '',
    newsletter: true,
  });
  const [mode, setMode]               = React.useState('envio'); // 'envio' | 'retiro'
  const [selectedShip, setSelectedShip] = React.useState(null);
  const [shipErr, setShipErr]           = React.useState(false);
  const [discount, setDiscount]       = React.useState('');
  const [discountApplied, setDiscountApplied] = React.useState(null);
  const [discountErr, setDiscountErr] = React.useState('');
  const [terms, setTerms]             = React.useState(false);
  const [payState, setPayState]       = React.useState('idle');
  const [touched, setTouched]         = React.useState({});
  const [summaryOpen, setSummaryOpen] = React.useState(false);

  React.useEffect(() => {
    if (open) { setPayState('idle'); setTouched({}); setSummaryOpen(false); }
  }, [open]);

  React.useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const fn = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [open, onClose]);

  if (!open) return null;

  // ── Totals ──
  const subtotal     = (cart || []).reduce((s, it) => s + parsePrice(it.price) * (it.qty || 1), 0);
  const totalGrams   = calcCartWeight(cart, content);
  const weightCat    = starkenCat(totalGrams);
  const zone         = STARKEN_ZONES[info.region] || null;
  const rates        = content?.starken || STARKEN_DEFAULT;
  const starkenOpts  = zone ? [
    { id:'starken-dom', name:'Starken · Domicilio',         eta: STARKEN_ETA[zone], price: rates.domicilio?.[zone]?.[weightCat] || 0 },
    { id:'starken-suc', name:'Starken · Retiro en sucursal', eta: STARKEN_ETA[zone], price: rates.sucursal?.[zone]?.[weightCat]  || 0 },
  ] : [];
  const activeShipOpt = mode === 'retiro'
    ? RETIRO_OPTION
    : (selectedShip ? (starkenOpts.find(o => o.id === selectedShip) || null) : null);
  const shipFee       = activeShipOpt ? activeShipOpt.price : 0;
  const discountAmount = discountApplied ? Math.round(subtotal * discountApplied.percent / 100) : 0;
  const total          = Math.max(0, subtotal - discountAmount) + shipFee;

  // ── Helpers ──
  function up(k, v) { setInfo(prev => ({ ...prev, [k]: v })); }

  function fieldCls(k, req = true) {
    if (touched[k] && req && !info[k]) return 'ck2-field invalid';
    if (info[k]) return 'ck2-field valid';
    return 'ck2-field';
  }
  function emailCls() {
    if (touched.email && !info.email.includes('@')) return 'ck2-field invalid';
    if (info.email && info.email.includes('@')) return 'ck2-field valid';
    return 'ck2-field';
  }

  // ── Discount ──
  function applyDiscount(e) {
    e && e.preventDefault();
    const code = discount.trim().toUpperCase();
    if (!code) { setDiscountApplied(null); setDiscountErr(''); return; }
    fetch('' + window.RUAH_API + '/api/checkout/validate-discount', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, subtotal }),
    })
    .then(r => r.json())
    .then(d => {
      if (d.valid) {
        setDiscountApplied({ code, percent: d.percent });
        setDiscountErr('');
      } else {
        setDiscountApplied(null);
        setDiscountErr(d.message || 'Código no válido');
      }
    })
    .catch(() => {
      // fallback local
      if (code === 'BIENVENIDO10') {
        setDiscountApplied({ code: 'BIENVENIDO10', percent: 10 });
        setDiscountErr('');
      } else {
        setDiscountApplied(null);
        setDiscountErr('Código no válido');
      }
    });
  }

  function setQty(uid, qty) {
    onUpdateCart(c => c.map(it => (it.uid || it.id) === uid ? { ...it, qty: Math.max(1, qty) } : it));
  }
  function removeItem(uid) {
    onUpdateCart(c => c.filter(it => (it.uid || it.id) !== uid));
  }

  // ── Validation ──
  function validate() {
    const req = { email: 1, firstName: 1, lastName: 1, phone: 1 };
    if (mode === 'envio') { req.address = 1; req.city = 1; req.region = 1; }
    setTouched(req);
    if (!info.email.includes('@')) return false;
    for (const k of Object.keys(req)) { if (!info[k]) return false; }
    if (mode === 'envio' && !selectedShip) { setShipErr(true); return false; }
    setShipErr(false);
    if (!terms) return false;
    return true;
  }

  // ── Pay ──
  function pay(e) {
    e && e.preventDefault();
    if (!validate()) {
      requestAnimationFrame(() => {
        const el = document.querySelector('.ck2-field.invalid input, .ck2-field.invalid select');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
      return;
    }
    setPayState('processing');
    try {
      sessionStorage.setItem('ruah-pending-order', JSON.stringify({
        email: info.email, firstName: info.firstName, lastName: info.lastName,
        phone: info.phone,
        address: info.address, address2: info.address2 || '',
        city: info.city, region: info.region,
        purchaseDate: new Date().toISOString(),
        cart, total,
        discount: discountApplied ? discountApplied.code : null,
        discountAmount,
        shippingFee: shipFee,
        shippingName: activeShipOpt ? activeShipOpt.name : '',
        shippingMethod: activeShipOpt ? activeShipOpt.id : 'std',
        totalGrams,
        weightCat,
      }));
    } catch(_) {}

    fetch('' + window.RUAH_API + '/api/checkout/create-preference', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cart: cart.map(it => ({ ...it, price: parsePrice(it.price) })),
        info,
        discount: discountApplied ? discountApplied.code : null,
        shippingMethod: activeShipOpt.id,
      }),
    })
    .then(r => r.json())
    .then(data => {
      if (data.error) { setPayState('idle'); alert('Error MP: ' + data.error); return; }
      try {
        const pending = JSON.parse(sessionStorage.getItem('ruah-pending-order') || '{}');
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = 'RL';
        for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
        pending.orderId = code;
        pending.mp_external_ref = data.preference_id || null;
        sessionStorage.setItem('ruah-pending-order', JSON.stringify(pending));
      } catch(_) {}
      window.location.href = data.init_point || data.sandbox_init_point;
    })
    .catch(err => {
      setPayState('idle');
      alert('No se pudo conectar con el servidor de pagos.\n' + err.message);
    });
  }

  // ── Render ──
  return (
    <div className="ck2-overlay" role="dialog" aria-modal="true">
      <div className="ck2-page">

        {/* ═══ HEADER ═══ */}
        <header className="ck2-header">
          <div className="ck2-header__inner">
            <img
              src="https://res.cloudinary.com/dh05zwrbp/image/upload/v1781323723/ruahlabs/s6aaamzrfbcwd46icjxu.png"
              alt="RUAH LABS" className="ck2-header__logo"
            />
            <button className="ck2-close" onClick={onClose} aria-label="Cerrar">×</button>
          </div>
          <button className="ck2-summary-toggle" type="button" onClick={() => setSummaryOpen(o => !o)}>
            <span>Resumen del pedido <span className="ck2-caret">{summaryOpen ? '▲' : '▼'}</span></span>
            <span className="ck2-summary-toggle__total">CLP ${fmtCLP(total)}</span>
          </button>
          {summaryOpen && (
            <div className="ck2-summary-drop">
              <SummaryItems
                cart={cart} setQty={setQty} removeItem={removeItem}
                subtotal={subtotal} shipFee={shipFee} activeShipOpt={activeShipOpt}
                discountApplied={discountApplied} discountAmount={discountAmount} total={total}
              />
            </div>
          )}
        </header>

        {/* ═══ BODY ═══ */}
        <div className="ck2-body">

          {/* ── CONTACTO ── */}
          <section className="ck2-section">
            <h2 className="ck2-section-title">Contacto</h2>
            <div className={emailCls()}>
              <input
                type="email" value={info.email} placeholder="Correo electrónico (el mismo de MercadoPago)"
                onChange={e => up('email', e.target.value)}
                onBlur={() => setTouched(t => ({ ...t, email: 1 }))}
                autoComplete="email"
              />
              {touched.email && !info.email.includes('@') && <span className="ck2-err">Ingresa un email válido</span>}
            </div>
            <label className="ck2-check">
              <input type="checkbox" checked={info.newsletter} onChange={e => up('newsletter', e.target.checked)} />
              <span>Enviarme novedades y el registro del Protocolo 1×1</span>
            </label>
          </section>

          {/* ── ENTREGA ── */}
          <section className="ck2-section">
            <h2 className="ck2-section-title">Entrega</h2>

            <div className="ck2-tabs">
              <button
                type="button"
                className={'ck2-tab' + (mode === 'envio' ? ' active' : '')}
                onClick={() => setMode('envio')}
              >
                <span className="ck2-tab-icon">📦</span> Envío
              </button>
              <button
                type="button"
                className={'ck2-tab' + (mode === 'retiro' ? ' active' : '')}
                onClick={() => setMode('retiro')}
              >
                <span className="ck2-tab-icon">📍</span> Retiro
              </button>
            </div>

            {/* ENVÍO — formulario de dirección */}
            {mode === 'envio' && (
              <div className="ck2-address-form">
                <div className="ck2-grid-2">
                  <div className={fieldCls('firstName')}>
                    <input type="text" value={info.firstName} placeholder="Nombre"
                      onChange={e => up('firstName', e.target.value)} autoComplete="given-name" />
                    {touched.firstName && !info.firstName && <span className="ck2-err">Requerido</span>}
                  </div>
                  <div className={fieldCls('lastName')}>
                    <input type="text" value={info.lastName} placeholder="Apellidos"
                      onChange={e => up('lastName', e.target.value)} autoComplete="family-name" />
                    {touched.lastName && !info.lastName && <span className="ck2-err">Requerido</span>}
                  </div>
                </div>
                <div className={fieldCls('address')}>
                  <input type="text" value={info.address} placeholder="Dirección"
                    onChange={e => up('address', e.target.value)} autoComplete="street-address" />
                  {touched.address && !info.address && <span className="ck2-err">Ingresa tu dirección</span>}
                </div>
                <div className="ck2-field">
                  <input type="text" value={info.address2} placeholder="Casa, apartamento, etc. (opcional)"
                    onChange={e => up('address2', e.target.value)} />
                </div>
                <div className="ck2-field">
                  <input type="text" value={info.postal} placeholder="Código postal (opcional)"
                    onChange={e => up('postal', e.target.value)} autoComplete="postal-code" />
                </div>
                <div className={fieldCls('city')}>
                  <input type="text" value={info.city} placeholder="Ciudad / Comuna"
                    onChange={e => up('city', e.target.value)} autoComplete="address-level2" />
                  {touched.city && !info.city && <span className="ck2-err">Ingresa tu ciudad</span>}
                </div>
                <div className={fieldCls('region')}>
                  <select value={info.region} onChange={e => { up('region', e.target.value); setSelectedShip(null); }}>
                    <option value="">Región</option>
                    <option>Arica y Parinacota</option><option>Tarapacá</option>
                    <option>Antofagasta</option><option>Atacama</option>
                    <option>Coquimbo</option><option>Valparaíso</option>
                    <option>Metropolitana</option><option>O'Higgins</option>
                    <option>Maule</option><option>Ñuble</option>
                    <option>Biobío</option><option>Araucanía</option>
                    <option>Los Ríos</option><option>Los Lagos</option>
                    <option>Aysén</option><option>Magallanes</option>
                  </select>
                  {touched.region && !info.region && <span className="ck2-err">Selecciona tu región</span>}
                </div>
                <div className={fieldCls('phone')}>
                  <input type="tel" value={info.phone} placeholder="Teléfono"
                    onChange={e => up('phone', e.target.value)} autoComplete="tel" />
                  {touched.phone && !info.phone && <span className="ck2-err">Ingresa tu teléfono</span>}
                </div>
              </div>
            )}

            {/* RETIRO — info fija + datos mínimos */}
            {mode === 'retiro' && (
              <div className="ck2-retiro-wrap">
                <div className="ck2-radio-card ck2-radio-card--selected ck2-radio-card--static">
                  <span className="ck2-radio-dot ck2-radio-dot--on"></span>
                  <div className="ck2-radio-card__body">
                    <span className="ck2-radio-card__name">Retiro en taller · <strong style={{color:'#ECA10C'}}>GRATIS</strong></span>
                    <span className="ck2-radio-card__meta">📍 Rigoberto Jara 0171</span>
                    <span className="ck2-radio-card__meta">🕐 Lunes a Viernes · 10:00 – 19:00</span>
                    <span className="ck2-radio-card__meta" style={{color:'#666'}}>Recibirás un correo cuando tu pedido esté listo para retirar</span>
                  </div>
                </div>
                <div className="ck2-grid-2" style={{marginTop:'14px'}}>
                  <div className={fieldCls('firstName')}>
                    <input type="text" value={info.firstName} placeholder="Nombre"
                      onChange={e => up('firstName', e.target.value)} autoComplete="given-name" />
                    {touched.firstName && !info.firstName && <span className="ck2-err">Requerido</span>}
                  </div>
                  <div className={fieldCls('lastName')}>
                    <input type="text" value={info.lastName} placeholder="Apellidos"
                      onChange={e => up('lastName', e.target.value)} autoComplete="family-name" />
                    {touched.lastName && !info.lastName && <span className="ck2-err">Requerido</span>}
                  </div>
                </div>
                <div className={fieldCls('phone')}>
                  <input type="tel" value={info.phone} placeholder="Teléfono"
                    onChange={e => up('phone', e.target.value)} autoComplete="tel" />
                  {touched.phone && !info.phone && <span className="ck2-err">Ingresa tu teléfono</span>}
                </div>
              </div>
            )}
          </section>

          {/* ── MÉTODO DE ENVÍO STARKEN (solo modo envío) ── */}
          {mode === 'envio' && (
            <section className="ck2-section">
              <h2 className="ck2-section-title">Método de envío</h2>
              {!info.region ? (
                <p className="ck2-section-sub" style={{color:'#555',marginBottom:0}}>Selecciona tu región arriba para ver las opciones de Starken</p>
              ) : (
                <React.Fragment>
                  <div className="ck2-ship-weight">
                    <span>📦</span>
                    <span>
                      Peso estimado del pedido: <strong>
                        {totalGrams >= 1000
                          ? (totalGrams / 1000).toFixed(2).replace('.', ',') + ' kg'
                          : totalGrams + ' g'}
                      </strong>
                    </span>
                  </div>
                  {shipErr && <p className="ck2-ship-warning">Selecciona un método de envío para continuar</p>}
                  <div className="ck2-ship-list">
                    {starkenOpts.map(opt => (
                      <div
                        key={opt.id}
                        className={'ck2-radio-card' + (selectedShip === opt.id ? ' ck2-radio-card--selected' : '')}
                        onClick={() => { setSelectedShip(opt.id); setShipErr(false); }}
                        role="radio" aria-checked={selectedShip === opt.id}
                        tabIndex={0}
                        onKeyDown={e => e.key === 'Enter' && (setSelectedShip(opt.id), setShipErr(false))}
                      >
                        <span className={'ck2-radio-dot' + (selectedShip === opt.id ? ' ck2-radio-dot--on' : '')}></span>
                        <div className="ck2-radio-card__body">
                          <span className="ck2-radio-card__name">{opt.name}</span>
                          <span className="ck2-radio-card__meta">{opt.eta}</span>
                        </div>
                        <span className="ck2-radio-card__price">+ CLP ${fmtCLP(opt.price)}</span>
                      </div>
                    ))}
                  </div>
                  <p style={{fontSize:'11px',color:'#3a3a3a',marginTop:'8px',letterSpacing:'.3px'}}>
                    Despacho desde Quilicura · Starken opera lunes a sábado
                  </p>
                </React.Fragment>
              )}
            </section>
          )}

          {/* ── PAGO ── */}
          <section className="ck2-section">
            <h2 className="ck2-section-title">Pago</h2>
            <p className="ck2-section-sub">Todas las transacciones son seguras y están encriptadas.</p>
            <div className="ck2-radio-card ck2-radio-card--selected ck2-radio-card--static">
              <span className="ck2-radio-dot ck2-radio-dot--on"></span>
              <div className="ck2-radio-card__body">
                <span className="ck2-radio-card__name">Todos los medios de pago · MercadoPago</span>
                <div className="ck2-pay-badges">
                  <span className="ck2-pay-badge">Visa</span>
                  <span className="ck2-pay-badge">Mastercard</span>
                  <span className="ck2-pay-badge">Débito</span>
                  <span className="ck2-pay-badge">+2</span>
                </div>
              </div>
              <span className="ck2-lock-icon">🔒</span>
            </div>
            <p className="ck2-pay-note">Serás redirigido a MercadoPago para completar la compra de forma segura.</p>
            <p className="ck2-pay-note ck2-pay-note--mobile">📱 En celular: si el botón "Pagar" aparece inactivo, ingresa tu correo en el campo de email que muestra MercadoPago.</p>
          </section>

          {/* ── RESUMEN DEL PEDIDO ── */}
          <section className="ck2-section">
            <h2 className="ck2-section-title">Resumen del pedido</h2>
            <SummaryItems
              cart={cart} setQty={setQty} removeItem={removeItem}
              subtotal={subtotal} shipFee={shipFee} activeShipOpt={activeShipOpt}
              discountApplied={discountApplied} discountAmount={discountAmount} total={total}
              discount={discount} setDiscount={setDiscount}
              discountErr={discountErr} applyDiscount={applyDiscount}
              showDiscount={true}
            />
          </section>

          {/* ── CTA ── */}
          <div className="ck2-cta-block">
            <label className={'ck2-check ck2-terms-check' + (!terms && touched.terms ? ' ck2-terms-err' : '')}>
              <input type="checkbox" checked={terms} onChange={e => setTerms(e.target.checked)} />
              <span>
                He leído y acepto los{' '}
                <a href="#" onClick={e => e.preventDefault()}>términos y condiciones</a>
                {' '}y la{' '}
                <a href="#" onClick={e => e.preventDefault()}>política de privacidad</a>
              </span>
            </label>

            <button
              type="button"
              className={'ck2-pay-btn ck2-pay-btn--' + payState}
              onClick={pay}
              disabled={payState === 'processing'}
            >
              {payState === 'idle' && (
                <React.Fragment>
                  CONFIRMAR Y PAGAR · CLP ${fmtCLP(total)}
                  <span className="ck2-btn-arrow">→</span>
                </React.Fragment>
              )}
              {payState === 'processing' && (
                <React.Fragment>
                  <span className="ck2-spin"></span>
                  Redirigiendo a MercadoPago…
                </React.Fragment>
              )}
            </button>

            <p className="ck2-trust-note">
              🔒 Pago seguro · SSL · Protocolo 1×1 se activa al confirmar
            </p>
          </div>

        </div>{/* /ck2-body */}
      </div>{/* /ck2-page */}
    </div>
  );
}

// ============================================================
// SUMMARY ITEMS (reutilizado en header dropdown y sección final)
// ============================================================
function SummaryItems({
  cart, setQty, removeItem,
  subtotal, shipFee, activeShipOpt, discountApplied, discountAmount, total,
  discount, setDiscount, discountErr, applyDiscount, showDiscount,
}) {
  return (
    <div className="ck2-summary-inner">

      {/* Items */}
      {(cart || []).map(it => (
        <div key={it.uid || it.id} className="ck2-order-item">
          <div className="ck2-order-item__thumb">
            {it.img
              ? <img src={it.img} alt={it.name} />
              : <span className="ck2-order-item__thumb-ph">{it.name.slice(0,2).toUpperCase()}</span>
            }
            <span className="ck2-order-item__qty-badge">{it.qty || 1}</span>
          </div>
          <div className="ck2-order-item__info">
            <div className="ck2-order-item__name">{it.name}</div>
            {it.size  && <div className="ck2-order-item__attr">Talla {it.size}</div>}
            {it.verse && <div className="ck2-order-item__attr">{it.verse}</div>}
            {setQty && (
              <div className="ck2-order-item__controls">
                <button type="button" onClick={() => setQty(it.uid||it.id, (it.qty||1)-1)}>−</button>
                <span>{it.qty || 1}</span>
                <button type="button" onClick={() => setQty(it.uid||it.id, (it.qty||1)+1)}>+</button>
                <button type="button" className="ck2-remove-btn" onClick={() => removeItem(it.uid||it.id)}>×</button>
              </div>
            )}
          </div>
          <div className="ck2-order-item__price">CLP ${fmtCLP(parsePrice(it.price) * (it.qty||1))}</div>
        </div>
      ))}

      {/* Discount */}
      {showDiscount && (
        <div className="ck2-discount-block">
          <div className="ck2-discount-row">
            <input
              type="text"
              value={discount || ''}
              placeholder="Código de descuento"
              onChange={e => setDiscount && setDiscount(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && applyDiscount(e)}
            />
            <button type="button" onClick={applyDiscount}>Aplicar</button>
          </div>
          {discountApplied && (
            <span className="ck2-discount-ok">✓ {discountApplied.code} · −{discountApplied.percent}%</span>
          )}
          {discountErr && <span className="ck2-discount-err">{discountErr}</span>}
        </div>
      )}

      {/* Totals */}
      <div className="ck2-totals">
        <div className="ck2-total-row">
          <span>Subtotal</span>
          <span>CLP ${fmtCLP(subtotal)}</span>
        </div>
        {discountApplied && (
          <div className="ck2-total-row ck2-total-row--disc">
            <span>Descuento · {discountApplied.code}</span>
            <span>−CLP ${fmtCLP(discountAmount)}</span>
          </div>
        )}
        <div className="ck2-total-row">
          <span>Envío{activeShipOpt ? ' · ' + activeShipOpt.name : ''}</span>
          <span style={!activeShipOpt ? {color:'#555'} : {}}>
            {!activeShipOpt ? 'Por seleccionar' : (shipFee === 0 ? 'GRATIS' : 'CLP $' + fmtCLP(shipFee))}
          </span>
        </div>
        <div className="ck2-total-row ck2-total-row--total">
          <strong>Total</strong>
          <strong>
            CLP ${fmtCLP(total)}
            {!activeShipOpt && <span style={{color:'#555',fontSize:'11px',fontWeight:'400'}}> + envío</span>}
          </strong>
        </div>
      </div>

      {/* Protocolo */}
      <div className="ck2-protocol-note">
        <span className="ck2-protocol-note__badge">1×</span>
        <span>
          <strong>Protocolo 1×1.</strong> Esta compra activa una donación de prendas a alguien en situación de calle.
        </span>
      </div>

    </div>
  );
}

Object.assign(window, { Checkout });
