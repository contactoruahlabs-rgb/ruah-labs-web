/* global React */
// ============================================================
// RUAH LABS — Checkout flow (3 pasos + confirmación)
// Reutiliza branding existente: .btn, .btn--amber, .btn--ghost,
// tipografía mono/serif, paleta ámbar/marfil/negro.
// ============================================================

const SHIPPING_OPTIONS = [{
  id: 'std',
  name: 'Envío estándar',
  eta: '5 – 7 días hábiles',
  price: 4990
}, {
  id: 'express',
  name: 'Envío express',
  eta: '24 – 48 hrs',
  price: 9990
}, {
  id: 'pickup',
  name: 'Retiro en taller',
  eta: 'Lunes a viernes · Ñuñoa',
  price: 0
}];
const PAY_METHODS = [{
  id: 'card',
  name: 'Tarjeta',
  hint: 'Crédito / Débito · Visa · Mastercard · Amex'
}, {
  id: 'webpay',
  name: 'Webpay',
  hint: 'Transbank · Redcompra'
}, {
  id: 'transfer',
  name: 'Transferencia',
  hint: 'BancoEstado · Tesorería RUAH'
}];
function parsePrice(p) {
  // "18.990" -> 18990 ; "9990" -> 9990
  return parseInt(String(p || '0').replace(/[^\d]/g, ''), 10) || 0;
}
function fmtCLP(n) {
  return new Intl.NumberFormat('es-CL').format(Math.max(0, Math.round(n || 0)));
}
function detectCardBrand(num) {
  const s = (num || '').replace(/\s+/g, '');
  if (/^4/.test(s)) return 'visa';
  if (/^(5[1-5]|2[2-7])/.test(s)) return 'mastercard';
  if (/^3[47]/.test(s)) return 'amex';
  if (/^6(011|5)/.test(s)) return 'discover';
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
function CardBrandMark({
  brand
}) {
  if (!brand) {
    return /*#__PURE__*/React.createElement("span", {
      className: "ck-card-brand ck-card-brand--blank",
      "aria-hidden": "true"
    }, /*#__PURE__*/React.createElement("span", null), /*#__PURE__*/React.createElement("span", null), /*#__PURE__*/React.createElement("span", null), /*#__PURE__*/React.createElement("span", null));
  }
  const labels = {
    visa: 'VISA',
    mastercard: 'MC',
    amex: 'AMEX',
    discover: 'DISC'
  };
  return /*#__PURE__*/React.createElement("span", {
    className: 'ck-card-brand ck-card-brand--' + brand
  }, labels[brand]);
}

// ============================================================
// MAIN
// ============================================================
function Checkout({
  open,
  cart,
  content,
  onClose,
  onUpdateCart
}) {
  const [step, setStep] = React.useState(0);
  const [info, setInfo] = React.useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    address2: '',
    city: '',
    region: '',
    postal: '',
    phone: '',
    country: 'Chile',
    newsletter: true
  });
  const [shipping, setShipping] = React.useState(SHIPPING_OPTIONS[0].id);
  const [payMethod, setPayMethod] = React.useState('card');
  const [card, setCard] = React.useState({
    num: '',
    name: '',
    exp: '',
    cvv: ''
  });
  const [discount, setDiscount] = React.useState('');
  const [discountApplied, setDiscountApplied] = React.useState(null);
  const [discountErr, setDiscountErr] = React.useState('');
  const [terms, setTerms] = React.useState(false);
  const [payState, setPayState] = React.useState('idle'); // idle | processing | success
  const [orderNum, setOrderNum] = React.useState('');
  const [touched, setTouched] = React.useState({});

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
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);
  React.useEffect(() => {
    if (!open) return;
    const onKey = e => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;

  // ---------------------- Totals ----------------------
  const subtotal = (cart || []).reduce((s, it) => s + parsePrice(it.price) * (it.qty || 1), 0);
  const shipOpt = SHIPPING_OPTIONS.find(s => s.id === shipping) || SHIPPING_OPTIONS[0];
  const shipFee = shipOpt.price;
  const discountAmount = discountApplied ? Math.round(subtotal * discountApplied.percent / 100) : 0;
  const total = Math.max(0, subtotal - discountAmount) + shipFee;
  const cardBrand = detectCardBrand(card.num);

  // ---------------------- Validation ----------------------
  function infoValid() {
    return info.email.includes('@') && info.firstName && info.lastName && info.address && info.city && info.region && info.phone;
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
      setDiscountApplied({
        code: 'BIENVENIDO10',
        percent: 10
      });
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
    onUpdateCart(c => c.map(it => (it.uid || it.id) === uid ? {
      ...it,
      qty: Math.max(1, qty)
    } : it));
  }
  function removeItem(uid) {
    onUpdateCart(c => c.filter(it => (it.uid || it.id) !== uid));
  }
  function goStep(n) {
    if (n > step) {
      if (step === 0 && !infoValid()) {
        setTouched({
          email: 1,
          firstName: 1,
          lastName: 1,
          address: 1,
          city: 1,
          region: 1,
          phone: 1
        });
        return;
      }
    }
    setStep(Math.max(0, Math.min(3, n)));
    requestAnimationFrame(() => {
      const el = document.querySelector('.ck-stage');
      if (el) el.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
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
        email: info.email,
        firstName: info.firstName,
        lastName: info.lastName,
        phone: info.phone,
        cart: cart,
        total: total,
        discount: discountApplied ? discountApplied.code : null
      }));
    } catch (_) {}
    fetch('' + window.RUAH_API + '/api/checkout/create-preference', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        cart: cart,
        info: info,
        discount: discountApplied ? discountApplied.code : null,
        shippingMethod: shipping
      })
    }).then(function (r) {
      return r.json();
    }).then(function (data) {
      if (data.error) {
        setPayState('idle');
        alert('Error MP: ' + data.error);
        return;
      }
      // Guardar número de pedido antes del redirect
      try {
        var pending = JSON.parse(sessionStorage.getItem('ruah-pending-order') || '{}');
        pending.orderId = data.preference_id || 'RUAH-' + Date.now().toString().slice(-8);
        sessionStorage.setItem('ruah-pending-order', JSON.stringify(pending));
      } catch (_) {}
      var url = data.init_point || data.sandbox_init_point;
      window.location.href = url;
    }).catch(function (err) {
      setPayState('idle');
      alert('No se pudo conectar con el servidor de pagos.\nAsegúrate de que el API server esté corriendo (puerto 3001).\n\n' + err.message);
    });
  }

  // ---------------------- Steps ----------------------
  const ck = content && content.checkout || {};
  return /*#__PURE__*/React.createElement("div", {
    className: "ck-overlay",
    role: "dialog",
    "aria-modal": "true"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ck-shell"
  }, /*#__PURE__*/React.createElement("header", {
    className: "ck-top"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ck-top__brand"
  }, /*#__PURE__*/React.createElement("img", {
    src: window.__resources && window.__resources.logoWhite || "assets/ruah-logo-white.png",
    alt: "RUAH LABS",
    className: "ck-top__logo"
  }), /*#__PURE__*/React.createElement("span", {
    className: "ck-top__tag"
  }, ck.topTag || 'CHECKOUT · ACTIVA PROTOCOLO 1×1')), /*#__PURE__*/React.createElement("button", {
    className: "ck-close",
    onClick: onClose,
    "aria-label": "Cerrar"
  }, "\xD7")), step < 3 && /*#__PURE__*/React.createElement(Stepper, {
    step: step,
    onGo: goStep,
    labels: ck.stepLabels
  }), /*#__PURE__*/React.createElement("div", {
    className: "ck-stage"
  }, step === 3 ? /*#__PURE__*/React.createElement(Confirmation, {
    order: orderNum,
    info: info,
    total: total,
    cart: cart,
    onClose: onClose,
    content: content
  }) : /*#__PURE__*/React.createElement("div", {
    className: "ck-layout"
  }, /*#__PURE__*/React.createElement("main", {
    className: "ck-main"
  }, step === 0 && /*#__PURE__*/React.createElement(StepInfo, {
    info: info,
    setInfo: setInfo,
    touched: touched,
    onNext: () => goStep(1),
    content: content
  }), step === 1 && /*#__PURE__*/React.createElement(StepShipping, {
    shipping: shipping,
    setShipping: setShipping,
    onBack: () => goStep(0),
    onNext: () => goStep(2),
    content: content
  }), step === 2 && /*#__PURE__*/React.createElement(StepPay, {
    payMethod: payMethod,
    setPayMethod: setPayMethod,
    card: card,
    setCard: setCard,
    cardBrand: cardBrand,
    discount: discount,
    setDiscount: setDiscount,
    discountApplied: discountApplied,
    discountErr: discountErr,
    applyDiscount: applyDiscount,
    terms: terms,
    setTerms: setTerms,
    total: total,
    payState: payState,
    onBack: () => goStep(1),
    onPay: pay,
    cardValid: cardValid(),
    content: content
  })), /*#__PURE__*/React.createElement(Summary, {
    cart: cart,
    setQty: setQty,
    removeItem: removeItem,
    subtotal: subtotal,
    shipOpt: shipOpt,
    shipFee: shipFee,
    discountApplied: discountApplied,
    discountAmount: discountAmount,
    total: total,
    content: content
  })))));
}

// ============================================================
// STEPPER
// ============================================================
function Stepper({
  step,
  onGo,
  labels
}) {
  const steps = labels && labels.length === 3 ? labels : ['INFORMACIÓN', 'ENVÍO', 'PAGO'];
  return /*#__PURE__*/React.createElement("nav", {
    className: "ck-stepper",
    "aria-label": "Pasos del checkout"
  }, steps.map((label, i) => /*#__PURE__*/React.createElement("button", {
    key: label,
    type: "button",
    className: 'ck-step' + (i === step ? ' active' : '') + (i < step ? ' done' : ''),
    onClick: () => i < step && onGo(i),
    disabled: i > step
  }, /*#__PURE__*/React.createElement("span", {
    className: "ck-step__n"
  }, String(i + 1).padStart(2, '0')), /*#__PURE__*/React.createElement("span", {
    className: "ck-step__l"
  }, label))));
}

// ============================================================
// STEP 1 — INFORMACIÓN
// ============================================================
function StepInfo({
  info,
  setInfo,
  touched,
  onNext,
  content
}) {
  const ck = content && content.checkout || {};
  function up(k, v) {
    setInfo({
      ...info,
      [k]: v
    });
  }
  function err(k) {
    return touched[k] && !info[k];
  }
  function submit(e) {
    e.preventDefault();
    onNext();
  }
  return /*#__PURE__*/React.createElement("form", {
    className: "ck-form",
    onSubmit: submit,
    noValidate: true
  }, /*#__PURE__*/React.createElement("h2", {
    className: "ck-h"
  }, ck.infoTitle || 'Información de contacto'), /*#__PURE__*/React.createElement("p", {
    className: "ck-sub"
  }, ck.infoSub || 'Recibirás aquí el comprobante y el registro del Protocolo 1×1.'), /*#__PURE__*/React.createElement("label", {
    className: 'ck-field' + (err('email') ? ' invalid' : '')
  }, /*#__PURE__*/React.createElement("span", null, "EMAIL"), /*#__PURE__*/React.createElement("input", {
    type: "email",
    required: true,
    value: info.email,
    onChange: e => up('email', e.target.value),
    placeholder: "tu@correo.cl",
    autoComplete: "email"
  })), /*#__PURE__*/React.createElement("h3", {
    className: "ck-h2"
  }, ck.addressTitle || 'Dirección de envío'), /*#__PURE__*/React.createElement("label", {
    className: "ck-field"
  }, /*#__PURE__*/React.createElement("span", null, "PA\xCDS / REGI\xD3N"), /*#__PURE__*/React.createElement("select", {
    value: info.country,
    onChange: e => up('country', e.target.value)
  }, /*#__PURE__*/React.createElement("option", null, "Chile"), /*#__PURE__*/React.createElement("option", null, "Argentina"), /*#__PURE__*/React.createElement("option", null, "Per\xFA"), /*#__PURE__*/React.createElement("option", null, "Colombia"), /*#__PURE__*/React.createElement("option", null, "M\xE9xico"), /*#__PURE__*/React.createElement("option", null, "Espa\xF1a"))), /*#__PURE__*/React.createElement("div", {
    className: "ck-grid-2"
  }, /*#__PURE__*/React.createElement("label", {
    className: 'ck-field' + (err('firstName') ? ' invalid' : '')
  }, /*#__PURE__*/React.createElement("span", null, "NOMBRE"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    required: true,
    value: info.firstName,
    onChange: e => up('firstName', e.target.value),
    placeholder: "Mar\xEDa",
    autoComplete: "given-name"
  })), /*#__PURE__*/React.createElement("label", {
    className: 'ck-field' + (err('lastName') ? ' invalid' : '')
  }, /*#__PURE__*/React.createElement("span", null, "APELLIDO"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    required: true,
    value: info.lastName,
    onChange: e => up('lastName', e.target.value),
    placeholder: "Gonz\xE1lez",
    autoComplete: "family-name"
  }))), /*#__PURE__*/React.createElement("label", {
    className: 'ck-field' + (err('address') ? ' invalid' : '')
  }, /*#__PURE__*/React.createElement("span", null, "DIRECCI\xD3N"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    required: true,
    value: info.address,
    onChange: e => up('address', e.target.value),
    placeholder: "Calle, n\xFAmero",
    autoComplete: "street-address"
  })), /*#__PURE__*/React.createElement("label", {
    className: "ck-field"
  }, /*#__PURE__*/React.createElement("span", null, "DEPTO / OFICINA \xB7 OPCIONAL"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: info.address2,
    onChange: e => up('address2', e.target.value),
    placeholder: "Depto 402 \xB7 Torre B"
  })), /*#__PURE__*/React.createElement("div", {
    className: "ck-grid-3"
  }, /*#__PURE__*/React.createElement("label", {
    className: 'ck-field' + (err('city') ? ' invalid' : '')
  }, /*#__PURE__*/React.createElement("span", null, "CIUDAD"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    required: true,
    value: info.city,
    onChange: e => up('city', e.target.value),
    placeholder: "Santiago",
    autoComplete: "address-level2"
  })), /*#__PURE__*/React.createElement("label", {
    className: 'ck-field' + (err('region') ? ' invalid' : '')
  }, /*#__PURE__*/React.createElement("span", null, "REGI\xD3N"), /*#__PURE__*/React.createElement("select", {
    required: true,
    value: info.region,
    onChange: e => up('region', e.target.value)
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "\u2014 Selecciona \u2014"), /*#__PURE__*/React.createElement("option", null, "Arica y Parinacota"), /*#__PURE__*/React.createElement("option", null, "Tarapac\xE1"), /*#__PURE__*/React.createElement("option", null, "Antofagasta"), /*#__PURE__*/React.createElement("option", null, "Atacama"), /*#__PURE__*/React.createElement("option", null, "Coquimbo"), /*#__PURE__*/React.createElement("option", null, "Valpara\xEDso"), /*#__PURE__*/React.createElement("option", null, "Metropolitana"), /*#__PURE__*/React.createElement("option", null, "O'Higgins"), /*#__PURE__*/React.createElement("option", null, "Maule"), /*#__PURE__*/React.createElement("option", null, "\xD1uble"), /*#__PURE__*/React.createElement("option", null, "Biob\xEDo"), /*#__PURE__*/React.createElement("option", null, "Araucan\xEDa"), /*#__PURE__*/React.createElement("option", null, "Los R\xEDos"), /*#__PURE__*/React.createElement("option", null, "Los Lagos"), /*#__PURE__*/React.createElement("option", null, "Ays\xE9n"), /*#__PURE__*/React.createElement("option", null, "Magallanes"))), /*#__PURE__*/React.createElement("label", {
    className: "ck-field"
  }, /*#__PURE__*/React.createElement("span", null, "C\xD3D. POSTAL"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: info.postal,
    onChange: e => up('postal', e.target.value),
    placeholder: "7500000",
    autoComplete: "postal-code"
  }))), /*#__PURE__*/React.createElement("label", {
    className: 'ck-field' + (err('phone') ? ' invalid' : '')
  }, /*#__PURE__*/React.createElement("span", null, "TEL\xC9FONO"), /*#__PURE__*/React.createElement("input", {
    type: "tel",
    required: true,
    value: info.phone,
    onChange: e => up('phone', e.target.value),
    placeholder: "+56 9 0000 0000",
    autoComplete: "tel"
  })), /*#__PURE__*/React.createElement("label", {
    className: "ck-check"
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: info.newsletter,
    onChange: e => up('newsletter', e.target.checked)
  }), /*#__PURE__*/React.createElement("span", null, "Sumarme al bolet\xEDn mensual del Protocolo 1\xD71 (sin spam).")), /*#__PURE__*/React.createElement("div", {
    className: "ck-actions"
  }, /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: "btn btn--amber"
  }, ck.nextLabel || 'Continuar a envío', " ", /*#__PURE__*/React.createElement("span", {
    className: "arrow"
  }, "\u2192"))));
}

// ============================================================
// STEP 2 — ENVÍO
// ============================================================
function StepShipping({
  shipping,
  setShipping,
  onBack,
  onNext,
  content
}) {
  const ck = content && content.checkout || {};
  return /*#__PURE__*/React.createElement("form", {
    className: "ck-form",
    onSubmit: e => {
      e.preventDefault();
      onNext();
    }
  }, /*#__PURE__*/React.createElement("h2", {
    className: "ck-h"
  }, ck.shippingTitle || 'Método de envío'), /*#__PURE__*/React.createElement("p", {
    className: "ck-sub"
  }, ck.shippingSub || 'Despachamos a todo Chile. Retiro disponible Lun – Vie, 11 a 19h.'), /*#__PURE__*/React.createElement("div", {
    className: "ck-options"
  }, SHIPPING_OPTIONS.map(opt => /*#__PURE__*/React.createElement("label", {
    key: opt.id,
    className: 'ck-opt' + (shipping === opt.id ? ' active' : '')
  }, /*#__PURE__*/React.createElement("input", {
    type: "radio",
    name: "ship",
    value: opt.id,
    checked: shipping === opt.id,
    onChange: () => setShipping(opt.id)
  }), /*#__PURE__*/React.createElement("div", {
    className: "ck-opt__body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ck-opt__row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ck-opt__name"
  }, opt.name), /*#__PURE__*/React.createElement("span", {
    className: "ck-opt__price"
  }, opt.price === 0 ? 'GRATIS' : 'CLP $' + fmtCLP(opt.price))), /*#__PURE__*/React.createElement("div", {
    className: "ck-opt__eta"
  }, opt.eta)), /*#__PURE__*/React.createElement("span", {
    className: "ck-opt__radio",
    "aria-hidden": "true"
  })))), /*#__PURE__*/React.createElement("div", {
    className: "ck-actions ck-actions--split"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn--ghost",
    onClick: onBack
  }, ck.backLabel || '← Volver'), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: "btn btn--amber"
  }, ck.nextPayLabel || 'Continuar a pago', " ", /*#__PURE__*/React.createElement("span", {
    className: "arrow"
  }, "\u2192"))));
}

// ============================================================
// STEP 3 — PAGO
// ============================================================
function StepPay({
  payMethod,
  setPayMethod,
  card,
  setCard,
  cardBrand,
  discount,
  setDiscount,
  discountApplied,
  discountErr,
  applyDiscount,
  terms,
  setTerms,
  total,
  payState,
  onBack,
  onPay,
  cardValid,
  content
}) {
  const ck = content && content.checkout || {};
  function onCardNum(e) {
    const formatted = formatCardNumber(e.target.value, cardBrand);
    setCard({
      ...card,
      num: formatted
    });
  }
  return /*#__PURE__*/React.createElement("form", {
    className: "ck-form",
    onSubmit: onPay
  }, /*#__PURE__*/React.createElement("h2", {
    className: "ck-h"
  }, ck.payTitle || 'Método de pago'), /*#__PURE__*/React.createElement("div", {
    className: "ck-tabs"
  }, PAY_METHODS.map(m => /*#__PURE__*/React.createElement("button", {
    key: m.id,
    type: "button",
    className: 'ck-tab' + (payMethod === m.id ? ' active' : ''),
    onClick: () => setPayMethod(m.id)
  }, m.name))), /*#__PURE__*/React.createElement("p", {
    className: "ck-tab__hint"
  }, PAY_METHODS.find(m => m.id === payMethod)?.hint), payMethod === 'card' && /*#__PURE__*/React.createElement("div", {
    className: "ck-card-form"
  }, /*#__PURE__*/React.createElement("label", {
    className: "ck-field"
  }, /*#__PURE__*/React.createElement("span", null, "N\xDAMERO DE TARJETA"), /*#__PURE__*/React.createElement("div", {
    className: "ck-input-row"
  }, /*#__PURE__*/React.createElement("input", {
    type: "text",
    inputMode: "numeric",
    value: card.num,
    onChange: onCardNum,
    placeholder: "0000 0000 0000 0000",
    autoComplete: "cc-number",
    maxLength: cardBrand === 'amex' ? 17 : 19
  }), /*#__PURE__*/React.createElement(CardBrandMark, {
    brand: cardBrand
  }))), /*#__PURE__*/React.createElement("label", {
    className: "ck-field"
  }, /*#__PURE__*/React.createElement("span", null, "NOMBRE EN LA TARJETA"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: card.name,
    onChange: e => setCard({
      ...card,
      name: e.target.value.toUpperCase()
    }),
    placeholder: "COMO APARECE EN LA TARJETA",
    autoComplete: "cc-name"
  })), /*#__PURE__*/React.createElement("div", {
    className: "ck-grid-2"
  }, /*#__PURE__*/React.createElement("label", {
    className: "ck-field"
  }, /*#__PURE__*/React.createElement("span", null, "VENCIMIENTO"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    inputMode: "numeric",
    value: card.exp,
    onChange: e => setCard({
      ...card,
      exp: formatExp(e.target.value)
    }),
    placeholder: "MM/AA",
    maxLength: 5,
    autoComplete: "cc-exp"
  })), /*#__PURE__*/React.createElement("label", {
    className: "ck-field"
  }, /*#__PURE__*/React.createElement("span", null, "CVV"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    inputMode: "numeric",
    value: card.cvv,
    onChange: e => setCard({
      ...card,
      cvv: e.target.value.replace(/\D/g, '').slice(0, cardBrand === 'amex' ? 4 : 3)
    }),
    placeholder: cardBrand === 'amex' ? '4 dígitos' : '3 dígitos',
    autoComplete: "cc-csc"
  })))), payMethod === 'webpay' && /*#__PURE__*/React.createElement("div", {
    className: "ck-alt"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ck-alt__t"
  }, "Ser\xE1s redirigido a Webpay Transbank."), /*#__PURE__*/React.createElement("div", {
    className: "ck-alt__d"
  }, "Pago seguro \xB7 soporta Visa, Mastercard, Redcompra, d\xE9bito.")), payMethod === 'transfer' && /*#__PURE__*/React.createElement("div", {
    className: "ck-alt"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ck-alt__t"
  }, "Transferencia electr\xF3nica"), /*#__PURE__*/React.createElement("div", {
    className: "ck-alt__d"
  }, "BancoEstado \xB7 Cuenta Vista 1234567 \xB7 ruahlabs.cl@gmail.com \u2014 confirmaremos al recibirla.")), /*#__PURE__*/React.createElement("div", {
    className: "ck-discount"
  }, /*#__PURE__*/React.createElement("label", {
    className: "ck-field"
  }, /*#__PURE__*/React.createElement("span", null, "C\xD3DIGO DE DESCUENTO"), /*#__PURE__*/React.createElement("div", {
    className: "ck-input-row"
  }, /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: discount,
    onChange: e => setDiscount(e.target.value.toUpperCase()),
    placeholder: "EJ: BIENVENIDO10"
  }), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "ck-apply",
    onClick: applyDiscount
  }, "Aplicar")), discountApplied && /*#__PURE__*/React.createElement("span", {
    className: "ck-discount__ok"
  }, "\u2713 ", discountApplied.code, " \xB7 \u2212", discountApplied.percent, "%"), discountErr && /*#__PURE__*/React.createElement("span", {
    className: "ck-discount__err"
  }, discountErr))), /*#__PURE__*/React.createElement("label", {
    className: "ck-check"
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: terms,
    onChange: e => setTerms(e.target.checked)
  }), /*#__PURE__*/React.createElement("span", null, "Acepto los ", /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => e.preventDefault()
  }, "t\xE9rminos"), " y la ", /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => e.preventDefault()
  }, "pol\xEDtica de privacidad"), ".")), /*#__PURE__*/React.createElement("div", {
    className: "ck-trust"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ck-trust__i"
  }, "\u25AA"), /*#__PURE__*/React.createElement("span", null, ck.trustTxt || 'Pago cifrado SSL · No guardamos datos de tarjeta · Protocolo 1×1 se activa al confirmar')), /*#__PURE__*/React.createElement("div", {
    className: "ck-actions ck-actions--split"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn--ghost",
    onClick: onBack,
    disabled: payState === 'processing'
  }, ck.backLabel || '← Volver'), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: 'btn btn--amber ck-pay ck-pay--' + payState,
    disabled: payState === 'processing' || !terms || payMethod === 'card' && !cardValid
  }, payState === 'idle' && /*#__PURE__*/React.createElement(React.Fragment, null, ck.payCtaLabel || 'Pagar', " CLP $", fmtCLP(total), " ", /*#__PURE__*/React.createElement("span", {
    className: "arrow"
  }, "\u2192")), payState === 'processing' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    className: "ck-spin"
  }), " Procesando\u2026"), payState === 'success' && /*#__PURE__*/React.createElement(React.Fragment, null, "\u2713 Pago confirmado"))));
}

// ============================================================
// CONFIRMACIÓN
// ============================================================
function Confirmation({
  order,
  info,
  total,
  cart,
  onClose,
  content
}) {
  const ck = content && content.checkout || {};
  return /*#__PURE__*/React.createElement("div", {
    className: "ck-confirm"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ck-check-wrap"
  }, /*#__PURE__*/React.createElement("svg", {
    className: "ck-check-svg",
    viewBox: "0 0 64 64",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "32",
    cy: "32",
    r: "30",
    stroke: "currentColor",
    strokeWidth: "2",
    fill: "none"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M18 32 L28 42 L46 22",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "3",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }))), /*#__PURE__*/React.createElement("h2", {
    className: "ck-confirm__t"
  }, ck.confirmedTitle || 'PEDIDO CONFIRMADO.'), /*#__PURE__*/React.createElement("p", {
    className: "ck-confirm__sub"
  }, "Gracias, ", /*#__PURE__*/React.createElement("strong", null, info.firstName || 'hermano'), ". El Protocolo 1\xD71 ya est\xE1 activado: una prenda saldr\xE1 a la calle a tu nombre."), /*#__PURE__*/React.createElement("div", {
    className: "ck-confirm__order"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ck-confirm__row"
  }, /*#__PURE__*/React.createElement("span", null, "N\xB0 ORDEN"), /*#__PURE__*/React.createElement("code", null, order)), /*#__PURE__*/React.createElement("div", {
    className: "ck-confirm__row"
  }, /*#__PURE__*/React.createElement("span", null, "EMAIL"), /*#__PURE__*/React.createElement("code", null, info.email || '—')), /*#__PURE__*/React.createElement("div", {
    className: "ck-confirm__row"
  }, /*#__PURE__*/React.createElement("span", null, "TOTAL PAGADO"), /*#__PURE__*/React.createElement("code", null, "CLP $", fmtCLP(total)))), /*#__PURE__*/React.createElement("div", {
    className: "ck-confirm__items"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ck-confirm__items__hd"
  }, "PIEZAS EN TU PEDIDO"), (cart || []).map(it => /*#__PURE__*/React.createElement("div", {
    className: "ck-confirm__item",
    key: it.id
  }, /*#__PURE__*/React.createElement("span", null, it.name, it.size ? ' · Talla ' + it.size : '', " ", it.qty > 1 ? '× ' + it.qty : ''), /*#__PURE__*/React.createElement("span", null, "CLP $", fmtCLP(parsePrice(it.price) * (it.qty || 1)))))), /*#__PURE__*/React.createElement("div", {
    className: "ck-confirm__actions"
  }, /*#__PURE__*/React.createElement("a", {
    className: "btn btn--ghost",
    href: '#orden-' + order,
    onClick: onClose
  }, "Seguir mi orden"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn--amber",
    onClick: onClose
  }, "Seguir comprando ", /*#__PURE__*/React.createElement("span", {
    className: "arrow"
  }, "\u2192"))), /*#__PURE__*/React.createElement("p", {
    className: "ck-confirm__note"
  }, "Te enviamos a ", /*#__PURE__*/React.createElement("strong", null, info.email), " el resumen y el seguimiento. Cuando salgamos a ruta, recibir\xE1s el registro de entrega (foto al piso, nunca de frente)."));
}

// ============================================================
// SUMMARY (sticky right column)
// ============================================================
function Summary({
  cart,
  setQty,
  removeItem,
  subtotal,
  shipOpt,
  shipFee,
  discountApplied,
  discountAmount,
  total,
  content
}) {
  const [collapsed, setCollapsed] = React.useState(false);
  const ck = content && content.checkout || {};
  return /*#__PURE__*/React.createElement("aside", {
    className: 'ck-summary' + (collapsed ? ' collapsed' : '')
  }, /*#__PURE__*/React.createElement("button", {
    className: "ck-summary__toggle",
    type: "button",
    onClick: () => setCollapsed(c => !c),
    "aria-expanded": !collapsed
  }, /*#__PURE__*/React.createElement("span", null, ck.summaryHd || 'RESUMEN DEL PEDIDO'), /*#__PURE__*/React.createElement("span", {
    className: "ck-summary__total-mini"
  }, "CLP $", fmtCLP(total), " ", /*#__PURE__*/React.createElement("span", {
    className: "caret"
  }, collapsed ? '▾' : '▴'))), /*#__PURE__*/React.createElement("div", {
    className: "ck-summary__body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ck-summary__items"
  }, (cart || []).length === 0 && /*#__PURE__*/React.createElement("div", {
    className: "ck-summary__empty"
  }, "CARRITO VAC\xCDO"), (cart || []).map(it => /*#__PURE__*/React.createElement("div", {
    className: "ck-summary__item",
    key: it.id
  }, /*#__PURE__*/React.createElement("div", {
    className: "ck-summary__media"
  }, it.img ? /*#__PURE__*/React.createElement("img", {
    src: it.img,
    alt: it.name
  }) : /*#__PURE__*/React.createElement("span", null, it.name.split(' ').slice(-1)[0].slice(0, 2)), /*#__PURE__*/React.createElement("span", {
    className: "ck-summary__qty"
  }, it.qty || 1)), /*#__PURE__*/React.createElement("div", {
    className: "ck-summary__info"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ck-summary__name"
  }, it.name), it.size && /*#__PURE__*/React.createElement("div", {
    className: "ck-summary__size"
  }, "TALLA ", it.size), /*#__PURE__*/React.createElement("div", {
    className: "ck-summary__verse"
  }, it.verse || ''), /*#__PURE__*/React.createElement("div", {
    className: "ck-summary__qtybar"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setQty(it.uid || it.id, (it.qty || 1) - 1),
    "aria-label": "Menos"
  }, "\u2212"), /*#__PURE__*/React.createElement("span", null, it.qty || 1), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setQty(it.uid || it.id, (it.qty || 1) + 1),
    "aria-label": "M\xE1s"
  }, "+"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "ck-summary__rm",
    onClick: () => removeItem(it.uid || it.id),
    "aria-label": "Eliminar"
  }, "\xD7"))), /*#__PURE__*/React.createElement("div", {
    className: "ck-summary__price"
  }, "CLP $", fmtCLP(parsePrice(it.price) * (it.qty || 1)))))), /*#__PURE__*/React.createElement("div", {
    className: "ck-summary__rows"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ck-summary__row"
  }, /*#__PURE__*/React.createElement("span", null, "Subtotal"), /*#__PURE__*/React.createElement("span", null, "CLP $", fmtCLP(subtotal))), /*#__PURE__*/React.createElement("div", {
    className: "ck-summary__row"
  }, /*#__PURE__*/React.createElement("span", null, "Env\xEDo \xB7 ", shipOpt.name), /*#__PURE__*/React.createElement("span", null, shipFee === 0 ? 'GRATIS' : 'CLP $' + fmtCLP(shipFee))), discountApplied && /*#__PURE__*/React.createElement("div", {
    className: "ck-summary__row ck-summary__row--disc"
  }, /*#__PURE__*/React.createElement("span", null, "Descuento ", discountApplied.code), /*#__PURE__*/React.createElement("span", null, "\u2212 CLP $", fmtCLP(discountAmount))), /*#__PURE__*/React.createElement("div", {
    className: "ck-summary__row ck-summary__row--total"
  }, /*#__PURE__*/React.createElement("span", null, "TOTAL"), /*#__PURE__*/React.createElement("span", null, "CLP $", fmtCLP(total)))), /*#__PURE__*/React.createElement("div", {
    className: "ck-summary__protocol"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ck-summary__protocol__icon"
  }, "1\xD7"), /*#__PURE__*/React.createElement("span", null, ck.summaryProtocol ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("strong", null, "PROTOCOLO 1\xD71."), " ", ck.summaryProtocol.replace(/^PROTOCOLO 1×1\.?\s*/, '')) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("strong", null, "PROTOCOLO 1\xD71."), " Esta compra dona una prenda filtrada a alguien en situaci\xF3n de calle.")))));
}
Object.assign(window, {
  Checkout
});