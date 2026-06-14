/* global React, Reveal, RevealLine, SectionHeader */
// ============================================================
// RUAH LABS — Cuadros e Iglesias
// ============================================================

function ruahDebug(msg) {
  var el = document.getElementById('ruah-debug-banner');
  if (!el) {
    el = document.createElement('div');
    el.id = 'ruah-debug-banner';
    el.style.cssText = 'position:fixed;bottom:0;left:0;right:0;background:#111;color:#eca10c;padding:10px 16px;z-index:99999;font-family:monospace;font-size:13px;border-top:2px solid #eca10c';
    document.body.appendChild(el);
  }
  el.textContent = '[RUAH DEBUG] ' + msg;
  clearTimeout(el._t);
  el._t = setTimeout(function () {
    el.textContent = '';
  }, 10000);
}

// ============================================================
// CUADRO PRODUCT MODAL
// ============================================================
function CuadroProductModal({
  productId,
  cuadros,
  onClose,
  onAddToCart,
  onBuyNow
}) {
  const open = !!productId;
  const product = open ? (cuadros.products || []).find(p => p.id === productId) : null;
  const [idx, setIdx] = React.useState(0);
  React.useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    setIdx(0);
  }, [open, productId]);
  React.useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape' && open) onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open || !product) return null;
  const gallery = [product.img, ...(product.gallery || [])].filter(Boolean);
  const currentImg = gallery[idx] || null;
  return ReactDOM.createPortal(/*#__PURE__*/React.createElement("div", {
    className: "pd-overlay open",
    onClick: onClose,
    role: "dialog",
    "aria-modal": "true"
  }, /*#__PURE__*/React.createElement("div", {
    className: "pd",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("button", {
    className: "pd__close",
    onClick: onClose,
    "aria-label": "Cerrar"
  }, "\xD7"), /*#__PURE__*/React.createElement("div", {
    className: "pd__media"
  }, /*#__PURE__*/React.createElement("div", {
    className: "pd__main pd__main--artwork"
  }, currentImg ? /*#__PURE__*/React.createElement("img", {
    src: currentImg,
    alt: product.name
  }) : /*#__PURE__*/React.createElement("div", {
    className: "pd__ph",
    style: {
      fontFamily: 'var(--mono)',
      fontSize: 14,
      letterSpacing: '0.2em'
    }
  }, product.style || 'CU')), gallery.length > 1 && /*#__PURE__*/React.createElement("div", {
    className: "pd__thumbs"
  }, gallery.map((g, i) => /*#__PURE__*/React.createElement("button", {
    key: i,
    className: 'pd__thumb' + (i === idx ? ' active' : ''),
    onClick: () => setIdx(i),
    "aria-label": 'Imagen ' + (i + 1)
  }, /*#__PURE__*/React.createElement("img", {
    src: g,
    alt: ""
  }))))), /*#__PURE__*/React.createElement("div", {
    className: "pd__body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "pd__verse"
  }, product.style, product.size ? ' · ' + product.size : '', product.tag ? ' · ' + product.tag : ''), /*#__PURE__*/React.createElement("h2", {
    className: "pd__title"
  }, product.name), /*#__PURE__*/React.createElement("div", {
    className: "pd__price"
  }, /*#__PURE__*/React.createElement("span", {
    className: "clp"
  }, "CLP"), "$", product.price), /*#__PURE__*/React.createElement("div", {
    className: "pd__scrollable"
  }, product.description && /*#__PURE__*/React.createElement("p", {
    className: "pd__desc"
  }, product.description), (product.details || []).length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "pd__details"
  }, product.details.map(d => /*#__PURE__*/React.createElement("div", {
    className: "pd__detail",
    key: d.id
  }, /*#__PURE__*/React.createElement("span", {
    className: "lbl"
  }, d.label), /*#__PURE__*/React.createElement("span", {
    className: "val"
  }, d.value))))), /*#__PURE__*/React.createElement("div", {
    className: "pd__protocol"
  }, /*#__PURE__*/React.createElement("span", {
    className: "icon"
  }, "1\xD7"), /*#__PURE__*/React.createElement("span", {
    className: "txt"
  }, /*#__PURE__*/React.createElement("strong", null, "PROTOCOLO 1\xD71 ACTIVO."), "\xA0Esta compra dona una prenda a alguien en situaci\xF3n de calle.")), /*#__PURE__*/React.createElement("div", {
    className: "pd__cta"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn--amber",
    onClick: () => {
      if (onBuyNow) onBuyNow(product.id);else onClose();
    }
  }, "Ir a pagar ", /*#__PURE__*/React.createElement("span", {
    className: "arrow"
  }, "\u2192")), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn--ghost",
    onClick: () => {
      if (onAddToCart) onAddToCart(product.id, 1);
    }
  }, "A\xF1adir al carrito"))))), document.body);
}

// ============================================================
// GALLERY MODAL (shared: Iglesias + Eventos)
// ============================================================
function GalleryModal({
  title,
  subtitle,
  photos,
  onClose
}) {
  const open = !!photos;
  const [idx, setIdx] = React.useState(0);
  const touchRef = React.useRef(null);
  const trackRef = React.useRef(null);
  React.useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    setIdx(0);
  }, [open]);
  React.useEffect(() => {
    function onKey(e) {
      if (!open) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && photos) setIdx(i => Math.min(i + 1, photos.length - 1));
      if (e.key === 'ArrowLeft' && photos) setIdx(i => Math.max(i - 1, 0));
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose, photos]);
  if (!open) return null;
  const imgs = (photos || []).filter(Boolean);
  const total = imgs.length;
  function prev(e) {
    e && e.stopPropagation();
    setIdx(i => Math.max(i - 1, 0));
  }
  function next(e) {
    e && e.stopPropagation();
    setIdx(i => Math.min(i + 1, total - 1));
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "gallery-overlay open",
    role: "dialog",
    "aria-modal": "true"
  }, /*#__PURE__*/React.createElement("div", {
    className: "gallery-modal",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    className: "gallery-modal__top"
  }, /*#__PURE__*/React.createElement("div", {
    className: "gallery-modal__info"
  }, subtitle && /*#__PURE__*/React.createElement("span", {
    className: "gallery-modal__code"
  }, subtitle), /*#__PURE__*/React.createElement("h3", {
    className: "gallery-modal__name"
  }, title)), /*#__PURE__*/React.createElement("button", {
    className: "gallery-modal__back",
    onClick: onClose
  }, "\u2190 REGRESAR")), imgs.length === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "gallery-modal__empty"
  }, "\u2014 SIN FOTOGRAF\xCDAS A\xDAN \u2014") : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "gallery-modal__main",
    onTouchStart: e => {
      touchRef.current = e.touches[0].clientX;
    },
    onTouchEnd: e => {
      var dx = e.changedTouches[0].clientX - (touchRef.current || 0);
      if (Math.abs(dx) > 40) {
        if (dx < 0) next();else prev();
      }
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: imgs[idx],
    alt: title + ' · ' + (idx + 1)
  }), total > 1 && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
    className: "gm__arr gm__arr--prev",
    onClick: prev,
    disabled: idx === 0
  }, "\u2039"), /*#__PURE__*/React.createElement("button", {
    className: "gm__arr gm__arr--next",
    onClick: next,
    disabled: idx === total - 1
  }, "\u203A"), /*#__PURE__*/React.createElement("div", {
    className: "gm__count"
  }, idx + 1, " / ", total))), total > 1 && /*#__PURE__*/React.createElement("div", {
    className: "gallery-modal__strip",
    ref: trackRef
  }, imgs.map((ph, i) => /*#__PURE__*/React.createElement("button", {
    key: i,
    className: 'gm__thumb' + (i === idx ? ' active' : ''),
    onClick: () => setIdx(i),
    "aria-label": 'Foto ' + (i + 1)
  }, /*#__PURE__*/React.createElement("img", {
    src: ph,
    alt: "",
    loading: "lazy"
  })))))));
}

// ============================================================
// CUADROS
// ============================================================
function Cuadros({
  content,
  onAddToCart,
  onBuyNow,
  onOpenCuadro
}) {
  const c = content.cuadros;
  const [activeStep, setActiveStep] = React.useState(0);
  const openCuadro = id => {
    if (onOpenCuadro) onOpenCuadro(id);
  };
  const [selectedEstilo, setSelectedEstilo] = React.useState(null);
  const [selectedFormato, setSelectedFormato] = React.useState(null);
  return /*#__PURE__*/React.createElement("section", {
    className: "cuadros",
    id: "cuadros"
  }, /*#__PURE__*/React.createElement("div", {
    className: "shell"
  }, /*#__PURE__*/React.createElement(SectionHeader, {
    index: c.headerIndex,
    title: c.headerTitle,
    right: c.headerRight
  }), /*#__PURE__*/React.createElement("div", {
    className: "cu-hero"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cu-hero__text"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "cu-hero__title"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(RevealLine, {
    delay: 20
  }, c.title1)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(RevealLine, {
    delay: 140
  }, c.title2)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(RevealLine, {
    delay: 260
  }, c.title3))), /*#__PURE__*/React.createElement(Reveal, {
    delay: 400,
    className: "cu-hero__lede"
  }, /*#__PURE__*/React.createElement("p", null, c.lede))), /*#__PURE__*/React.createElement("div", {
    className: "cu-hero__styles"
  }, (c.styles || []).map((s, i) => /*#__PURE__*/React.createElement(Reveal, {
    key: s.id,
    delay: i * 70,
    className: 'cu-style' + (s.img ? ' has-img' : '')
  }, s.img && /*#__PURE__*/React.createElement("img", {
    src: s.img,
    alt: s.tag,
    className: "cu-style__img"
  }), /*#__PURE__*/React.createElement("div", {
    className: "cu-style__top"
  }, /*#__PURE__*/React.createElement("span", {
    className: "cu-style__sq"
  }, "\u25AA"), /*#__PURE__*/React.createElement("span", {
    className: "cu-style__tag"
  }, s.tag)), /*#__PURE__*/React.createElement("div", {
    className: "cu-style__pattern"
  }), /*#__PURE__*/React.createElement("div", {
    className: "cu-style__foot"
  }, /*#__PURE__*/React.createElement("span", {
    className: "cu-style__bar"
  }), /*#__PURE__*/React.createElement("span", {
    className: "cu-style__desc"
  }, s.desc)))))), c.products && c.products.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "cu-catalog"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cu-catalog__head"
  }, /*#__PURE__*/React.createElement(Reveal, null, /*#__PURE__*/React.createElement("div", {
    className: "mono-label"
  }, c.productsEyebrow || '[ CATÁLOGO CUADROS ]')), /*#__PURE__*/React.createElement("h3", {
    className: "cu-catalog__title"
  }, /*#__PURE__*/React.createElement(RevealLine, null, c.productsTitle || 'CUADROS'), ' ', /*#__PURE__*/React.createElement(RevealLine, {
    delay: 120
  }, /*#__PURE__*/React.createElement("span", {
    className: "amb"
  }, c.productsTitleEm || 'EN VENTA'))), /*#__PURE__*/React.createElement(Reveal, {
    delay: 250
  }, /*#__PURE__*/React.createElement("p", {
    className: "cu-catalog__sub"
  }, c.productsSub))), /*#__PURE__*/React.createElement("div", {
    className: "cu-prod-grid"
  }, (c.products || []).map((it, i) => /*#__PURE__*/React.createElement(Reveal, {
    key: it.id,
    delay: i * 70,
    className: "cu-prod",
    onClick: () => openCuadro(it.id)
  }, /*#__PURE__*/React.createElement("div", {
    className: "cu-prod__media"
  }, it.img ? /*#__PURE__*/React.createElement("img", {
    src: it.img,
    alt: it.name,
    loading: "lazy"
  }) : /*#__PURE__*/React.createElement("div", {
    className: "cu-prod__ph"
  }, (it.name || '').split(' ').slice(-1)[0].slice(0, 2)), it.tag && /*#__PURE__*/React.createElement("span", {
    className: "cu-prod__tag"
  }, it.tag), /*#__PURE__*/React.createElement("span", {
    className: "cu-prod__view"
  }, "Ver detalle \u2192")), /*#__PURE__*/React.createElement("div", {
    className: "cu-prod__body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cu-prod__style"
  }, it.style), /*#__PURE__*/React.createElement("h4", {
    className: "cu-prod__name"
  }, it.name), /*#__PURE__*/React.createElement("div", {
    className: "cu-prod__row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cu-prod__price"
  }, /*#__PURE__*/React.createElement("span", {
    className: "clp"
  }, "CLP"), "$", it.price), /*#__PURE__*/React.createElement("button", {
    className: "cu-prod__buy",
    onClick: e => {
      e.stopPropagation();
      openCuadro(it.id);
    }
  }, "Ver \u2192"))))))), /*#__PURE__*/React.createElement("div", {
    className: "cu-brief"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cu-brief__left"
  }, /*#__PURE__*/React.createElement(Reveal, null, /*#__PURE__*/React.createElement("div", {
    className: "mono-label cu-brief__eyebrow"
  }, c.briefEyebrow)), /*#__PURE__*/React.createElement("h3", {
    className: "cu-brief__title"
  }, /*#__PURE__*/React.createElement(RevealLine, null, c.briefTitle)), /*#__PURE__*/React.createElement(Reveal, {
    delay: 200,
    className: "cu-brief__sub"
  }, /*#__PURE__*/React.createElement("p", null, c.briefSub))), /*#__PURE__*/React.createElement("div", {
    className: "cu-brief__right"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cu-tabs",
    role: "tablist"
  }, (c.steps || []).map((s, i) => /*#__PURE__*/React.createElement("button", {
    key: s.id,
    className: 'cu-tab' + (i === activeStep ? ' active' : ''),
    onClick: () => setActiveStep(i),
    role: "tab",
    "aria-selected": i === activeStep,
    type: "button"
  }, s.num, "-", s.name))), /*#__PURE__*/React.createElement("div", {
    className: "cu-panel"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cu-panel__hd"
  }, "PASO ", c.steps[activeStep]?.num || '01', " ", activeStep === 3 ? '· ENVIAR BRIEF' : '· ' + (c.steps[activeStep]?.name || '')), activeStep === 0 && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("p", {
    className: "cu-panel__lead"
  }, c.step1Body), /*#__PURE__*/React.createElement("div", {
    className: "cu-refs"
  }, (c.refs || []).map((r, i) => /*#__PURE__*/React.createElement(Reveal, {
    key: r.id,
    delay: i * 70,
    className: 'cu-ref' + (r.img ? ' has-img' : '')
  }, /*#__PURE__*/React.createElement("div", {
    className: "cu-ref__ph"
  }, r.img ? /*#__PURE__*/React.createElement("img", {
    src: r.img,
    alt: r.name
  }) : /*#__PURE__*/React.createElement("div", {
    className: "cu-ref__placeholder"
  }, "+")), /*#__PURE__*/React.createElement("div", {
    className: "cu-ref__top"
  }, /*#__PURE__*/React.createElement("span", {
    className: "cu-ref__sq"
  }, "\u25AA"), /*#__PURE__*/React.createElement("span", {
    className: "cu-ref__code"
  }, r.code)), /*#__PURE__*/React.createElement("div", {
    className: "cu-ref__foot"
  }, /*#__PURE__*/React.createElement("span", {
    className: "cu-ref__bar"
  }), /*#__PURE__*/React.createElement("span", {
    className: "cu-ref__name"
  }, r.name)))))), activeStep === 1 && /*#__PURE__*/React.createElement("div", {
    className: "cu-estilos"
  }, (c.estilos || []).map(e => /*#__PURE__*/React.createElement("button", {
    key: e.id,
    className: 'cu-estilo' + (selectedEstilo === e.id ? ' selected' : ''),
    type: "button",
    onClick: () => {
      setSelectedEstilo(e.id);
      setTimeout(() => setActiveStep(2), 300);
    }
  }, e.name))), activeStep === 2 && /*#__PURE__*/React.createElement("div", {
    className: "cu-formatos"
  }, (c.formatos || []).map(f => /*#__PURE__*/React.createElement("button", {
    key: f.id,
    className: 'cu-formato' + (selectedFormato === f.id ? ' selected' : ''),
    type: "button",
    onClick: () => {
      setSelectedFormato(f.id);
      setTimeout(() => setActiveStep(3), 300);
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "cu-formato__size"
  }, f.size), /*#__PURE__*/React.createElement("span", {
    className: "cu-formato__price"
  }, f.price)))), activeStep === 3 && /*#__PURE__*/React.createElement(CuadrosSendForm, {
    fields: c.sendFields || [],
    submitLabel: c.sendSubmit || 'ENVIAR BRIEF',
    selectedEstilo: selectedEstilo ? (c.estilos || []).find(e => e.id === selectedEstilo)?.name : null,
    selectedFormato: selectedFormato ? (c.formatos || []).find(f => f.id === selectedFormato)?.size : null
  }))))));
}
function CuadrosSendForm({
  fields,
  submitLabel,
  selectedEstilo,
  selectedFormato
}) {
  const [status, setStatus] = React.useState('idle'); // idle | sending | ok | err-NNN | net-err
  function onSubmit(e) {
    e.preventDefault();
    var fd = new FormData(e.target);
    var row = {
      name: '',
      email: '',
      versiculo: '',
      notas: '',
      estilo: selectedEstilo || '',
      formato: selectedFormato || ''
    };
    fields.forEach(function (f) {
      var val = (fd.get(f.id) || '').trim();
      var lbl = (f.label || '').toUpperCase();
      if (lbl.indexOf('NOMBRE') >= 0) row.name = val;else if (lbl.indexOf('EMAIL') >= 0) row.email = val;else if (lbl.indexOf('VERS') >= 0) row.versiculo = val;else if (lbl.indexOf('NOTA') >= 0) row.notas = val;
    });
    e.target.reset();
    setStatus('sending');
    ruahDebug('CUADROS: iniciando fetch...');
    fetch('https://txrpxzsqqomdlnxmyvxn.supabase.co/rest/v1/cuadros_briefs', {
      method: 'POST',
      headers: {
        'apikey': 'sb_publishable_ZLrj11-7GjIE8gEiwybtvQ_6e4NZ07p',
        'Authorization': 'Bearer sb_publishable_ZLrj11-7GjIE8gEiwybtvQ_6e4NZ07p',
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(row)
    }).then(function (r) {
      var s = r.ok ? 'ok' : 'err-' + r.status;
      setStatus(s);
      ruahDebug('CUADROS: HTTP ' + r.status + (r.ok ? ' ✓ GUARDADO' : ' ✗ ERROR'));
      setTimeout(function () {
        setStatus('idle');
      }, 8000);
    }).catch(function (err) {
      setStatus('net-err');
      ruahDebug('CUADROS: NET-ERR — ' + err.message);
      setTimeout(function () {
        setStatus('idle');
      }, 8000);
    });
  }
  var btnLabel = submitLabel;
  if (status === 'sending') btnLabel = 'ENVIANDO...';
  if (status === 'ok') btnLabel = '✓ GUARDADO EN BD';
  if (status.indexOf('err') === 0) btnLabel = '✗ ' + status.toUpperCase();
  return /*#__PURE__*/React.createElement("form", {
    className: 'cu-form' + (status === 'ok' ? ' sent' : ''),
    onSubmit: onSubmit
  }, (selectedEstilo || selectedFormato) && /*#__PURE__*/React.createElement("div", {
    className: "cu-form__summary"
  }, selectedEstilo && /*#__PURE__*/React.createElement("span", {
    className: "cu-form__tag"
  }, "ESTILO: ", selectedEstilo), selectedFormato && /*#__PURE__*/React.createElement("span", {
    className: "cu-form__tag"
  }, "FORMATO: ", selectedFormato)), fields.map(f => /*#__PURE__*/React.createElement("label", {
    key: f.id,
    className: "cu-field"
  }, /*#__PURE__*/React.createElement("span", null, f.label), f.type === 'textarea' ? /*#__PURE__*/React.createElement("textarea", {
    name: f.id,
    rows: 3,
    placeholder: f.placeholder,
    required: true
  }) : /*#__PURE__*/React.createElement("input", {
    name: f.id,
    type: f.type || 'text',
    placeholder: f.placeholder,
    required: true
  }))), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: "cu-submit",
    disabled: status === 'sending'
  }, btnLabel, status === 'idle' && /*#__PURE__*/React.createElement("span", {
    className: "arr"
  }, "\u2192")));
}

// ============================================================
// IGLESIAS
// ============================================================
function Iglesias({
  content
}) {
  const ig = content.iglesias;
  const [eventType, setEventType] = React.useState(ig.eventOptions[0] || '');
  const [submitted, setSubmitted] = React.useState(false);
  const [galleryProject, setGalleryProject] = React.useState(null);
  function onSubmit(e) {
    e.preventDefault();
    var fd = new FormData(e.target);
    var row = {
      iglesia: (fd.get('iglesia') || '').trim(),
      nombre: (fd.get('contacto') || '').trim(),
      email: (fd.get('email') || '').trim(),
      evento_tipo: eventType,
      descripcion: (fd.get('brief') || '').trim()
    };
    e.target.reset();
    setEventType(ig.eventOptions[0] || '');
    setSubmitted('sending');
    ruahDebug('IGLESIAS: iniciando fetch...');
    fetch('https://txrpxzsqqomdlnxmyvxn.supabase.co/rest/v1/iglesias_requests', {
      method: 'POST',
      headers: {
        'apikey': 'sb_publishable_ZLrj11-7GjIE8gEiwybtvQ_6e4NZ07p',
        'Authorization': 'Bearer sb_publishable_ZLrj11-7GjIE8gEiwybtvQ_6e4NZ07p',
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(row)
    }).then(function (r) {
      setSubmitted(r.ok ? 'ok' : 'err-' + r.status);
      ruahDebug('IGLESIAS: HTTP ' + r.status + (r.ok ? ' ✓ GUARDADO' : ' ✗ ERROR'));
      setTimeout(function () {
        setSubmitted(false);
      }, 8000);
    }).catch(function (err) {
      setSubmitted('net-err');
      ruahDebug('IGLESIAS: NET-ERR — ' + err.message);
      setTimeout(function () {
        setSubmitted(false);
      }, 8000);
    });
  }
  return /*#__PURE__*/React.createElement("section", {
    className: "iglesias",
    id: "iglesias"
  }, /*#__PURE__*/React.createElement("div", {
    className: "shell"
  }, /*#__PURE__*/React.createElement(SectionHeader, {
    index: ig.headerIndex,
    title: ig.headerTitle,
    right: ig.headerRight
  }), /*#__PURE__*/React.createElement("div", {
    className: "ig-hero"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ig-hero__text"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "ig-hero__title"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(RevealLine, {
    delay: 20
  }, ig.title1)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(RevealLine, {
    delay: 160
  }, ig.title2))), /*#__PURE__*/React.createElement(Reveal, {
    delay: 350,
    className: "ig-hero__lede"
  }, /*#__PURE__*/React.createElement("p", null, ig.lede))), /*#__PURE__*/React.createElement(Reveal, {
    delay: 120,
    className: 'ig-feat' + (ig.featureImg ? ' has-img' : '')
  }, ig.featureImg && /*#__PURE__*/React.createElement("img", {
    src: ig.featureImg,
    alt: ig.featureName,
    className: "ig-feat__img"
  }), /*#__PURE__*/React.createElement("div", {
    className: "ig-feat__top"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ig-feat__sq"
  }, "\u25AA"), /*#__PURE__*/React.createElement("span", {
    className: "ig-feat__tag"
  }, ig.featureTag)), /*#__PURE__*/React.createElement("div", {
    className: "ig-feat__pattern"
  }), /*#__PURE__*/React.createElement("div", {
    className: "ig-feat__foot"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ig-feat__bar"
  }), /*#__PURE__*/React.createElement("span", {
    className: "ig-feat__name"
  }, ig.featureName)))), /*#__PURE__*/React.createElement("div", {
    className: "ig-svcs"
  }, ig.services.map((s, i) => /*#__PURE__*/React.createElement(Reveal, {
    key: s.id,
    delay: i * 80,
    className: "ig-svc"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ig-svc__top"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ig-svc__num"
  }, s.num), /*#__PURE__*/React.createElement("span", {
    className: "ig-svc__dot"
  }, "\u25CF")), /*#__PURE__*/React.createElement("h4", {
    className: "ig-svc__name"
  }, s.name), /*#__PURE__*/React.createElement("p", {
    className: "ig-svc__desc"
  }, s.desc)))), /*#__PURE__*/React.createElement("div", {
    className: "ig-port"
  }, /*#__PURE__*/React.createElement(SectionHeader, {
    index: ig.portfolioIndex,
    title: ig.portfolioTitle,
    right: ig.portfolioRight
  }), /*#__PURE__*/React.createElement("div", {
    className: "ig-projs"
  }, ig.projects.map((p, i) => {
    const hasGallery = (p.gallery || []).length > 0;
    return /*#__PURE__*/React.createElement(Reveal, {
      key: p.id,
      delay: i * 60,
      className: 'ig-proj' + (hasGallery ? ' clickable' : ''),
      onClick: () => hasGallery && setGalleryProject(p)
    }, /*#__PURE__*/React.createElement("div", {
      className: 'ig-proj__card' + (p.img ? ' has-img' : '')
    }, p.img && /*#__PURE__*/React.createElement("img", {
      src: p.img,
      alt: p.name,
      className: "ig-proj__img"
    }), /*#__PURE__*/React.createElement("div", {
      className: "ig-proj__top"
    }, /*#__PURE__*/React.createElement("span", {
      className: "ig-proj__sq"
    }, "\u25AA"), /*#__PURE__*/React.createElement("span", {
      className: "ig-proj__code"
    }, p.code)), /*#__PURE__*/React.createElement("div", {
      className: "ig-proj__pattern"
    }), /*#__PURE__*/React.createElement("div", {
      className: "ig-proj__foot"
    }, /*#__PURE__*/React.createElement("span", {
      className: "ig-proj__bar"
    }), /*#__PURE__*/React.createElement("span", {
      className: "ig-proj__name"
    }, p.name)), hasGallery && /*#__PURE__*/React.createElement("div", {
      className: "ig-proj__gallery-badge"
    }, (p.gallery || []).length, " foto", (p.gallery || []).length !== 1 ? 's' : '', " \u2192")), /*#__PURE__*/React.createElement("div", {
      className: "ig-proj__meta"
    }, p.meta));
  }))), /*#__PURE__*/React.createElement("div", {
    className: "ig-formWrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ig-formWrap__left"
  }, /*#__PURE__*/React.createElement(Reveal, null, /*#__PURE__*/React.createElement("div", {
    className: "mono-label ig-formWrap__eyebrow"
  }, ig.formEyebrow)), /*#__PURE__*/React.createElement("h3", {
    className: "ig-formWrap__title"
  }, /*#__PURE__*/React.createElement(RevealLine, null, ig.formTitle)), /*#__PURE__*/React.createElement(Reveal, {
    delay: 200,
    className: "ig-formWrap__sub"
  }, /*#__PURE__*/React.createElement("p", null, ig.formSub))), /*#__PURE__*/React.createElement("form", {
    className: 'ig-form' + (submitted ? ' sent' : ''),
    onSubmit: onSubmit
  }, /*#__PURE__*/React.createElement("label", {
    className: "ig-field"
  }, /*#__PURE__*/React.createElement("span", null, "IGLESIA / MINISTERIO"), /*#__PURE__*/React.createElement("input", {
    name: "iglesia",
    type: "text",
    required: true,
    placeholder: "Nombre"
  })), /*#__PURE__*/React.createElement("label", {
    className: "ig-field"
  }, /*#__PURE__*/React.createElement("span", null, "CONTACTO"), /*#__PURE__*/React.createElement("input", {
    name: "contacto",
    type: "text",
    required: true,
    placeholder: "Tu nombre"
  })), /*#__PURE__*/React.createElement("label", {
    className: "ig-field"
  }, /*#__PURE__*/React.createElement("span", null, "EMAIL"), /*#__PURE__*/React.createElement("input", {
    name: "email",
    type: "email",
    required: true,
    placeholder: "email"
  })), /*#__PURE__*/React.createElement("label", {
    className: "ig-field"
  }, /*#__PURE__*/React.createElement("span", null, "EVENTO"), /*#__PURE__*/React.createElement("select", {
    value: eventType,
    onChange: e => setEventType(e.target.value)
  }, ig.eventOptions.map(o => /*#__PURE__*/React.createElement("option", {
    key: o,
    value: o
  }, o)))), /*#__PURE__*/React.createElement("label", {
    className: "ig-field ig-field--full"
  }, /*#__PURE__*/React.createElement("span", null, "BRIEF"), /*#__PURE__*/React.createElement("textarea", {
    name: "brief",
    rows: 3,
    required: true,
    placeholder: "Cantidad, fecha, formato..."
  })), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: "ig-submit",
    disabled: submitted === 'sending'
  }, submitted === 'ok' ? '✓ GUARDADO EN BD' : submitted && submitted !== false ? '✗ ' + String(submitted).toUpperCase() : submitted ? '✓ SOLICITUD ENVIADA' : ig.formSubmit, !submitted && /*#__PURE__*/React.createElement("span", {
    className: "arr"
  }, "\u2192"))))), galleryProject && /*#__PURE__*/React.createElement(GalleryModal, {
    title: galleryProject.name,
    subtitle: galleryProject.code + ' · ' + galleryProject.meta,
    photos: galleryProject.gallery || [],
    onClose: () => setGalleryProject(null)
  }));
}
Object.assign(window, {
  Cuadros,
  Iglesias,
  GalleryModal
});