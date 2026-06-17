/* global React */
// ============================================================
// RUAH LABS — Checkout flow (3 pasos + confirmación)
// Reutiliza branding existente: .btn, .btn--amber, .btn--ghost,
// tipografía mono/serif, paleta ámbar/marfil/negro.
// ============================================================

const SHIPPING_OPTIONS = [
  { id: 'std',     name: 'Envío estándar',     eta: '5 – 7 días hábiles', price: 4990 },
  { id: 'express', name: 'Envío express',      eta: '24 – 48 hrs',         price: 9990 },
  { id: 'pickup',  name: 'Retiro en taller',   eta: 'Lunes a viernes · Ñuñoa', price: 0 },
];

const PAY_METHODS = [
  { id: 'card',     name: 'Tarjeta',          hint: 'Crédito / Débito · Visa · Mastercard · Amex' },
  { id: 'webpay',   name: 'Webpay',           hint: 'Transbank · Redcompra' },
  { id: 'transfer', name: 'Transferencia',    hint: 'BancoEstado · Tesorería RUAH' },
];

function parsePrice(p) {
  // "18.990" -> 18990 ; "9990" -> 9990
  return parseInt(String(p || '0').replace(/[^\d]/g, ''), 10) || 0;
}
function fmtCLP(n) {
  return new Intl.NumberFormat('es-CL').format(Math.max(0, Math.round(n || 0)));
}

function detectCardBrand(num) {
  const s = (num || '').replace(/\s+/g, '');
  if (/^4/.test(s))                              return 'visa';
  if (/^(5[1-5]|2[2-7])/.test(s))                return 'mastercard';
  if (/^3[47]/.test(s))                          return 'amex';
  if (/^6(011|5)/.test(s))                       return 'discover';
  return null;
}
function formatCardNumber(num, brand) {
  const s = (num || '').replace(/\D/g, '');
  if (brand === 'amex') {
    return s.replace(/(\d{0,4})(\d{0,6})(\d{0,5}).*/, (_, a, b, c) => [a, b, c].filter(Boolean).join(' ')).trim();
  }
  return s.replace(/(\d{4})/g, '$1 ').trim().slice(0, 19);
}
function formatExp(s) {
  const v = (s || '').replace(/\D/g, '').slice(0, 4);
  if (v.length < 3) return v;
  return v.slice(0, 2) + '/' + v.slice(2);
}

function CardBrandMark({ brand }) {
  if (!brand) {
    return (
      <span className="ck-card-brand ck-card-brand--blank" aria-hidden="true">
        <span></span><span></span><span></span><span></span>
      </span>
    );
  }
  const labels = { visa: 'VISA', mastercard: 'MC', amex: 'AMEX', discover: 'DISC' };
  return <span className={'ck-card-brand ck-card-brand--' + brand}>{labels[brand]}</span>;
}

// ============================================================
// MAIN
// ============================================================
function Checkout({ open, cart, content, onClose, onUpdateCart }) {
  const [step, setStep]         = React.useState(0);
  const [info, setInfo]         = React.useState({
    email: '', firstName: '', lastName: '', address: '', address2: '',
    city: '', region: '', postal: '', phone: '', country: 'Chile', newsletter: true,
  });
  const [shipping, setShipping] = React.useState(SHIPPING_OPTIONS[0].id);
  const [payMethod, setPayMethod] = React.useState('card');
  const [card, setCard]         = React.useState({ num: '', name: '', exp: '', cvv: '' });
  const [discount, setDiscount] = React.useState('');
  const [discountApplied, setDiscountApplied] = React.useState(null);
  const [discountErr, setDiscountErr] = React.useState('');
  const [terms, setTerms]       = React.useState(false);
  const [payState, setPayState] = React.useState('idle'); // idle | processing | success
  const [orderNum, setOrderNum] = React.useState('');
  const [touched, setTouched]   = React.useState({});

  // Reset when re-opened
  React.useEffect(() => {
    if (open) {
      setStep(0);
      setPayState('idle');
      setTouched({});
    }
  }, [open]);

  React.useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  // ---------------------- Totals ----------------------
  const subtotal = (cart || []).reduce((s, it) => s + parsePrice(it.price) * (it.qty || 1), 0);
  const shipOpt  = SHIPPING_OPTIONS.find(s => s.id === shipping) || SHIPPING_OPTIONS[0];
  const shipFee  = shipOpt.price;
  const discountAmount = discountApplied ? Math.round(subtotal * discountApplied.percent / 100) : 0;
  const total    = Math.max(0, subtotal - discountAmount) + shipFee;

  const cardBrand = detectCardBrand(card.num);

  // ---------------------- Validation ----------------------
  function infoValid() {
    return info.email.includes('@') &&
           info.firstName && info.lastName &&
           info.address && info.city && info.region && info.phone;
  }
  function cardValid() {
    const n = card.num.replace(/\D/g, '');
    return n.length >= 13 && card.name && /^\d{2}\/\d{2}$/.test(card.exp) && card.cvv.length >= 3 && terms;
  }

  // ---------------------- Actions ----------------------
  function applyDiscount(e) {
    e && e.preventDefault();
    const code = discount.trim().toUpperCase();
    if (code === 'BIENVENIDO10') {
      setDiscountApplied({ code: 'BIENVENIDO10', percent: 10 });
      setDiscountErr('');
    } else if (code === '') {
      setDiscountApplied(null);
      setDiscountErr('');
    } else {
      setDiscountApplied(null);
      setDiscountErr('Código no válido');
    }
  }

  function setQty(uid, qty) {
    onUpdateCart(c => c.map(it => (it.uid || it.id) === uid ? { ...it, qty: Math.max(1, qty) } : it));
  }
  function removeItem(uid) {
    onUpdateCart(c => c.filter(it => (it.uid || it.id) !== uid));
  }

  function goStep(n) {
    if (n > step) {
      if (step === 0 && !infoValid()) {
        setTouched({ email: 1, firstName: 1, lastName: 1, address: 1, city: 1, region: 1, phone: 1 });
        return;
      }
    }
    setStep(Math.max(0, Math.min(3, n)));
    requestAnimationFrame(() => {
      const el = document.querySelector('.ck-stage');
      if (el) el.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  function pay(e) {
    e.preventDefault();
    if (payMethod === 'card' && !cardValid()) return;
    if (payMethod !== 'card' && !terms) return;
    setPayState('processing');
    // Guardar datos del comprador para recuperarlos después del redirect de MP
    try {
      sessionStorage.setItem('ruah-pending-order', JSON.stringify({
        email: info.email, firstName: info.firstName, lastName: info.lastName,
        phone: info.phone, cart: cart, total: total, discount: discountApplied ? discountApplied.code : null,
      }));
    } catch(_) {}
    fetch('' + window.RUAH_API + '/api/checkout/create-preference', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cart: cart, info: info, discount: discountApplied ? discountApplied.code : null, shippingMethod: shipping }),
    })
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if (data.error) { setPayState('idle'); alert('Error MP: ' + data.error); return; }
      // Guardar número de pedido antes del redirect
      try {
        var pending = JSON.parse(sessionStorage.getItem('ruah-pending-order') || '{}');
        var _chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        var _code  = 'RL';
        for (var _i = 0; _i < 4; _i++) _code += _chars[Math.floor(Math.random() * _chars.length)];
        pending.orderId = _code;
        sessionStorage.setItem('ruah-pending-order', JSON.stringify(pending));
      } catch(_) {}
      var url = data.init_point || data.sandbox_init_point;
      window.location.href = url;
    })
    .catch(function(err) {
      setPayState('idle');
      alert('No se pudo conectar con el servidor de pagos.\nAsegúrate de que el API server esté corriendo (puerto 3001).\n\n' + err.message);
    });
  }

  // ---------------------- Steps ----------------------
  const ck = (content && content.checkout) || {};
  return (
    <div className="ck-overlay" role="dialog" aria-modal="true">
      <div className="ck-shell">
        <header className="ck-top">
          <div className="ck-top__brand">
            <img src={(window.__resources && window.__resources.logoWhite) || "https://res.cloudinary.com/dh05zwrbp/image/upload/v1781323723/ruahlabs/s6aaamzrfbcwd46icjxu.png"} alt="RUAH LABS" className="ck-top__logo" />
            <span className="ck-top__tag">{ck.topTag || 'CHECKOUT · ACTIVA PROTOCOLO 1×1'}</span>
          </div>
          <button className="ck-close" onClick={onClose} aria-label="Cerrar">×</button>
        </header>

        {step < 3 && (
          <Stepper step={step} onGo={goStep} labels={ck.stepLabels} />
        )}

        <div className="ck-stage">
          {step === 3 ? (
            <Confirmation order={orderNum} info={info} total={total} cart={cart} onClose={onClose} content={content} />
          ) : (
            <div className="ck-layout">
              <main className="ck-main">
                {step === 0 && (
                  <StepInfo
                    info={info} setInfo={setInfo}
                    touched={touched}
                    onNext={() => goStep(1)}
                    content={content}
                  />
                )}
                {step === 1 && (
                  <StepShipping
                    shipping={shipping} setShipping={setShipping}
                    onBack={() => goStep(0)} onNext={() => goStep(2)}
                    content={content}
                  />
                )}
                {step === 2 && (
                  <StepPay
                    payMethod={payMethod} setPayMethod={setPayMethod}
                    card={card} setCard={setCard}
                    cardBrand={cardBrand}
                    discount={discount} setDiscount={setDiscount}
                    discountApplied={discountApplied} discountErr={discountErr}
                    applyDiscount={applyDiscount}
                    terms={terms} setTerms={setTerms}
                    total={total} payState={payState}
                    onBack={() => goStep(1)} onPay={pay}
                    cardValid={cardValid()}
                    content={content}
                  />
                )}
              </main>
              <Summary
                cart={cart} setQty={setQty} removeItem={removeItem}
                subtotal={subtotal} shipOpt={shipOpt} shipFee={shipFee}
                discountApplied={discountApplied} discountAmount={discountAmount}
                total={total}
                content={content}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// STEPPER
// ============================================================
function Stepper({ step, onGo, labels }) {
  const steps = (labels && labels.length === 3) ? labels : ['INFORMACIÓN', 'ENVÍO', 'PAGO'];
  return (
    <nav className="ck-stepper" aria-label="Pasos del checkout">
      {steps.map((label, i) => (
        <button
          key={label}
          type="button"
          className={'ck-step' + (i === step ? ' active' : '') + (i < step ? ' done' : '')}
          onClick={() => i < step && onGo(i)}
          disabled={i > step}
        >
          <span className="ck-step__n">{String(i + 1).padStart(2, '0')}</span>
          <span className="ck-step__l">{label}</span>
        </button>
      ))}
    </nav>
  );
}

// ============================================================
// STEP 1 — INFORMACIÓN
// ============================================================
function StepInfo({ info, setInfo, touched, onNext, content }) {
  const ck = (content && content.checkout) || {};
  function up(k, v) { setInfo({ ...info, [k]: v }); }
  function err(k) { return touched[k] && !info[k]; }

  function submit(e) { e.preventDefault(); onNext(); }

  return (
    <form className="ck-form" onSubmit={submit} noValidate>
      <h2 className="ck-h">{ck.infoTitle || 'Información de contacto'}</h2>
      <p className="ck-sub">{ck.infoSub || 'Recibirás aquí el comprobante y el registro del Protocolo 1×1.'}</p>

      <label className={'ck-field' + (err('email') ? ' invalid' : '')}>
        <span>EMAIL</span>
        <input
          type="email" required value={info.email}
          onChange={e => up('email', e.target.value)}
          placeholder="tu@correo.cl" autoComplete="email"
        />
      </label>

      <h3 className="ck-h2">{ck.addressTitle || 'Dirección de envío'}</h3>

      <label className="ck-field">
        <span>PAÍS / REGIÓN</span>
        <select value={info.country} onChange={e => up('country', e.target.value)}>
          <option>Chile</option>
          <option>Argentina</option>
          <option>Perú</option>
          <option>Colombia</option>
          <option>México</option>
          <option>España</option>
        </select>
      </label>

      <div className="ck-grid-2">
        <label className={'ck-field' + (err('firstName') ? ' invalid' : '')}>
          <span>NOMBRE</span>
          <input type="text" required value={info.firstName} onChange={e => up('firstName', e.target.value)} placeholder="María" autoComplete="given-name" />
        </label>
        <label className={'ck-field' + (err('lastName') ? ' invalid' : '')}>
          <span>APELLIDO</span>
          <input type="text" required value={info.lastName} onChange={e => up('lastName', e.target.value)} placeholder="González" autoComplete="family-name" />
        </label>
      </div>

      <label className={'ck-field' + (err('address') ? ' invalid' : '')}>
        <span>DIRECCIÓN</span>
        <input type="text" required value={info.address} onChange={e => up('address', e.target.value)} placeholder="Calle, número" autoComplete="street-address" />
      </label>
      <label className="ck-field">
        <span>DEPTO / OFICINA · OPCIONAL</span>
        <input type="text" value={info.address2} onChange={e => up('address2', e.target.value)} placeholder="Depto 402 · Torre B" />
      </label>

      <div className="ck-grid-3">
        <label className={'ck-field' + (err('city') ? ' invalid' : '')}>
          <span>CIUDAD</span>
          <input type="text" required value={info.city} onChange={e => up('city', e.target.value)} placeholder="Santiago" autoComplete="address-level2" />
        </label>
        <label className={'ck-field' + (err('region') ? ' invalid' : '')}>
          <span>REGIÓN</span>
          <select required value={info.region} onChange={e => up('region', e.target.value)}>
            <option value="">— Selecciona —</option>
            <option>Arica y Parinacota</option><option>Tarapacá</option><option>Antofagasta</option>
            <option>Atacama</option><option>Coquimbo</option><option>Valparaíso</option>
            <option>Metropolitana</option><option>O'Higgins</option><option>Maule</option>
            <option>Ñuble</option><option>Biobío</option><option>Araucanía</option>
            <option>Los Ríos</option><option>Los Lagos</option><option>Aysén</option>
            <option>Magallanes</option>
          </select>
        </label>
        <label className="ck-field">
          <span>CÓD. POSTAL</span>
          <input type="text" value={info.postal} onChange={e => up('postal', e.target.value)} placeholder="7500000" autoComplete="postal-code" />
        </label>
      </div>

      <label className={'ck-field' + (err('phone') ? ' invalid' : '')}>
        <span>TELÉFONO</span>
        <input type="tel" required value={info.phone} onChange={e => up('phone', e.target.value)} placeholder="+56 9 0000 0000" autoComplete="tel" />
      </label>

      <label className="ck-check">
        <input type="checkbox" checked={info.newsletter} onChange={e => up('newsletter', e.target.checked)} />
        <span>Sumarme al boletín mensual del Protocolo 1×1 (sin spam).</span>
      </label>

      <div className="ck-actions">
        <button type="submit" className="btn btn--amber">
          {ck.nextLabel || 'Continuar a envío'} <span className="arrow">→</span>
        </button>
      </div>
    </form>
  );
}

// ============================================================
// STEP 2 — ENVÍO
// ============================================================
function StepShipping({ shipping, setShipping, onBack, onNext, content }) {
  const ck = (content && content.checkout) || {};
  return (
    <form className="ck-form" onSubmit={(e) => { e.preventDefault(); onNext(); }}>
      <h2 className="ck-h">{ck.shippingTitle || 'Método de envío'}</h2>
      <p className="ck-sub">{ck.shippingSub || 'Despachamos a todo Chile. Retiro disponible Lun – Vie, 11 a 19h.'}</p>

      <div className="ck-options">
        {SHIPPING_OPTIONS.map(opt => (
          <label key={opt.id} className={'ck-opt' + (shipping === opt.id ? ' active' : '')}>
            <input type="radio" name="ship" value={opt.id} checked={shipping === opt.id} onChange={() => setShipping(opt.id)} />
            <div className="ck-opt__body">
              <div className="ck-opt__row">
                <span className="ck-opt__name">{opt.name}</span>
                <span className="ck-opt__price">{opt.price === 0 ? 'GRATIS' : 'CLP $' + fmtCLP(opt.price)}</span>
              </div>
              <div className="ck-opt__eta">{opt.eta}</div>
            </div>
            <span className="ck-opt__radio" aria-hidden="true"></span>
          </label>
        ))}
      </div>

      <div className="ck-actions ck-actions--split">
        <button type="button" className="btn btn--ghost" onClick={onBack}>{ck.backLabel || '← Volver'}</button>
        <button type="submit" className="btn btn--amber">
          {ck.nextPayLabel || 'Continuar a pago'} <span className="arrow">→</span>
        </button>
      </div>
    </form>
  );
}

// ============================================================
// STEP 3 — PAGO
// ============================================================
function StepPay({
  payMethod, setPayMethod, card, setCard, cardBrand,
  discount, setDiscount, discountApplied, discountErr, applyDiscount,
  terms, setTerms, total, payState, onBack, onPay, cardValid, content,
}) {
  const ck = (content && content.checkout) || {};
  function onCardNum(e) {
    const formatted = formatCardNumber(e.target.value, cardBrand);
    setCard({ ...card, num: formatted });
  }
  return (
    <form className="ck-form" onSubmit={onPay}>
      <h2 className="ck-h">{ck.payTitle || 'Método de pago'}</h2>

      <div className="ck-pay-logos" aria-label="Métodos de pago aceptados">
        <span className="ck-pay-logo ck-pay-logo--mp">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{verticalAlign:'middle',marginRight:5}}><circle cx="12" cy="12" r="12"/></svg>
          mercado pago
        </span>
      </div>

      <div className="ck-tabs">
        {PAY_METHODS.map(m => (
          <button
            key={m.id} type="button"
            className={'ck-tab' + (payMethod === m.id ? ' active' : '')}
            onClick={() => setPayMethod(m.id)}
          >
            {m.name}
          </button>
        ))}
      </div>
      <p className="ck-tab__hint">{PAY_METHODS.find(m => m.id === payMethod)?.hint}</p>

      {payMethod === 'card' && (
        <div className="ck-card-form">
          <label className="ck-field">
            <span>NÚMERO DE TARJETA</span>
            <div className="ck-input-row">
              <input
                type="text" inputMode="numeric"
                value={card.num} onChange={onCardNum}
                placeholder="0000 0000 0000 0000"
                autoComplete="cc-number"
                maxLength={cardBrand === 'amex' ? 17 : 19}
              />
              <CardBrandMark brand={cardBrand} />
            </div>
          </label>

          <label className="ck-field">
            <span>NOMBRE EN LA TARJETA</span>
            <input
              type="text" value={card.name}
              onChange={e => setCard({ ...card, name: e.target.value.toUpperCase() })}
              placeholder="COMO APARECE EN LA TARJETA"
              autoComplete="cc-name"
            />
          </label>

          <div className="ck-grid-2">
            <label className="ck-field">
              <span>VENCIMIENTO</span>
              <input
                type="text" inputMode="numeric"
                value={card.exp} onChange={e => setCard({ ...card, exp: formatExp(e.target.value) })}
                placeholder="MM/AA" maxLength={5} autoComplete="cc-exp"
              />
            </label>
            <label className="ck-field">
              <span>CVV</span>
              <input
                type="text" inputMode="numeric"
                value={card.cvv}
                onChange={e => setCard({ ...card, cvv: e.target.value.replace(/\D/g, '').slice(0, cardBrand === 'amex' ? 4 : 3) })}
                placeholder={cardBrand === 'amex' ? '4 dígitos' : '3 dígitos'}
                autoComplete="cc-csc"
              />
            </label>
          </div>
        </div>
      )}

      {payMethod === 'webpay' && (
        <div className="ck-alt">
          <div className="ck-alt__t">Serás redirigido a Webpay Transbank.</div>
          <div className="ck-alt__d">Pago seguro · soporta Visa, Mastercard, Redcompra, débito.</div>
        </div>
      )}
      {payMethod === 'transfer' && (
        <div className="ck-alt">
          <div className="ck-alt__t">Transferencia electrónica</div>
          <div className="ck-alt__d">BancoEstado · Cuenta Vista 1234567 · contacto@ruahlabs.cl — confirmaremos al recibirla.</div>
        </div>
      )}

      <div className="ck-discount">
        <label className="ck-field">
          <span>CÓDIGO DE DESCUENTO</span>
          <div className="ck-input-row">
            <input
              type="text" value={discount}
              onChange={e => setDiscount(e.target.value.toUpperCase())}
              placeholder="EJ: BIENVENIDO10"
            />
            <button type="button" className="ck-apply" onClick={applyDiscount}>Aplicar</button>
          </div>
          {discountApplied && <span className="ck-discount__ok">✓ {discountApplied.code} · −{discountApplied.percent}%</span>}
          {discountErr && <span className="ck-discount__err">{discountErr}</span>}
        </label>
      </div>

      <label className="ck-check">
        <input type="checkbox" checked={terms} onChange={e => setTerms(e.target.checked)} />
        <span>Acepto los <a href="#" onClick={(e) => e.preventDefault()}>términos</a> y la <a href="#" onClick={(e) => e.preventDefault()}>política de privacidad</a>.</span>
      </label>

      <div className="ck-trust">
        <span className="ck-trust__i">▪</span>
        <span>{ck.trustTxt || 'Pago cifrado SSL · No guardamos datos de tarjeta · Protocolo 1×1 se activa al confirmar'}</span>
      </div>

      <div className="ck-actions ck-actions--split">
        <button type="button" className="btn btn--ghost" onClick={onBack} disabled={payState === 'processing'}>{ck.backLabel || '← Volver'}</button>
        <button
          type="submit"
          className={'btn btn--amber ck-pay ck-pay--' + payState}
          disabled={payState === 'processing' || !terms || (payMethod === 'card' && !cardValid)}
        >
          {payState === 'idle' && <React.Fragment>{ck.payCtaLabel || 'Pagar'} CLP ${fmtCLP(total)} <span className="arrow">→</span></React.Fragment>}
          {payState === 'processing' && <React.Fragment><span className="ck-spin"></span> Procesando…</React.Fragment>}
          {payState === 'success' && <React.Fragment>✓ Pago confirmado</React.Fragment>}
        </button>
      </div>
    </form>
  );
}

// ============================================================
// CONFIRMACIÓN
// ============================================================
function Confirmation({ order, info, total, cart, onClose, content }) {
  const ck = (content && content.checkout) || {};
  return (
    <div className="ck-confirm">
      <div className="ck-check-wrap">
        <svg className="ck-check-svg" viewBox="0 0 64 64" aria-hidden="true">
          <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="2" fill="none" />
          <path d="M18 32 L28 42 L46 22" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h2 className="ck-confirm__t">{ck.confirmedTitle || 'PEDIDO CONFIRMADO.'}</h2>
      <p className="ck-confirm__sub">
        Gracias, <strong>{info.firstName || 'hermano'}</strong>. El Protocolo 1×1 ya está activado: una prenda saldrá a la calle a tu nombre.
      </p>

      <div className="ck-confirm__order">
        <div className="ck-confirm__row"><span>N° ORDEN</span><code>{order}</code></div>
        <div className="ck-confirm__row"><span>EMAIL</span><code>{info.email || '—'}</code></div>
        <div className="ck-confirm__row"><span>TOTAL PAGADO</span><code>CLP ${fmtCLP(total)}</code></div>
      </div>

      <div className="ck-confirm__items">
        <div className="ck-confirm__items__hd">PIEZAS EN TU PEDIDO</div>
        {(cart || []).map(it => (
          <div className="ck-confirm__item" key={it.id}>
            <span>{it.name}{it.size ? ' · Talla ' + it.size : ''} {it.qty > 1 ? '× ' + it.qty : ''}</span>
            <span>CLP ${fmtCLP(parsePrice(it.price) * (it.qty || 1))}</span>
          </div>
        ))}
      </div>

      <div className="ck-confirm__actions">
        <a className="btn btn--ghost" href={'#orden-' + order} onClick={onClose}>Seguir mi orden</a>
        <button type="button" className="btn btn--amber" onClick={onClose}>
          Seguir comprando <span className="arrow">→</span>
        </button>
      </div>

      <p className="ck-confirm__note">
        Te enviamos a <strong>{info.email}</strong> el resumen y el seguimiento. Cuando salgamos a ruta, recibirás el registro de entrega (foto al piso, nunca de frente).
      </p>
    </div>
  );
}

// ============================================================
// SUMMARY (sticky right column)
// ============================================================
function Summary({ cart, setQty, removeItem, subtotal, shipOpt, shipFee, discountApplied, discountAmount, total, content }) {
  const [collapsed, setCollapsed] = React.useState(false);
  const ck = (content && content.checkout) || {};
  return (
    <aside className={'ck-summary' + (collapsed ? ' collapsed' : '')}>
      <button
        className="ck-summary__toggle"
        type="button"
        onClick={() => setCollapsed(c => !c)}
        aria-expanded={!collapsed}
      >
        <span>{ck.summaryHd || 'RESUMEN DEL PEDIDO'}</span>
        <span className="ck-summary__total-mini">CLP ${fmtCLP(total)} <span className="caret">{collapsed ? '▾' : '▴'}</span></span>
      </button>

      <div className="ck-summary__body">
        <div className="ck-summary__items">
          {(cart || []).length === 0 && (
            <div className="ck-summary__empty">CARRITO VACÍO</div>
          )}
          {(cart || []).map(it => (
            <div className="ck-summary__item" key={it.id}>
              <div className="ck-summary__media">
                {it.img
                  ? <img src={it.img} alt={it.name} />
                  : <span>{it.name.split(' ').slice(-1)[0].slice(0, 2)}</span>}
                <span className="ck-summary__qty">{it.qty || 1}</span>
              </div>
              <div className="ck-summary__info">
                <div className="ck-summary__name">{it.name}</div>
                {it.size && <div className="ck-summary__size">TALLA {it.size}</div>}
                <div className="ck-summary__verse">{it.verse || ''}</div>
                <div className="ck-summary__qtybar">
                  <button type="button" onClick={() => setQty(it.uid || it.id, (it.qty || 1) - 1)} aria-label="Menos">−</button>
                  <span>{it.qty || 1}</span>
                  <button type="button" onClick={() => setQty(it.uid || it.id, (it.qty || 1) + 1)} aria-label="Más">+</button>
                  <button type="button" className="ck-summary__rm" onClick={() => removeItem(it.uid || it.id)} aria-label="Eliminar">×</button>
                </div>
              </div>
              <div className="ck-summary__price">CLP ${fmtCLP(parsePrice(it.price) * (it.qty || 1))}</div>
            </div>
          ))}
        </div>

        <div className="ck-summary__rows">
          <div className="ck-summary__row"><span>Subtotal</span><span>CLP ${fmtCLP(subtotal)}</span></div>
          <div className="ck-summary__row"><span>Envío · {shipOpt.name}</span><span>{shipFee === 0 ? 'GRATIS' : 'CLP $' + fmtCLP(shipFee)}</span></div>
          {discountApplied && (
            <div className="ck-summary__row ck-summary__row--disc">
              <span>Descuento {discountApplied.code}</span>
              <span>− CLP ${fmtCLP(discountAmount)}</span>
            </div>
          )}
          <div className="ck-summary__row ck-summary__row--total">
            <span>TOTAL</span><span>CLP ${fmtCLP(total)}</span>
          </div>
        </div>

        <div className="ck-summary__protocol">
          <span className="ck-summary__protocol__icon">1×</span>
          <span>{ck.summaryProtocol
            ? <React.Fragment><strong>PROTOCOLO 1×1.</strong> {ck.summaryProtocol.replace(/^PROTOCOLO 1×1\.?\s*/, '')}</React.Fragment>
            : <React.Fragment><strong>PROTOCOLO 1×1.</strong> Esta compra dona una prenda filtrada a alguien en situación de calle.</React.Fragment>
          }</span>
        </div>
      </div>
    </aside>
  );
}

Object.assign(window, { Checkout });
