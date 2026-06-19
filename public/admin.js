/* global React */
// ============================================================
// RUAH LABS — Admin Panel
// ============================================================

// ----- Small reusable form atoms -----
function Field({
  label,
  hint,
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "field"
  }, /*#__PURE__*/React.createElement("label", null, /*#__PURE__*/React.createElement("span", null, label), hint && /*#__PURE__*/React.createElement("span", {
    className: "hint"
  }, hint)), children);
}
function Text({
  label,
  value,
  onChange,
  hint,
  placeholder,
  multiline,
  rows = 3
}) {
  return /*#__PURE__*/React.createElement(Field, {
    label: label,
    hint: hint
  }, multiline ? /*#__PURE__*/React.createElement("textarea", {
    className: "textarea",
    rows: rows,
    value: value || '',
    placeholder: placeholder,
    onChange: e => onChange(e.target.value)
  }) : /*#__PURE__*/React.createElement("input", {
    className: "input",
    value: value || '',
    placeholder: placeholder,
    onChange: e => onChange(e.target.value)
  }));
}

// Text + font-size combo: input on the left, A−/A+ pad on the right.
// Pass `sizePath` (typography.xxx) and `store` to enable size controls.
function EditText({
  label,
  value,
  onChange,
  hint,
  placeholder,
  multiline,
  rows = 3,
  sizePath,
  store,
  content,
  sizeMin = 10,
  sizeMax = 320,
  sizeStep = 2
}) {
  const t = content && content.typography;
  const current = sizePath && t ? t[sizePath] || 0 : null;
  function bump(delta) {
    if (!sizePath || !store) return;
    const next = Math.max(sizeMin, Math.min(sizeMax, (current || sizeMin) + delta));
    store.update('typography.' + sizePath, next);
  }
  const InputEl = multiline ? /*#__PURE__*/React.createElement("textarea", {
    className: "textarea",
    rows: rows,
    value: value || '',
    placeholder: placeholder,
    onChange: e => onChange(e.target.value)
  }) : /*#__PURE__*/React.createElement("input", {
    className: "input",
    value: value || '',
    placeholder: placeholder,
    onChange: e => onChange(e.target.value)
  });
  if (!sizePath) {
    return /*#__PURE__*/React.createElement(Field, {
      label: label,
      hint: hint
    }, InputEl);
  }
  return /*#__PURE__*/React.createElement(Field, {
    label: label,
    hint: hint || (current ? 'Tamaño actual: ' + current + 'px' : null)
  }, /*#__PURE__*/React.createElement("div", {
    className: "txt-size"
  }, InputEl, /*#__PURE__*/React.createElement("div", {
    className: "size-pad",
    title: "Aumentar / disminuir tama\xF1o"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => bump(-sizeStep),
    "aria-label": "Reducir"
  }, "A\u2212"), /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, current, /*#__PURE__*/React.createElement("small", null, "px")), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "amber-fixed",
    onClick: () => bump(sizeStep),
    "aria-label": "Aumentar"
  }, "A+"))));
}
function ColorPicker({
  label,
  value,
  onChange
}) {
  return /*#__PURE__*/React.createElement(Field, {
    label: label
  }, /*#__PURE__*/React.createElement("div", {
    className: "color-field"
  }, /*#__PURE__*/React.createElement("input", {
    type: "color",
    value: value,
    onChange: e => onChange(e.target.value)
  }), /*#__PURE__*/React.createElement("input", {
    type: "text",
    className: "input",
    value: value,
    onChange: e => onChange(e.target.value)
  })));
}

// Compact 1-line color editor — used in TokenEditor rows. No <label> wrapper.
function ColorSwatch({
  value,
  onChange,
  fallback = '#000000'
}) {
  const hasValue = value && value.length > 0;
  return /*#__PURE__*/React.createElement("div", {
    className: "ce-swatch"
  }, /*#__PURE__*/React.createElement("input", {
    type: "color",
    value: hasValue ? value : fallback,
    onChange: e => onChange(e.target.value),
    title: "Cambiar color"
  }), /*#__PURE__*/React.createElement("input", {
    type: "text",
    className: "input",
    value: value || '',
    placeholder: fallback + ' (default)',
    onChange: e => onChange(e.target.value)
  }), hasValue && /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "abtn ghost sm",
    onClick: () => onChange(''),
    title: "Restaurar color por defecto"
  }, "\u21BA"));
}

// Row that bundles label + size pad + color picker for ONE editable text slot.
// Pass `sizePath` (typography key) and/or `colorKey` (colors key).
function TokenRow({
  label,
  sizePath,
  colorKey,
  store,
  content,
  sizeMin = 10,
  sizeMax = 320,
  sizeStep = 2,
  fallback
}) {
  const t = content.typography || {};
  const cMap = content.colors || {};
  const current = sizePath ? t[sizePath] || 0 : null;
  const curColor = colorKey ? cMap[colorKey] || '' : '';
  function bump(d) {
    const next = Math.max(sizeMin, Math.min(sizeMax, (current || sizeMin) + d));
    store.update('typography.' + sizePath, next);
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "token-row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "token-row__label"
  }, label), sizePath && /*#__PURE__*/React.createElement("div", {
    className: "size-pad",
    title: "Tama\xF1o"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => bump(-sizeStep),
    "aria-label": "\u2212"
  }, "A\u2212"), /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, current, /*#__PURE__*/React.createElement("small", null, "px")), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "amber-fixed",
    onClick: () => bump(sizeStep),
    "aria-label": "+"
  }, "A+")), colorKey && /*#__PURE__*/React.createElement(ColorSwatch, {
    value: curColor,
    onChange: v => store.update('colors.' + colorKey, v),
    fallback: fallback || '#1a1a1a'
  }));
}

// Quick token panel: renders all editable text slots for a single section in a card.
// Sourced from TOKEN_GROUPS (defined further down).
function SectionTokens({
  groupName,
  content,
  store,
  defaultOpen = false
}) {
  const [open, setOpen] = React.useState(defaultOpen);
  const group = typeof TOKEN_GROUPS !== 'undefined' && TOKEN_GROUPS.find(([n]) => n === groupName);
  if (!group) return null;
  const slots = group[1];
  return /*#__PURE__*/React.createElement("div", {
    className: "card sec-tokens"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "sec-tokens__head",
    onClick: () => setOpen(o => !o),
    "aria-expanded": open
  }, /*#__PURE__*/React.createElement("span", {
    className: "sec-tokens__caret"
  }, open ? '▾' : '▸'), /*#__PURE__*/React.createElement("h3", null, "Estilo de textos \u2014 ", groupName), /*#__PURE__*/React.createElement("span", {
    className: "meta"
  }, slots.length, " elemento", slots.length !== 1 ? 's' : '', " \xB7 tama\xF1o + color")), open && /*#__PURE__*/React.createElement("div", {
    className: "token-list",
    style: {
      marginTop: 14
    }
  }, slots.map(([label, sizePath, colorKey, fallback], i) => /*#__PURE__*/React.createElement(TokenRow, {
    key: i,
    label: label,
    sizePath: sizePath,
    colorKey: colorKey,
    store: store,
    content: content,
    fallback: fallback,
    sizeMin: sizePath === 'label' ? 9 : sizePath === 'bodyBase' ? 12 : 10,
    sizeMax: sizePath && sizePath.includes('itleMax') ? 320 : sizePath === 'heroMax' ? 320 : 200,
    sizeStep: sizePath && (sizePath.includes('itleMax') || sizePath === 'heroMax') ? 4 : 1
  }))));
}
function Toggle({
  label,
  value,
  onChange
}) {
  return /*#__PURE__*/React.createElement("button", {
    className: 'toggle' + (value ? ' on' : ''),
    onClick: () => onChange(!value),
    type: "button"
  }, /*#__PURE__*/React.createElement("span", {
    className: "toggle__sw"
  }), /*#__PURE__*/React.createElement("span", null, label));
}

// Subir archivo a Cloudinary con firma del servidor (signed upload)
// resourceType: 'image' | 'video'
async function uploadToCloudinary(file, resourceType) {
  var rt = resourceType || (file.type.startsWith('video/') ? 'video' : 'image');
  var api = (window.RUAH_API || '') + '/api/images/sign';
  var adminKey = typeof getAdminToken === 'function' ? await getAdminToken() : sessionStorage.getItem('ruah-admin-session') || '';
  var signRes = await fetch(api, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-key': adminKey
    },
    body: JSON.stringify({
      folder: 'ruahlabs'
    })
  });
  var sign = await signRes.json();
  if (sign.error) throw new Error('Firma Cloudinary: ' + sign.error);
  var fd = new FormData();
  fd.append('file', file);
  fd.append('api_key', sign.apiKey);
  fd.append('timestamp', String(sign.timestamp));
  fd.append('signature', sign.signature);
  fd.append('folder', sign.folder);
  var res = await fetch('https://api.cloudinary.com/v1_1/' + sign.cloudName + '/' + rt + '/upload', {
    method: 'POST',
    body: fd
  });
  var data = await res.json();
  if (!data.secure_url) throw new Error(data.error && data.error.message || 'Upload fallido');
  return data.secure_url;
}

// Reusable image picker — shows current image, upload + remove
function ImgPicker({
  label,
  value,
  onChange,
  hint,
  ratio = '4 / 3'
}) {
  const [uploading, setUploading] = React.useState(false);
  async function onFile(e) {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    setUploading(true);
    try {
      const url = await uploadToCloudinary(f);
      onChange(url);
    } catch (err) {
      alert('Error subiendo imagen: ' + err.message);
    } finally {
      setUploading(false);
    }
  }
  return /*#__PURE__*/React.createElement(Field, {
    label: label,
    hint: hint
  }, /*#__PURE__*/React.createElement("div", {
    className: "img-picker"
  }, /*#__PURE__*/React.createElement("label", {
    className: 'img-picker__slot' + (value ? ' has' : '') + (uploading ? ' uploading' : ''),
    style: {
      aspectRatio: ratio
    }
  }, uploading ? /*#__PURE__*/React.createElement("span", {
    className: "img-picker__ph"
  }, "Subiendo\u2026") : value ? /*#__PURE__*/React.createElement("img", {
    src: value,
    alt: ""
  }) : /*#__PURE__*/React.createElement("span", {
    className: "img-picker__ph"
  }, "+ Subir foto"), /*#__PURE__*/React.createElement("input", {
    type: "file",
    accept: "image/*",
    onChange: onFile,
    disabled: uploading
  })), /*#__PURE__*/React.createElement("div", {
    className: "img-picker__actions"
  }, /*#__PURE__*/React.createElement("label", {
    className: "abtn ghost sm",
    style: {
      position: 'relative',
      cursor: 'pointer'
    }
  }, value ? 'Reemplazar' : 'Elegir archivo', /*#__PURE__*/React.createElement("input", {
    type: "file",
    accept: "image/*",
    onChange: onFile,
    style: {
      position: 'absolute',
      inset: 0,
      opacity: 0,
      cursor: 'pointer'
    }
  })), value && /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "abtn danger sm",
    onClick: () => onChange('')
  }, "Quitar foto"))));
}

// FilePicker — igual que ImgPicker pero acepta video y detecta tipo automáticamente
function FilePicker({
  label,
  value,
  onChange,
  hint,
  accept,
  ratio
}) {
  var [uploading, setUploading] = React.useState(false);
  var isVideo = value ? /\.(mp4|mov|webm)(\?|$)/i.test(value) : (accept || '').includes('video');
  var acceptAttr = accept || 'image/*,video/mp4';
  async function onFile(e) {
    var f = e.target.files && e.target.files[0];
    if (!f) return;
    setUploading(true);
    try {
      var url = await uploadToCloudinary(f);
      onChange(url);
    } catch (err) {
      alert('Error subiendo archivo: ' + err.message);
    } finally {
      setUploading(false);
    }
  }
  return /*#__PURE__*/React.createElement(Field, {
    label: label,
    hint: hint
  }, /*#__PURE__*/React.createElement("div", {
    className: "img-picker"
  }, /*#__PURE__*/React.createElement("div", {
    className: 'img-picker__slot' + (value ? ' has' : '') + (uploading ? ' uploading' : ''),
    style: {
      aspectRatio: ratio || '16/9'
    }
  }, uploading ? /*#__PURE__*/React.createElement("span", {
    className: "img-picker__ph"
  }, "Subiendo\u2026") : value && isVideo ? /*#__PURE__*/React.createElement("video", {
    src: value,
    muted: true,
    autoPlay: true,
    loop: true,
    playsInline: true,
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      display: 'block'
    }
  }) : value ? /*#__PURE__*/React.createElement("img", {
    src: value,
    alt: ""
  }) : /*#__PURE__*/React.createElement("span", {
    className: "img-picker__ph"
  }, "+ Subir archivo")), /*#__PURE__*/React.createElement("div", {
    className: "img-picker__actions"
  }, /*#__PURE__*/React.createElement("label", {
    className: "abtn ghost sm",
    style: {
      position: 'relative',
      cursor: 'pointer'
    }
  }, value ? 'Reemplazar' : 'Elegir archivo', /*#__PURE__*/React.createElement("input", {
    type: "file",
    accept: acceptAttr,
    onChange: onFile,
    disabled: uploading,
    style: {
      position: 'absolute',
      inset: 0,
      opacity: 0,
      cursor: 'pointer'
    }
  })), value && /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "abtn danger sm",
    onClick: () => onChange('')
  }, "Quitar"))));
}

// ----- View: Dashboard -----
function ViewDashboard({
  content,
  setView
}) {
  const counts = {
    services: content.services.items.length,
    products: content.products.items.length,
    testimonials: content.testimonials.items.length,
    routes: content.club.routes.length
  };
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "stat-tiles"
  }, /*#__PURE__*/React.createElement("div", {
    className: "stat-tile"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lbl"
  }, "Servicios"), /*#__PURE__*/React.createElement("div", {
    className: "num"
  }, counts.services)), /*#__PURE__*/React.createElement("div", {
    className: "stat-tile"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lbl"
  }, "Productos"), /*#__PURE__*/React.createElement("div", {
    className: "num amber"
  }, counts.products)), /*#__PURE__*/React.createElement("div", {
    className: "stat-tile"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lbl"
  }, "Testimonios"), /*#__PURE__*/React.createElement("div", {
    className: "num"
  }, counts.testimonials)), /*#__PURE__*/React.createElement("div", {
    className: "stat-tile"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lbl"
  }, "Rutas Club"), /*#__PURE__*/React.createElement("div", {
    className: "num"
  }, counts.routes))), /*#__PURE__*/React.createElement("div", {
    className: "preview-mini"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lbl"
  }, "Vista previa \u2014 Hero"), /*#__PURE__*/React.createElement("div", {
    className: "ttl"
  }, content.hero.titleLine1, " ", content.hero.titleLine2, " ", /*#__PURE__*/React.createElement("span", {
    className: "amb"
  }, content.hero.titleLine3))), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card__head"
  }, /*#__PURE__*/React.createElement("h3", null, "Accesos r\xE1pidos")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "abtn",
    onClick: () => setView('home')
  }, "Inicio"), /*#__PURE__*/React.createElement("button", {
    className: "abtn",
    onClick: () => setView('hero')
  }, "Hero"), /*#__PURE__*/React.createElement("button", {
    className: "abtn",
    onClick: () => setView('about')
  }, "Quienes Somos"), /*#__PURE__*/React.createElement("button", {
    className: "abtn",
    onClick: () => setView('services')
  }, "Servicios"), /*#__PURE__*/React.createElement("button", {
    className: "abtn",
    onClick: () => setView('categories')
  }, "Categor\xEDas"), /*#__PURE__*/React.createElement("button", {
    className: "abtn",
    onClick: () => setView('products')
  }, "Productos"), /*#__PURE__*/React.createElement("button", {
    className: "abtn",
    onClick: () => setView('testimonials')
  }, "Testimonios"), /*#__PURE__*/React.createElement("button", {
    className: "abtn",
    onClick: () => setView('theme')
  }, "Colores"), /*#__PURE__*/React.createElement("button", {
    className: "abtn",
    onClick: () => setView('typography')
  }, "Tipograf\xEDa"), /*#__PURE__*/React.createElement("button", {
    className: "abtn",
    onClick: () => setView('club')
  }, "Club Secreto"))), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card__head"
  }, /*#__PURE__*/React.createElement("h3", null, "Acerca del panel")), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--mono)',
      fontSize: 13,
      color: 'var(--gray)',
      lineHeight: 1.6
    }
  }, "Este panel controla cada texto, color, precio, imagen y enlace del sitio. Todo se guarda en tu navegador. Usa \"Exportar\" para descargar un respaldo en JSON, o \"Importar\" para restaurar uno.")));
}

// ----- View: Theme -----
function ViewTheme({
  content,
  store
}) {
  const {
    update
  } = store;
  return /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card__head"
  }, /*#__PURE__*/React.createElement("h3", null, "Paleta de colores"), /*#__PURE__*/React.createElement("span", {
    className: "meta"
  }, "CSS Variables \xB7 Live")), /*#__PURE__*/React.createElement("div", {
    className: "row"
  }, /*#__PURE__*/React.createElement(ColorPicker, {
    label: "Marfil / Ivory",
    value: content.theme.ivory,
    onChange: v => update('theme.ivory', v)
  }), /*#__PURE__*/React.createElement(ColorPicker, {
    label: "\xC1mbar / Acento",
    value: content.theme.amber,
    onChange: v => update('theme.amber', v)
  }), /*#__PURE__*/React.createElement(ColorPicker, {
    label: "Gris",
    value: content.theme.gray,
    onChange: v => update('theme.gray', v)
  }), /*#__PURE__*/React.createElement(ColorPicker, {
    label: "Negro / Tinta",
    value: content.theme.black,
    onChange: v => update('theme.black', v)
  })), /*#__PURE__*/React.createElement("div", {
    className: "divider"
  }, "Presets"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap'
    }
  }, [{
    name: 'Ruah Original',
    ivory: '#f5f1e8',
    amber: '#eca10c',
    gray: '#6b6b62',
    black: '#0a0a0a'
  }, {
    name: 'Hueso + Cobre',
    ivory: '#efe9d9',
    amber: '#c2410c',
    gray: '#574f44',
    black: '#0a0a0a'
  }, {
    name: 'Marfil + Oliva',
    ivory: '#f5f1e8',
    amber: '#7c8c44',
    gray: '#5b5b50',
    black: '#0a0a0a'
  }, {
    name: 'Crudo + Sangre',
    ivory: '#efe9d9',
    amber: '#9b1c1c',
    gray: '#5b554c',
    black: '#0a0a0a'
  }].map(p => /*#__PURE__*/React.createElement("button", {
    key: p.name,
    className: "abtn ghost",
    onClick: () => {
      update('theme.ivory', p.ivory);
      update('theme.amber', p.amber);
      update('theme.gray', p.gray);
      update('theme.black', p.black);
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      gap: 2,
      marginRight: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 12,
      height: 12,
      background: p.ivory,
      borderRadius: 2
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 12,
      height: 12,
      background: p.amber,
      borderRadius: 2
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 12,
      height: 12,
      background: p.gray,
      borderRadius: 2
    }
  })), p.name))));
}

// ----- View: Brand -----
function ViewBrand({
  content,
  store
}) {
  const {
    update
  } = store;
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card__head"
  }, /*#__PURE__*/React.createElement("h3", null, "Identidad")), /*#__PURE__*/React.createElement("div", {
    className: "row"
  }, /*#__PURE__*/React.createElement(Text, {
    label: "Nombre",
    value: content.brand.name,
    onChange: v => update('brand.name', v)
  }), /*#__PURE__*/React.createElement(Text, {
    label: "Tagline corto",
    value: content.brand.tagline,
    onChange: v => update('brand.tagline', v)
  }), /*#__PURE__*/React.createElement(Text, {
    label: "Instagram",
    value: content.brand.instagram,
    onChange: v => update('brand.instagram', v)
  }), /*#__PURE__*/React.createElement(Text, {
    label: "Ubicaci\xF3n / Env\xEDos",
    value: content.brand.location,
    onChange: v => update('brand.location', v)
  }))), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card__head"
  }, /*#__PURE__*/React.createElement("h3", null, "Accesos"), /*#__PURE__*/React.createElement("span", {
    className: "meta"
  }, "Sensibles")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--mono)',
      fontSize: 12,
      color: 'var(--gray)',
      lineHeight: 1.6,
      padding: '8px 0'
    }
  }, "La contrase\xF1a de admin se gestiona en Supabase Auth. Para cambiarla, ve al dashboard de Supabase \u2192 Authentication \u2192 Users."), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--mono)',
      fontSize: 12,
      color: 'var(--gray)',
      lineHeight: 1.6,
      padding: '8px 0'
    }
  }, "La contrase\xF1a global del Club se gestiona en el servidor (Railway \u2192 variable ", /*#__PURE__*/React.createElement("strong", null, "CLUB_PASSWORD_HASH"), "). Por seguridad ya no se guarda ning\xFAn hash en el contenido p\xFAblico.")));
}

// ----- View: Home (Inicio) -----
function ViewHome({
  content,
  store
}) {
  const {
    update
  } = store;
  const h = content.home || {};
  const intro = h.intro || {};
  const featured = h.featured || [];
  function updateFeatured(idx, key, val) {
    const next = featured.map((it, i) => i === idx ? {
      ...it,
      [key]: val
    } : it);
    update('home.featured', next);
  }
  async function uploadFeat(idx, file, isGallery = false) {
    try {
      const url = await uploadToCloudinary(file);
      if (!url) return;
      if (isGallery) {
        const next = featured.map((it, i) => i === idx ? {
          ...it,
          gallery: [...(it.gallery || []), url]
        } : it);
        update('home.featured', next);
      } else {
        updateFeatured(idx, 'img', url);
      }
    } catch (e) {
      alert('Error al subir: ' + e.message);
    }
  }
  function removeGalleryImg(idx, gIdx) {
    const next = featured.map((it, i) => i === idx ? {
      ...it,
      gallery: (it.gallery || []).filter((_, j) => j !== gIdx)
    } : it);
    update('home.featured', next);
  }
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card__head"
  }, /*#__PURE__*/React.createElement("h3", null, "Info ligera (post-hero)")), /*#__PURE__*/React.createElement(Text, {
    label: "Eyebrow",
    value: intro.eyebrow,
    onChange: v => update('home.intro.eyebrow', v)
  }), /*#__PURE__*/React.createElement(Text, {
    label: "Texto",
    value: intro.text,
    onChange: v => update('home.intro.text', v),
    multiline: true,
    rows: 2
  })), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card__head"
  }, /*#__PURE__*/React.createElement("h3", null, "2 Prendas Destacadas")), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--mono)',
      fontSize: 12,
      color: 'var(--gray)',
      marginBottom: 16
    }
  }, "Las 2 prendas que aparecen lado a lado debajo del hero. Pon el ID de un producto existente para que abra su detalle al hacer click."), featured.map((item, i) => /*#__PURE__*/React.createElement("div", {
    key: item.id,
    className: "prod-edit",
    style: {
      marginBottom: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "prod-edit__media"
  }, item.img ? /*#__PURE__*/React.createElement("img", {
    src: item.img,
    alt: item.name,
    style: {
      width: '100%',
      aspectRatio: '3/4',
      objectFit: 'cover'
    }
  }) : /*#__PURE__*/React.createElement("div", {
    className: "prod-edit__ph",
    style: {
      aspectRatio: '3/4'
    }
  }, i + 1), /*#__PURE__*/React.createElement("label", {
    className: "abtn sm",
    style: {
      marginTop: 8,
      display: 'block',
      textAlign: 'center',
      cursor: 'pointer'
    }
  }, "Cambiar foto", /*#__PURE__*/React.createElement("input", {
    type: "file",
    accept: "image/*",
    style: {
      display: 'none'
    },
    onChange: e => e.target.files[0] && uploadFeat(i, e.target.files[0])
  })), item.img && /*#__PURE__*/React.createElement("button", {
    className: "abtn danger sm",
    style: {
      marginTop: 4,
      width: '100%'
    },
    onClick: () => updateFeatured(i, 'img', '')
  }, "\xD7 Quitar")), /*#__PURE__*/React.createElement("div", {
    className: "prod-edit__fields"
  }, /*#__PURE__*/React.createElement("div", {
    className: "row"
  }, /*#__PURE__*/React.createElement(Text, {
    label: 'Nombre prenda ' + (i + 1),
    value: item.name,
    onChange: v => updateFeatured(i, 'name', v)
  }), /*#__PURE__*/React.createElement(Text, {
    label: "Precio (ej: 18.990)",
    value: item.price,
    onChange: v => updateFeatured(i, 'price', v)
  })), /*#__PURE__*/React.createElement("div", {
    className: "row"
  }, /*#__PURE__*/React.createElement(Text, {
    label: "Tag (ej: NUEVO)",
    value: item.tag,
    onChange: v => updateFeatured(i, 'tag', v)
  }), /*#__PURE__*/React.createElement(Text, {
    label: "ID Producto del cat\xE1logo",
    value: item.productId,
    onChange: v => updateFeatured(i, 'productId', v),
    hint: "Ej: p1, p2, p3..."
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Galer\xEDa de fotos adicionales"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap',
      marginTop: 8
    }
  }, (item.gallery || []).map((g, gIdx) => /*#__PURE__*/React.createElement("div", {
    key: gIdx,
    style: {
      position: 'relative',
      width: 72,
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: g,
    alt: "",
    style: {
      width: 72,
      height: 96,
      objectFit: 'cover',
      display: 'block'
    }
  }), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => removeGalleryImg(i, gIdx),
    style: {
      position: 'absolute',
      top: 2,
      right: 2,
      background: 'rgba(0,0,0,0.7)',
      color: '#fff',
      border: 'none',
      width: 20,
      height: 20,
      fontSize: 12,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, "\xD7"))), /*#__PURE__*/React.createElement("label", {
    style: {
      width: 72,
      height: 96,
      border: '1px dashed var(--line)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      fontSize: 24,
      color: 'var(--gray)',
      flexShrink: 0
    }
  }, "+", /*#__PURE__*/React.createElement("input", {
    type: "file",
    accept: "image/*",
    style: {
      display: 'none'
    },
    onChange: e => e.target.files[0] && uploadFeat(i, e.target.files[0], true)
  })))))))), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card__head"
  }, /*#__PURE__*/React.createElement("h3", null, "Carrusel de categor\xEDas")), /*#__PURE__*/React.createElement(Text, {
    label: "T\xEDtulo del carrusel",
    value: h.carousel && h.carousel.title || '',
    onChange: v => update('home.carousel.title', v)
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--mono)',
      fontSize: 12,
      color: 'var(--gray)',
      marginTop: 8
    }
  }, "El carrusel muestra autom\xE1ticamente el primer producto con imagen de cada categor\xEDa.")));
}

// ----- View: Hero -----
function ViewHero({
  content,
  store
}) {
  const {
    update
  } = store;
  const h = content.hero;
  const bgType = h.bgType || 'video';
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(SectionTokens, {
    groupName: "Hero",
    content: content,
    store: store
  }), /*#__PURE__*/React.createElement("div", {
    className: "card",
    style: {
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "card__head"
  }, /*#__PURE__*/React.createElement("h3", null, "Fondo del Hero"), /*#__PURE__*/React.createElement("span", {
    className: "meta"
  }, "Video o imagen a pantalla completa")), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--mono)',
      fontSize: 11,
      color: 'var(--gray)',
      marginBottom: 12,
      lineHeight: 1.6
    }
  }, /*#__PURE__*/React.createElement("strong", null, "Desktop:"), " 1920\xD71080 px (16:9) \xB7 ", /*#__PURE__*/React.createElement("strong", null, "M\xF3vil:"), " 1080\xD71920 px (9:16)", /*#__PURE__*/React.createElement("br", null), "Formatos aceptados \u2014 Video: MP4 H.264 \xB7 Imagen: JPG, WebP, PNG"), /*#__PURE__*/React.createElement(Field, {
    label: "Tipo de fondo"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, [['video', 'Video'], ['image', 'Imagen']].map(([val, lbl]) => /*#__PURE__*/React.createElement("button", {
    key: val,
    type: "button",
    className: 'abtn sm ' + (bgType === val ? 'amber' : 'ghost'),
    onClick: () => update('hero.bgType', val)
  }, lbl)))), bgType === 'video' ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(FilePicker, {
    label: "Video desktop (MP4 \xB7 1920\xD71080)",
    accept: "video/mp4",
    ratio: "16/9",
    value: h.videoBgDesktop || '',
    onChange: v => update('hero.videoBgDesktop', v),
    hint: "Dejar vac\xEDo usa el video original del sitio."
  }), /*#__PURE__*/React.createElement(FilePicker, {
    label: "Video m\xF3vil (MP4 \xB7 1080\xD71920)",
    accept: "video/mp4",
    ratio: "9/16",
    value: h.videoBgMobile || '',
    onChange: v => update('hero.videoBgMobile', v)
  })) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(FilePicker, {
    label: "Imagen desktop (JPG/WebP \xB7 1920\xD71080)",
    accept: "image/*",
    ratio: "16/9",
    value: h.imageBgDesktop || '',
    onChange: v => update('hero.imageBgDesktop', v)
  }), /*#__PURE__*/React.createElement(FilePicker, {
    label: "Imagen m\xF3vil (JPG/WebP \xB7 1080\xD71920)",
    accept: "image/*",
    ratio: "9/16",
    value: h.imageBgMobile || '',
    onChange: v => update('hero.imageBgMobile', v)
  }))), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card__head"
  }, /*#__PURE__*/React.createElement("h3", null, "Hero principal"), /*#__PURE__*/React.createElement("span", {
    className: "meta"
  }, "A\u2212 / A+ para cambiar tama\xF1o en vivo")), /*#__PURE__*/React.createElement(Text, {
    label: "Eyebrow superior",
    value: h.eyebrow,
    onChange: v => update('hero.eyebrow', v)
  }), /*#__PURE__*/React.createElement("div", {
    className: "row-3"
  }, /*#__PURE__*/React.createElement(EditText, {
    label: "T\xEDtulo \u2014 l\xEDnea 1",
    value: h.titleLine1,
    onChange: v => update('hero.titleLine1', v),
    sizePath: "heroMax",
    sizeMin: 60,
    sizeMax: 320,
    sizeStep: 4,
    content: content,
    store: store
  }), /*#__PURE__*/React.createElement(EditText, {
    label: "T\xEDtulo \u2014 l\xEDnea 2",
    value: h.titleLine2,
    onChange: v => update('hero.titleLine2', v),
    sizePath: "heroMax",
    sizeMin: 60,
    sizeMax: 320,
    sizeStep: 4,
    content: content,
    store: store
  }), /*#__PURE__*/React.createElement(EditText, {
    label: "T\xEDtulo \u2014 l\xEDnea 3 (acento \xE1mbar)",
    value: h.titleLine3,
    onChange: v => update('hero.titleLine3', v),
    sizePath: "heroMax",
    sizeMin: 60,
    sizeMax: 320,
    sizeStep: 4,
    content: content,
    store: store
  })), /*#__PURE__*/React.createElement(EditText, {
    label: "Bajada / Lede",
    value: h.lede,
    onChange: v => update('hero.lede', v),
    multiline: true,
    rows: 4,
    sizePath: "lede",
    sizeMin: 12,
    sizeMax: 28,
    content: content,
    store: store
  }), /*#__PURE__*/React.createElement("div", {
    className: "card",
    style: {
      padding: '16px 20px',
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      cursor: 'pointer',
      fontFamily: 'var(--mono)',
      fontSize: 12
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: h.primaryCta.show !== false,
    onChange: e => update('hero.primaryCta.show', e.target.checked)
  }), "Mostrar bot\xF3n primario")), /*#__PURE__*/React.createElement("div", {
    className: "row"
  }, /*#__PURE__*/React.createElement(Text, {
    label: "CTA primaria \u2014 texto",
    value: h.primaryCta.label,
    onChange: v => update('hero.primaryCta.label', v)
  }), /*#__PURE__*/React.createElement(Text, {
    label: "CTA primaria \u2014 enlace",
    value: h.primaryCta.href,
    onChange: v => update('hero.primaryCta.href', v)
  }))), /*#__PURE__*/React.createElement("div", {
    className: "card",
    style: {
      padding: '16px 20px',
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      cursor: 'pointer',
      fontFamily: 'var(--mono)',
      fontSize: 12
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: h.secondaryCta.show !== false,
    onChange: e => update('hero.secondaryCta.show', e.target.checked)
  }), "Mostrar bot\xF3n secundario")), /*#__PURE__*/React.createElement("div", {
    className: "row"
  }, /*#__PURE__*/React.createElement(Text, {
    label: "CTA secundaria \u2014 texto",
    value: h.secondaryCta.label,
    onChange: v => update('hero.secondaryCta.label', v)
  }), /*#__PURE__*/React.createElement(Text, {
    label: "CTA secundaria \u2014 enlace",
    value: h.secondaryCta.href,
    onChange: v => update('hero.secondaryCta.href', v)
  }))), /*#__PURE__*/React.createElement(Text, {
    label: "Precio ancla (ej: Desde $12.990 \xB7 Env\xEDo a todo Chile \u2014 dejar vac\xEDo para ocultar)",
    value: h.heroPrice || '',
    onChange: v => update('hero.heroPrice', v)
  }), /*#__PURE__*/React.createElement(Text, {
    label: "Marquesina inferior (separa con \xB7)",
    value: h.marquee,
    onChange: v => update('hero.marquee', v),
    multiline: true,
    rows: 2
  })));
}

// ----- View: Protocol -----
function ViewProtocol({
  content,
  store
}) {
  const {
    update,
    updateList
  } = store;
  const p = content.protocol;
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(SectionTokens, {
    groupName: "Protocolo 1\xD71",
    content: content,
    store: store
  }), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card__head"
  }, /*#__PURE__*/React.createElement("h3", null, "Cabecera de secci\xF3n")), /*#__PURE__*/React.createElement("div", {
    className: "row-3"
  }, /*#__PURE__*/React.createElement(Text, {
    label: "\xCDndice (ej. \xA702 / 06)",
    value: p.headerIndex,
    onChange: v => update('protocol.headerIndex', v)
  }), /*#__PURE__*/React.createElement(Text, {
    label: "T\xEDtulo (centro)",
    value: p.headerTitle,
    onChange: v => update('protocol.headerTitle', v)
  }), /*#__PURE__*/React.createElement(Text, {
    label: "Derecha",
    value: p.headerRight,
    onChange: v => update('protocol.headerRight', v)
  }))), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card__head"
  }, /*#__PURE__*/React.createElement("h3", null, "T\xEDtulo grande (4 l\xEDneas)"), /*#__PURE__*/React.createElement("span", {
    className: "meta"
  }, "A\u2212 / A+ controla el tama\xF1o")), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--mono)',
      fontSize: 12,
      color: 'var(--gray)',
      marginBottom: 12
    }
  }, "Cada l\xEDnea es una palabra independiente. Marca las casillas para que las l\xEDneas 2 y 4 salgan en color \xE1mbar."), /*#__PURE__*/React.createElement("div", {
    className: "row"
  }, /*#__PURE__*/React.createElement(EditText, {
    label: "L\xEDnea 1",
    value: p.title1,
    onChange: v => update('protocol.title1', v),
    sizePath: "protocolTitleMax",
    sizeMin: 60,
    sizeMax: 240,
    sizeStep: 4,
    content: content,
    store: store
  }), /*#__PURE__*/React.createElement(EditText, {
    label: "L\xEDnea 2",
    value: p.title2,
    onChange: v => update('protocol.title2', v),
    sizePath: "protocolTitleMax",
    sizeMin: 60,
    sizeMax: 240,
    sizeStep: 4,
    content: content,
    store: store
  })), /*#__PURE__*/React.createElement(Toggle, {
    label: "L\xEDnea 2 en \xE1mbar",
    value: !!p.title2Amber,
    onChange: v => update('protocol.title2Amber', v)
  }), /*#__PURE__*/React.createElement("div", {
    className: "row"
  }, /*#__PURE__*/React.createElement(EditText, {
    label: "L\xEDnea 3",
    value: p.title3,
    onChange: v => update('protocol.title3', v),
    sizePath: "protocolTitleMax",
    sizeMin: 60,
    sizeMax: 240,
    sizeStep: 4,
    content: content,
    store: store
  }), /*#__PURE__*/React.createElement(EditText, {
    label: "L\xEDnea 4",
    value: p.title4,
    onChange: v => update('protocol.title4', v),
    sizePath: "protocolTitleMax",
    sizeMin: 60,
    sizeMax: 240,
    sizeStep: 4,
    content: content,
    store: store
  })), /*#__PURE__*/React.createElement(Toggle, {
    label: "L\xEDnea 4 en \xE1mbar",
    value: !!p.title4Amber,
    onChange: v => update('protocol.title4Amber', v)
  })), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card__head"
  }, /*#__PURE__*/React.createElement("h3", null, "Secciones \u2014 ", (p.sections || []).length), /*#__PURE__*/React.createElement("button", {
    className: "abtn sm",
    onClick: () => updateList('protocol.sections', l => [...(l || []), {
      id: 'ps' + Date.now(),
      heading: 'NUEVA SECCIÓN',
      body: ''
    }])
  }, "+ Secci\xF3n")), (p.sections || []).map((s, i) => /*#__PURE__*/React.createElement("div", {
    className: "prod-edit",
    key: s.id,
    style: {
      gridTemplateColumns: '40px 1fr auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--serif)',
      fontSize: 22,
      color: 'var(--amber)'
    }
  }, String(i + 1).padStart(2, '0')), /*#__PURE__*/React.createElement("div", {
    className: "prod-edit__fields"
  }, /*#__PURE__*/React.createElement(Text, {
    label: "Encabezado",
    value: s.heading,
    onChange: v => updateList('protocol.sections', l => l.map(x => x.id === s.id ? {
      ...x,
      heading: v
    } : x))
  }), /*#__PURE__*/React.createElement(Text, {
    label: "Cuerpo",
    value: s.body,
    onChange: v => updateList('protocol.sections', l => l.map(x => x.id === s.id ? {
      ...x,
      body: v
    } : x)),
    multiline: true,
    rows: 3
  })), /*#__PURE__*/React.createElement("div", {
    className: "prod-edit__actions"
  }, /*#__PURE__*/React.createElement("button", {
    className: "abtn ghost sm",
    disabled: i === 0,
    onClick: () => updateList('protocol.sections', l => {
      const a = [...l];
      [a[i - 1], a[i]] = [a[i], a[i - 1]];
      return a;
    })
  }, "\u2191"), /*#__PURE__*/React.createElement("button", {
    className: "abtn ghost sm",
    disabled: i === (p.sections || []).length - 1,
    onClick: () => updateList('protocol.sections', l => {
      const a = [...l];
      [a[i + 1], a[i]] = [a[i], a[i + 1]];
      return a;
    })
  }, "\u2193"), /*#__PURE__*/React.createElement("button", {
    className: "abtn danger sm",
    onClick: () => updateList('protocol.sections', l => l.filter(x => x.id !== s.id))
  }, "\xD7"))))), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card__head"
  }, /*#__PURE__*/React.createElement("h3", null, "Cita b\xEDblica")), /*#__PURE__*/React.createElement(Text, {
    label: "Referencia (ej. MATEO 6:3-4)",
    value: p.quoteRef,
    onChange: v => update('protocol.quoteRef', v)
  }), /*#__PURE__*/React.createElement(Text, {
    label: "Texto de la cita",
    value: p.quoteText,
    onChange: v => update('protocol.quoteText', v),
    multiline: true,
    rows: 4
  })), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card__head"
  }, /*#__PURE__*/React.createElement("h3", null, "Flujo interno \u2014 ", (p.flow || []).length, " pasos"), /*#__PURE__*/React.createElement("button", {
    className: "abtn sm",
    onClick: () => updateList('protocol.flow', l => [...(l || []), {
      id: 'pf' + Date.now(),
      num: String((l || []).length + 1).padStart(2, '0'),
      name: 'NUEVO',
      detail: ''
    }])
  }, "+ Paso")), /*#__PURE__*/React.createElement(Text, {
    label: "T\xEDtulo del bloque",
    value: p.flowTitle,
    onChange: v => update('protocol.flowTitle', v),
    hint: "Ej: FLUJO INTERNO"
  }), (p.flow || []).map((f, i) => /*#__PURE__*/React.createElement("div", {
    className: "prod-edit",
    key: f.id,
    style: {
      gridTemplateColumns: '1fr auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "prod-edit__fields"
  }, /*#__PURE__*/React.createElement("div", {
    className: "row-3"
  }, /*#__PURE__*/React.createElement(Text, {
    label: "N\xFAm.",
    value: f.num,
    onChange: v => updateList('protocol.flow', l => l.map(x => x.id === f.id ? {
      ...x,
      num: v
    } : x))
  }), /*#__PURE__*/React.createElement(Text, {
    label: "Nombre",
    value: f.name,
    onChange: v => updateList('protocol.flow', l => l.map(x => x.id === f.id ? {
      ...x,
      name: v
    } : x))
  }), /*#__PURE__*/React.createElement(Text, {
    label: "Detalle",
    value: f.detail,
    onChange: v => updateList('protocol.flow', l => l.map(x => x.id === f.id ? {
      ...x,
      detail: v
    } : x))
  }))), /*#__PURE__*/React.createElement("div", {
    className: "prod-edit__actions"
  }, /*#__PURE__*/React.createElement("button", {
    className: "abtn ghost sm",
    disabled: i === 0,
    onClick: () => updateList('protocol.flow', l => {
      const a = [...l];
      [a[i - 1], a[i]] = [a[i], a[i - 1]];
      return a;
    })
  }, "\u2191"), /*#__PURE__*/React.createElement("button", {
    className: "abtn ghost sm",
    disabled: i === (p.flow || []).length - 1,
    onClick: () => updateList('protocol.flow', l => {
      const a = [...l];
      [a[i + 1], a[i]] = [a[i], a[i + 1]];
      return a;
    })
  }, "\u2193"), /*#__PURE__*/React.createElement("button", {
    className: "abtn danger sm",
    onClick: () => updateList('protocol.flow', l => l.filter(x => x.id !== f.id))
  }, "\xD7"))))), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card__head"
  }, /*#__PURE__*/React.createElement("h3", null, "Bloque \"Equipo\" + Bot\xF3n de acci\xF3n")), /*#__PURE__*/React.createElement("div", {
    className: "row-3"
  }, /*#__PURE__*/React.createElement(Text, {
    label: "T\xEDtulo",
    value: p.teamTitle,
    onChange: v => update('protocol.teamTitle', v),
    hint: "Ej: EQUIPO"
  }), /*#__PURE__*/React.createElement(Text, {
    label: "Caption (sobre foto)",
    value: p.teamCaption,
    onChange: v => update('protocol.teamCaption', v),
    hint: "FOTO ESPALDA \xB7 RUTA"
  }), /*#__PURE__*/React.createElement(Text, {
    label: "Meta",
    value: p.teamMeta,
    onChange: v => update('protocol.teamMeta', v),
    hint: "AN\xD3NIMO"
  })), /*#__PURE__*/React.createElement(ImgPicker, {
    label: "Foto del equipo (an\xF3nima \xB7 espalda)",
    value: p.teamImg,
    onChange: v => update('protocol.teamImg', v),
    hint: "Recomendado 16:10. Sube una foto o deja vac\xEDo para el patr\xF3n gr\xE1fico.",
    ratio: "16 / 10"
  }), /*#__PURE__*/React.createElement("div", {
    className: "row"
  }, /*#__PURE__*/React.createElement(Text, {
    label: "Texto del bot\xF3n",
    value: p.activateCta,
    onChange: v => update('protocol.activateCta', v)
  }), /*#__PURE__*/React.createElement(Text, {
    label: "Enlace del bot\xF3n",
    value: p.activateHref,
    onChange: v => update('protocol.activateHref', v)
  }))));
}

// ----- View: Services -----
function ViewServices({
  content,
  store
}) {
  const {
    update,
    updateList
  } = store;
  const s = content.services;
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(SectionTokens, {
    groupName: "Servicios",
    content: content,
    store: store
  }), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card__head"
  }, /*#__PURE__*/React.createElement("h3", null, "Cabecera"), /*#__PURE__*/React.createElement("span", {
    className: "meta"
  }, "A\u2212 / A+ controla el tama\xF1o")), /*#__PURE__*/React.createElement(Text, {
    label: "Eyebrow",
    value: s.eyebrow,
    onChange: v => update('services.eyebrow', v)
  }), /*#__PURE__*/React.createElement("div", {
    className: "row"
  }, /*#__PURE__*/React.createElement(EditText, {
    label: "T\xEDtulo",
    value: s.title,
    onChange: v => update('services.title', v),
    sizePath: "servicesTitleMax",
    sizeMin: 50,
    sizeMax: 220,
    sizeStep: 4,
    content: content,
    store: store
  }), /*#__PURE__*/React.createElement(EditText, {
    label: "Acento (\xE1mbar)",
    value: s.titleEm,
    onChange: v => update('services.titleEm', v),
    sizePath: "servicesTitleMax",
    sizeMin: 50,
    sizeMax: 220,
    sizeStep: 4,
    content: content,
    store: store
  })), /*#__PURE__*/React.createElement(Text, {
    label: "Subt\xEDtulo",
    value: s.sub,
    onChange: v => update('services.sub', v),
    multiline: true
  })), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card__head"
  }, /*#__PURE__*/React.createElement("h3", null, "Servicios"), /*#__PURE__*/React.createElement("button", {
    className: "abtn amber sm",
    onClick: () => updateList('services.items', l => [...l, {
      id: 'sv' + Date.now(),
      name: 'Nuevo servicio',
      desc: 'Descripción...'
    }])
  }, "+ Servicio")), s.items.map((it, i) => /*#__PURE__*/React.createElement("div", {
    className: "svc-edit",
    key: it.id
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Text, {
    label: 'Servicio ' + (i + 1) + ' — Nombre',
    value: it.name,
    onChange: v => updateList('services.items', l => l.map(x => x.id === it.id ? {
      ...x,
      name: v
    } : x))
  }), /*#__PURE__*/React.createElement(Text, {
    label: "Descripci\xF3n",
    value: it.desc,
    onChange: v => updateList('services.items', l => l.map(x => x.id === it.id ? {
      ...x,
      desc: v
    } : x)),
    multiline: true,
    rows: 2
  })), /*#__PURE__*/React.createElement("div", {
    className: "prod-edit__actions"
  }, /*#__PURE__*/React.createElement("button", {
    className: "abtn ghost sm",
    disabled: i === 0,
    onClick: () => updateList('services.items', l => {
      const a = [...l];
      [a[i - 1], a[i]] = [a[i], a[i - 1]];
      return a;
    })
  }, "\u2191"), /*#__PURE__*/React.createElement("button", {
    className: "abtn ghost sm",
    disabled: i === s.items.length - 1,
    onClick: () => updateList('services.items', l => {
      const a = [...l];
      [a[i + 1], a[i]] = [a[i], a[i + 1]];
      return a;
    })
  }, "\u2193"), /*#__PURE__*/React.createElement("button", {
    className: "abtn danger sm",
    onClick: () => updateList('services.items', l => l.filter(x => x.id !== it.id))
  }, "Eliminar"))))));
}

// ----- View: Products -----
function ViewProducts({
  content,
  store
}) {
  const {
    update,
    updateList
  } = store;
  const p = content.products;
  const [expandedId, setExpandedId] = React.useState(null);
  async function uploadImage(id, file) {
    try {
      const url = await uploadToCloudinary(file);
      updateList('products.items', l => l.map(x => x.id === id ? {
        ...x,
        img: url
      } : x));
    } catch (e) {
      alert('Error al subir: ' + e.message);
    }
  }
  async function addGalleryImage(id, file) {
    try {
      const url = await uploadToCloudinary(file);
      updateList('products.items', l => l.map(x => x.id === id ? {
        ...x,
        gallery: [...(x.gallery || []), url]
      } : x));
    } catch (e) {
      alert('Error al subir: ' + e.message);
    }
  }
  function removeGalleryAt(id, idx) {
    updateList('products.items', l => l.map(x => x.id === id ? {
      ...x,
      gallery: (x.gallery || []).filter((_, i) => i !== idx)
    } : x));
  }
  const realCategories = p.categories.filter(c => c.slug !== 'todo');
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(SectionTokens, {
    groupName: "Productos",
    content: content,
    store: store
  }), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card__head"
  }, /*#__PURE__*/React.createElement("h3", null, "Cabecera"), /*#__PURE__*/React.createElement("span", {
    className: "meta"
  }, "A\u2212 / A+ controla el tama\xF1o")), /*#__PURE__*/React.createElement(Text, {
    label: "Eyebrow",
    value: p.eyebrow,
    onChange: v => update('products.eyebrow', v)
  }), /*#__PURE__*/React.createElement("div", {
    className: "row"
  }, /*#__PURE__*/React.createElement(EditText, {
    label: "T\xEDtulo",
    value: p.title,
    onChange: v => update('products.title', v),
    sizePath: "productsTitleMax",
    sizeMin: 50,
    sizeMax: 220,
    sizeStep: 4,
    content: content,
    store: store
  }), /*#__PURE__*/React.createElement(EditText, {
    label: "Acento (\xE1mbar)",
    value: p.titleEm,
    onChange: v => update('products.titleEm', v),
    sizePath: "productsTitleMax",
    sizeMin: 50,
    sizeMax: 220,
    sizeStep: 4,
    content: content,
    store: store
  })), /*#__PURE__*/React.createElement(Text, {
    label: "Subt\xEDtulo",
    value: p.sub,
    onChange: v => update('products.sub', v),
    multiline: true
  })), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card__head"
  }, /*#__PURE__*/React.createElement("h3", null, "Cat\xE1logo \u2014 ", p.items.length, " producto", p.items.length !== 1 ? 's' : ''), /*#__PURE__*/React.createElement("button", {
    className: "abtn amber sm",
    onClick: () => updateList('products.items', l => [...l, {
      id: 'p' + Date.now(),
      name: 'Nueva prenda',
      verse: 'GEN. 1:1',
      price: '0',
      tag: '',
      tagStyle: 'amber',
      img: '',
      gallery: [],
      categoryId: realCategories[0]?.id || '',
      description: '',
      details: []
    }])
  }, "+ Producto")), p.items.map((it, i) => {
    const isOpen = expandedId === it.id;
    const cat = p.categories.find(c => c.id === it.categoryId);
    return /*#__PURE__*/React.createElement("div", {
      className: "prod-edit",
      key: it.id,
      style: {
        gridTemplateColumns: '100px 1fr auto'
      }
    }, /*#__PURE__*/React.createElement("label", {
      className: "prod-edit__media"
    }, it.img ? /*#__PURE__*/React.createElement("img", {
      src: it.img,
      alt: it.name
    }) : /*#__PURE__*/React.createElement("span", null, "Subir", /*#__PURE__*/React.createElement("br", null), "imagen"), /*#__PURE__*/React.createElement("input", {
      type: "file",
      accept: "image/*",
      onChange: e => e.target.files[0] && uploadImage(it.id, e.target.files[0])
    })), /*#__PURE__*/React.createElement("div", {
      className: "prod-edit__fields"
    }, /*#__PURE__*/React.createElement("div", {
      className: "row"
    }, /*#__PURE__*/React.createElement(Text, {
      label: "Nombre",
      value: it.name,
      onChange: v => updateList('products.items', l => l.map(x => x.id === it.id ? {
        ...x,
        name: v
      } : x))
    }), /*#__PURE__*/React.createElement(Text, {
      label: "Vers\xEDculo / Subt\xEDtulo",
      value: it.verse,
      onChange: v => updateList('products.items', l => l.map(x => x.id === it.id ? {
        ...x,
        verse: v
      } : x))
    })), /*#__PURE__*/React.createElement("div", {
      className: "card",
      style: {
        margin: '12px 0 0',
        padding: '12px 16px',
        background: 'var(--surface2,#f5f5f3)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "card__head",
      style: {
        marginBottom: 10
      }
    }, /*#__PURE__*/React.createElement("h4", {
      style: {
        margin: 0,
        fontSize: 12,
        letterSpacing: '0.05em'
      }
    }, "ESPECIFICACIONES (aparecen en el correo de compra)")), /*#__PURE__*/React.createElement("div", {
      className: "row"
    }, /*#__PURE__*/React.createElement(Text, {
      label: "Material:",
      value: it.material || '',
      placeholder: "Algod\xF3n premium 220 gsm",
      onChange: v => updateList('products.items', l => l.map(x => x.id === it.id ? {
        ...x,
        material: v
      } : x))
    }), /*#__PURE__*/React.createElement(Text, {
      label: "Estampado:",
      value: it.estampado || '',
      placeholder: "Serigraf\xEDa a 2 tintas",
      onChange: v => updateList('products.items', l => l.map(x => x.id === it.id ? {
        ...x,
        estampado: v
      } : x))
    })), /*#__PURE__*/React.createElement("div", {
      className: "row"
    }, /*#__PURE__*/React.createElement(Text, {
      label: "Fit:",
      value: it.fit || '',
      placeholder: "Oversize relajado, unisex",
      onChange: v => updateList('products.items', l => l.map(x => x.id === it.id ? {
        ...x,
        fit: v
      } : x))
    }), /*#__PURE__*/React.createElement(Text, {
      label: "Tallas:",
      value: it.tallas || '',
      placeholder: "S \xB7 M \xB7 L \xB7 XL \xB7 XXL",
      onChange: v => updateList('products.items', l => l.map(x => x.id === it.id ? {
        ...x,
        tallas: v
      } : x))
    })), /*#__PURE__*/React.createElement(Text, {
      label: "Origen:",
      value: it.origen || '',
      placeholder: "Dise\xF1ado y producido en Santiago, Chile",
      onChange: v => updateList('products.items', l => l.map(x => x.id === it.id ? {
        ...x,
        origen: v
      } : x))
    })), /*#__PURE__*/React.createElement("div", {
      className: "row-3"
    }, /*#__PURE__*/React.createElement(Text, {
      label: "Precio CLP",
      value: it.price,
      onChange: v => updateList('products.items', l => l.map(x => x.id === it.id ? {
        ...x,
        price: v
      } : x))
    }), /*#__PURE__*/React.createElement(Text, {
      label: "Etiqueta",
      value: it.tag,
      onChange: v => updateList('products.items', l => l.map(x => x.id === it.id ? {
        ...x,
        tag: v
      } : x)),
      hint: "DROP 04 / EXCLUSIVO / B\xC1SICO"
    }), /*#__PURE__*/React.createElement(Field, {
      label: "Categor\xEDa"
    }, /*#__PURE__*/React.createElement("select", {
      className: "select",
      value: it.categoryId || '',
      onChange: e => updateList('products.items', l => l.map(x => x.id === it.id ? {
        ...x,
        categoryId: e.target.value
      } : x))
    }, /*#__PURE__*/React.createElement("option", {
      value: ""
    }, "\u2014 Sin categor\xEDa \u2014"), realCategories.map(c => /*#__PURE__*/React.createElement("option", {
      key: c.id,
      value: c.id
    }, c.name))))), /*#__PURE__*/React.createElement(Field, {
      label: "Estilo etiqueta"
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 8
      }
    }, ['amber', 'soft'].map(s => /*#__PURE__*/React.createElement("button", {
      key: s,
      type: "button",
      className: 'abtn sm ' + (it.tagStyle === s ? 'amber' : 'ghost'),
      onClick: () => updateList('products.items', l => l.map(x => x.id === it.id ? {
        ...x,
        tagStyle: s
      } : x))
    }, s.toUpperCase())))), /*#__PURE__*/React.createElement(Field, {
      label: "Tipo de talla"
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 8,
        flexWrap: 'wrap'
      }
    }, [['adulto', 'De Adulto'], ['nino', 'De Niño'], ['unica', 'Talla Única']].map(([val, lbl]) => /*#__PURE__*/React.createElement("button", {
      key: val,
      type: "button",
      className: 'abtn sm ' + ((it.sizeType || 'adulto') === val ? 'amber' : 'ghost'),
      onClick: () => updateList('products.items', l => l.map(x => x.id === it.id ? {
        ...x,
        sizeType: val
      } : x))
    }, lbl)))), /*#__PURE__*/React.createElement(Field, {
      label: "Tipo de stock"
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 8,
        flexWrap: 'wrap'
      }
    }, [['permanente', 'Stock permanente'], ['limitado', 'Stock limitado'], ['unica', 'Pieza única']].map(([val, lbl]) => /*#__PURE__*/React.createElement("button", {
      key: val,
      type: "button",
      className: 'abtn sm ' + ((it.stockType || 'permanente') === val ? 'amber' : 'ghost'),
      onClick: () => updateList('products.items', l => l.map(x => x.id === it.id ? {
        ...x,
        stockType: val
      } : x))
    }, lbl)))), it.stockType === 'limitado' && /*#__PURE__*/React.createElement("div", {
      className: "row",
      style: {
        gridTemplateColumns: '1fr 1fr'
      }
    }, /*#__PURE__*/React.createElement(Text, {
      label: "Stock total (unidades)",
      value: String(it.stockTotal || 0),
      onChange: v => updateList('products.items', l => l.map(x => x.id === it.id ? {
        ...x,
        stockTotal: Math.max(0, parseInt(v) || 0),
        stockActual: Math.min(x.stockActual != null ? x.stockActual : parseInt(v) || 0, parseInt(v) || 0)
      } : x))
    }), /*#__PURE__*/React.createElement(Text, {
      label: "Disponibles actuales",
      value: String(it.stockActual != null ? it.stockActual : it.stockTotal || 0),
      onChange: v => updateList('products.items', l => l.map(x => x.id === it.id ? {
        ...x,
        stockActual: Math.max(0, Math.min(parseInt(v) || 0, x.stockTotal || 0))
      } : x))
    })), /*#__PURE__*/React.createElement("div", {
      className: "card",
      style: {
        margin: '12px 0 0',
        padding: '12px 16px',
        background: 'var(--surface2,#f5f5f3)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "card__head",
      style: {
        marginBottom: 10
      }
    }, /*#__PURE__*/React.createElement("h4", {
      style: {
        margin: 0,
        fontSize: 12,
        letterSpacing: '0.05em'
      }
    }, "POL\xCDTICA DE CAMBIOS")), /*#__PURE__*/React.createElement(Toggle, {
      label: "Sin derecho a cambio (ej: producto personalizado)",
      value: !!it.noReturn,
      onChange: v => updateList('products.items', l => l.map(x => x.id === it.id ? {
        ...x,
        noReturn: v
      } : x))
    }), !it.noReturn && /*#__PURE__*/React.createElement(Text, {
      label: "D\xEDas para cambio de talla",
      hint: "Default: 30 d\xEDas",
      value: String(it.returnDays != null ? it.returnDays : 30),
      onChange: v => updateList('products.items', l => l.map(x => x.id === it.id ? {
        ...x,
        returnDays: Math.max(1, parseInt(v) || 30)
      } : x))
    })), /*#__PURE__*/React.createElement(Toggle, {
      label: "Mostrar en carrusel de inicio",
      value: !!it.featuredInCarousel,
      onChange: v => updateList('products.items', l => l.map(x => x.id === it.id ? {
        ...x,
        featuredInCarousel: v
      } : x))
    }), /*#__PURE__*/React.createElement(Toggle, {
      label: "Mostrar como producto destacado del inicio (m\xE1x. 2)",
      value: !!it.featuredOnHome,
      onChange: v => updateList('products.items', l => l.map(x => x.id === it.id ? {
        ...x,
        featuredOnHome: v
      } : x))
    }), /*#__PURE__*/React.createElement("button", {
      className: "abtn ghost sm",
      type: "button",
      onClick: () => setExpandedId(isOpen ? null : it.id),
      style: {
        alignSelf: 'flex-start',
        marginTop: 4
      }
    }, isOpen ? '▴ Ocultar descripción y detalles' : '▾ Descripción + detalles + galería'), isOpen && /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 12,
        padding: 14,
        background: '#fff',
        border: '1px solid var(--line)',
        borderRadius: 6
      }
    }, /*#__PURE__*/React.createElement(Text, {
      label: "Descripci\xF3n completa",
      value: it.description || '',
      onChange: v => updateList('products.items', l => l.map(x => x.id === it.id ? {
        ...x,
        description: v
      } : x)),
      multiline: true,
      rows: 5,
      placeholder: "Material, fit, inspiraci\xF3n, vers\xEDculo, etc."
    }), /*#__PURE__*/React.createElement("div", {
      className: "divider"
    }, "Ficha t\xE9cnica \xB7 atributos"), (it.details || []).map((d, di) => /*#__PURE__*/React.createElement("div", {
      key: d.id,
      className: "row",
      style: {
        gridTemplateColumns: '160px 1fr auto',
        alignItems: 'end',
        marginBottom: 6
      }
    }, /*#__PURE__*/React.createElement(Text, {
      label: 'Atributo ' + (di + 1),
      value: d.label,
      onChange: v => updateList('products.items', l => l.map(x => x.id === it.id ? {
        ...x,
        details: x.details.map(y => y.id === d.id ? {
          ...y,
          label: v
        } : y)
      } : x))
    }), /*#__PURE__*/React.createElement(Text, {
      label: "Valor",
      value: d.value,
      onChange: v => updateList('products.items', l => l.map(x => x.id === it.id ? {
        ...x,
        details: x.details.map(y => y.id === d.id ? {
          ...y,
          value: v
        } : y)
      } : x))
    }), /*#__PURE__*/React.createElement("button", {
      className: "abtn danger sm",
      style: {
        marginBottom: 14
      },
      onClick: () => updateList('products.items', l => l.map(x => x.id === it.id ? {
        ...x,
        details: x.details.filter(y => y.id !== d.id)
      } : x))
    }, "\xD7"))), /*#__PURE__*/React.createElement("button", {
      className: "abtn sm",
      type: "button",
      onClick: () => updateList('products.items', l => l.map(x => x.id === it.id ? {
        ...x,
        details: [...(x.details || []), {
          id: 'd' + Date.now(),
          label: 'Material',
          value: ''
        }]
      } : x))
    }, "+ Atributo"), /*#__PURE__*/React.createElement("div", {
      className: "divider"
    }, "Galer\xEDa \xB7 im\xE1genes extra"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 10
      }
    }, (it.gallery || []).map((g, gi) => /*#__PURE__*/React.createElement("div", {
      key: gi,
      style: {
        position: 'relative',
        width: 80,
        height: 96,
        background: '#f0ecdf',
        borderRadius: 4,
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement("img", {
      src: g,
      alt: "",
      style: {
        width: '100%',
        height: '100%',
        objectFit: 'cover'
      }
    }), /*#__PURE__*/React.createElement("button", {
      className: "abtn danger sm",
      style: {
        position: 'absolute',
        top: 4,
        right: 4,
        padding: '2px 6px',
        minHeight: 0
      },
      onClick: () => removeGalleryAt(it.id, gi)
    }, "\xD7"))), /*#__PURE__*/React.createElement("label", {
      className: "abtn ghost sm",
      style: {
        position: 'relative',
        cursor: 'pointer',
        width: 80,
        height: 96,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderStyle: 'dashed'
      }
    }, "+ IMG", /*#__PURE__*/React.createElement("input", {
      type: "file",
      accept: "image/*",
      style: {
        position: 'absolute',
        inset: 0,
        opacity: 0,
        cursor: 'pointer'
      },
      onChange: e => e.target.files[0] && addGalleryImage(it.id, e.target.files[0])
    }))))), /*#__PURE__*/React.createElement("div", {
      className: "prod-edit__actions"
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--mono)',
        fontSize: 9,
        letterSpacing: '0.16em',
        color: 'var(--gray)',
        textAlign: 'right',
        padding: '4px 0'
      }
    }, cat ? cat.name.toUpperCase() : 'SIN CAT.'), /*#__PURE__*/React.createElement("button", {
      className: "abtn ghost sm",
      disabled: i === 0,
      onClick: () => updateList('products.items', l => {
        const a = [...l];
        [a[i - 1], a[i]] = [a[i], a[i - 1]];
        return a;
      })
    }, "\u2191"), /*#__PURE__*/React.createElement("button", {
      className: "abtn ghost sm",
      disabled: i === p.items.length - 1,
      onClick: () => updateList('products.items', l => {
        const a = [...l];
        [a[i + 1], a[i]] = [a[i], a[i + 1]];
        return a;
      })
    }, "\u2193"), it.img && /*#__PURE__*/React.createElement("button", {
      className: "abtn ghost sm",
      onClick: () => updateList('products.items', l => l.map(x => x.id === it.id ? {
        ...x,
        img: ''
      } : x))
    }, "Quitar img"), /*#__PURE__*/React.createElement("button", {
      className: "abtn danger sm",
      onClick: () => {
        if (confirm('¿Eliminar producto?')) updateList('products.items', l => l.filter(x => x.id !== it.id));
      }
    }, "Eliminar")));
  })));
}

// ----- View: Categories -----
function ViewCategories({
  content,
  store
}) {
  const {
    updateList
  } = store;
  const cats = content.products.categories;
  function slugify(s) {
    return (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(SectionTokens, {
    groupName: "Categor\xEDas",
    content: content,
    store: store
  }), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card__head"
  }, /*#__PURE__*/React.createElement("h3", null, "Subcategor\xEDas del men\xFA Productos"), /*#__PURE__*/React.createElement("button", {
    className: "abtn amber sm",
    onClick: () => updateList('products.categories', l => [...l, {
      id: 'c' + Date.now(),
      name: 'Nueva',
      slug: 'nueva-' + Date.now()
    }])
  }, "+ Categor\xEDa")), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--mono)',
      fontSize: 12,
      color: 'var(--gray)',
      marginBottom: 16,
      lineHeight: 1.5
    }
  }, "Aparecen en el men\xFA principal como dropdown y como chips de filtro en la secci\xF3n Productos. La categor\xEDa ", /*#__PURE__*/React.createElement("strong", null, "\"Todo\""), " es virtual: muestra todos los productos."), cats.map((c, i) => {
    const productCount = content.products.items.filter(p => p.categoryId === c.id).length;
    const isVirtual = c.slug === 'todo';
    return /*#__PURE__*/React.createElement("div", {
      className: "prod-edit",
      key: c.id,
      style: {
        gridTemplateColumns: '40px 1fr auto'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--serif)',
        fontSize: 28,
        color: isVirtual ? 'var(--gray-soft)' : 'var(--amber)'
      }
    }, String(i + 1).padStart(2, '0')), /*#__PURE__*/React.createElement("div", {
      className: "prod-edit__fields"
    }, /*#__PURE__*/React.createElement("div", {
      className: "row"
    }, /*#__PURE__*/React.createElement(Text, {
      label: "Nombre visible",
      value: c.name,
      onChange: v => updateList('products.categories', l => l.map(x => x.id === c.id ? {
        ...x,
        name: v,
        slug: x.slug === 'todo' ? 'todo' : slugify(v)
      } : x))
    }), /*#__PURE__*/React.createElement(Text, {
      label: "Slug (URL)",
      value: c.slug,
      onChange: v => updateList('products.categories', l => l.map(x => x.id === c.id ? {
        ...x,
        slug: slugify(v)
      } : x)),
      hint: isVirtual ? 'reservado' : productCount + ' producto' + (productCount !== 1 ? 's' : '')
    }))), /*#__PURE__*/React.createElement("div", {
      className: "prod-edit__actions"
    }, /*#__PURE__*/React.createElement("button", {
      className: "abtn ghost sm",
      disabled: i === 0,
      onClick: () => updateList('products.categories', l => {
        const a = [...l];
        [a[i - 1], a[i]] = [a[i], a[i - 1]];
        return a;
      })
    }, "\u2191"), /*#__PURE__*/React.createElement("button", {
      className: "abtn ghost sm",
      disabled: i === cats.length - 1,
      onClick: () => updateList('products.categories', l => {
        const a = [...l];
        [a[i + 1], a[i]] = [a[i], a[i + 1]];
        return a;
      })
    }, "\u2193"), /*#__PURE__*/React.createElement("button", {
      className: "abtn danger sm",
      disabled: isVirtual,
      onClick: () => {
        if (productCount > 0) {
          alert('Esta categoría tiene productos. Reasígnalos antes de eliminarla.');
          return;
        }
        if (confirm('¿Eliminar categoría?')) updateList('products.categories', l => l.filter(x => x.id !== c.id));
      }
    }, "\xD7")));
  })));
}

// ----- View: About -----
function ViewAbout({
  content,
  store
}) {
  const {
    update,
    updateList
  } = store;
  const a = content.about;
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(SectionTokens, {
    groupName: "Qui\xE9nes Somos",
    content: content,
    store: store
  }), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card__head"
  }, /*#__PURE__*/React.createElement("h3", null, "Cabecera Quienes Somos"), /*#__PURE__*/React.createElement("span", {
    className: "meta"
  }, "A\u2212 / A+ controla el tama\xF1o del t\xEDtulo")), /*#__PURE__*/React.createElement(Text, {
    label: "Eyebrow",
    value: a.eyebrow,
    onChange: v => update('about.eyebrow', v)
  }), /*#__PURE__*/React.createElement("div", {
    className: "row"
  }, /*#__PURE__*/React.createElement(EditText, {
    label: "T\xEDtulo",
    value: a.title,
    onChange: v => update('about.title', v),
    sizePath: "aboutTitleMax",
    sizeMin: 50,
    sizeMax: 220,
    sizeStep: 4,
    content: content,
    store: store
  }), /*#__PURE__*/React.createElement(EditText, {
    label: "Acento (\xE1mbar)",
    value: a.titleEm,
    onChange: v => update('about.titleEm', v),
    sizePath: "aboutTitleMax",
    sizeMin: 50,
    sizeMax: 220,
    sizeStep: 4,
    content: content,
    store: store
  })), /*#__PURE__*/React.createElement(Text, {
    label: "Subt\xEDtulo",
    value: a.sub,
    onChange: v => update('about.sub', v),
    multiline: true
  })), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card__head"
  }, /*#__PURE__*/React.createElement("h3", null, "Historia \xB7 cuerpo de texto")), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--mono)',
      fontSize: 12,
      color: 'var(--gray)',
      marginBottom: 10
    }
  }, "Separa cada p\xE1rrafo con una l\xEDnea en blanco."), /*#__PURE__*/React.createElement("textarea", {
    className: "textarea",
    rows: 10,
    value: a.body.join('\n\n'),
    onChange: e => update('about.body', e.target.value.split(/\n\n+/))
  })), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card__head"
  }, /*#__PURE__*/React.createElement("h3", null, "Pilares \u2014 ", a.pillars.length), /*#__PURE__*/React.createElement("button", {
    className: "abtn amber sm",
    onClick: () => updateList('about.pillars', l => [...l, {
      id: 'a' + Date.now(),
      num: String(l.length + 1).padStart(2, '0'),
      title: 'Nuevo pilar',
      desc: 'Descripción…'
    }])
  }, "+ Pilar")), a.pillars.map((p, i) => /*#__PURE__*/React.createElement("div", {
    className: "prod-edit",
    key: p.id,
    style: {
      gridTemplateColumns: '60px 1fr auto'
    }
  }, /*#__PURE__*/React.createElement(Text, {
    label: "N\xFAm.",
    value: p.num,
    onChange: v => updateList('about.pillars', l => l.map(x => x.id === p.id ? {
      ...x,
      num: v
    } : x))
  }), /*#__PURE__*/React.createElement("div", {
    className: "prod-edit__fields"
  }, /*#__PURE__*/React.createElement(Text, {
    label: "T\xEDtulo",
    value: p.title,
    onChange: v => updateList('about.pillars', l => l.map(x => x.id === p.id ? {
      ...x,
      title: v
    } : x))
  }), /*#__PURE__*/React.createElement(Text, {
    label: "Descripci\xF3n",
    value: p.desc,
    onChange: v => updateList('about.pillars', l => l.map(x => x.id === p.id ? {
      ...x,
      desc: v
    } : x)),
    multiline: true,
    rows: 2
  })), /*#__PURE__*/React.createElement("div", {
    className: "prod-edit__actions"
  }, /*#__PURE__*/React.createElement("button", {
    className: "abtn ghost sm",
    disabled: i === 0,
    onClick: () => updateList('about.pillars', l => {
      const a2 = [...l];
      [a2[i - 1], a2[i]] = [a2[i], a2[i - 1]];
      return a2;
    })
  }, "\u2191"), /*#__PURE__*/React.createElement("button", {
    className: "abtn ghost sm",
    disabled: i === a.pillars.length - 1,
    onClick: () => updateList('about.pillars', l => {
      const a2 = [...l];
      [a2[i + 1], a2[i]] = [a2[i], a2[i + 1]];
      return a2;
    })
  }, "\u2193"), /*#__PURE__*/React.createElement("button", {
    className: "abtn danger sm",
    onClick: () => updateList('about.pillars', l => l.filter(x => x.id !== p.id))
  }, "\xD7"))))), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card__head"
  }, /*#__PURE__*/React.createElement("h3", null, "M\xE9tricas \u2014 ", a.metrics.length), /*#__PURE__*/React.createElement("button", {
    className: "abtn sm",
    onClick: () => updateList('about.metrics', l => [...l, {
      id: 'am' + Date.now(),
      num: '0',
      lbl: 'Nueva métrica'
    }])
  }, "+ M\xE9trica")), a.metrics.map(m => /*#__PURE__*/React.createElement("div", {
    className: "prod-edit",
    key: m.id,
    style: {
      gridTemplateColumns: '1fr auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "prod-edit__fields"
  }, /*#__PURE__*/React.createElement("div", {
    className: "row"
  }, /*#__PURE__*/React.createElement(Text, {
    label: "N\xFAmero",
    value: m.num,
    onChange: v => updateList('about.metrics', l => l.map(x => x.id === m.id ? {
      ...x,
      num: v
    } : x))
  }), /*#__PURE__*/React.createElement(Text, {
    label: "Etiqueta",
    value: m.lbl,
    onChange: v => updateList('about.metrics', l => l.map(x => x.id === m.id ? {
      ...x,
      lbl: v
    } : x))
  }))), /*#__PURE__*/React.createElement("div", {
    className: "prod-edit__actions"
  }, /*#__PURE__*/React.createElement("button", {
    className: "abtn danger sm",
    onClick: () => updateList('about.metrics', l => l.filter(x => x.id !== m.id))
  }, "\xD7"))))));
}

// ----- View: Typography -----
function ViewTypography({
  content,
  store
}) {
  const {
    update
  } = store;
  const t = content.typography;
  function Slider({
    label,
    path,
    min,
    max,
    step = 1
  }) {
    const v = t[path];
    return /*#__PURE__*/React.createElement(Field, {
      label: label,
      hint: (v || 0) + 'px'
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 12
      }
    }, /*#__PURE__*/React.createElement("input", {
      type: "range",
      min: min,
      max: max,
      step: step,
      value: v || min,
      onChange: e => update('typography.' + path, Number(e.target.value)),
      style: {
        flex: 1,
        accentColor: 'var(--amber)'
      }
    }), /*#__PURE__*/React.createElement("input", {
      type: "number",
      className: "input",
      value: v || '',
      min: min,
      max: max,
      onChange: e => update('typography.' + path, Number(e.target.value)),
      style: {
        width: 80
      }
    })));
  }
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card__head"
  }, /*#__PURE__*/React.createElement("h3", null, "T\xEDtulos de secci\xF3n \xB7 P\xE1gina principal"), /*#__PURE__*/React.createElement("span", {
    className: "meta"
  }, "M\xE1x. en pantalla grande \xB7 Live")), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--mono)',
      fontSize: 12,
      color: 'var(--gray)',
      marginBottom: 16,
      lineHeight: 1.55
    }
  }, "Cada slider controla un t\xEDtulo distinto. En mobile se reducen autom\xE1ticamente."), /*#__PURE__*/React.createElement("div", {
    className: "row"
  }, /*#__PURE__*/React.createElement(Slider, {
    label: "Hero \xB7 T\xEDtulo principal",
    path: "heroMax",
    min: 60,
    max: 320
  }), /*#__PURE__*/React.createElement(Slider, {
    label: "Qui\xE9nes Somos \xB7 T\xEDtulo",
    path: "aboutTitleMax",
    min: 50,
    max: 220
  }), /*#__PURE__*/React.createElement(Slider, {
    label: "Servicios \xB7 T\xEDtulo",
    path: "servicesTitleMax",
    min: 50,
    max: 220
  }), /*#__PURE__*/React.createElement(Slider, {
    label: "Productos \xB7 T\xEDtulo",
    path: "productsTitleMax",
    min: 50,
    max: 220
  }), /*#__PURE__*/React.createElement(Slider, {
    label: "Cuadros \xB7 T\xEDtulo grande",
    path: "cuadrosTitleMax",
    min: 60,
    max: 240
  }), /*#__PURE__*/React.createElement(Slider, {
    label: "Iglesias \xB7 T\xEDtulo grande",
    path: "iglesiasTitleMax",
    min: 50,
    max: 220
  }), /*#__PURE__*/React.createElement(Slider, {
    label: "Protocolo \xB7 T\xEDtulo grande",
    path: "protocolTitleMax",
    min: 60,
    max: 240
  }), /*#__PURE__*/React.createElement(Slider, {
    label: "Manifiesto",
    path: "manifestoMax",
    min: 40,
    max: 180
  }), /*#__PURE__*/React.createElement(Slider, {
    label: "Testimonios \xB7 T\xEDtulo",
    path: "testimonialsTitleMax",
    min: 50,
    max: 220
  }), /*#__PURE__*/React.createElement(Slider, {
    label: "CTA Final \xB7 T\xEDtulo",
    path: "ctaMax",
    min: 60,
    max: 260
  }), /*#__PURE__*/React.createElement(Slider, {
    label: "Wordmark del Footer",
    path: "wordmarkMax",
    min: 80,
    max: 420
  }), /*#__PURE__*/React.createElement(Slider, {
    label: "Secci\xF3n gen\xE9rica (fallback)",
    path: "sectionMax",
    min: 60,
    max: 220
  }))), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card__head"
  }, /*#__PURE__*/React.createElement("h3", null, "Iglesias \xB7 sub-elementos")), /*#__PURE__*/React.createElement("div", {
    className: "row"
  }, /*#__PURE__*/React.createElement(Slider, {
    label: "Nombre del servicio",
    path: "iglesiasServiceName",
    min: 14,
    max: 48
  }), /*#__PURE__*/React.createElement(Slider, {
    label: "Nombre del proyecto",
    path: "iglesiasProjectName",
    min: 20,
    max: 64
  }), /*#__PURE__*/React.createElement(Slider, {
    label: "T\xEDtulo Portafolio",
    path: "iglesiasPortfolioTitle",
    min: 40,
    max: 160
  }), /*#__PURE__*/React.createElement(Slider, {
    label: "T\xEDtulo Formulario",
    path: "iglesiasFormTitle",
    min: 28,
    max: 120
  }), /*#__PURE__*/React.createElement(Slider, {
    label: "Nombre pieza destacada",
    path: "iglesiasFeatureName",
    min: 28,
    max: 140
  }))), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card__head"
  }, /*#__PURE__*/React.createElement("h3", null, "Cuadros \xB7 sub-elementos")), /*#__PURE__*/React.createElement("div", {
    className: "row"
  }, /*#__PURE__*/React.createElement(Slider, {
    label: "Tag de estilo",
    path: "cuadrosStyleTag",
    min: 12,
    max: 36
  }), /*#__PURE__*/React.createElement(Slider, {
    label: "Brief \xB7 T\xEDtulo",
    path: "cuadrosBriefTitle",
    min: 28,
    max: 120
  }), /*#__PURE__*/React.createElement(Slider, {
    label: "N\xFAmero de paso",
    path: "cuadrosStepNum",
    min: 20,
    max: 72
  }), /*#__PURE__*/React.createElement(Slider, {
    label: "Nombre de referencia",
    path: "cuadrosRefName",
    min: 24,
    max: 96
  }), /*#__PURE__*/React.createElement(Slider, {
    label: "N\xFAmero de formato (px40)",
    path: "cuadrosFormatNum",
    min: 20,
    max: 72
  }))), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card__head"
  }, /*#__PURE__*/React.createElement("h3", null, "Protocolo \xB7 sub-elementos")), /*#__PURE__*/React.createElement("div", {
    className: "row"
  }, /*#__PURE__*/React.createElement(Slider, {
    label: "Nombre del flujo",
    path: "protocolFlowName",
    min: 10,
    max: 20
  }), /*#__PURE__*/React.createElement(Slider, {
    label: "Encabezado de secci\xF3n",
    path: "protocolSectionHd",
    min: 9,
    max: 18
  }), /*#__PURE__*/React.createElement(Slider, {
    label: "Cita b\xEDblica",
    path: "protocolQuote",
    min: 13,
    max: 32
  }))), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card__head"
  }, /*#__PURE__*/React.createElement("h3", null, "Club Secreto \xB7 tama\xF1os")), /*#__PURE__*/React.createElement("div", {
    className: "row"
  }, /*#__PURE__*/React.createElement(Slider, {
    label: "Club \xB7 T\xEDtulo grande",
    path: "clubTitleMax",
    min: 50,
    max: 220
  }), /*#__PURE__*/React.createElement(Slider, {
    label: "Panel \xB7 n\xFAmero grande",
    path: "clubPanelBig",
    min: 32,
    max: 120
  }), /*#__PURE__*/React.createElement(Slider, {
    label: "Nombre de ruta",
    path: "clubRouteName",
    min: 14,
    max: 48
  }), /*#__PURE__*/React.createElement(Slider, {
    label: "D\xEDa de reuni\xF3n",
    path: "clubMeetingDay",
    min: 20,
    max: 72
  }))), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card__head"
  }, /*#__PURE__*/React.createElement("h3", null, "Otros componentes")), /*#__PURE__*/React.createElement("div", {
    className: "row"
  }, /*#__PURE__*/React.createElement(Slider, {
    label: "Producto \xB7 T\xEDtulo",
    path: "productTitle",
    min: 16,
    max: 48
  }), /*#__PURE__*/React.createElement(Slider, {
    label: "Testimonio \xB7 Cita",
    path: "testiQuote",
    min: 16,
    max: 48
  }), /*#__PURE__*/React.createElement(Slider, {
    label: "Pilar \xB7 T\xEDtulo",
    path: "pillarTitle",
    min: 20,
    max: 64
  }), /*#__PURE__*/React.createElement(Slider, {
    label: "M\xE9trica \xB7 n\xFAmero",
    path: "statNum",
    min: 40,
    max: 160
  }), /*#__PURE__*/React.createElement(Slider, {
    label: "Nav \xB7 Brand (no usado, logo es imagen)",
    path: "navBrand",
    min: 14,
    max: 40
  }))), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card__head"
  }, /*#__PURE__*/React.createElement("h3", null, "Cuerpo \xB7 texto")), /*#__PURE__*/React.createElement("div", {
    className: "row"
  }, /*#__PURE__*/React.createElement(Slider, {
    label: "Texto base",
    path: "bodyBase",
    min: 12,
    max: 22
  }), /*#__PURE__*/React.createElement(Slider, {
    label: "Lede / Subt\xEDtulos",
    path: "lede",
    min: 12,
    max: 24
  }), /*#__PURE__*/React.createElement(Slider, {
    label: "Etiquetas mono",
    path: "label",
    min: 9,
    max: 18
  }))), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card__head"
  }, /*#__PURE__*/React.createElement("h3", null, "Presets")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "abtn ghost",
    onClick: () => {
      update('typography.heroMax', 220);
      update('typography.sectionMax', 120);
      update('typography.aboutTitleMax', 120);
      update('typography.servicesTitleMax', 120);
      update('typography.productsTitleMax', 120);
      update('typography.cuadrosTitleMax', 140);
      update('typography.iglesiasTitleMax', 120);
      update('typography.protocolTitleMax', 140);
      update('typography.testimonialsTitleMax', 120);
      update('typography.ctaMax', 160);
      update('typography.wordmarkMax', 280);
      update('typography.manifestoMax', 92);
      update('typography.clubTitleMax', 140);
      update('typography.productTitle', 28);
      update('typography.testiQuote', 28);
      update('typography.bodyBase', 15);
      update('typography.lede', 16);
      update('typography.label', 11);
      update('typography.navBrand', 24);
      update('typography.pillarTitle', 32);
      update('typography.statNum', 92);
      update('typography.iglesiasServiceName', 22);
      update('typography.iglesiasProjectName', 38);
      update('typography.iglesiasPortfolioTitle', 92);
      update('typography.iglesiasFormTitle', 72);
      update('typography.iglesiasFeatureName', 88);
      update('typography.cuadrosStyleTag', 18);
      update('typography.cuadrosBriefTitle', 64);
      update('typography.cuadrosStepNum', 38);
      update('typography.cuadrosRefName', 56);
      update('typography.cuadrosFormatNum', 36);
      update('typography.protocolFlowName', 13);
      update('typography.protocolSectionHd', 11);
      update('typography.protocolQuote', 18);
      update('typography.clubPanelBig', 64);
      update('typography.clubRouteName', 22);
      update('typography.clubMeetingDay', 36);
    }
  }, "\u21BA Ruah Original"), /*#__PURE__*/React.createElement("button", {
    className: "abtn ghost",
    onClick: () => {
      update('typography.heroMax', 280);
      update('typography.aboutTitleMax', 140);
      update('typography.servicesTitleMax', 140);
      update('typography.productsTitleMax', 140);
      update('typography.cuadrosTitleMax', 170);
      update('typography.iglesiasTitleMax', 140);
      update('typography.protocolTitleMax', 170);
      update('typography.testimonialsTitleMax', 140);
      update('typography.ctaMax', 200);
      update('typography.wordmarkMax', 340);
      update('typography.manifestoMax', 110);
    }
  }, "\u2191 Editorial XL"), /*#__PURE__*/React.createElement("button", {
    className: "abtn ghost",
    onClick: () => {
      update('typography.heroMax', 180);
      update('typography.aboutTitleMax', 96);
      update('typography.servicesTitleMax', 96);
      update('typography.productsTitleMax', 96);
      update('typography.cuadrosTitleMax', 110);
      update('typography.iglesiasTitleMax', 96);
      update('typography.protocolTitleMax', 110);
      update('typography.testimonialsTitleMax', 96);
      update('typography.ctaMax', 130);
      update('typography.wordmarkMax', 220);
      update('typography.manifestoMax', 72);
    }
  }, "\u2193 Compacto"))));
}

// ----- View: Manifesto -----
function ViewManifesto({
  content,
  store
}) {
  const {
    update,
    updateList
  } = store;
  const segs = content.manifesto.text;
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(SectionTokens, {
    groupName: "Manifiesto",
    content: content,
    store: store
  }), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card__head"
  }, /*#__PURE__*/React.createElement("h3", null, "Manifiesto (texto grande)"), /*#__PURE__*/React.createElement("span", {
    className: "meta"
  }, "A\u2212 / A+ controla el tama\xF1o")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement(EditText, {
    label: "Tama\xF1o del manifiesto",
    value: '—',
    onChange: () => {},
    sizePath: "manifestoMax",
    sizeMin: 40,
    sizeMax: 180,
    sizeStep: 4,
    content: content,
    store: store,
    hint: "Aplica a todas las l\xEDneas del manifiesto"
  })), /*#__PURE__*/React.createElement("div", {
    className: "card__head",
    style: {
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "meta"
  }, "L\xEDneas individuales"), /*#__PURE__*/React.createElement("button", {
    className: "abtn sm",
    onClick: () => updateList('manifesto.text', l => [...l, {
      txt: 'Nueva frase',
      em: false,
      strike: false
    }])
  }, "+ L\xEDnea")), segs.map((seg, i) => /*#__PURE__*/React.createElement("div", {
    className: "prod-edit",
    key: i,
    style: {
      gridTemplateColumns: '40px 1fr auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--serif)',
      fontSize: 24
    }
  }, "#", i + 1), /*#__PURE__*/React.createElement("div", {
    className: "prod-edit__fields"
  }, /*#__PURE__*/React.createElement(Text, {
    label: "Texto",
    value: seg.txt,
    onChange: v => updateList('manifesto.text', l => l.map((s, j) => j === i ? {
      ...s,
      txt: v
    } : s))
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Toggle, {
    label: "It\xE1lica/\xC1mbar",
    value: seg.em,
    onChange: v => updateList('manifesto.text', l => l.map((s, j) => j === i ? {
      ...s,
      em: v
    } : s))
  }), /*#__PURE__*/React.createElement(Toggle, {
    label: "Tachado",
    value: seg.strike,
    onChange: v => updateList('manifesto.text', l => l.map((s, j) => j === i ? {
      ...s,
      strike: v
    } : s))
  }))), /*#__PURE__*/React.createElement("div", {
    className: "prod-edit__actions"
  }, /*#__PURE__*/React.createElement("button", {
    className: "abtn danger sm",
    onClick: () => updateList('manifesto.text', l => l.filter((_, j) => j !== i))
  }, "Eliminar"))))));
}

// ----- View: Testimonials -----
function ViewTestimonials({
  content,
  store
}) {
  const {
    update,
    updateList
  } = store;
  const t = content.testimonials;
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(SectionTokens, {
    groupName: "Testimonios",
    content: content,
    store: store
  }), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card__head"
  }, /*#__PURE__*/React.createElement("h3", null, "Cabecera"), /*#__PURE__*/React.createElement("span", {
    className: "meta"
  }, "A\u2212 / A+ controla el tama\xF1o")), /*#__PURE__*/React.createElement(Text, {
    label: "Eyebrow",
    value: t.eyebrow,
    onChange: v => update('testimonials.eyebrow', v)
  }), /*#__PURE__*/React.createElement("div", {
    className: "row"
  }, /*#__PURE__*/React.createElement(EditText, {
    label: "T\xEDtulo",
    value: t.title,
    onChange: v => update('testimonials.title', v),
    sizePath: "testimonialsTitleMax",
    sizeMin: 50,
    sizeMax: 220,
    sizeStep: 4,
    content: content,
    store: store
  }), /*#__PURE__*/React.createElement(EditText, {
    label: "Acento",
    value: t.titleEm,
    onChange: v => update('testimonials.titleEm', v),
    sizePath: "testimonialsTitleMax",
    sizeMin: 50,
    sizeMax: 220,
    sizeStep: 4,
    content: content,
    store: store
  })), /*#__PURE__*/React.createElement(Text, {
    label: "Subt\xEDtulo",
    value: t.sub,
    onChange: v => update('testimonials.sub', v),
    multiline: true
  })), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card__head"
  }, /*#__PURE__*/React.createElement("h3", null, "Testimonios"), /*#__PURE__*/React.createElement("button", {
    className: "abtn amber sm",
    onClick: () => updateList('testimonials.items', l => [...l, {
      id: 't' + Date.now(),
      quote: 'Nuevo testimonio…',
      name: 'NOMBRE',
      role: 'rol',
      initial: 'X',
      img: ''
    }])
  }, "+ Testimonio")), t.items.map((it, i) => /*#__PURE__*/React.createElement("div", {
    className: "testi-edit",
    key: it.id
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Text, {
    label: 'Cita #' + (i + 1),
    value: it.quote,
    onChange: v => updateList('testimonials.items', l => l.map(x => x.id === it.id ? {
      ...x,
      quote: v
    } : x)),
    multiline: true,
    rows: 3
  }), /*#__PURE__*/React.createElement("div", {
    className: "row-3"
  }, /*#__PURE__*/React.createElement(Text, {
    label: "Nombre",
    value: it.name,
    onChange: v => updateList('testimonials.items', l => l.map(x => x.id === it.id ? {
      ...x,
      name: v
    } : x))
  }), /*#__PURE__*/React.createElement(Text, {
    label: "Rol / Iglesia",
    value: it.role,
    onChange: v => updateList('testimonials.items', l => l.map(x => x.id === it.id ? {
      ...x,
      role: v
    } : x))
  }), /*#__PURE__*/React.createElement(Text, {
    label: "Inicial avatar",
    value: it.initial,
    onChange: v => updateList('testimonials.items', l => l.map(x => x.id === it.id ? {
      ...x,
      initial: v.slice(0, 1).toUpperCase()
    } : x))
  }), /*#__PURE__*/React.createElement(ImgPicker, {
    label: "Foto (reemplaza la inicial)",
    ratio: "1/1",
    value: it.img || '',
    onChange: v => updateList('testimonials.items', l => l.map(x => x.id === it.id ? {
      ...x,
      img: v
    } : x))
  }))), /*#__PURE__*/React.createElement("div", {
    className: "prod-edit__actions"
  }, /*#__PURE__*/React.createElement("button", {
    className: "abtn ghost sm",
    disabled: i === 0,
    onClick: () => updateList('testimonials.items', l => {
      const a = [...l];
      [a[i - 1], a[i]] = [a[i], a[i - 1]];
      return a;
    })
  }, "\u2191"), /*#__PURE__*/React.createElement("button", {
    className: "abtn ghost sm",
    disabled: i === t.items.length - 1,
    onClick: () => updateList('testimonials.items', l => {
      const a = [...l];
      [a[i + 1], a[i]] = [a[i], a[i + 1]];
      return a;
    })
  }, "\u2193"), /*#__PURE__*/React.createElement("button", {
    className: "abtn danger sm",
    onClick: () => updateList('testimonials.items', l => l.filter(x => x.id !== it.id))
  }, "Eliminar"))))));
}

// ----- View: CTA -----
function ViewCTA({
  content,
  store
}) {
  const {
    update
  } = store;
  const c = content.cta;
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(SectionTokens, {
    groupName: "CTA Final",
    content: content,
    store: store
  }), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card__head"
  }, /*#__PURE__*/React.createElement("h3", null, "Bloque CTA final"), /*#__PURE__*/React.createElement("span", {
    className: "meta"
  }, "A\u2212 / A+ controla el tama\xF1o")), /*#__PURE__*/React.createElement("div", {
    className: "row-3"
  }, /*#__PURE__*/React.createElement(EditText, {
    label: "T\xEDtulo",
    value: c.title,
    onChange: v => update('cta.title', v),
    sizePath: "ctaMax",
    sizeMin: 60,
    sizeMax: 260,
    sizeStep: 4,
    content: content,
    store: store
  }), /*#__PURE__*/React.createElement(EditText, {
    label: "Acento (\xE1mbar)",
    value: c.titleEm,
    onChange: v => update('cta.titleEm', v),
    sizePath: "ctaMax",
    sizeMin: 60,
    sizeMax: 260,
    sizeStep: 4,
    content: content,
    store: store
  }), /*#__PURE__*/React.createElement(EditText, {
    label: "Texto final",
    value: c.titleAfter,
    onChange: v => update('cta.titleAfter', v),
    sizePath: "ctaMax",
    sizeMin: 60,
    sizeMax: 260,
    sizeStep: 4,
    content: content,
    store: store
  })), /*#__PURE__*/React.createElement(Text, {
    label: "Cuerpo",
    value: c.body,
    onChange: v => update('cta.body', v),
    multiline: true
  }), /*#__PURE__*/React.createElement("div", {
    className: "row"
  }, /*#__PURE__*/React.createElement(Text, {
    label: "CTA 1 \u2014 texto",
    value: c.primaryCta.label,
    onChange: v => update('cta.primaryCta.label', v)
  }), /*#__PURE__*/React.createElement(Text, {
    label: "CTA 1 \u2014 enlace",
    value: c.primaryCta.href,
    onChange: v => update('cta.primaryCta.href', v)
  }), /*#__PURE__*/React.createElement(Text, {
    label: "CTA 2 \u2014 texto",
    value: c.secondaryCta.label,
    onChange: v => update('cta.secondaryCta.label', v)
  }), /*#__PURE__*/React.createElement(Text, {
    label: "CTA 2 \u2014 enlace",
    value: c.secondaryCta.href,
    onChange: v => update('cta.secondaryCta.href', v)
  }))));
}

// ----- View: Footer -----
function ViewFooter({
  content,
  store
}) {
  const {
    update,
    updateList
  } = store;
  const f = content.footer;
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(SectionTokens, {
    groupName: "Footer",
    content: content,
    store: store
  }), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card__head"
  }, /*#__PURE__*/React.createElement("h3", null, "Wordmark y descripci\xF3n")), /*#__PURE__*/React.createElement("div", {
    className: "row"
  }, /*#__PURE__*/React.createElement(Text, {
    label: "Wordmark \u2014 parte 1",
    value: f.wordmark,
    onChange: v => update('footer.wordmark', v)
  }), /*#__PURE__*/React.createElement(Text, {
    label: "Wordmark \u2014 parte 2 (acceso secreto al Club)",
    value: f.wordmarkSecret,
    onChange: v => update('footer.wordmarkSecret', v),
    hint: "Click abre el Club"
  })), /*#__PURE__*/React.createElement(Text, {
    label: "Descripci\xF3n",
    value: f.about,
    onChange: v => update('footer.about', v),
    multiline: true
  }), /*#__PURE__*/React.createElement("div", {
    className: "row"
  }, /*#__PURE__*/React.createElement(Text, {
    label: "L\xEDnea inferior izquierda",
    value: f.bottomLeft,
    onChange: v => update('footer.bottomLeft', v)
  }), /*#__PURE__*/React.createElement(Text, {
    label: "L\xEDnea inferior derecha",
    value: f.bottomRight,
    onChange: v => update('footer.bottomRight', v)
  }))), f.cols.map((col, ci) => /*#__PURE__*/React.createElement("div", {
    className: "card",
    key: col.id
  }, /*#__PURE__*/React.createElement("div", {
    className: "card__head"
  }, /*#__PURE__*/React.createElement("h3", null, "Columna \u2014 ", col.title), /*#__PURE__*/React.createElement("button", {
    className: "abtn sm",
    onClick: () => updateList('footer.cols', l => l.map(c => c.id === col.id ? {
      ...c,
      items: [...c.items, {
        id: 'i' + Date.now(),
        label: 'Nuevo',
        href: '#'
      }]
    } : c))
  }, "+ Item")), /*#__PURE__*/React.createElement(Text, {
    label: "T\xEDtulo columna",
    value: col.title,
    onChange: v => updateList('footer.cols', l => l.map(c => c.id === col.id ? {
      ...c,
      title: v
    } : c))
  }), col.items.map(it => /*#__PURE__*/React.createElement("div", {
    className: "row",
    key: it.id,
    style: {
      gridTemplateColumns: '1fr 1fr auto',
      alignItems: 'end'
    }
  }, /*#__PURE__*/React.createElement(Text, {
    label: "Etiqueta",
    value: it.label,
    onChange: v => updateList('footer.cols', l => l.map(c => c.id === col.id ? {
      ...c,
      items: c.items.map(x => x.id === it.id ? {
        ...x,
        label: v
      } : x)
    } : c))
  }), /*#__PURE__*/React.createElement(Text, {
    label: "Enlace",
    value: it.href,
    onChange: v => updateList('footer.cols', l => l.map(c => c.id === col.id ? {
      ...c,
      items: c.items.map(x => x.id === it.id ? {
        ...x,
        href: v
      } : x)
    } : c))
  }), /*#__PURE__*/React.createElement("button", {
    className: "abtn danger sm",
    style: {
      marginBottom: 14
    },
    onClick: () => updateList('footer.cols', l => l.map(c => c.id === col.id ? {
      ...c,
      items: c.items.filter(x => x.id !== it.id)
    } : c))
  }, "\xD7"))))));
}

// ----- View: Navigation -----
function ViewNav({
  content,
  store
}) {
  const {
    update,
    updateList
  } = store;
  const n = content.nav;
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(SectionTokens, {
    groupName: "Nav (men\xFA superior)",
    content: content,
    store: store
  }), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card__head"
  }, /*#__PURE__*/React.createElement("h3", null, "Enlaces del men\xFA"), /*#__PURE__*/React.createElement("button", {
    className: "abtn sm",
    onClick: () => updateList('nav.links', l => [...l, {
      id: 'l' + Date.now(),
      label: 'Nuevo',
      href: '#'
    }])
  }, "+ Link")), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--mono)',
      fontSize: 12,
      color: 'var(--gray)',
      marginBottom: 14,
      lineHeight: 1.5
    }
  }, "Marca ", /*#__PURE__*/React.createElement("strong", null, "\"Dropdown\""), " en un enlace para que despliegue las subcategor\xEDas de Productos."), n.links.map((l, i) => /*#__PURE__*/React.createElement("div", {
    className: "prod-edit",
    key: l.id,
    style: {
      gridTemplateColumns: '1fr auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "prod-edit__fields"
  }, /*#__PURE__*/React.createElement("div", {
    className: "row"
  }, /*#__PURE__*/React.createElement(Text, {
    label: "Etiqueta",
    value: l.label,
    onChange: v => updateList('nav.links', list => list.map(x => x.id === l.id ? {
      ...x,
      label: v
    } : x))
  }), /*#__PURE__*/React.createElement(Text, {
    label: "Enlace (#ancla)",
    value: l.href,
    onChange: v => updateList('nav.links', list => list.map(x => x.id === l.id ? {
      ...x,
      href: v
    } : x))
  })), /*#__PURE__*/React.createElement(Toggle, {
    label: "Mostrar subcategor\xEDas de Productos como dropdown",
    value: !!l.dropdown,
    onChange: v => updateList('nav.links', list => list.map(x => x.id === l.id ? {
      ...x,
      dropdown: v
    } : x))
  })), /*#__PURE__*/React.createElement("div", {
    className: "prod-edit__actions"
  }, /*#__PURE__*/React.createElement("button", {
    className: "abtn ghost sm",
    disabled: i === 0,
    onClick: () => updateList('nav.links', list => {
      const a = [...list];
      [a[i - 1], a[i]] = [a[i], a[i - 1]];
      return a;
    })
  }, "\u2191"), /*#__PURE__*/React.createElement("button", {
    className: "abtn ghost sm",
    disabled: i === n.links.length - 1,
    onClick: () => updateList('nav.links', list => {
      const a = [...list];
      [a[i + 1], a[i]] = [a[i], a[i + 1]];
      return a;
    })
  }, "\u2193"), /*#__PURE__*/React.createElement("button", {
    className: "abtn danger sm",
    onClick: () => updateList('nav.links', list => list.filter(x => x.id !== l.id))
  }, "\xD7"))))), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card__head"
  }, /*#__PURE__*/React.createElement("h3", null, "CTA del nav")), /*#__PURE__*/React.createElement("div", {
    className: "row"
  }, /*#__PURE__*/React.createElement(Text, {
    label: "Texto",
    value: n.cta.label,
    onChange: v => update('nav.cta.label', v)
  }), /*#__PURE__*/React.createElement(Text, {
    label: "Enlace",
    value: n.cta.href,
    onChange: v => update('nav.cta.href', v)
  }))));
}

// ----- Club: Panel de Miembros y Anotados -----
function ClubMembersPanel() {
  const [members, setMembers] = React.useState(null);
  const [signups, setSignups] = React.useState(null);
  const [log, setLog] = React.useState(null);
  const [tab, setTab] = React.useState('members');
  const [form, setForm] = React.useState({
    name: '',
    email: '',
    notes: ''
  });
  const [newMember, setNewMember] = React.useState(null);
  const [busy, setBusy] = React.useState(false);
  const SVC = sessionStorage.getItem('ruah-admin-session') || '';
  function load() {
    fetch('' + window.RUAH_API + '/api/club/members', {
      headers: {
        'x-admin-key': SVC
      }
    }).then(r => r.json()).then(setMembers).catch(() => setMembers([]));
    fetch('' + window.RUAH_API + '/api/club/signups', {
      headers: {
        'x-admin-key': SVC
      }
    }).then(r => r.json()).then(setSignups).catch(() => setSignups([]));
    fetch('' + window.RUAH_API + '/api/club/access-log', {
      headers: {
        'x-admin-key': SVC
      }
    }).then(r => r.json()).then(setLog).catch(() => setLog([]));
  }
  React.useEffect(load, []);
  function createMember(e) {
    e.preventDefault();
    setBusy(true);
    fetch('' + window.RUAH_API + '/api/club/members', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': SVC
      },
      body: JSON.stringify(form)
    }).then(r => r.json()).then(d => {
      setBusy(false);
      if (d.error) {
        alert('Error: ' + JSON.stringify(d.error));
        return;
      }
      setNewMember(d);
      setForm({
        name: '',
        email: '',
        notes: ''
      });
      load();
    }).catch(() => setBusy(false));
  }
  function deactivate(email) {
    if (!confirm('¿Desactivar acceso de ' + email + '?')) return;
    fetch('' + window.RUAH_API + '/api/club/members/' + encodeURIComponent(email), {
      method: 'DELETE',
      headers: {
        'x-admin-key': SVC
      }
    }).then(load);
  }
  function fmt(d) {
    return d ? new Date(d).toLocaleString('es-CL', {
      dateStyle: 'short',
      timeStyle: 'short'
    }) : '—';
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "card",
    style: {
      marginTop: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "card__head"
  }, /*#__PURE__*/React.createElement("h3", null, "Club \xB7 Miembros y Accesos"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6
    }
  }, ['members', 'signups', 'log'].map(t => /*#__PURE__*/React.createElement("button", {
    key: t,
    className: 'abtn sm' + (tab === t ? ' amber' : ''),
    onClick: () => setTab(t)
  }, t === 'members' ? 'Miembros' : t === 'signups' ? 'Anotados' : 'Log')), /*#__PURE__*/React.createElement("button", {
    className: "abtn sm",
    onClick: load
  }, "\u21BA"))), tab === 'members' && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("form", {
    onSubmit: createMember,
    style: {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap',
      padding: '0 0 16px'
    }
  }, /*#__PURE__*/React.createElement("input", {
    className: "inp",
    placeholder: "Nombre",
    value: form.name,
    onChange: e => setForm(f => ({
      ...f,
      name: e.target.value
    })),
    required: true,
    style: {
      flex: 1,
      minWidth: 120
    }
  }), /*#__PURE__*/React.createElement("input", {
    className: "inp",
    placeholder: "Email",
    value: form.email,
    onChange: e => setForm(f => ({
      ...f,
      email: e.target.value
    })),
    required: true,
    type: "email",
    style: {
      flex: 1,
      minWidth: 160
    }
  }), /*#__PURE__*/React.createElement("input", {
    className: "inp",
    placeholder: "Notas",
    value: form.notes,
    onChange: e => setForm(f => ({
      ...f,
      notes: e.target.value
    })),
    style: {
      flex: 1,
      minWidth: 120
    }
  }), /*#__PURE__*/React.createElement("button", {
    className: "abtn amber",
    type: "submit",
    disabled: busy
  }, busy ? '...' : '+ Crear')), newMember && /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#0a2a0a',
      border: '1px solid #2a6a2a',
      padding: '10px 14px',
      marginBottom: 12,
      fontSize: 13,
      fontFamily: 'monospace'
    }
  }, "\u2705 Miembro creado \u2014 env\xEDa estas credenciales por correo:", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("strong", null, "Email:"), " ", newMember.email, " \xA0|\xA0", /*#__PURE__*/React.createElement("strong", null, "Contrase\xF1a inicial:"), " ", /*#__PURE__*/React.createElement("code", {
    style: {
      color: '#eca10c'
    }
  }, newMember.password), /*#__PURE__*/React.createElement("button", {
    className: "abtn sm",
    style: {
      marginLeft: 12
    },
    onClick: () => setNewMember(null)
  }, "\xD7")), !members ? /*#__PURE__*/React.createElement("p", {
    style: {
      color: '#888',
      padding: 8
    }
  }, "Cargando\u2026") : /*#__PURE__*/React.createElement("table", {
    style: {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: 12
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
    style: {
      borderBottom: '1px solid #333',
      color: '#888'
    }
  }, /*#__PURE__*/React.createElement("th", {
    style: {
      textAlign: 'left',
      padding: '4px 8px'
    }
  }, "Nombre"), /*#__PURE__*/React.createElement("th", {
    style: {
      textAlign: 'left',
      padding: '4px 8px'
    }
  }, "Email"), /*#__PURE__*/React.createElement("th", {
    style: {
      textAlign: 'left',
      padding: '4px 8px'
    }
  }, "\xDAltimo acceso"), /*#__PURE__*/React.createElement("th", {
    style: {
      textAlign: 'left',
      padding: '4px 8px'
    }
  }, "Estado"), /*#__PURE__*/React.createElement("th", null))), /*#__PURE__*/React.createElement("tbody", null, members.map(m => /*#__PURE__*/React.createElement("tr", {
    key: m.id,
    style: {
      borderBottom: '1px solid #1a1a1a'
    }
  }, /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '6px 8px'
    }
  }, m.name), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '6px 8px',
      color: '#eca10c'
    }
  }, m.email), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '6px 8px',
      color: '#888'
    }
  }, fmt(m.last_login_at)), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '6px 8px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: m.is_active ? '#4caf50' : '#f44336'
    }
  }, m.is_active ? '● Activo' : '○ Inactivo'), m.must_change_password && /*#__PURE__*/React.createElement("span", {
    style: {
      color: '#888',
      marginLeft: 8,
      fontSize: 11
    }
  }, "clave pendiente")), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '6px 8px'
    }
  }, m.is_active && /*#__PURE__*/React.createElement("button", {
    className: "abtn danger sm",
    onClick: () => deactivate(m.email)
  }, "Desactivar"))))))), tab === 'signups' && /*#__PURE__*/React.createElement("div", null, !signups ? /*#__PURE__*/React.createElement("p", {
    style: {
      color: '#888',
      padding: 8
    }
  }, "Cargando\u2026") : signups.length === 0 ? /*#__PURE__*/React.createElement("p", {
    style: {
      color: '#888',
      padding: 8
    }
  }, "Sin anotaciones a\xFAn.") : /*#__PURE__*/React.createElement("table", {
    style: {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: 12
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
    style: {
      borderBottom: '1px solid #333',
      color: '#888'
    }
  }, /*#__PURE__*/React.createElement("th", {
    style: {
      textAlign: 'left',
      padding: '4px 8px'
    }
  }, "Email"), /*#__PURE__*/React.createElement("th", {
    style: {
      textAlign: 'left',
      padding: '4px 8px'
    }
  }, "Ruta"), /*#__PURE__*/React.createElement("th", {
    style: {
      textAlign: 'left',
      padding: '4px 8px'
    }
  }, "Fecha"))), /*#__PURE__*/React.createElement("tbody", null, signups.map(s => /*#__PURE__*/React.createElement("tr", {
    key: s.id,
    style: {
      borderBottom: '1px solid #1a1a1a'
    }
  }, /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '6px 8px',
      color: '#eca10c'
    }
  }, s.email), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '6px 8px'
    }
  }, s.route_name), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '6px 8px',
      color: '#888'
    }
  }, fmt(s.created_at))))))), tab === 'log' && /*#__PURE__*/React.createElement("div", null, !log ? /*#__PURE__*/React.createElement("p", {
    style: {
      color: '#888',
      padding: 8
    }
  }, "Cargando\u2026") : log.length === 0 ? /*#__PURE__*/React.createElement("p", {
    style: {
      color: '#888',
      padding: 8
    }
  }, "Sin accesos registrados.") : /*#__PURE__*/React.createElement("table", {
    style: {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: 12
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
    style: {
      borderBottom: '1px solid #333',
      color: '#888'
    }
  }, /*#__PURE__*/React.createElement("th", {
    style: {
      textAlign: 'left',
      padding: '4px 8px'
    }
  }, "Email"), /*#__PURE__*/React.createElement("th", {
    style: {
      textAlign: 'left',
      padding: '4px 8px'
    }
  }, "Acci\xF3n"), /*#__PURE__*/React.createElement("th", {
    style: {
      textAlign: 'left',
      padding: '4px 8px'
    }
  }, "Fecha"))), /*#__PURE__*/React.createElement("tbody", null, log.map(l => /*#__PURE__*/React.createElement("tr", {
    key: l.id,
    style: {
      borderBottom: '1px solid #1a1a1a'
    }
  }, /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '6px 8px',
      color: '#eca10c'
    }
  }, l.email), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '6px 8px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: l.action === 'login_ok' ? '#4caf50' : l.action === 'login_fail' ? '#f44336' : '#eca10c'
    }
  }, l.action)), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '6px 8px',
      color: '#888'
    }
  }, fmt(l.created_at))))))));
}

// ----- View: Club -----
function ViewClub({
  content,
  store
}) {
  const {
    update,
    updateList
  } = store;
  const c = content.club;
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(ClubMembersPanel, null), /*#__PURE__*/React.createElement(SectionTokens, {
    groupName: "Club Secreto",
    content: content,
    store: store
  }), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card__head"
  }, /*#__PURE__*/React.createElement("h3", null, "Cabecera del Club")), /*#__PURE__*/React.createElement(Text, {
    label: "Eyebrow",
    value: c.heroEyebrow,
    onChange: v => update('club.heroEyebrow', v)
  }), /*#__PURE__*/React.createElement("div", {
    className: "row"
  }, /*#__PURE__*/React.createElement(Text, {
    label: "T\xEDtulo",
    value: c.title,
    onChange: v => update('club.title', v)
  }), /*#__PURE__*/React.createElement(Text, {
    label: "Acento",
    value: c.titleEm,
    onChange: v => update('club.titleEm', v)
  })), /*#__PURE__*/React.createElement(Text, {
    label: "Frase introductoria",
    value: c.frase,
    onChange: v => update('club.frase', v),
    multiline: true,
    rows: 4
  })), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card__head"
  }, /*#__PURE__*/React.createElement("h3", null, "Paneles destacados (3)"), /*#__PURE__*/React.createElement("button", {
    className: "abtn sm",
    onClick: () => updateList('club.panels', l => [...l, {
      id: 'cp' + Date.now(),
      ttl: 'NUEVO',
      big: '0',
      desc: ''
    }])
  }, "+ Panel")), c.panels.map((p, i) => /*#__PURE__*/React.createElement("div", {
    className: "prod-edit",
    key: p.id,
    style: {
      gridTemplateColumns: '60px 1fr auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--serif)',
      fontSize: 28
    }
  }, "#", i + 1), /*#__PURE__*/React.createElement("div", {
    className: "prod-edit__fields"
  }, /*#__PURE__*/React.createElement("div", {
    className: "row-3"
  }, /*#__PURE__*/React.createElement(Text, {
    label: "Etiqueta",
    value: p.ttl,
    onChange: v => updateList('club.panels', l => l.map(x => x.id === p.id ? {
      ...x,
      ttl: v
    } : x))
  }), /*#__PURE__*/React.createElement(Text, {
    label: "N\xFAmero grande",
    value: p.big,
    onChange: v => updateList('club.panels', l => l.map(x => x.id === p.id ? {
      ...x,
      big: v
    } : x))
  }), /*#__PURE__*/React.createElement(Text, {
    label: "Descripci\xF3n",
    value: p.desc,
    onChange: v => updateList('club.panels', l => l.map(x => x.id === p.id ? {
      ...x,
      desc: v
    } : x))
  }))), /*#__PURE__*/React.createElement("div", {
    className: "prod-edit__actions"
  }, /*#__PURE__*/React.createElement("button", {
    className: "abtn danger sm",
    onClick: () => updateList('club.panels', l => l.filter(x => x.id !== p.id))
  }, "\xD7"))))), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card__head"
  }, /*#__PURE__*/React.createElement("h3", null, "Rutas \u2014 ", c.routes.length), /*#__PURE__*/React.createElement("button", {
    className: "abtn amber sm",
    onClick: () => updateList('club.routes', l => [...l, {
      id: 'r' + Date.now(),
      name: 'Nueva ruta',
      date: '00 MES · 00:00',
      meta: '',
      joined: false
    }])
  }, "+ Ruta")), c.routes.map(r => /*#__PURE__*/React.createElement("div", {
    className: "prod-edit",
    key: r.id,
    style: {
      gridTemplateColumns: '1fr auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "prod-edit__fields"
  }, /*#__PURE__*/React.createElement("div", {
    className: "row"
  }, /*#__PURE__*/React.createElement(Text, {
    label: "Nombre",
    value: r.name,
    onChange: v => updateList('club.routes', l => l.map(x => x.id === r.id ? {
      ...x,
      name: v
    } : x))
  }), /*#__PURE__*/React.createElement(Text, {
    label: "Fecha \xB7 Hora",
    value: r.date,
    onChange: v => updateList('club.routes', l => l.map(x => x.id === r.id ? {
      ...x,
      date: v
    } : x))
  })), /*#__PURE__*/React.createElement(Text, {
    label: "Detalle (punto, cupos, prendas)",
    value: r.meta,
    onChange: v => updateList('club.routes', l => l.map(x => x.id === r.id ? {
      ...x,
      meta: v
    } : x)),
    multiline: true,
    rows: 2
  })), /*#__PURE__*/React.createElement("div", {
    className: "prod-edit__actions"
  }, /*#__PURE__*/React.createElement("button", {
    className: "abtn danger sm",
    onClick: () => updateList('club.routes', l => l.filter(x => x.id !== r.id))
  }, "\xD7"))))), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card__head"
  }, /*#__PURE__*/React.createElement("h3", null, "Reuniones \u2014 ", c.meetings.length), /*#__PURE__*/React.createElement("button", {
    className: "abtn amber sm",
    onClick: () => updateList('club.meetings', l => [...l, {
      id: 'm' + Date.now(),
      day: '00',
      mon: 'MES',
      name: 'Nueva reunión',
      det: ''
    }])
  }, "+ Reuni\xF3n")), c.meetings.map(m => /*#__PURE__*/React.createElement("div", {
    className: "prod-edit",
    key: m.id,
    style: {
      gridTemplateColumns: '1fr auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "prod-edit__fields"
  }, /*#__PURE__*/React.createElement("div", {
    className: "row-3"
  }, /*#__PURE__*/React.createElement(Text, {
    label: "D\xEDa",
    value: m.day,
    onChange: v => updateList('club.meetings', l => l.map(x => x.id === m.id ? {
      ...x,
      day: v
    } : x))
  }), /*#__PURE__*/React.createElement(Text, {
    label: "Mes",
    value: m.mon,
    onChange: v => updateList('club.meetings', l => l.map(x => x.id === m.id ? {
      ...x,
      mon: v
    } : x))
  }), /*#__PURE__*/React.createElement(Text, {
    label: "Nombre",
    value: m.name,
    onChange: v => updateList('club.meetings', l => l.map(x => x.id === m.id ? {
      ...x,
      name: v
    } : x))
  })), /*#__PURE__*/React.createElement(Text, {
    label: "Detalle",
    value: m.det,
    onChange: v => updateList('club.meetings', l => l.map(x => x.id === m.id ? {
      ...x,
      det: v
    } : x))
  })), /*#__PURE__*/React.createElement("div", {
    className: "prod-edit__actions"
  }, /*#__PURE__*/React.createElement("button", {
    className: "abtn danger sm",
    onClick: () => updateList('club.meetings', l => l.filter(x => x.id !== m.id))
  }, "\xD7"))))), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card__head"
  }, /*#__PURE__*/React.createElement("h3", null, "Feed inicial \u2014 ", c.feed.length), /*#__PURE__*/React.createElement("button", {
    className: "abtn sm",
    onClick: () => updateList('club.feed', l => [...l, {
      id: 'f' + Date.now(),
      when: 'HOY · ANÓNIMO',
      what: ''
    }])
  }, "+ Mensaje")), c.feed.map(f => /*#__PURE__*/React.createElement("div", {
    className: "prod-edit",
    key: f.id,
    style: {
      gridTemplateColumns: '1fr auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "prod-edit__fields"
  }, /*#__PURE__*/React.createElement(Text, {
    label: "Cu\xE1ndo \xB7 Qui\xE9n",
    value: f.when,
    onChange: v => updateList('club.feed', l => l.map(x => x.id === f.id ? {
      ...x,
      when: v
    } : x))
  }), /*#__PURE__*/React.createElement(Text, {
    label: "Mensaje",
    value: f.what,
    onChange: v => updateList('club.feed', l => l.map(x => x.id === f.id ? {
      ...x,
      what: v
    } : x)),
    multiline: true,
    rows: 2
  })), /*#__PURE__*/React.createElement("div", {
    className: "prod-edit__actions"
  }, /*#__PURE__*/React.createElement("button", {
    className: "abtn danger sm",
    onClick: () => updateList('club.feed', l => l.filter(x => x.id !== f.id))
  }, "\xD7"))))), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card__head"
  }, /*#__PURE__*/React.createElement("h3", null, "Registro Fotogr\xE1fico \u2014 ", (c.photos || []).length, " fotos"), /*#__PURE__*/React.createElement("button", {
    className: "abtn amber sm",
    onClick: () => updateList('club.photos', l => [...(l || []), {
      id: 'ph' + Date.now(),
      img: '',
      caption: 'Nueva foto'
    }])
  }, "+ Foto")), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--mono)',
      fontSize: 12,
      color: 'var(--gray)',
      marginBottom: 16,
      lineHeight: 1.55
    }
  }, "Estas fotos aparecen en la pesta\xF1a D / REGISTRO FOTOGR\xC1FICO del Club, con fondo negro y letras en \xE1mbar. S\xF3lo ven los miembros autenticados."), /*#__PURE__*/React.createElement("div", {
    className: "row"
  }, /*#__PURE__*/React.createElement(Text, {
    label: "T\xEDtulo de secci\xF3n",
    value: c.photoRegistryTitle || '',
    onChange: v => update('club.photoRegistryTitle', v)
  }), /*#__PURE__*/React.createElement(Text, {
    label: "Subt\xEDtulo",
    value: c.photoRegistrySubtitle || '',
    onChange: v => update('club.photoRegistrySubtitle', v)
  })), /*#__PURE__*/React.createElement("div", {
    className: "divider"
  }, "Fotos \u2014 ", (c.photos || []).length), (c.photos || []).map((p, i) => /*#__PURE__*/React.createElement("div", {
    className: "prod-edit",
    key: p.id,
    style: {
      gridTemplateColumns: '120px 1fr auto'
    }
  }, /*#__PURE__*/React.createElement("label", {
    className: "prod-edit__media",
    style: {
      aspectRatio: '1 / 1',
      height: 'auto'
    }
  }, p.img ? /*#__PURE__*/React.createElement("img", {
    src: p.img,
    alt: p.caption
  }) : /*#__PURE__*/React.createElement("span", null, "Subir", /*#__PURE__*/React.createElement("br", null), "foto"), /*#__PURE__*/React.createElement("input", {
    type: "file",
    accept: "image/*",
    onChange: async e => {
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      const url = await uploadToCloudinary(f);
      updateList('club.photos', l => l.map(x => x.id === p.id ? {
        ...x,
        img: url
      } : x));
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "prod-edit__fields"
  }, /*#__PURE__*/React.createElement(Text, {
    label: "Caption / descripci\xF3n",
    value: p.caption,
    onChange: v => updateList('club.photos', l => l.map(x => x.id === p.id ? {
      ...x,
      caption: v
    } : x))
  }), p.img && /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "abtn danger sm",
    style: {
      alignSelf: 'flex-start',
      marginTop: 6
    },
    onClick: () => updateList('club.photos', l => l.map(x => x.id === p.id ? {
      ...x,
      img: ''
    } : x))
  }, "Quitar foto")), /*#__PURE__*/React.createElement("div", {
    className: "prod-edit__actions"
  }, /*#__PURE__*/React.createElement("button", {
    className: "abtn ghost sm",
    disabled: i === 0,
    onClick: () => updateList('club.photos', l => {
      const a = [...l];
      [a[i - 1], a[i]] = [a[i], a[i - 1]];
      return a;
    })
  }, "\u2191"), /*#__PURE__*/React.createElement("button", {
    className: "abtn ghost sm",
    disabled: i === (c.photos || []).length - 1,
    onClick: () => updateList('club.photos', l => {
      const a = [...l];
      [a[i + 1], a[i]] = [a[i], a[i + 1]];
      return a;
    })
  }, "\u2193"), /*#__PURE__*/React.createElement("button", {
    className: "abtn danger sm",
    onClick: () => updateList('club.photos', l => l.filter(x => x.id !== p.id))
  }, "\xD7"))))));
}
function ChangePasswordField({
  label,
  hint,
  onSave
}) {
  const [open, setOpen] = React.useState(false);
  const [val, setVal] = React.useState('');
  const [done, setDone] = React.useState(false);
  async function save(e) {
    e && e.preventDefault();
    if (!val.trim()) return;
    await onSave(val.trim());
    setVal('');
    setOpen(false);
    setDone(true);
    setTimeout(() => setDone(false), 3000);
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      letterSpacing: '0.08em',
      color: 'var(--gray-soft)',
      marginBottom: 6
    }
  }, label), hint && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--gray-soft)',
      marginBottom: 8,
      opacity: 0.7
    }
  }, hint), !open ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--mono)',
      letterSpacing: '0.1em',
      fontSize: 14
    }
  }, "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "abtn sm ghost",
    onClick: () => setOpen(true)
  }, "Cambiar"), done && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: 'var(--amber)'
    }
  }, "\u2713 Guardado")) : /*#__PURE__*/React.createElement("form", {
    onSubmit: save,
    style: {
      display: 'flex',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("input", {
    className: "input",
    type: "password",
    value: val,
    onChange: e => setVal(e.target.value),
    placeholder: "Nueva contrase\xF1a",
    autoFocus: true,
    style: {
      flex: 1,
      fontSize: 13
    }
  }), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: "abtn sm amber"
  }, "Guardar"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "abtn sm ghost",
    onClick: () => {
      setOpen(false);
      setVal('');
    }
  }, "Cancelar")));
}

// ----- View: Settings -----
function ViewSettings({
  store
}) {
  const fileRef = React.useRef(null);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card__head"
  }, /*#__PURE__*/React.createElement("h3", null, "Respaldos")), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--mono)',
      fontSize: 12,
      color: 'var(--gray)',
      marginBottom: 16,
      lineHeight: 1.55
    }
  }, "Exporta todo el contenido como archivo JSON para respaldarlo o transferirlo. Importa un archivo para restaurar."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "abtn amber",
    onClick: store.exportJSON
  }, "\u2193 Exportar JSON"), /*#__PURE__*/React.createElement("button", {
    className: "abtn ghost",
    onClick: () => fileRef.current?.click()
  }, "\u2191 Importar JSON"), /*#__PURE__*/React.createElement("input", {
    ref: fileRef,
    type: "file",
    accept: "application/json",
    style: {
      display: 'none'
    },
    onChange: e => e.target.files[0] && store.importJSON(e.target.files[0])
  }))), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card__head"
  }, /*#__PURE__*/React.createElement("h3", null, "Zona peligrosa")), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--mono)',
      fontSize: 12,
      color: 'var(--gray)',
      marginBottom: 16
    }
  }, "Esto borra todos los cambios y restaura el contenido original."), /*#__PURE__*/React.createElement("button", {
    className: "abtn danger",
    onClick: store.reset
  }, "\u2A2F Restablecer todo")));
}

// ----- View: Cuadros -----
function ViewCuadros({
  content,
  store
}) {
  const {
    update,
    updateList
  } = store;
  const c = content.cuadros;
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(SectionTokens, {
    groupName: "Cuadros",
    content: content,
    store: store
  }), /*#__PURE__*/React.createElement("div", {
    className: "card",
    style: {
      borderColor: c.comingSoon ? 'var(--amber)' : undefined
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "card__head"
  }, /*#__PURE__*/React.createElement("h3", null, "\uD83D\uDEA7 Modo \"Pr\xF3ximamente\""), /*#__PURE__*/React.createElement("span", {
    className: "meta"
  }, c.comingSoon ? 'ACTIVO — el video cubre la sección' : 'desactivado — sección visible normal')), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      padding: '4px 0 8px'
    }
  }, /*#__PURE__*/React.createElement(Toggle, {
    label: c.comingSoon ? 'Desactivar (lanzar cuadros)' : 'Activar pantalla "Próximamente"',
    value: !!c.comingSoon,
    onChange: v => update('cuadros.comingSoon', v)
  })), /*#__PURE__*/React.createElement(Text, {
    label: "Video m\xF3vil (vertical, Cloudinary)",
    value: c.comingSoonVideo || '',
    onChange: v => update('cuadros.comingSoonVideo', v),
    hint: "Se muestra en pantallas < 768px"
  }), /*#__PURE__*/React.createElement(Text, {
    label: "Video desktop (horizontal, Cloudinary)",
    value: c.comingSoonVideoDesktop || '',
    onChange: v => update('cuadros.comingSoonVideoDesktop', v),
    hint: "Se muestra en pantallas \u2265 768px"
  })), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card__head"
  }, /*#__PURE__*/React.createElement("h3", null, "Cabecera de secci\xF3n")), /*#__PURE__*/React.createElement("div", {
    className: "row-3"
  }, /*#__PURE__*/React.createElement(Text, {
    label: "\xCDndice (ej. \xA705 / 06)",
    value: c.headerIndex,
    onChange: v => update('cuadros.headerIndex', v)
  }), /*#__PURE__*/React.createElement(Text, {
    label: "T\xEDtulo",
    value: c.headerTitle,
    onChange: v => update('cuadros.headerTitle', v)
  }), /*#__PURE__*/React.createElement(Text, {
    label: "Derecha",
    value: c.headerRight,
    onChange: v => update('cuadros.headerRight', v)
  }))), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card__head"
  }, /*#__PURE__*/React.createElement("h3", null, "Hero \xB7 Cuadros"), /*#__PURE__*/React.createElement("span", {
    className: "meta"
  }, "A\u2212 / A+ controla el tama\xF1o del t\xEDtulo grande")), /*#__PURE__*/React.createElement("div", {
    className: "row-3"
  }, /*#__PURE__*/React.createElement(EditText, {
    label: "T\xEDtulo \u2014 l\xEDnea 1",
    value: c.title1,
    onChange: v => update('cuadros.title1', v),
    sizePath: "cuadrosTitleMax",
    sizeMin: 60,
    sizeMax: 240,
    sizeStep: 4,
    content: content,
    store: store
  }), /*#__PURE__*/React.createElement(EditText, {
    label: "T\xEDtulo \u2014 l\xEDnea 2",
    value: c.title2,
    onChange: v => update('cuadros.title2', v),
    sizePath: "cuadrosTitleMax",
    sizeMin: 60,
    sizeMax: 240,
    sizeStep: 4,
    content: content,
    store: store
  }), /*#__PURE__*/React.createElement(EditText, {
    label: "T\xEDtulo \u2014 l\xEDnea 3",
    value: c.title3,
    onChange: v => update('cuadros.title3', v),
    sizePath: "cuadrosTitleMax",
    sizeMin: 60,
    sizeMax: 240,
    sizeStep: 4,
    content: content,
    store: store
  })), /*#__PURE__*/React.createElement(Text, {
    label: "Bajada / Lede",
    value: c.lede,
    onChange: v => update('cuadros.lede', v),
    multiline: true,
    rows: 4
  })), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card__head"
  }, /*#__PURE__*/React.createElement("h3", null, "Estilos (cards) \u2014 ", c.styles.length), /*#__PURE__*/React.createElement("button", {
    className: "abtn sm",
    onClick: () => updateList('cuadros.styles', l => [...l, {
      id: 'cs' + Date.now(),
      tag: 'NUEVO',
      desc: 'DESCRIPCIÓN'
    }])
  }, "+ Estilo")), c.styles.map((s, i) => /*#__PURE__*/React.createElement("div", {
    className: "prod-edit",
    key: s.id,
    style: {
      gridTemplateColumns: '120px 1fr auto'
    }
  }, /*#__PURE__*/React.createElement("label", {
    className: "prod-edit__media",
    style: {
      aspectRatio: '1 / 1',
      height: 'auto'
    }
  }, s.img ? /*#__PURE__*/React.createElement("img", {
    src: s.img,
    alt: s.tag
  }) : /*#__PURE__*/React.createElement("span", null, "Subir", /*#__PURE__*/React.createElement("br", null), "foto"), /*#__PURE__*/React.createElement("input", {
    type: "file",
    accept: "image/*",
    onChange: async e => {
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      const url = await uploadToCloudinary(f);
      updateList('cuadros.styles', l => l.map(x => x.id === s.id ? {
        ...x,
        img: url
      } : x));
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "prod-edit__fields"
  }, /*#__PURE__*/React.createElement("div", {
    className: "row"
  }, /*#__PURE__*/React.createElement(Text, {
    label: "Tag",
    value: s.tag,
    onChange: v => updateList('cuadros.styles', l => l.map(x => x.id === s.id ? {
      ...x,
      tag: v
    } : x))
  }), /*#__PURE__*/React.createElement(Text, {
    label: "Descripci\xF3n corta",
    value: s.desc,
    onChange: v => updateList('cuadros.styles', l => l.map(x => x.id === s.id ? {
      ...x,
      desc: v
    } : x))
  })), s.img && /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "abtn danger sm",
    style: {
      alignSelf: 'flex-start'
    },
    onClick: () => updateList('cuadros.styles', l => l.map(x => x.id === s.id ? {
      ...x,
      img: ''
    } : x))
  }, "Quitar foto")), /*#__PURE__*/React.createElement("div", {
    className: "prod-edit__actions"
  }, /*#__PURE__*/React.createElement("button", {
    className: "abtn ghost sm",
    disabled: i === 0,
    onClick: () => updateList('cuadros.styles', l => {
      const a = [...l];
      [a[i - 1], a[i]] = [a[i], a[i - 1]];
      return a;
    })
  }, "\u2191"), /*#__PURE__*/React.createElement("button", {
    className: "abtn ghost sm",
    disabled: i === c.styles.length - 1,
    onClick: () => updateList('cuadros.styles', l => {
      const a = [...l];
      [a[i + 1], a[i]] = [a[i], a[i + 1]];
      return a;
    })
  }, "\u2193"), /*#__PURE__*/React.createElement("button", {
    className: "abtn danger sm",
    onClick: () => updateList('cuadros.styles', l => l.filter(x => x.id !== s.id))
  }, "\xD7"))))), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card__head"
  }, /*#__PURE__*/React.createElement("h3", null, "Brief \xB7 cabecera")), /*#__PURE__*/React.createElement(Text, {
    label: "Eyebrow",
    value: c.briefEyebrow,
    onChange: v => update('cuadros.briefEyebrow', v)
  }), /*#__PURE__*/React.createElement(Text, {
    label: "T\xEDtulo",
    value: c.briefTitle,
    onChange: v => update('cuadros.briefTitle', v)
  }), /*#__PURE__*/React.createElement(Text, {
    label: "Subt\xEDtulo",
    value: c.briefSub,
    onChange: v => update('cuadros.briefSub', v),
    multiline: true,
    rows: 3
  })), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card__head"
  }, /*#__PURE__*/React.createElement("h3", null, "Pasos del brief \u2014 ", c.steps.length)), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--mono)',
      fontSize: 12,
      color: 'var(--gray)',
      marginBottom: 12,
      lineHeight: 1.55
    }
  }, "Los 4 pasos (01-EXPLORAR, 02-ESTILO, 03-FORMATO, 04-ENVIAR) controlan los tabs. Edita su nombre y n\xFAmero aqu\xED."), c.steps.map(s => /*#__PURE__*/React.createElement("div", {
    className: "prod-edit",
    key: s.id,
    style: {
      gridTemplateColumns: '1fr auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "prod-edit__fields"
  }, /*#__PURE__*/React.createElement("div", {
    className: "row"
  }, /*#__PURE__*/React.createElement(Text, {
    label: "N\xFAmero",
    value: s.num,
    onChange: v => updateList('cuadros.steps', l => l.map(x => x.id === s.id ? {
      ...x,
      num: v
    } : x))
  }), /*#__PURE__*/React.createElement(Text, {
    label: "Nombre",
    value: s.name,
    onChange: v => updateList('cuadros.steps', l => l.map(x => x.id === s.id ? {
      ...x,
      name: v
    } : x))
  }))), /*#__PURE__*/React.createElement("div", {
    className: "prod-edit__actions"
  }, /*#__PURE__*/React.createElement("button", {
    className: "abtn danger sm",
    onClick: () => updateList('cuadros.steps', l => l.filter(x => x.id !== s.id))
  }, "\xD7"))))), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card__head"
  }, /*#__PURE__*/React.createElement("h3", null, "Paso 01 \xB7 EXPLORAR")), /*#__PURE__*/React.createElement(Text, {
    label: "Texto introductorio",
    value: c.step1Body,
    onChange: v => update('cuadros.step1Body', v),
    multiline: true,
    rows: 3
  }), /*#__PURE__*/React.createElement("div", {
    className: "divider"
  }, "Referencias (3-6)"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'flex-end',
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "abtn amber sm",
    onClick: () => updateList('cuadros.refs', l => [...l, {
      id: 'cr' + Date.now(),
      code: 'REF ' + String(l.length + 1).padStart(2, '0'),
      name: 'NUEVO',
      meta: ''
    }])
  }, "+ Referencia")), c.refs.map((r, i) => /*#__PURE__*/React.createElement("div", {
    className: "prod-edit",
    key: r.id,
    style: {
      gridTemplateColumns: '120px 1fr auto'
    }
  }, /*#__PURE__*/React.createElement("label", {
    className: "prod-edit__media",
    style: {
      aspectRatio: '4 / 3',
      height: 'auto'
    }
  }, r.img ? /*#__PURE__*/React.createElement("img", {
    src: r.img,
    alt: r.name
  }) : /*#__PURE__*/React.createElement("span", null, "Subir", /*#__PURE__*/React.createElement("br", null), "foto"), /*#__PURE__*/React.createElement("input", {
    type: "file",
    accept: "image/*",
    onChange: async e => {
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      const url = await uploadToCloudinary(f);
      updateList('cuadros.refs', l => l.map(x => x.id === r.id ? {
        ...x,
        img: url
      } : x));
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "prod-edit__fields"
  }, /*#__PURE__*/React.createElement("div", {
    className: "row-3"
  }, /*#__PURE__*/React.createElement(Text, {
    label: "C\xF3digo",
    value: r.code,
    onChange: v => updateList('cuadros.refs', l => l.map(x => x.id === r.id ? {
      ...x,
      code: v
    } : x))
  }), /*#__PURE__*/React.createElement(Text, {
    label: "Nombre",
    value: r.name,
    onChange: v => updateList('cuadros.refs', l => l.map(x => x.id === r.id ? {
      ...x,
      name: v
    } : x))
  }), /*#__PURE__*/React.createElement(Text, {
    label: "Meta",
    value: r.meta,
    onChange: v => updateList('cuadros.refs', l => l.map(x => x.id === r.id ? {
      ...x,
      meta: v
    } : x))
  })), r.img && /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "abtn danger sm",
    style: {
      alignSelf: 'flex-start',
      marginTop: 6
    },
    onClick: () => updateList('cuadros.refs', l => l.map(x => x.id === r.id ? {
      ...x,
      img: ''
    } : x))
  }, "Quitar foto")), /*#__PURE__*/React.createElement("div", {
    className: "prod-edit__actions"
  }, /*#__PURE__*/React.createElement("button", {
    className: "abtn ghost sm",
    disabled: i === 0,
    onClick: () => updateList('cuadros.refs', l => {
      const a = [...l];
      [a[i - 1], a[i]] = [a[i], a[i - 1]];
      return a;
    })
  }, "\u2191"), /*#__PURE__*/React.createElement("button", {
    className: "abtn ghost sm",
    disabled: i === c.refs.length - 1,
    onClick: () => updateList('cuadros.refs', l => {
      const a = [...l];
      [a[i + 1], a[i]] = [a[i], a[i + 1]];
      return a;
    })
  }, "\u2193"), /*#__PURE__*/React.createElement("button", {
    className: "abtn danger sm",
    onClick: () => updateList('cuadros.refs', l => l.filter(x => x.id !== r.id))
  }, "\xD7"))))), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card__head"
  }, /*#__PURE__*/React.createElement("h3", null, "Paso 02 \xB7 ESTILO \u2014 ", (c.estilos || []).length, " opciones"), /*#__PURE__*/React.createElement("button", {
    className: "abtn sm",
    onClick: () => updateList('cuadros.estilos', l => [...(l || []), {
      id: 'ce' + Date.now(),
      name: 'NUEVO ESTILO'
    }])
  }, "+ Opci\xF3n")), (c.estilos || []).map((e, i) => /*#__PURE__*/React.createElement("div", {
    className: "prod-edit",
    key: e.id,
    style: {
      gridTemplateColumns: '1fr auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "prod-edit__fields"
  }, /*#__PURE__*/React.createElement(Text, {
    label: 'Estilo ' + (i + 1),
    value: e.name,
    onChange: v => updateList('cuadros.estilos', l => l.map(x => x.id === e.id ? {
      ...x,
      name: v
    } : x))
  })), /*#__PURE__*/React.createElement("div", {
    className: "prod-edit__actions"
  }, /*#__PURE__*/React.createElement("button", {
    className: "abtn ghost sm",
    disabled: i === 0,
    onClick: () => updateList('cuadros.estilos', l => {
      const a = [...l];
      [a[i - 1], a[i]] = [a[i], a[i - 1]];
      return a;
    })
  }, "\u2191"), /*#__PURE__*/React.createElement("button", {
    className: "abtn ghost sm",
    disabled: i === (c.estilos || []).length - 1,
    onClick: () => updateList('cuadros.estilos', l => {
      const a = [...l];
      [a[i + 1], a[i]] = [a[i], a[i + 1]];
      return a;
    })
  }, "\u2193"), /*#__PURE__*/React.createElement("button", {
    className: "abtn danger sm",
    onClick: () => updateList('cuadros.estilos', l => l.filter(x => x.id !== e.id))
  }, "\xD7"))))), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card__head"
  }, /*#__PURE__*/React.createElement("h3", null, "Paso 03 \xB7 FORMATO \u2014 ", (c.formatos || []).length, " opciones"), /*#__PURE__*/React.createElement("button", {
    className: "abtn amber sm",
    onClick: () => updateList('cuadros.formatos', l => [...(l || []), {
      id: 'cf' + Date.now(),
      size: 'NUEVO',
      price: '$0'
    }])
  }, "+ Formato")), (c.formatos || []).map((f, i) => /*#__PURE__*/React.createElement("div", {
    className: "prod-edit",
    key: f.id,
    style: {
      gridTemplateColumns: '1fr auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "prod-edit__fields"
  }, /*#__PURE__*/React.createElement("div", {
    className: "row"
  }, /*#__PURE__*/React.createElement(Text, {
    label: "Tama\xF1o",
    value: f.size,
    onChange: v => updateList('cuadros.formatos', l => l.map(x => x.id === f.id ? {
      ...x,
      size: v
    } : x))
  }), /*#__PURE__*/React.createElement(Text, {
    label: "Precio",
    value: f.price,
    onChange: v => updateList('cuadros.formatos', l => l.map(x => x.id === f.id ? {
      ...x,
      price: v
    } : x))
  }))), /*#__PURE__*/React.createElement("div", {
    className: "prod-edit__actions"
  }, /*#__PURE__*/React.createElement("button", {
    className: "abtn ghost sm",
    disabled: i === 0,
    onClick: () => updateList('cuadros.formatos', l => {
      const a = [...l];
      [a[i - 1], a[i]] = [a[i], a[i - 1]];
      return a;
    })
  }, "\u2191"), /*#__PURE__*/React.createElement("button", {
    className: "abtn ghost sm",
    disabled: i === (c.formatos || []).length - 1,
    onClick: () => updateList('cuadros.formatos', l => {
      const a = [...l];
      [a[i + 1], a[i]] = [a[i], a[i + 1]];
      return a;
    })
  }, "\u2193"), /*#__PURE__*/React.createElement("button", {
    className: "abtn danger sm",
    onClick: () => updateList('cuadros.formatos', l => l.filter(x => x.id !== f.id))
  }, "\xD7"))))), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card__head"
  }, /*#__PURE__*/React.createElement("h3", null, "Paso 04 \xB7 ENVIAR \u2014 ", (c.sendFields || []).length, " campos"), /*#__PURE__*/React.createElement("button", {
    className: "abtn sm",
    onClick: () => updateList('cuadros.sendFields', l => [...(l || []), {
      id: 'cf' + Date.now(),
      label: 'NUEVO',
      placeholder: '',
      type: 'text'
    }])
  }, "+ Campo")), /*#__PURE__*/React.createElement(Text, {
    label: "Texto del bot\xF3n",
    value: c.sendSubmit,
    onChange: v => update('cuadros.sendSubmit', v)
  }), /*#__PURE__*/React.createElement("div", {
    className: "divider"
  }, "Campos del formulario"), (c.sendFields || []).map((f, i) => /*#__PURE__*/React.createElement("div", {
    className: "prod-edit",
    key: f.id,
    style: {
      gridTemplateColumns: '1fr auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "prod-edit__fields"
  }, /*#__PURE__*/React.createElement("div", {
    className: "row-3"
  }, /*#__PURE__*/React.createElement(Text, {
    label: "Etiqueta",
    value: f.label,
    onChange: v => updateList('cuadros.sendFields', l => l.map(x => x.id === f.id ? {
      ...x,
      label: v
    } : x))
  }), /*#__PURE__*/React.createElement(Text, {
    label: "Placeholder",
    value: f.placeholder,
    onChange: v => updateList('cuadros.sendFields', l => l.map(x => x.id === f.id ? {
      ...x,
      placeholder: v
    } : x))
  }), /*#__PURE__*/React.createElement(Field, {
    label: "Tipo"
  }, /*#__PURE__*/React.createElement("select", {
    className: "select",
    value: f.type || 'text',
    onChange: e => updateList('cuadros.sendFields', l => l.map(x => x.id === f.id ? {
      ...x,
      type: e.target.value
    } : x))
  }, /*#__PURE__*/React.createElement("option", {
    value: "text"
  }, "Texto"), /*#__PURE__*/React.createElement("option", {
    value: "email"
  }, "Email"), /*#__PURE__*/React.createElement("option", {
    value: "textarea"
  }, "Textarea"))))), /*#__PURE__*/React.createElement("div", {
    className: "prod-edit__actions"
  }, /*#__PURE__*/React.createElement("button", {
    className: "abtn ghost sm",
    disabled: i === 0,
    onClick: () => updateList('cuadros.sendFields', l => {
      const a = [...l];
      [a[i - 1], a[i]] = [a[i], a[i - 1]];
      return a;
    })
  }, "\u2191"), /*#__PURE__*/React.createElement("button", {
    className: "abtn ghost sm",
    disabled: i === (c.sendFields || []).length - 1,
    onClick: () => updateList('cuadros.sendFields', l => {
      const a = [...l];
      [a[i + 1], a[i]] = [a[i], a[i + 1]];
      return a;
    })
  }, "\u2193"), /*#__PURE__*/React.createElement("button", {
    className: "abtn danger sm",
    onClick: () => updateList('cuadros.sendFields', l => l.filter(x => x.id !== f.id))
  }, "\xD7"))))), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card__head"
  }, /*#__PURE__*/React.createElement("h3", null, "Cat\xE1logo en Venta \u2014 ", (c.products || []).length, " cuadros"), /*#__PURE__*/React.createElement("button", {
    className: "abtn amber sm",
    onClick: () => updateList('cuadros.products', l => [...(l || []), {
      id: 'cq' + Date.now(),
      name: 'Nuevo cuadro',
      style: 'MINIMAL',
      price: '59.990',
      size: '30×40 cm',
      tag: 'STOCK',
      img: '',
      gallery: [],
      description: '',
      details: []
    }])
  }, "+ Cuadro")), /*#__PURE__*/React.createElement("div", {
    className: "divider"
  }, "Cabecera del cat\xE1logo"), /*#__PURE__*/React.createElement("div", {
    className: "row-3"
  }, /*#__PURE__*/React.createElement(Text, {
    label: "Eyebrow",
    value: c.productsEyebrow || '',
    onChange: v => update('cuadros.productsEyebrow', v)
  }), /*#__PURE__*/React.createElement(Text, {
    label: "T\xEDtulo",
    value: c.productsTitle || '',
    onChange: v => update('cuadros.productsTitle', v)
  }), /*#__PURE__*/React.createElement(Text, {
    label: "T\xEDtulo (acento \xE1mbar)",
    value: c.productsTitleEm || '',
    onChange: v => update('cuadros.productsTitleEm', v)
  })), /*#__PURE__*/React.createElement(Text, {
    label: "Subt\xEDtulo",
    value: c.productsSub || '',
    onChange: v => update('cuadros.productsSub', v),
    multiline: true,
    rows: 2
  }), /*#__PURE__*/React.createElement("div", {
    className: "divider"
  }, "Piezas"), (c.products || []).map((it, i) => /*#__PURE__*/React.createElement("div", {
    key: it.id,
    style: {
      border: '1px solid var(--border)',
      borderRadius: 8,
      padding: 16,
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "prod-edit",
    style: {
      gridTemplateColumns: '120px 1fr auto'
    }
  }, /*#__PURE__*/React.createElement("label", {
    className: "prod-edit__media",
    style: {
      aspectRatio: '3/4',
      height: 'auto'
    }
  }, it.img ? /*#__PURE__*/React.createElement("img", {
    src: it.img,
    alt: it.name
  }) : /*#__PURE__*/React.createElement("span", null, "Subir", /*#__PURE__*/React.createElement("br", null), "foto"), /*#__PURE__*/React.createElement("input", {
    type: "file",
    accept: "image/*",
    onChange: async e => {
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      const url = await uploadToCloudinary(f);
      updateList('cuadros.products', l => l.map(x => x.id === it.id ? {
        ...x,
        img: url
      } : x));
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "prod-edit__fields"
  }, /*#__PURE__*/React.createElement("div", {
    className: "row"
  }, /*#__PURE__*/React.createElement(Text, {
    label: "Nombre",
    value: it.name,
    onChange: v => updateList('cuadros.products', l => l.map(x => x.id === it.id ? {
      ...x,
      name: v
    } : x))
  }), /*#__PURE__*/React.createElement(Text, {
    label: "Estilo",
    value: it.style,
    onChange: v => updateList('cuadros.products', l => l.map(x => x.id === it.id ? {
      ...x,
      style: v
    } : x))
  })), /*#__PURE__*/React.createElement("div", {
    className: "row-3"
  }, /*#__PURE__*/React.createElement(Text, {
    label: "Precio (CLP)",
    value: it.price,
    onChange: v => updateList('cuadros.products', l => l.map(x => x.id === it.id ? {
      ...x,
      price: v
    } : x))
  }), /*#__PURE__*/React.createElement(Text, {
    label: "Tama\xF1o",
    value: it.size,
    onChange: v => updateList('cuadros.products', l => l.map(x => x.id === it.id ? {
      ...x,
      size: v
    } : x))
  }), /*#__PURE__*/React.createElement(Text, {
    label: "Tag (STOCK/ENCARGO)",
    value: it.tag,
    onChange: v => updateList('cuadros.products', l => l.map(x => x.id === it.id ? {
      ...x,
      tag: v
    } : x))
  })), /*#__PURE__*/React.createElement(Text, {
    label: "Descripci\xF3n",
    value: it.description || '',
    onChange: v => updateList('cuadros.products', l => l.map(x => x.id === it.id ? {
      ...x,
      description: v
    } : x)),
    multiline: true,
    rows: 2
  }), it.img && /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "abtn danger sm",
    style: {
      alignSelf: 'flex-start',
      marginTop: 4
    },
    onClick: () => updateList('cuadros.products', l => l.map(x => x.id === it.id ? {
      ...x,
      img: ''
    } : x))
  }, "Quitar foto principal")), /*#__PURE__*/React.createElement("div", {
    className: "prod-edit__actions"
  }, /*#__PURE__*/React.createElement("button", {
    className: "abtn ghost sm",
    disabled: i === 0,
    onClick: () => updateList('cuadros.products', l => {
      const a = [...l];
      [a[i - 1], a[i]] = [a[i], a[i - 1]];
      return a;
    })
  }, "\u2191"), /*#__PURE__*/React.createElement("button", {
    className: "abtn ghost sm",
    disabled: i === (c.products || []).length - 1,
    onClick: () => updateList('cuadros.products', l => {
      const a = [...l];
      [a[i + 1], a[i]] = [a[i], a[i + 1]];
      return a;
    })
  }, "\u2193"), /*#__PURE__*/React.createElement("button", {
    className: "abtn danger sm",
    onClick: () => {
      if (confirm('¿Eliminar cuadro?')) updateList('cuadros.products', l => l.filter(x => x.id !== it.id));
    }
  }, "\xD7"))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--mono)',
      fontSize: 12,
      color: 'var(--gray)',
      letterSpacing: '0.12em'
    }
  }, "GALER\xCDA EXTRA \u2014 ", (it.gallery || []).length, " foto", (it.gallery || []).length !== 1 ? 's' : ''), /*#__PURE__*/React.createElement("label", {
    className: "abtn ghost sm",
    style: {
      position: 'relative',
      cursor: 'pointer'
    }
  }, "+ A\xF1adir foto", /*#__PURE__*/React.createElement("input", {
    type: "file",
    accept: "image/*",
    multiple: true,
    style: {
      position: 'absolute',
      inset: 0,
      opacity: 0,
      cursor: 'pointer'
    },
    onChange: async e => {
      const files = Array.from(e.target.files || []);
      for (const f of files) {
        const url = await uploadToCloudinary(f);
        updateList('cuadros.products', l => l.map(x => x.id === it.id ? {
          ...x,
          gallery: [...(x.gallery || []), url]
        } : x));
      }
    }
  }))), (it.gallery || []).length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap'
    }
  }, (it.gallery || []).map((url, gi) => /*#__PURE__*/React.createElement("div", {
    key: gi,
    style: {
      position: 'relative',
      width: 64,
      height: 64
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: url,
    alt: "",
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      borderRadius: 4,
      border: '1px solid var(--border)'
    }
  }), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => updateList('cuadros.products', l => l.map(x => x.id === it.id ? {
      ...x,
      gallery: x.gallery.filter((_, idx) => idx !== gi)
    } : x)),
    style: {
      position: 'absolute',
      top: -6,
      right: -6,
      width: 18,
      height: 18,
      borderRadius: '50%',
      background: '#e53e3e',
      color: '#fff',
      border: 'none',
      cursor: 'pointer',
      fontSize: 12,
      lineHeight: '18px',
      textAlign: 'center',
      padding: 0
    }
  }, "\xD7")))))))));
}

// ----- View: Iglesias -----
function ViewIglesias({
  content,
  store
}) {
  const {
    update,
    updateList
  } = store;
  const ig = content.iglesias;
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(SectionTokens, {
    groupName: "Iglesias",
    content: content,
    store: store
  }), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card__head"
  }, /*#__PURE__*/React.createElement("h3", null, "Cabecera de secci\xF3n")), /*#__PURE__*/React.createElement("div", {
    className: "row-3"
  }, /*#__PURE__*/React.createElement(Text, {
    label: "\xCDndice (ej. \xA704 / 06)",
    value: ig.headerIndex,
    onChange: v => update('iglesias.headerIndex', v)
  }), /*#__PURE__*/React.createElement(Text, {
    label: "T\xEDtulo",
    value: ig.headerTitle,
    onChange: v => update('iglesias.headerTitle', v)
  }), /*#__PURE__*/React.createElement(Text, {
    label: "Derecha",
    value: ig.headerRight,
    onChange: v => update('iglesias.headerRight', v)
  }))), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card__head"
  }, /*#__PURE__*/React.createElement("h3", null, "Hero \xB7 Iglesias"), /*#__PURE__*/React.createElement("span", {
    className: "meta"
  }, "A\u2212 / A+ controla el tama\xF1o del t\xEDtulo")), /*#__PURE__*/React.createElement("div", {
    className: "row"
  }, /*#__PURE__*/React.createElement(EditText, {
    label: "T\xEDtulo \u2014 l\xEDnea 1",
    value: ig.title1,
    onChange: v => update('iglesias.title1', v),
    sizePath: "iglesiasTitleMax",
    sizeMin: 50,
    sizeMax: 220,
    sizeStep: 4,
    content: content,
    store: store
  }), /*#__PURE__*/React.createElement(EditText, {
    label: "T\xEDtulo \u2014 l\xEDnea 2",
    value: ig.title2,
    onChange: v => update('iglesias.title2', v),
    sizePath: "iglesiasTitleMax",
    sizeMin: 50,
    sizeMax: 220,
    sizeStep: 4,
    content: content,
    store: store
  })), /*#__PURE__*/React.createElement(Text, {
    label: "Bajada / Lede",
    value: ig.lede,
    onChange: v => update('iglesias.lede', v),
    multiline: true,
    rows: 4
  })), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card__head"
  }, /*#__PURE__*/React.createElement("h3", null, "Pieza destacada")), /*#__PURE__*/React.createElement("div", {
    className: "row"
  }, /*#__PURE__*/React.createElement(Text, {
    label: "Tag",
    value: ig.featureTag,
    onChange: v => update('iglesias.featureTag', v),
    hint: "PORTAFOLIO"
  }), /*#__PURE__*/React.createElement(Text, {
    label: "Nombre del proyecto",
    value: ig.featureName,
    onChange: v => update('iglesias.featureName', v)
  })), /*#__PURE__*/React.createElement(ImgPicker, {
    label: "Foto del proyecto destacado",
    value: ig.featureImg,
    onChange: v => update('iglesias.featureImg', v),
    hint: "Recomendado 16:10. Reemplaza la card pattern por una foto real.",
    ratio: "16 / 10"
  })), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card__head"
  }, /*#__PURE__*/React.createElement("h3", null, "Servicios \u2014 ", ig.services.length), /*#__PURE__*/React.createElement("button", {
    className: "abtn sm",
    onClick: () => updateList('iglesias.services', l => [...l, {
      id: 'is' + Date.now(),
      num: String(l.length + 1).padStart(2, '0'),
      name: 'Nuevo',
      desc: ''
    }])
  }, "+ Servicio")), ig.services.map((s, i) => /*#__PURE__*/React.createElement("div", {
    className: "prod-edit",
    key: s.id,
    style: {
      gridTemplateColumns: '60px 1fr auto'
    }
  }, /*#__PURE__*/React.createElement(Text, {
    label: "N\xFAm.",
    value: s.num,
    onChange: v => updateList('iglesias.services', l => l.map(x => x.id === s.id ? {
      ...x,
      num: v
    } : x))
  }), /*#__PURE__*/React.createElement("div", {
    className: "prod-edit__fields"
  }, /*#__PURE__*/React.createElement(Text, {
    label: "Nombre",
    value: s.name,
    onChange: v => updateList('iglesias.services', l => l.map(x => x.id === s.id ? {
      ...x,
      name: v
    } : x))
  }), /*#__PURE__*/React.createElement(Text, {
    label: "Descripci\xF3n",
    value: s.desc,
    onChange: v => updateList('iglesias.services', l => l.map(x => x.id === s.id ? {
      ...x,
      desc: v
    } : x)),
    multiline: true,
    rows: 2
  })), /*#__PURE__*/React.createElement("div", {
    className: "prod-edit__actions"
  }, /*#__PURE__*/React.createElement("button", {
    className: "abtn ghost sm",
    disabled: i === 0,
    onClick: () => updateList('iglesias.services', l => {
      const a = [...l];
      [a[i - 1], a[i]] = [a[i], a[i - 1]];
      return a;
    })
  }, "\u2191"), /*#__PURE__*/React.createElement("button", {
    className: "abtn ghost sm",
    disabled: i === ig.services.length - 1,
    onClick: () => updateList('iglesias.services', l => {
      const a = [...l];
      [a[i + 1], a[i]] = [a[i], a[i + 1]];
      return a;
    })
  }, "\u2193"), /*#__PURE__*/React.createElement("button", {
    className: "abtn danger sm",
    onClick: () => updateList('iglesias.services', l => l.filter(x => x.id !== s.id))
  }, "\xD7"))))), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card__head"
  }, /*#__PURE__*/React.createElement("h3", null, "Portafolio \xB7 cabecera")), /*#__PURE__*/React.createElement("div", {
    className: "row-3"
  }, /*#__PURE__*/React.createElement(Text, {
    label: "\xCDndice (ej. \xA704.01 / 06)",
    value: ig.portfolioIndex,
    onChange: v => update('iglesias.portfolioIndex', v)
  }), /*#__PURE__*/React.createElement(Text, {
    label: "T\xEDtulo",
    value: ig.portfolioTitle,
    onChange: v => update('iglesias.portfolioTitle', v)
  }), /*#__PURE__*/React.createElement(Text, {
    label: "Derecha",
    value: ig.portfolioRight,
    onChange: v => update('iglesias.portfolioRight', v),
    hint: "Ej: ALGUNOS TRABAJOS"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card__head"
  }, /*#__PURE__*/React.createElement("h3", null, "Proyectos \u2014 ", ig.projects.length), /*#__PURE__*/React.createElement("button", {
    className: "abtn amber sm",
    onClick: () => updateList('iglesias.projects', l => [...l, {
      id: 'ip' + Date.now(),
      code: 'PROYECTO ' + String(l.length + 1).padStart(2, '0'),
      name: 'NUEVO',
      meta: '',
      img: '',
      gallery: []
    }])
  }, "+ Proyecto")), ig.projects.map((p, i) => /*#__PURE__*/React.createElement("div", {
    key: p.id,
    style: {
      border: '1px solid var(--border)',
      borderRadius: 8,
      padding: 16,
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "prod-edit",
    style: {
      gridTemplateColumns: '120px 1fr auto'
    }
  }, /*#__PURE__*/React.createElement("label", {
    className: "prod-edit__media",
    style: {
      aspectRatio: '4 / 3',
      height: 'auto'
    }
  }, p.img ? /*#__PURE__*/React.createElement("img", {
    src: p.img,
    alt: p.name
  }) : /*#__PURE__*/React.createElement("span", null, "Subir", /*#__PURE__*/React.createElement("br", null), "foto"), /*#__PURE__*/React.createElement("input", {
    type: "file",
    accept: "image/*",
    onChange: async e => {
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      const url = await uploadToCloudinary(f);
      updateList('iglesias.projects', l => l.map(x => x.id === p.id ? {
        ...x,
        img: url
      } : x));
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "prod-edit__fields"
  }, /*#__PURE__*/React.createElement("div", {
    className: "row-3"
  }, /*#__PURE__*/React.createElement(Text, {
    label: "C\xF3digo",
    value: p.code,
    onChange: v => updateList('iglesias.projects', l => l.map(x => x.id === p.id ? {
      ...x,
      code: v
    } : x))
  }), /*#__PURE__*/React.createElement(Text, {
    label: "Nombre",
    value: p.name,
    onChange: v => updateList('iglesias.projects', l => l.map(x => x.id === p.id ? {
      ...x,
      name: v
    } : x))
  }), /*#__PURE__*/React.createElement(Text, {
    label: "Meta",
    value: p.meta,
    onChange: v => updateList('iglesias.projects', l => l.map(x => x.id === p.id ? {
      ...x,
      meta: v
    } : x))
  })), p.img && /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "abtn danger sm",
    style: {
      alignSelf: 'flex-start',
      marginTop: 4
    },
    onClick: () => updateList('iglesias.projects', l => l.map(x => x.id === p.id ? {
      ...x,
      img: ''
    } : x))
  }, "Quitar foto portada")), /*#__PURE__*/React.createElement("div", {
    className: "prod-edit__actions"
  }, /*#__PURE__*/React.createElement("button", {
    className: "abtn ghost sm",
    disabled: i === 0,
    onClick: () => updateList('iglesias.projects', l => {
      const a = [...l];
      [a[i - 1], a[i]] = [a[i], a[i - 1]];
      return a;
    })
  }, "\u2191"), /*#__PURE__*/React.createElement("button", {
    className: "abtn ghost sm",
    disabled: i === ig.projects.length - 1,
    onClick: () => updateList('iglesias.projects', l => {
      const a = [...l];
      [a[i + 1], a[i]] = [a[i], a[i + 1]];
      return a;
    })
  }, "\u2193"), /*#__PURE__*/React.createElement("button", {
    className: "abtn danger sm",
    onClick: () => updateList('iglesias.projects', l => l.filter(x => x.id !== p.id))
  }, "\xD7"))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--mono)',
      fontSize: 12,
      color: 'var(--gray)',
      letterSpacing: '0.12em'
    }
  }, "GALER\xCDA DEL PROYECTO \u2014 ", (p.gallery || []).length, " foto", (p.gallery || []).length !== 1 ? 's' : '', " (aparece al hacer click)"), /*#__PURE__*/React.createElement("label", {
    className: "abtn ghost sm",
    style: {
      position: 'relative',
      cursor: 'pointer'
    }
  }, "+ A\xF1adir fotos", /*#__PURE__*/React.createElement("input", {
    type: "file",
    accept: "image/*",
    multiple: true,
    style: {
      position: 'absolute',
      inset: 0,
      opacity: 0,
      cursor: 'pointer'
    },
    onChange: async e => {
      const files = Array.from(e.target.files || []);
      for (const f of files) {
        const url = await uploadToCloudinary(f);
        updateList('iglesias.projects', l => l.map(x => x.id === p.id ? {
          ...x,
          gallery: [...(x.gallery || []), url]
        } : x));
      }
    }
  }))), (p.gallery || []).length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap'
    }
  }, (p.gallery || []).map((url, gi) => /*#__PURE__*/React.createElement("div", {
    key: gi,
    style: {
      position: 'relative',
      width: 72,
      height: 72
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: url,
    alt: "",
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      borderRadius: 4,
      border: '1px solid var(--border)'
    }
  }), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => updateList('iglesias.projects', l => l.map(x => x.id === p.id ? {
      ...x,
      gallery: x.gallery.filter((_, idx) => idx !== gi)
    } : x)),
    style: {
      position: 'absolute',
      top: -6,
      right: -6,
      width: 18,
      height: 18,
      borderRadius: '50%',
      background: '#e53e3e',
      color: '#fff',
      border: 'none',
      cursor: 'pointer',
      fontSize: 12,
      lineHeight: '18px',
      textAlign: 'center',
      padding: 0
    }
  }, "\xD7")))))))), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card__head"
  }, /*#__PURE__*/React.createElement("h3", null, "Formulario de cotizaci\xF3n")), /*#__PURE__*/React.createElement(Text, {
    label: "Eyebrow",
    value: ig.formEyebrow,
    onChange: v => update('iglesias.formEyebrow', v)
  }), /*#__PURE__*/React.createElement("div", {
    className: "row"
  }, /*#__PURE__*/React.createElement(Text, {
    label: "T\xEDtulo",
    value: ig.formTitle,
    onChange: v => update('iglesias.formTitle', v)
  }), /*#__PURE__*/React.createElement(Text, {
    label: "Bot\xF3n \u2014 texto",
    value: ig.formSubmit,
    onChange: v => update('iglesias.formSubmit', v)
  })), /*#__PURE__*/React.createElement(Text, {
    label: "Subt\xEDtulo",
    value: ig.formSub,
    onChange: v => update('iglesias.formSub', v),
    multiline: true,
    rows: 2
  }), /*#__PURE__*/React.createElement(Text, {
    label: "Opciones de evento (separar con coma)",
    value: (ig.eventOptions || []).join(', '),
    onChange: v => update('iglesias.eventOptions', v.split(',').map(s => s.trim()).filter(Boolean)),
    multiline: true,
    rows: 2,
    hint: "Aparecen en el dropdown EVENTO"
  })));
}

// ----- Token catalog: every editable text slot on the page -----
// Each entry: [label, sizePath (typography.*), colorKey (colors.*), defaultColor]
// sizePath or colorKey may be null when that dimension doesn't apply.
const TOKEN_GROUPS = [['Hero', [['Hero · Eyebrow', 'label', 'heroEyebrow', '#cfcabe'], ['Hero · Título línea 1', 'heroMax', 'heroTitle', '#f5f1e8'], ['Hero · Título línea 2', 'heroMax', 'heroTitle', '#f5f1e8'], ['Hero · Acento ámbar', 'heroMax', 'heroTitleEm', '#eca10c'], ['Hero · Bajada/Lede', 'lede', 'heroLede', '#f5f1e8']]], ['Quiénes Somos', [['Quiénes Somos · Título', 'aboutTitleMax', 'aboutTitle', '#f5f1e8'], ['Quiénes Somos · Acento ámbar', 'aboutTitleMax', 'aboutTitleEm', '#eca10c'], ['Quiénes Somos · Subtítulo', 'lede', 'aboutSub', '#f5f1e8'], ['Quiénes Somos · Cuerpo párrafos', 'bodyBase', 'aboutBody', '#f5f1e8'], ['Quiénes Somos · Eyebrow / Núm.', 'label', 'aboutEyebrow', '#f5f1e8'], ['Pilar · Núm.', 'label', 'pillarNum', '#eca10c'], ['Pilar · Título', 'pillarTitle', 'pillarTitle', '#f5f1e8'], ['Pilar · Descripción', 'bodyBase', 'pillarDesc', '#cfcabe'], ['Métrica · Número grande', 'statNum', 'metricNum', '#eca10c'], ['Métrica · Etiqueta', 'label', 'metricLbl', '#cfcabe']]], ['Protocolo 1×1', [['Protocolo · Título', 'protocolTitleMax', 'protocolTitle', '#f5f1e8'], ['Protocolo · Acento ámbar', 'protocolTitleMax', 'protocolTitleAmber', '#eca10c'], ['Protocolo · Encabezado sección', 'protocolSectionHd', 'protocolSectionHd', '#eca10c'], ['Protocolo · Cuerpo', 'bodyBase', 'protocolBody', '#cfcabe'], ['Protocolo · Ref. cita', 'label', 'protocolQuoteRef', '#b8b5ad'], ['Protocolo · Cita bíblica', 'protocolQuote', 'protocolQuoteText', '#f5f1e8'], ['Protocolo · Nombre flujo', 'protocolFlowName', 'protocolFlowName', '#eca10c'], ['Protocolo · Detalle flujo', 'protocolFlowDet', 'protocolFlowDet', '#a8a59c']]], ['Servicios', [['Servicios · Título', 'servicesTitleMax', 'servicesTitle', '#1a1a1a'], ['Servicios · Acento ámbar', 'servicesTitleMax', 'servicesTitleEm', '#eca10c'], ['Servicios · Núm. fila', 'servicesNum', 'servicesNum', '#6b6b62'], ['Servicios · Nombre', 'servicesName', 'servicesName', '#1a1a1a'], ['Servicios · Descripción', 'servicesDesc', 'servicesDesc', '#6b6b62']]], ['Productos', [['Productos · Título', 'productsTitleMax', 'productsTitle', '#f5f1e8'], ['Productos · Acento ámbar', 'productsTitleMax', 'productsTitleEm', '#eca10c'], ['Producto · Nombre', 'productTitle', 'productsName', '#f5f1e8'], ['Producto · Versículo', 'productsVerse', 'productsVerse', '#eca10c'], ['Producto · Precio', 'productsPrice', 'productsPrice', '#f5f1e8']]], ['Categorías', [['Categoría · Chip / filtro', 'catChip', 'navLink', '#f5f1e8']]], ['Cuadros', [['Cuadros · Título grande', 'cuadrosTitleMax', 'cuadrosTitle', '#1a1a1a'], ['Cuadros · Bajada', 'cuadrosLede', 'cuadrosLede', '#6b6b62'], ['Cuadros · Brief Título', 'cuadrosBriefTitle', 'cuadrosBriefTitle', '#1a1a1a'], ['Cuadros · Tag de estilo', 'cuadrosStyleTag', null, null], ['Cuadros · Núm. paso', 'cuadrosStepNum', null, null], ['Cuadros · Nombre ref.', 'cuadrosRefName', null, null], ['Cuadros · Núm. formato', 'cuadrosFormatNum', null, null]]], ['Iglesias', [['Iglesias · Título', 'iglesiasTitleMax', 'iglesiasTitle', '#f5f1e8'], ['Iglesias · Bajada', 'iglesiasLede', 'iglesiasLede', '#a8a59c'], ['Iglesias · Nombre servicio', 'iglesiasServiceName', null, null], ['Iglesias · Nombre proyecto', 'iglesiasProjectName', null, null], ['Iglesias · Título portafolio', 'iglesiasPortfolioTitle', null, null], ['Iglesias · Título formulario', 'iglesiasFormTitle', null, null], ['Iglesias · Nombre feature', 'iglesiasFeatureName', null, null]]], ['Evento (Ruah Evento)', [['Evento · Eyebrow', 'eventosEyebrow', 'eventosEyebrow', '#6b6b62'], ['Evento · Título', 'heroMax', 'eventosTitle', '#1a1a1a'], ['Evento · Acento ámbar', 'heroMax', 'eventosTitleEm', '#eca10c'], ['Evento · Bajada', 'lede', 'eventosLede', '#1a1a1a'], ['Evento · Cuerpo párrafos', 'bodyBase', 'eventosBody', '#1a1a1a'], ['Evento · Título de bloque', 'eventosBlockTitle', 'eventosBlockTitle', '#1a1a1a']]], ['Manifiesto', [['Manifiesto · Texto', 'manifestoMax', 'manifestoTxt', '#1a1a1a'], ['Manifiesto · Acento ámbar', 'manifestoMax', 'manifestoAmber', '#eca10c']]], ['Testimonios', [['Testimonios · Núm. eyebrow', 'label', 'testiNum', '#cfcabe'], ['Testimonios · Título', 'testimonialsTitleMax', 'testiTitle', '#f5f1e8'], ['Testimonios · Acento ámbar', 'testimonialsTitleMax', 'testiTitleEm', '#eca10c'], ['Testimonios · Subtítulo', 'lede', 'testiSub', '#f5f1e8'], ['Testimonios · Cita', 'testiQuote', 'testiQuote', '#1a1a1a'], ['Testimonios · Nombre', 'testiName', 'testiName', '#1a1a1a'], ['Testimonios · Rol', 'testiRole', 'testiRole', '#6b6b62']]], ['CTA Final', [['CTA · Título', 'ctaMax', 'ctaTitle', '#0a0a0a'], ['CTA · Cuerpo', 'ctaBody', 'ctaBody', '#0a0a0a']]], ['Footer', [['Footer · Wordmark', 'wordmarkMax', 'footerWordmark', '#f5f1e8'], ['Footer · Descripción', 'footerAbout', 'footerAbout', '#b8b5ad'], ['Footer · Columna título', 'footerColTitle', 'footerColTitle', '#b8b5ad'], ['Footer · Columna item', 'footerColItem', 'footerColItem', '#f5f1e8']]], ['Nav (menú superior)', [['Nav · Tamaño del logo', 'navLogo', null, null], ['Nav · Enlace', 'navLink', 'navLink', '#1a1a1a']]], ['Club Secreto', [['Club · Título portada (gate)', 'clubGateTitle', null, null], ['Club · Título principal', 'clubHeroTitle', null, null], ['Club · Título de sección', 'clubSectionTitle', null, null], ['Club · Número de panel', 'clubPanelBig', null, null], ['Club · Nombre de ruta', 'clubRouteName', null, null], ['Club · Día de reunión', 'clubMeetingDay', null, null], ['Club · Cuerpo de texto', 'clubBody', null, null]]]];

// ----- View: Colors (text-color + size for every editable slot) -----
function ViewColors({
  content,
  store
}) {
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card__head"
  }, /*#__PURE__*/React.createElement("h3", null, "Colores y tama\xF1os de TODO el texto"), /*#__PURE__*/React.createElement("button", {
    className: "abtn ghost sm",
    onClick: () => {
      if (confirm('¿Restablecer todos los colores de texto a los valores por defecto?')) store.update('colors', {});
    }
  }, "\u21BA Restablecer todos los colores")), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--mono)',
      fontSize: 12,
      color: 'var(--gray)',
      marginBottom: 16,
      lineHeight: 1.55
    }
  }, "Cada fila controla el ", /*#__PURE__*/React.createElement("strong", null, "tama\xF1o"), " y el ", /*#__PURE__*/React.createElement("strong", null, "color"), " de un texto de la p\xE1gina. Si dejas el color vac\xEDo, se usa el color original del dise\xF1o. Los cambios se aplican en vivo.")), TOKEN_GROUPS.map(([groupName, slots], gi) => /*#__PURE__*/React.createElement("div", {
    className: "card",
    key: groupName
  }, /*#__PURE__*/React.createElement("div", {
    className: "card__head"
  }, /*#__PURE__*/React.createElement("h3", null, groupName), /*#__PURE__*/React.createElement("span", {
    className: "meta"
  }, slots.length, " elemento", slots.length !== 1 ? 's' : '')), /*#__PURE__*/React.createElement("div", {
    className: "token-list"
  }, slots.map(([label, sizePath, colorKey, fallback], i) => /*#__PURE__*/React.createElement(TokenRow, {
    key: i,
    label: label,
    sizePath: sizePath,
    colorKey: colorKey,
    store: store,
    content: content,
    fallback: fallback,
    sizeMin: sizePath === 'label' ? 9 : sizePath === 'bodyBase' ? 12 : 10,
    sizeMax: sizePath && sizePath.includes('itleMax') ? 320 : sizePath === 'heroMax' ? 320 : 200,
    sizeStep: sizePath && (sizePath.includes('itleMax') || sizePath === 'heroMax') ? 4 : 1
  }))))));
}

// ----- View: Eventos (Ruah Evento) -----
function ViewEventos({
  content,
  store
}) {
  const {
    update,
    updateList
  } = store;
  const ev = content.eventos;
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(SectionTokens, {
    groupName: "Evento (Ruah Evento)",
    content: content,
    store: store
  }), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card__head"
  }, /*#__PURE__*/React.createElement("h3", null, "Cabecera"), /*#__PURE__*/React.createElement("span", {
    className: "meta"
  }, "A\u2212 / A+ controla el tama\xF1o")), /*#__PURE__*/React.createElement(Text, {
    label: "Eyebrow",
    value: ev.eyebrow,
    onChange: v => update('eventos.eyebrow', v)
  }), /*#__PURE__*/React.createElement("div", {
    className: "row-3"
  }, /*#__PURE__*/React.createElement(Text, {
    label: "T\xEDtulo \u2014 l\xEDnea 1",
    value: ev.title,
    onChange: v => update('eventos.title', v)
  }), /*#__PURE__*/React.createElement(Text, {
    label: "T\xEDtulo \u2014 l\xEDnea 2 (acento \xE1mbar)",
    value: ev.titleEm,
    onChange: v => update('eventos.titleEm', v)
  }), /*#__PURE__*/React.createElement(Text, {
    label: "T\xEDtulo \u2014 l\xEDnea 3",
    value: ev.titleAfter,
    onChange: v => update('eventos.titleAfter', v)
  })), /*#__PURE__*/React.createElement(Text, {
    label: "Bajada / Subt\xEDtulo",
    value: ev.sub,
    onChange: v => update('eventos.sub', v),
    multiline: true,
    rows: 3
  })), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card__head"
  }, /*#__PURE__*/React.createElement("h3", null, "El problema")), /*#__PURE__*/React.createElement(Text, {
    label: "Eyebrow",
    value: ev.problemEyebrow,
    onChange: v => update('eventos.problemEyebrow', v)
  }), /*#__PURE__*/React.createElement(Text, {
    label: "T\xEDtulo",
    value: ev.problemTitle,
    onChange: v => update('eventos.problemTitle', v)
  }), /*#__PURE__*/React.createElement(Text, {
    label: "Cuerpo",
    value: ev.problemBody,
    onChange: v => update('eventos.problemBody', v),
    multiline: true,
    rows: 4
  })), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card__head"
  }, /*#__PURE__*/React.createElement("h3", null, "Lo que hacemos")), /*#__PURE__*/React.createElement(Text, {
    label: "Eyebrow",
    value: ev.weDoEyebrow,
    onChange: v => update('eventos.weDoEyebrow', v)
  }), /*#__PURE__*/React.createElement(Text, {
    label: "T\xEDtulo",
    value: ev.weDoTitle,
    onChange: v => update('eventos.weDoTitle', v),
    multiline: true,
    rows: 2
  }), /*#__PURE__*/React.createElement(Text, {
    label: "Cuerpo",
    value: ev.weDoBody,
    onChange: v => update('eventos.weDoBody', v),
    multiline: true,
    rows: 3
  }), /*#__PURE__*/React.createElement(Text, {
    label: "Tagline",
    value: ev.weDoTagline,
    onChange: v => update('eventos.weDoTagline', v)
  })), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card__head"
  }, /*#__PURE__*/React.createElement("h3", null, "Por qu\xE9 funciona \u2014 Pilares (", ev.pillars.length, ")"), /*#__PURE__*/React.createElement("button", {
    className: "abtn amber sm",
    onClick: () => updateList('eventos.pillars', l => [...l, {
      id: 'ev' + Date.now(),
      num: String(l.length + 1).padStart(2, '0'),
      title: 'Nuevo',
      desc: ''
    }])
  }, "+ Pilar")), ev.pillars.map((p, i) => /*#__PURE__*/React.createElement("div", {
    className: "prod-edit",
    key: p.id,
    style: {
      gridTemplateColumns: '60px 1fr auto'
    }
  }, /*#__PURE__*/React.createElement(Text, {
    label: "N\xFAm.",
    value: p.num,
    onChange: v => updateList('eventos.pillars', l => l.map(x => x.id === p.id ? {
      ...x,
      num: v
    } : x))
  }), /*#__PURE__*/React.createElement("div", {
    className: "prod-edit__fields"
  }, /*#__PURE__*/React.createElement(Text, {
    label: "T\xEDtulo",
    value: p.title,
    onChange: v => updateList('eventos.pillars', l => l.map(x => x.id === p.id ? {
      ...x,
      title: v
    } : x))
  }), /*#__PURE__*/React.createElement(Text, {
    label: "Descripci\xF3n",
    value: p.desc,
    onChange: v => updateList('eventos.pillars', l => l.map(x => x.id === p.id ? {
      ...x,
      desc: v
    } : x)),
    multiline: true,
    rows: 2
  })), /*#__PURE__*/React.createElement("div", {
    className: "prod-edit__actions"
  }, /*#__PURE__*/React.createElement("button", {
    className: "abtn ghost sm",
    disabled: i === 0,
    onClick: () => updateList('eventos.pillars', l => {
      const a = [...l];
      [a[i - 1], a[i]] = [a[i], a[i - 1]];
      return a;
    })
  }, "\u2191"), /*#__PURE__*/React.createElement("button", {
    className: "abtn ghost sm",
    disabled: i === ev.pillars.length - 1,
    onClick: () => updateList('eventos.pillars', l => {
      const a = [...l];
      [a[i + 1], a[i]] = [a[i], a[i + 1]];
      return a;
    })
  }, "\u2193"), /*#__PURE__*/React.createElement("button", {
    className: "abtn danger sm",
    onClick: () => updateList('eventos.pillars', l => l.filter(x => x.id !== p.id))
  }, "\xD7"))))), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card__head"
  }, /*#__PURE__*/React.createElement("h3", null, "Para qu\xE9 eventos \xB7 Sobre qu\xE9 estampamos")), /*#__PURE__*/React.createElement("div", {
    className: "row"
  }, /*#__PURE__*/React.createElement(Text, {
    label: "T\xEDtulo 1 \xB7 Para qu\xE9 eventos",
    value: ev.forWhatTitle,
    onChange: v => update('eventos.forWhatTitle', v)
  }), /*#__PURE__*/React.createElement(Text, {
    label: "Cuerpo 1",
    value: ev.forWhatBody,
    onChange: v => update('eventos.forWhatBody', v),
    multiline: true,
    rows: 3
  }), /*#__PURE__*/React.createElement(Text, {
    label: "T\xEDtulo 2 \xB7 Sobre qu\xE9 estampamos",
    value: ev.onWhatTitle,
    onChange: v => update('eventos.onWhatTitle', v)
  }), /*#__PURE__*/React.createElement(Text, {
    label: "Cuerpo 2",
    value: ev.onWhatBody,
    onChange: v => update('eventos.onWhatBody', v),
    multiline: true,
    rows: 3
  }))), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card__head"
  }, /*#__PURE__*/React.createElement("h3", null, "El detalle que cambia todo")), /*#__PURE__*/React.createElement(Text, {
    label: "T\xEDtulo",
    value: ev.detailTitle,
    onChange: v => update('eventos.detailTitle', v)
  }), /*#__PURE__*/React.createElement(Text, {
    label: "Cuerpo",
    value: ev.detailBody,
    onChange: v => update('eventos.detailBody', v),
    multiline: true,
    rows: 4
  })), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card__head"
  }, /*#__PURE__*/React.createElement("h3", null, "Banner de portafolio (", (ev.gallery || []).length, " fotos)"), /*#__PURE__*/React.createElement("button", {
    className: "abtn amber sm",
    onClick: () => updateList('eventos.gallery', l => [...(l || []), {
      id: 'eg' + Date.now(),
      img: '',
      caption: '',
      photos: []
    }])
  }, "+ Foto")), (ev.gallery || []).map((g, i) => /*#__PURE__*/React.createElement("div", {
    key: g.id,
    style: {
      border: '1px solid var(--border)',
      borderRadius: 8,
      padding: 16,
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "prod-edit",
    style: {
      gridTemplateColumns: '120px 1fr auto'
    }
  }, /*#__PURE__*/React.createElement("label", {
    className: "prod-edit__media",
    style: {
      aspectRatio: '3 / 4',
      height: 'auto'
    }
  }, g.img ? /*#__PURE__*/React.createElement("img", {
    src: g.img,
    alt: g.caption || ''
  }) : /*#__PURE__*/React.createElement("span", null, "Subir", /*#__PURE__*/React.createElement("br", null), "foto portada"), /*#__PURE__*/React.createElement("input", {
    type: "file",
    accept: "image/*",
    onChange: async e => {
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      const url = await uploadToCloudinary(f);
      updateList('eventos.gallery', l => l.map(x => x.id === g.id ? {
        ...x,
        img: url
      } : x));
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "prod-edit__fields"
  }, /*#__PURE__*/React.createElement(Text, {
    label: 'Foto ' + (i + 1) + ' · Caption',
    value: g.caption,
    onChange: v => updateList('eventos.gallery', l => l.map(x => x.id === g.id ? {
      ...x,
      caption: v
    } : x)),
    multiline: true,
    rows: 2
  }), g.img && /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "abtn danger sm",
    style: {
      alignSelf: 'flex-start',
      marginTop: 4
    },
    onClick: () => updateList('eventos.gallery', l => l.map(x => x.id === g.id ? {
      ...x,
      img: ''
    } : x))
  }, "Quitar portada")), /*#__PURE__*/React.createElement("div", {
    className: "prod-edit__actions"
  }, /*#__PURE__*/React.createElement("button", {
    className: "abtn ghost sm",
    disabled: i === 0,
    onClick: () => updateList('eventos.gallery', l => {
      const a = [...l];
      [a[i - 1], a[i]] = [a[i], a[i - 1]];
      return a;
    })
  }, "\u2191"), /*#__PURE__*/React.createElement("button", {
    className: "abtn ghost sm",
    disabled: i === (ev.gallery || []).length - 1,
    onClick: () => updateList('eventos.gallery', l => {
      const a = [...l];
      [a[i + 1], a[i]] = [a[i], a[i + 1]];
      return a;
    })
  }, "\u2193"), /*#__PURE__*/React.createElement("button", {
    className: "abtn danger sm",
    onClick: () => {
      if (confirm('¿Eliminar foto?')) updateList('eventos.gallery', l => l.filter(x => x.id !== g.id));
    }
  }, "\xD7"))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--mono)',
      fontSize: 12,
      color: 'var(--gray)',
      letterSpacing: '0.12em'
    }
  }, "GALER\xCDA INTERIOR \u2014 ", (g.photos || []).length, " foto", (g.photos || []).length !== 1 ? 's' : '', " (aparece al hacer click)"), /*#__PURE__*/React.createElement("label", {
    className: "abtn ghost sm",
    style: {
      position: 'relative',
      cursor: 'pointer'
    }
  }, "+ A\xF1adir fotos", /*#__PURE__*/React.createElement("input", {
    type: "file",
    accept: "image/*",
    multiple: true,
    style: {
      position: 'absolute',
      inset: 0,
      opacity: 0,
      cursor: 'pointer'
    },
    onChange: async e => {
      const files = Array.from(e.target.files || []);
      for (const f of files) {
        const url = await uploadToCloudinary(f);
        updateList('eventos.gallery', l => l.map(x => x.id === g.id ? {
          ...x,
          photos: [...(x.photos || []), url]
        } : x));
      }
    }
  }))), (g.photos || []).length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap'
    }
  }, (g.photos || []).map((url, pi) => /*#__PURE__*/React.createElement("div", {
    key: pi,
    style: {
      position: 'relative',
      width: 72,
      height: 72
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: url,
    alt: "",
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      borderRadius: 4,
      border: '1px solid var(--border)'
    }
  }), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => updateList('eventos.gallery', l => l.map(x => x.id === g.id ? {
      ...x,
      photos: x.photos.filter((_, idx) => idx !== pi)
    } : x)),
    style: {
      position: 'absolute',
      top: -6,
      right: -6,
      width: 18,
      height: 18,
      borderRadius: '50%',
      background: '#e53e3e',
      color: '#fff',
      border: 'none',
      cursor: 'pointer',
      fontSize: 12,
      lineHeight: '18px',
      textAlign: 'center',
      padding: 0
    }
  }, "\xD7")))))))), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card__head"
  }, /*#__PURE__*/React.createElement("h3", null, "Lo que recibes (", ev.receiveItems.length, ")"), /*#__PURE__*/React.createElement("button", {
    className: "abtn sm",
    onClick: () => updateList('eventos.receiveItems', l => [...l, {
      id: 'evr' + Date.now(),
      txt: 'Nuevo item'
    }])
  }, "+ Item")), /*#__PURE__*/React.createElement(Text, {
    label: "T\xEDtulo del bloque",
    value: ev.receiveTitle,
    onChange: v => update('eventos.receiveTitle', v)
  }), ev.receiveItems.map((it, i) => /*#__PURE__*/React.createElement("div", {
    className: "prod-edit",
    key: it.id,
    style: {
      gridTemplateColumns: '40px 1fr auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--mono)',
      fontSize: 12,
      color: 'var(--amber)'
    }
  }, String(i + 1).padStart(2, '0')), /*#__PURE__*/React.createElement(Text, {
    label: 'Item ' + (i + 1),
    value: it.txt,
    onChange: v => updateList('eventos.receiveItems', l => l.map(x => x.id === it.id ? {
      ...x,
      txt: v
    } : x))
  }), /*#__PURE__*/React.createElement("div", {
    className: "prod-edit__actions"
  }, /*#__PURE__*/React.createElement("button", {
    className: "abtn ghost sm",
    disabled: i === 0,
    onClick: () => updateList('eventos.receiveItems', l => {
      const a = [...l];
      [a[i - 1], a[i]] = [a[i], a[i - 1]];
      return a;
    })
  }, "\u2191"), /*#__PURE__*/React.createElement("button", {
    className: "abtn ghost sm",
    disabled: i === ev.receiveItems.length - 1,
    onClick: () => updateList('eventos.receiveItems', l => {
      const a = [...l];
      [a[i + 1], a[i]] = [a[i], a[i + 1]];
      return a;
    })
  }, "\u2193"), /*#__PURE__*/React.createElement("button", {
    className: "abtn danger sm",
    onClick: () => updateList('eventos.receiveItems', l => l.filter(x => x.id !== it.id))
  }, "\xD7"))))), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card__head"
  }, /*#__PURE__*/React.createElement("h3", null, "Paquetes (", ev.packs.length, ")"), /*#__PURE__*/React.createElement("button", {
    className: "abtn amber sm",
    onClick: () => updateList('eventos.packs', l => [...l, {
      id: 'evp' + Date.now(),
      name: 'NUEVO',
      limit: '',
      detail: ''
    }])
  }, "+ Paquete")), /*#__PURE__*/React.createElement(Text, {
    label: "T\xEDtulo del bloque",
    value: ev.packsTitle,
    onChange: v => update('eventos.packsTitle', v)
  }), ev.packs.map((p, i) => /*#__PURE__*/React.createElement("div", {
    className: "prod-edit",
    key: p.id,
    style: {
      gridTemplateColumns: '1fr auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "prod-edit__fields"
  }, /*#__PURE__*/React.createElement("div", {
    className: "row-3"
  }, /*#__PURE__*/React.createElement(Text, {
    label: "Nombre",
    value: p.name,
    onChange: v => updateList('eventos.packs', l => l.map(x => x.id === p.id ? {
      ...x,
      name: v
    } : x))
  }), /*#__PURE__*/React.createElement(Text, {
    label: "L\xEDmite",
    value: p.limit,
    onChange: v => updateList('eventos.packs', l => l.map(x => x.id === p.id ? {
      ...x,
      limit: v
    } : x))
  }), /*#__PURE__*/React.createElement(Text, {
    label: "Precio",
    value: p.price || '',
    onChange: v => updateList('eventos.packs', l => l.map(x => x.id === p.id ? {
      ...x,
      price: v
    } : x))
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 16,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(Text, {
    label: "Detalle",
    value: p.detail,
    onChange: v => updateList('eventos.packs', l => l.map(x => x.id === p.id ? {
      ...x,
      detail: v
    } : x))
  }), /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      fontSize: 13,
      cursor: 'pointer',
      whiteSpace: 'nowrap',
      paddingTop: 18
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: !!p.featured,
    onChange: e => updateList('eventos.packs', l => l.map(x => x.id === p.id ? {
      ...x,
      featured: e.target.checked
    } : x))
  }), "Destacado"))), /*#__PURE__*/React.createElement("div", {
    className: "prod-edit__actions"
  }, /*#__PURE__*/React.createElement("button", {
    className: "abtn danger sm",
    onClick: () => updateList('eventos.packs', l => l.filter(x => x.id !== p.id))
  }, "\xD7")))), /*#__PURE__*/React.createElement(Text, {
    label: "Texto al pie del bloque",
    value: ev.packsFoot,
    onChange: v => update('eventos.packsFoot', v),
    multiline: true,
    rows: 2
  })), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card__head"
  }, /*#__PURE__*/React.createElement("h3", null, "Cobertura")), /*#__PURE__*/React.createElement("div", {
    className: "row"
  }, /*#__PURE__*/React.createElement(Text, {
    label: "Etiqueta",
    value: ev.coverageTitle,
    onChange: v => update('eventos.coverageTitle', v)
  }), /*#__PURE__*/React.createElement(Text, {
    label: "Valor",
    value: ev.coverageBody,
    onChange: v => update('eventos.coverageBody', v)
  }))), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card__head"
  }, /*#__PURE__*/React.createElement("h3", null, "CTA final \xB7 El siguiente paso")), /*#__PURE__*/React.createElement(Text, {
    label: "Eyebrow",
    value: ev.ctaEyebrow,
    onChange: v => update('eventos.ctaEyebrow', v)
  }), /*#__PURE__*/React.createElement(Text, {
    label: "T\xEDtulo",
    value: ev.ctaTitle,
    onChange: v => update('eventos.ctaTitle', v)
  }), /*#__PURE__*/React.createElement(Text, {
    label: "Cuerpo",
    value: ev.ctaBody,
    onChange: v => update('eventos.ctaBody', v),
    multiline: true,
    rows: 3
  }), /*#__PURE__*/React.createElement("div", {
    className: "row"
  }, /*#__PURE__*/React.createElement(Text, {
    label: "CTA 1 \xB7 Texto",
    value: ev.ctaBtn.label,
    onChange: v => update('eventos.ctaBtn.label', v)
  }), /*#__PURE__*/React.createElement(Text, {
    label: "CTA 1 \xB7 Enlace",
    value: ev.ctaBtn.href,
    onChange: v => update('eventos.ctaBtn.href', v)
  }), /*#__PURE__*/React.createElement(Text, {
    label: "CTA 2 \xB7 Texto",
    value: ev.ctaBtn2.label,
    onChange: v => update('eventos.ctaBtn2.label', v)
  }), /*#__PURE__*/React.createElement(Text, {
    label: "CTA 2 \xB7 Enlace",
    value: ev.ctaBtn2.href,
    onChange: v => update('eventos.ctaBtn2.href', v)
  })), /*#__PURE__*/React.createElement(Text, {
    label: "Instagram",
    value: ev.instagram,
    onChange: v => update('eventos.instagram', v)
  }), /*#__PURE__*/React.createElement(Text, {
    label: "Cierre (frase final)",
    value: ev.closing,
    onChange: v => update('eventos.closing', v),
    multiline: true,
    rows: 3
  })));
}

// ----- View: Checkout (pasarela de pago) -----
function ViewCheckout({
  content,
  store
}) {
  const {
    update
  } = store;
  const ck = content.checkout || {};
  const s = ck.style || {};
  function setStyle(key, val) {
    store.update('checkout.style.' + key, val);
  }
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card__head"
  }, /*#__PURE__*/React.createElement("h3", null, "Textos del checkout"), /*#__PURE__*/React.createElement("span", {
    className: "meta"
  }, "3 pasos + confirmaci\xF3n")), /*#__PURE__*/React.createElement(Text, {
    label: "Etiqueta de la barra superior",
    value: ck.topTag,
    onChange: v => update('checkout.topTag', v)
  }), /*#__PURE__*/React.createElement(Text, {
    label: "Etiquetas de los 3 pasos (separar con coma)",
    value: (ck.stepLabels || []).join(', '),
    onChange: v => update('checkout.stepLabels', v.split(',').map(s => s.trim()).filter(Boolean))
  }), /*#__PURE__*/React.createElement("div", {
    className: "row"
  }, /*#__PURE__*/React.createElement(Text, {
    label: "Paso 1 \xB7 T\xEDtulo",
    value: ck.infoTitle,
    onChange: v => update('checkout.infoTitle', v)
  }), /*#__PURE__*/React.createElement(Text, {
    label: "Paso 1 \xB7 Subt\xEDtulo",
    value: ck.infoSub,
    onChange: v => update('checkout.infoSub', v),
    multiline: true,
    rows: 2
  }), /*#__PURE__*/React.createElement(Text, {
    label: "Dir. env\xEDo \xB7 T\xEDtulo",
    value: ck.addressTitle,
    onChange: v => update('checkout.addressTitle', v)
  })), /*#__PURE__*/React.createElement("div", {
    className: "row"
  }, /*#__PURE__*/React.createElement(Text, {
    label: "Paso 2 \xB7 T\xEDtulo",
    value: ck.shippingTitle,
    onChange: v => update('checkout.shippingTitle', v)
  }), /*#__PURE__*/React.createElement(Text, {
    label: "Paso 2 \xB7 Subt\xEDtulo",
    value: ck.shippingSub,
    onChange: v => update('checkout.shippingSub', v),
    multiline: true,
    rows: 2
  }), /*#__PURE__*/React.createElement(Text, {
    label: "Paso 3 \xB7 T\xEDtulo",
    value: ck.payTitle,
    onChange: v => update('checkout.payTitle', v)
  })), /*#__PURE__*/React.createElement("div", {
    className: "row"
  }, /*#__PURE__*/React.createElement(Text, {
    label: "Bot\xF3n Continuar a env\xEDo",
    value: ck.nextLabel,
    onChange: v => update('checkout.nextLabel', v)
  }), /*#__PURE__*/React.createElement(Text, {
    label: "Bot\xF3n Continuar a pago",
    value: ck.nextPayLabel,
    onChange: v => update('checkout.nextPayLabel', v)
  }), /*#__PURE__*/React.createElement(Text, {
    label: "Bot\xF3n Volver",
    value: ck.backLabel,
    onChange: v => update('checkout.backLabel', v)
  }), /*#__PURE__*/React.createElement(Text, {
    label: "Bot\xF3n Pagar \xB7 prefijo",
    value: ck.payCtaLabel,
    onChange: v => update('checkout.payCtaLabel', v)
  })), /*#__PURE__*/React.createElement(Text, {
    label: "Mensaje de confianza (footer)",
    value: ck.trustTxt,
    onChange: v => update('checkout.trustTxt', v),
    multiline: true,
    rows: 2
  }), /*#__PURE__*/React.createElement("div", {
    className: "row"
  }, /*#__PURE__*/React.createElement(Text, {
    label: "Resumen \xB7 Encabezado",
    value: ck.summaryHd,
    onChange: v => update('checkout.summaryHd', v)
  }), /*#__PURE__*/React.createElement(Text, {
    label: "Resumen \xB7 Protocolo",
    value: ck.summaryProtocol,
    onChange: v => update('checkout.summaryProtocol', v),
    multiline: true,
    rows: 2
  })), /*#__PURE__*/React.createElement(Text, {
    label: "Confirmaci\xF3n \xB7 T\xEDtulo",
    value: ck.confirmedTitle,
    onChange: v => update('checkout.confirmedTitle', v)
  })), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card__head"
  }, /*#__PURE__*/React.createElement("h3", null, "Tarifas de env\xEDo"), /*#__PURE__*/React.createElement("span", {
    className: "meta"
  }, "El servidor usa estos valores \u2014 el cliente no puede modificarlos")), /*#__PURE__*/React.createElement("div", {
    className: "row"
  }, /*#__PURE__*/React.createElement(Text, {
    label: "Env\xEDo est\xE1ndar (CLP, sin puntos)",
    value: String((ck.shippingFees || {}).std ?? 4990),
    onChange: v => update('checkout.shippingFees.std', parseInt(v.replace(/[^0-9]/g, ''), 10) || 0),
    hint: "Ej: 4990"
  }), /*#__PURE__*/React.createElement(Text, {
    label: "Env\xEDo express (CLP, sin puntos)",
    value: String((ck.shippingFees || {}).express ?? 9990),
    onChange: v => update('checkout.shippingFees.express', parseInt(v.replace(/[^0-9]/g, ''), 10) || 0),
    hint: "Ej: 9990"
  }), /*#__PURE__*/React.createElement(Text, {
    label: "Retiro en tienda (0 = gratis)",
    value: String((ck.shippingFees || {}).pickup ?? 0),
    onChange: v => update('checkout.shippingFees.pickup', parseInt(v.replace(/[^0-9]/g, ''), 10) || 0),
    hint: "Normalmente 0"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card__head"
  }, /*#__PURE__*/React.createElement("h3", null, "Colores del checkout")), /*#__PURE__*/React.createElement("div", {
    className: "row"
  }, /*#__PURE__*/React.createElement(ColorPicker, {
    label: "Fondo principal (negro)",
    value: s.cardBg || '#0a0a0a',
    onChange: v => setStyle('cardBg', v)
  }), /*#__PURE__*/React.createElement(ColorPicker, {
    label: "Texto principal (blanco)",
    value: s.textOnCard || '#ffffff',
    onChange: v => setStyle('textOnCard', v)
  }), /*#__PURE__*/React.createElement(ColorPicker, {
    label: "Color de acento (CTA / foco)",
    value: s.accent || '#eca10c',
    onChange: v => setStyle('accent', v)
  }), /*#__PURE__*/React.createElement(ColorPicker, {
    label: "Resumen \xB7 Fondo",
    value: s.sumBg || '#0a0a0a',
    onChange: v => setStyle('sumBg', v)
  }), /*#__PURE__*/React.createElement(ColorPicker, {
    label: "Resumen \xB7 Texto",
    value: s.sumText || '#f5f1e8',
    onChange: v => setStyle('sumText', v)
  }))), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card__head"
  }, /*#__PURE__*/React.createElement("h3", null, "Tama\xF1os del checkout")), /*#__PURE__*/React.createElement("div", {
    className: "row"
  }, /*#__PURE__*/React.createElement(Field, {
    label: 'Título de paso · ' + (s.titleSize || 28) + 'px'
  }, /*#__PURE__*/React.createElement("input", {
    type: "range",
    min: 20,
    max: 64,
    value: s.titleSize || 28,
    onChange: e => setStyle('titleSize', Number(e.target.value)),
    style: {
      accentColor: 'var(--amber)',
      width: '100%'
    }
  })), /*#__PURE__*/React.createElement(Field, {
    label: 'Subtítulo · ' + (s.subSize || 14) + 'px'
  }, /*#__PURE__*/React.createElement("input", {
    type: "range",
    min: 11,
    max: 22,
    value: s.subSize || 14,
    onChange: e => setStyle('subSize', Number(e.target.value)),
    style: {
      accentColor: 'var(--amber)',
      width: '100%'
    }
  })), /*#__PURE__*/React.createElement(Field, {
    label: 'Etiquetas de pasos · ' + (s.stepLabelSize || 11) + 'px'
  }, /*#__PURE__*/React.createElement("input", {
    type: "range",
    min: 9,
    max: 18,
    value: s.stepLabelSize || 11,
    onChange: e => setStyle('stepLabelSize', Number(e.target.value)),
    style: {
      accentColor: 'var(--amber)',
      width: '100%'
    }
  })), /*#__PURE__*/React.createElement(Field, {
    label: 'Etiquetas de campos · ' + (s.fieldLabelSize || 10) + 'px'
  }, /*#__PURE__*/React.createElement("input", {
    type: "range",
    min: 9,
    max: 16,
    value: s.fieldLabelSize || 10,
    onChange: e => setStyle('fieldLabelSize', Number(e.target.value)),
    style: {
      accentColor: 'var(--amber)',
      width: '100%'
    }
  })), /*#__PURE__*/React.createElement(Field, {
    label: 'Texto en inputs · ' + (s.fieldInputSize || 16) + 'px'
  }, /*#__PURE__*/React.createElement("input", {
    type: "range",
    min: 12,
    max: 24,
    value: s.fieldInputSize || 16,
    onChange: e => setStyle('fieldInputSize', Number(e.target.value)),
    style: {
      accentColor: 'var(--amber)',
      width: '100%'
    }
  })), /*#__PURE__*/React.createElement(Field, {
    label: 'Resumen · Encabezado · ' + (s.summaryHdSize || 11) + 'px'
  }, /*#__PURE__*/React.createElement("input", {
    type: "range",
    min: 9,
    max: 18,
    value: s.summaryHdSize || 11,
    onChange: e => setStyle('summaryHdSize', Number(e.target.value)),
    style: {
      accentColor: 'var(--amber)',
      width: '100%'
    }
  })), /*#__PURE__*/React.createElement(Field, {
    label: 'Resumen · Items · ' + (s.summaryItemSize || 12) + 'px'
  }, /*#__PURE__*/React.createElement("input", {
    type: "range",
    min: 10,
    max: 18,
    value: s.summaryItemSize || 12,
    onChange: e => setStyle('summaryItemSize', Number(e.target.value)),
    style: {
      accentColor: 'var(--amber)',
      width: '100%'
    }
  })), /*#__PURE__*/React.createElement(Field, {
    label: 'Resumen · Total · ' + (s.summaryTotalSize || 18) + 'px'
  }, /*#__PURE__*/React.createElement("input", {
    type: "range",
    min: 14,
    max: 32,
    value: s.summaryTotalSize || 18,
    onChange: e => setStyle('summaryTotalSize', Number(e.target.value)),
    style: {
      accentColor: 'var(--amber)',
      width: '100%'
    }
  })))), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card__head"
  }, /*#__PURE__*/React.createElement("h3", null, "Restablecer")), /*#__PURE__*/React.createElement("button", {
    className: "abtn ghost",
    onClick: () => {
      if (confirm('¿Restablecer estilos del checkout?')) store.update('checkout.style', DEFAULT_CONTENT.checkout.style);
    }
  }, "\u21BA Restablecer estilos del checkout")));
}

// ----- Design Gallery Admin -----
function PiezaEditor({
  pieza: initial,
  onSave,
  onCancel
}) {
  const [p, setP] = React.useState(initial);
  const [uploading, setUploading] = React.useState(false);
  function set(key, val) {
    setP(x => ({
      ...x,
      [key]: val
    }));
  }
  async function uploadMain(file) {
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      set('imagen_principal', url);
    } catch (e) {
      alert('Error: ' + e.message);
    } finally {
      setUploading(false);
    }
  }
  async function uploadDetail(file) {
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      setP(x => ({
        ...x,
        imagenes_detalle: [...(x.imagenes_detalle || []), url]
      }));
    } catch (e) {
      alert('Error: ' + e.message);
    } finally {
      setUploading(false);
    }
  }
  const FRAMES = ['', 'Dorado Clásico', 'Metal Negro', 'Madera Rústica', 'Blanco Moderno', 'Bronce Vintage'];
  return /*#__PURE__*/React.createElement("div", {
    className: "card",
    style: {
      border: '1px solid var(--amber)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "card__head"
  }, /*#__PURE__*/React.createElement("h3", null, p.nombre || 'Nueva pieza')), /*#__PURE__*/React.createElement("div", {
    className: "field-grid"
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Nombre"
  }, /*#__PURE__*/React.createElement("input", {
    className: "ainput",
    value: p.nombre || '',
    onChange: e => set('nombre', e.target.value)
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Cliente"
  }, /*#__PURE__*/React.createElement("input", {
    className: "ainput",
    value: p.cliente || '',
    onChange: e => set('cliente', e.target.value)
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Fecha"
  }, /*#__PURE__*/React.createElement("input", {
    className: "ainput",
    value: p.fecha_creacion || '',
    onChange: e => set('fecha_creacion', e.target.value)
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Visible"
  }, /*#__PURE__*/React.createElement(Toggle, {
    label: "Visible en galer\xEDa",
    value: p.estado === 'visible',
    onChange: v => set('estado', v ? 'visible' : 'oculto')
  }))), /*#__PURE__*/React.createElement(Field, {
    label: "Descripci\xF3n breve (cartela)"
  }, /*#__PURE__*/React.createElement("textarea", {
    className: "ainput",
    rows: 3,
    value: p.descripcion_breve || '',
    onChange: e => set('descripcion_breve', e.target.value)
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Historia completa (modal)"
  }, /*#__PURE__*/React.createElement("textarea", {
    className: "ainput",
    rows: 6,
    value: p.descripcion_historia || '',
    onChange: e => set('descripcion_historia', e.target.value)
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Marco"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap'
    }
  }, [1, 2, 3, 4, 5].map(t => /*#__PURE__*/React.createElement("button", {
    key: t,
    type: "button",
    className: 'abtn' + (Number(p.tipo_marco) === t ? '' : ' ghost'),
    onClick: () => set('tipo_marco', t),
    style: {
      fontSize: 12
    }
  }, t, ". ", FRAMES[t])))), /*#__PURE__*/React.createElement(Field, {
    label: "Imagen principal"
  }, p.imagen_principal ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: 10,
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: p.imagen_principal,
    alt: "",
    style: {
      width: 80,
      height: 106,
      objectFit: 'cover',
      borderRadius: 2
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("label", {
    className: "abtn ghost",
    style: {
      cursor: 'pointer',
      display: 'inline-block'
    }
  }, uploading ? 'Subiendo…' : '↑ Cambiar imagen', /*#__PURE__*/React.createElement("input", {
    type: "file",
    accept: "image/*",
    style: {
      display: 'none'
    },
    onChange: e => {
      const f = e.target.files && e.target.files[0];
      if (f) uploadMain(f);
      e.target.value = '';
    }
  })), /*#__PURE__*/React.createElement("button", {
    className: "abtn ghost",
    onClick: () => set('imagen_principal', '')
  }, "\u2715 Quitar"))) : /*#__PURE__*/React.createElement("label", {
    className: "abtn ghost",
    style: {
      cursor: 'pointer',
      display: 'inline-block'
    }
  }, uploading ? 'Subiendo…' : '↑ Subir imagen principal', /*#__PURE__*/React.createElement("input", {
    type: "file",
    accept: "image/*",
    style: {
      display: 'none'
    },
    onChange: e => {
      const f = e.target.files && e.target.files[0];
      if (f) uploadMain(f);
      e.target.value = '';
    }
  }))), /*#__PURE__*/React.createElement(Field, {
    label: 'Imágenes de detalle (' + (p.imagenes_detalle || []).length + ')'
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 8
    }
  }, (p.imagenes_detalle || []).map((url, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: url,
    alt: "",
    style: {
      width: 72,
      height: 72,
      objectFit: 'cover',
      borderRadius: 2
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: () => setP(x => ({
      ...x,
      imagenes_detalle: x.imagenes_detalle.filter((_, j) => j !== i)
    })),
    style: {
      position: 'absolute',
      top: -6,
      right: -6,
      width: 20,
      height: 20,
      borderRadius: '50%',
      border: '1px solid #ccc',
      background: '#fff',
      fontSize: 10,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 0
    }
  }, "\u2715")))), /*#__PURE__*/React.createElement("label", {
    className: "abtn ghost",
    style: {
      cursor: 'pointer',
      display: 'inline-block'
    }
  }, uploading ? 'Subiendo…' : '↑ Agregar imagen de detalle', /*#__PURE__*/React.createElement("input", {
    type: "file",
    accept: "image/*",
    style: {
      display: 'none'
    },
    onChange: e => {
      const f = e.target.files && e.target.files[0];
      if (f) uploadDetail(f);
      e.target.value = '';
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12,
      marginTop: 16
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "abtn",
    onClick: () => onSave(p)
  }, "Guardar"), /*#__PURE__*/React.createElement("button", {
    className: "abtn ghost",
    onClick: onCancel
  }, "Cancelar")));
}
function ViewDesign({
  content,
  store
}) {
  const piezas = content.design && content.design.piezas || [];
  const [editId, setEditId] = React.useState(null);
  const [creating, setCreating] = React.useState(false);
  function save(pieza) {
    const exists = piezas.find(p => p.id === pieza.id);
    if (exists) store.update('design.piezas', piezas.map(p => p.id === pieza.id ? pieza : p));else store.update('design.piezas', [...piezas, pieza]);
    setEditId(null);
    setCreating(false);
  }
  function del(id) {
    if (!confirm('¿Eliminar esta pieza?')) return;
    store.update('design.piezas', piezas.filter(p => p.id !== id));
  }
  const editPieza = creating ? {
    id: 'pz-' + Date.now(),
    nombre: '',
    cliente: '',
    fecha_creacion: new Date().getFullYear().toString(),
    imagen_principal: '',
    imagenes_detalle: [],
    descripcion_breve: '',
    descripcion_historia: '',
    tipo_marco: 1,
    orden: piezas.length,
    estado: 'visible'
  } : editId ? piezas.find(p => p.id === editId) : null;
  const eyebrowSize = content.design && content.design.eyebrowSize || 90;
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "card",
    style: {
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "card__head"
  }, /*#__PURE__*/React.createElement("h3", null, "Apariencia de la secci\xF3n")), /*#__PURE__*/React.createElement(Field, {
    label: 'Tamaño título PERSONALIZADOS · ' + eyebrowSize + 'px'
  }, /*#__PURE__*/React.createElement("input", {
    type: "range",
    min: 40,
    max: 160,
    step: 5,
    value: eyebrowSize,
    onChange: e => store.update('design.eyebrowSize', Number(e.target.value)),
    style: {
      accentColor: 'var(--amber)',
      width: '100%'
    }
  }))), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card__head"
  }, /*#__PURE__*/React.createElement("h3", null, "Galer\xEDa Design \u2014 ", piezas.length, " ", piezas.length === 1 ? 'pieza' : 'piezas'), !creating && !editId && /*#__PURE__*/React.createElement("button", {
    className: "abtn",
    onClick: () => {
      setCreating(true);
      setEditId(null);
    }
  }, "+ Nueva pieza"))), editPieza && /*#__PURE__*/React.createElement(PiezaEditor, {
    pieza: editPieza,
    onSave: save,
    onCancel: () => {
      setEditId(null);
      setCreating(false);
    }
  }), piezas.map(pieza => /*#__PURE__*/React.createElement("div", {
    key: pieza.id,
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14
    }
  }, pieza.imagen_principal ? /*#__PURE__*/React.createElement("img", {
    src: pieza.imagen_principal,
    alt: pieza.nombre,
    style: {
      width: 56,
      height: 74,
      objectFit: 'cover',
      borderRadius: 2,
      flexShrink: 0
    }
  }) : /*#__PURE__*/React.createElement("div", {
    style: {
      width: 56,
      height: 74,
      background: 'var(--surface)',
      borderRadius: 2,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 11,
      color: 'var(--muted)',
      flexShrink: 0
    }
  }, "Sin img"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--serif)',
      fontSize: 15,
      letterSpacing: '0.06em',
      marginBottom: 4
    }
  }, pieza.nombre || '(sin nombre)'), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--muted)'
    }
  }, pieza.cliente, " \xB7 ", pieza.fecha_creacion, " \xB7 Marco ", pieza.tipo_marco, ' · ', /*#__PURE__*/React.createElement("span", {
    style: {
      color: pieza.estado === 'visible' ? 'var(--green, #4a9)' : 'var(--muted)'
    }
  }, pieza.estado))), !editId && !creating && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "abtn ghost",
    onClick: () => {
      setEditId(pieza.id);
      setCreating(false);
    }
  }, "Editar"), /*#__PURE__*/React.createElement("button", {
    className: "abtn ghost",
    onClick: () => del(pieza.id)
  }, "\u2715"))))));
}

// ----- Admin shell -----
function ViewLaunch({
  content,
  store
}) {
  const L = content.launch || {};
  const active = !!L.active;
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "card",
    style: {
      borderColor: active ? '#ff4444' : 'var(--amber)',
      marginBottom: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "card__head",
    style: {
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontSize: 14,
      letterSpacing: '0.08em'
    }
  }, active ? '🔴 PANTALLA DE LANZAMIENTO ACTIVA' : '⚪ PANTALLA DE LANZAMIENTO INACTIVA'), /*#__PURE__*/React.createElement("span", {
    className: "meta",
    style: {
      color: active ? '#ff4444' : 'var(--amber)'
    }
  }, active ? 'Los visitantes ven la imagen — el sitio está oculto' : 'El sitio está visible normalmente')), /*#__PURE__*/React.createElement("button", {
    className: 'abtn ' + (active ? 'danger' : 'amber'),
    style: {
      width: '100%',
      fontSize: 15,
      padding: '14px 0',
      letterSpacing: '0.1em',
      marginBottom: 8
    },
    onClick: () => store.update('launch.active', !active)
  }, active ? '✓ DESACTIVAR — MOSTRAR EL SITIO' : '🚀 ACTIVAR — CUBRIR EL SITIO'), active && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '8px 0 0',
      color: '#ff4444',
      fontSize: 12,
      textAlign: 'center'
    }
  }, "Guarda los cambios para que tome efecto en todos los visitantes")), /*#__PURE__*/React.createElement("div", {
    className: "card",
    style: {
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "card__head",
    style: {
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("h4", {
    style: {
      margin: 0,
      fontSize: 12,
      letterSpacing: '0.05em'
    }
  }, "IMAGEN M\xD3VIL (vertical 9:16)")), /*#__PURE__*/React.createElement(Text, {
    label: "URL de imagen m\xF3vil (Cloudinary)",
    value: L.imageMobile || '',
    placeholder: "https://res.cloudinary.com/...",
    onChange: v => store.update('launch.imageMobile', v)
  }), L.imageMobile && /*#__PURE__*/React.createElement("img", {
    src: L.imageMobile,
    alt: "preview m\xF3vil",
    style: {
      marginTop: 8,
      maxHeight: 160,
      borderRadius: 4,
      display: 'block'
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card__head",
    style: {
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("h4", {
    style: {
      margin: 0,
      fontSize: 12,
      letterSpacing: '0.05em'
    }
  }, "IMAGEN DESKTOP (horizontal 16:9)")), /*#__PURE__*/React.createElement(Text, {
    label: "URL de imagen desktop (Cloudinary)",
    value: L.imageDesktop || '',
    placeholder: "https://res.cloudinary.com/...",
    onChange: v => store.update('launch.imageDesktop', v)
  }), L.imageDesktop && /*#__PURE__*/React.createElement("img", {
    src: L.imageDesktop,
    alt: "preview desktop",
    style: {
      marginTop: 8,
      maxWidth: '100%',
      maxHeight: 120,
      borderRadius: 4,
      display: 'block'
    }
  })));
}
const ADMIN_VIEWS = [{
  id: 'dash',
  label: 'Panel',
  comp: ViewDashboard
}, {
  id: 'launch',
  label: '🚀 Lanzamiento',
  comp: ViewLaunch
}, {
  id: 'colors',
  label: 'Colores texto',
  comp: ViewColors
}, {
  id: 'theme',
  label: 'Paleta',
  comp: ViewTheme
}, {
  id: 'typography',
  label: 'Tipografía',
  comp: ViewTypography
}, {
  id: 'brand',
  label: 'Marca',
  comp: ViewBrand
}, {
  id: 'nav',
  label: 'Menú',
  comp: ViewNav
}, {
  id: 'home',
  label: 'Inicio',
  comp: ViewHome
}, {
  id: 'design',
  label: 'Personalizado',
  comp: ViewDesign
}, {
  id: 'hero',
  label: 'Hero',
  comp: ViewHero
}, {
  id: 'about',
  label: 'Quienes Somos',
  comp: ViewAbout
}, {
  id: 'protocol',
  label: 'Protocolo 1×1',
  comp: ViewProtocol
}, {
  id: 'services',
  label: 'Servicios',
  comp: ViewServices
}, {
  id: 'categories',
  label: 'Categorías',
  comp: ViewCategories
}, {
  id: 'products',
  label: 'Productos',
  comp: ViewProducts
}, {
  id: 'cuadros',
  label: 'Cuadros',
  comp: ViewCuadros
}, {
  id: 'iglesias',
  label: 'Iglesias',
  comp: ViewIglesias
}, {
  id: 'eventos',
  label: 'Evento',
  comp: ViewEventos
}, {
  id: 'manifesto',
  label: 'Manifiesto',
  comp: ViewManifesto
}, {
  id: 'testimonials',
  label: 'Testimonios',
  comp: ViewTestimonials
}, {
  id: 'cta',
  label: 'CTA Final',
  comp: ViewCTA
}, {
  id: 'footer',
  label: 'Footer',
  comp: ViewFooter
}, {
  id: 'club',
  label: 'Club Secreto',
  comp: ViewClub
}, {
  id: 'checkout',
  label: 'Pasarela pago',
  comp: ViewCheckout
}, {
  id: 'settings',
  label: 'Ajustes',
  comp: ViewSettings
}];
function Admin({
  open,
  content,
  store,
  onClose
}) {
  const [authed, setAuthed] = React.useState(() => sessionStorage.getItem('ruah-admin-auth') === '1');
  const [pwd, setPwd] = React.useState('');
  const [err, setErr] = React.useState('');
  const [view, setView] = React.useState('dash');
  const [dirty, setDirty] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const isFirstRender = React.useRef(true);

  // Marca como "hay cambios" cada vez que el contenido cambia (excepto la carga inicial)
  React.useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (authed) setDirty(true);
  }, [content]);
  async function handleSave() {
    setSaving(true);
    try {
      await store.save();
      setDirty(false);
    } catch (e) {
      // el toast de error ya lo muestra saveContent
    } finally {
      setSaving(false);
    }
  }
  React.useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
  }, [open]);
  async function authenticate(e) {
    e && e.preventDefault();
    if (!pwd.trim()) return;
    setErr('');
    try {
      var SB_URL = 'https://txrpxzsqqomdlnxmyvxn.supabase.co';
      var SB_ANON = 'sb_publishable_ZLrj11-7GjIE8gEiwybtvQ_6e4NZ07p';
      var sbClient = window._ruahSbClient || window.supabase && window.supabase.createClient(SB_URL, SB_ANON);
      if (!sbClient) {
        setErr('SDK no cargado — recarga la página');
        return;
      }
      var result = await sbClient.auth.signInWithPassword({
        email: 'contacto.ruahlabs@gmail.com',
        password: pwd
      });
      if (result.error || !result.data || !result.data.session) {
        setErr('CONTRASEÑA INCORRECTA');
        return;
      }
      sessionStorage.setItem('ruah-admin-auth', '1');
      sessionStorage.setItem('ruah-admin-session', result.data.session.access_token);
      setAuthed(true);
      setErr('');
      setPwd('');
    } catch (ex) {
      setErr('ERROR DE CONEXIÓN');
    }
  }
  function logout() {
    var sbClient = window._ruahSbClient;
    if (sbClient) sbClient.auth.signOut().catch(function () {});
    sessionStorage.removeItem('ruah-admin-auth');
    sessionStorage.removeItem('ruah-admin-session');
    setAuthed(false);
  }
  const Active = ADMIN_VIEWS.find(v => v.id === view)?.comp || ViewDashboard;
  const activeMeta = ADMIN_VIEWS.find(v => v.id === view);
  return /*#__PURE__*/React.createElement("div", {
    className: 'admin-overlay' + (open ? ' open' : ''),
    role: "dialog",
    "aria-hidden": !open
  }, /*#__PURE__*/React.createElement("div", {
    className: "admin"
  }, !authed ? /*#__PURE__*/React.createElement("form", {
    className: "admin-login",
    onSubmit: authenticate,
    style: {
      gridColumn: '1 / -1',
      alignSelf: 'center'
    }
  }, /*#__PURE__*/React.createElement("h2", null, "PANEL ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--amber)'
    }
  }, "ADMIN")), /*#__PURE__*/React.createElement("p", null, "RUAH LABS \xB7 CONTROL TOTAL"), /*#__PURE__*/React.createElement(Field, {
    label: "Contrase\xF1a"
  }, /*#__PURE__*/React.createElement("input", {
    className: "input",
    type: "password",
    value: pwd,
    onChange: e => setPwd(e.target.value),
    autoFocus: true,
    placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
  })), /*#__PURE__*/React.createElement("div", {
    className: "err"
  }, err), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      marginTop: 16
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: "abtn amber",
    style: {
      flex: 1
    }
  }, "Entrar \u2192"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "abtn ghost",
    onClick: onClose
  }, "Cancelar"))) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("aside", {
    className: "admin__side"
  }, /*#__PURE__*/React.createElement("div", {
    className: "admin__brand"
  }, /*#__PURE__*/React.createElement("span", {
    className: "dot"
  }), "ADMIN"), /*#__PURE__*/React.createElement("nav", {
    className: "admin__nav"
  }, ADMIN_VIEWS.map((v, i) => /*#__PURE__*/React.createElement("button", {
    key: v.id,
    className: view === v.id ? 'active' : '',
    onClick: () => setView(v.id)
  }, /*#__PURE__*/React.createElement("span", null, v.label), /*#__PURE__*/React.createElement("span", {
    className: "num"
  }, String(i).padStart(2, '0'))))), /*#__PURE__*/React.createElement("div", {
    className: "admin__footer"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => window.open(window.location.href, '_blank')
  }, "\u2197 VER SITIO EN NUEVA PESTA\xD1A"), /*#__PURE__*/React.createElement("button", {
    onClick: logout
  }, "\u2190 CERRAR SESI\xD3N"), /*#__PURE__*/React.createElement("button", {
    className: "danger",
    onClick: onClose
  }, "\xD7 CERRAR PANEL"))), /*#__PURE__*/React.createElement("main", {
    className: "admin__main"
  }, /*#__PURE__*/React.createElement("header", {
    className: "admin__top"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", null, activeMeta?.label || 'Panel'), /*#__PURE__*/React.createElement("div", {
    className: "sub"
  }, "RUAH LABS \xB7 ADMIN \xB7 LIVE")), /*#__PURE__*/React.createElement("div", {
    className: "admin__top__actions"
  }, dirty && !saving && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '12px',
      color: 'var(--amber)',
      fontWeight: 700,
      letterSpacing: '0.05em'
    }
  }, "\u25CF CAMBIOS SIN GUARDAR"), /*#__PURE__*/React.createElement("button", {
    className: 'abtn' + (dirty ? '' : ' ghost'),
    onClick: handleSave,
    disabled: saving || !dirty,
    style: {
      minWidth: '160px'
    }
  }, saving ? 'GUARDANDO…' : 'GUARDAR CAMBIOS'), /*#__PURE__*/React.createElement("button", {
    className: "abtn ghost",
    onClick: onClose
  }, "\u2190 Volver al sitio"))), /*#__PURE__*/React.createElement("div", {
    className: "admin__body"
  }, /*#__PURE__*/React.createElement(Active, {
    content: content,
    store: store,
    setView: setView
  }))))));
}
Object.assign(window, {
  Admin
});