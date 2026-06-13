/* global React */
// ============================================================
// RUAH LABS — Admin Panel
// ============================================================

// ----- Small reusable form atoms -----
function Field({ label, hint, children }) {
  return (
    <div className="field">
      <label>
        <span>{label}</span>
        {hint && <span className="hint">{hint}</span>}
      </label>
      {children}
    </div>
  );
}

function Text({ label, value, onChange, hint, placeholder, multiline, rows = 3 }) {
  return (
    <Field label={label} hint={hint}>
      {multiline
        ? <textarea className="textarea" rows={rows} value={value || ''} placeholder={placeholder} onChange={e => onChange(e.target.value)} />
        : <input className="input" value={value || ''} placeholder={placeholder} onChange={e => onChange(e.target.value)} />}
    </Field>
  );
}

// Text + font-size combo: input on the left, A−/A+ pad on the right.
// Pass `sizePath` (typography.xxx) and `store` to enable size controls.
function EditText({
  label, value, onChange, hint, placeholder, multiline, rows = 3,
  sizePath, store, content, sizeMin = 10, sizeMax = 320, sizeStep = 2,
}) {
  const t = content && content.typography;
  const current = sizePath && t ? (t[sizePath] || 0) : null;

  function bump(delta) {
    if (!sizePath || !store) return;
    const next = Math.max(sizeMin, Math.min(sizeMax, (current || sizeMin) + delta));
    store.update('typography.' + sizePath, next);
  }

  const InputEl = multiline
    ? <textarea className="textarea" rows={rows} value={value || ''} placeholder={placeholder} onChange={e => onChange(e.target.value)} />
    : <input className="input" value={value || ''} placeholder={placeholder} onChange={e => onChange(e.target.value)} />;

  if (!sizePath) {
    return <Field label={label} hint={hint}>{InputEl}</Field>;
  }

  return (
    <Field label={label} hint={hint || (current ? 'Tamaño actual: ' + current + 'px' : null)}>
      <div className="txt-size">
        {InputEl}
        <div className="size-pad" title="Aumentar / disminuir tamaño">
          <button type="button" onClick={() => bump(-sizeStep)} aria-label="Reducir">A−</button>
          <span className="v">{current}<small>px</small></span>
          <button type="button" className="amber-fixed" onClick={() => bump(sizeStep)} aria-label="Aumentar">A+</button>
        </div>
      </div>
    </Field>
  );
}

function ColorPicker({ label, value, onChange }) {
  return (
    <Field label={label}>
      <div className="color-field">
        <input type="color" value={value} onChange={e => onChange(e.target.value)} />
        <input type="text" className="input" value={value} onChange={e => onChange(e.target.value)} />
      </div>
    </Field>
  );
}

// Compact 1-line color editor — used in TokenEditor rows. No <label> wrapper.
function ColorSwatch({ value, onChange, fallback = '#000000' }) {
  const hasValue = value && value.length > 0;
  return (
    <div className="ce-swatch">
      <input
        type="color"
        value={hasValue ? value : fallback}
        onChange={e => onChange(e.target.value)}
        title="Cambiar color"
      />
      <input
        type="text"
        className="input"
        value={value || ''}
        placeholder={fallback + ' (default)'}
        onChange={e => onChange(e.target.value)}
      />
      {hasValue && (
        <button type="button" className="abtn ghost sm" onClick={() => onChange('')} title="Restaurar color por defecto">↺</button>
      )}
    </div>
  );
}

// Row that bundles label + size pad + color picker for ONE editable text slot.
// Pass `sizePath` (typography key) and/or `colorKey` (colors key).
function TokenRow({ label, sizePath, colorKey, store, content, sizeMin = 10, sizeMax = 320, sizeStep = 2, fallback }) {
  const t = content.typography || {};
  const cMap = content.colors || {};
  const current = sizePath ? (t[sizePath] || 0) : null;
  const curColor = colorKey ? (cMap[colorKey] || '') : '';

  function bump(d) {
    const next = Math.max(sizeMin, Math.min(sizeMax, (current || sizeMin) + d));
    store.update('typography.' + sizePath, next);
  }

  return (
    <div className="token-row">
      <div className="token-row__label">{label}</div>
      {sizePath && (
        <div className="size-pad" title="Tamaño">
          <button type="button" onClick={() => bump(-sizeStep)} aria-label="−">A−</button>
          <span className="v">{current}<small>px</small></span>
          <button type="button" className="amber-fixed" onClick={() => bump(sizeStep)} aria-label="+">A+</button>
        </div>
      )}
      {colorKey && (
        <ColorSwatch
          value={curColor}
          onChange={v => store.update('colors.' + colorKey, v)}
          fallback={fallback || '#1a1a1a'}
        />
      )}
    </div>
  );
}

// Quick token panel: renders all editable text slots for a single section in a card.
// Sourced from TOKEN_GROUPS (defined further down).
function SectionTokens({ groupName, content, store, defaultOpen = false }) {
  const [open, setOpen] = React.useState(defaultOpen);
  const group = (typeof TOKEN_GROUPS !== 'undefined') && TOKEN_GROUPS.find(([n]) => n === groupName);
  if (!group) return null;
  const slots = group[1];
  return (
    <div className="card sec-tokens">
      <button
        type="button"
        className="sec-tokens__head"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <span className="sec-tokens__caret">{open ? '▾' : '▸'}</span>
        <h3>Estilo de textos — {groupName}</h3>
        <span className="meta">{slots.length} elemento{slots.length !== 1 ? 's' : ''} · tamaño + color</span>
      </button>
      {open && (
        <div className="token-list" style={{ marginTop: 14 }}>
          {slots.map(([label, sizePath, colorKey, fallback], i) => (
            <TokenRow
              key={i}
              label={label}
              sizePath={sizePath}
              colorKey={colorKey}
              store={store}
              content={content}
              fallback={fallback}
              sizeMin={sizePath === 'label' ? 9 : (sizePath === 'bodyBase' ? 12 : 10)}
              sizeMax={sizePath && sizePath.includes('itleMax') ? 320 : (sizePath === 'heroMax' ? 320 : 200)}
              sizeStep={sizePath && (sizePath.includes('itleMax') || sizePath === 'heroMax') ? 4 : 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function Toggle({ label, value, onChange }) {
  return (
    <button className={'toggle' + (value ? ' on' : '')} onClick={() => onChange(!value)} type="button">
      <span className="toggle__sw"></span>
      <span>{label}</span>
    </button>
  );
}

// Subir imagen a Cloudinary con firma del servidor (signed upload)
async function uploadToCloudinary(file) {
  var api = (window.RUAH_API || '') + '/api/images/sign';
  var adminKey = sessionStorage.getItem('ruah-admin-session') || '';

  var signRes = await fetch(api, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
    body: JSON.stringify({ folder: 'ruahlabs' }),
  });
  var sign = await signRes.json();
  if (sign.error) throw new Error('Firma Cloudinary: ' + sign.error);

  var fd = new FormData();
  fd.append('file', file);
  fd.append('api_key',   sign.apiKey);
  fd.append('timestamp', String(sign.timestamp));
  fd.append('signature', sign.signature);
  fd.append('folder',    sign.folder);

  var res = await fetch('https://api.cloudinary.com/v1_1/' + sign.cloudName + '/image/upload', {
    method: 'POST', body: fd,
  });
  var data = await res.json();
  if (!data.secure_url) throw new Error((data.error && data.error.message) || 'Upload fallido');
  return data.secure_url;
}

// Reusable image picker — shows current image, upload + remove
function ImgPicker({ label, value, onChange, hint, ratio = '4 / 3' }) {
  const [uploading, setUploading] = React.useState(false);
  async function onFile(e) {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    setUploading(true);
    try {
      const url = await uploadToCloudinary(f);
      onChange(url);
    } catch(err) {
      alert('Error subiendo imagen: ' + err.message);
    } finally {
      setUploading(false);
    }
  }
  return (
    <Field label={label} hint={hint}>
      <div className="img-picker">
        <label className={'img-picker__slot' + (value ? ' has' : '') + (uploading ? ' uploading' : '')} style={{ aspectRatio: ratio }}>
          {uploading
            ? <span className="img-picker__ph">Subiendo…</span>
            : value
              ? <img src={value} alt="" />
              : <span className="img-picker__ph">+ Subir foto</span>}
          <input type="file" accept="image/*" onChange={onFile} disabled={uploading} />
        </label>
        <div className="img-picker__actions">
          <label className="abtn ghost sm" style={{ position: 'relative', cursor: 'pointer' }}>
            {value ? 'Reemplazar' : 'Elegir archivo'}
            <input type="file" accept="image/*" onChange={onFile} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
          </label>
          {value && <button type="button" className="abtn danger sm" onClick={() => onChange('')}>Quitar foto</button>}
        </div>
      </div>
    </Field>
  );
}

// ----- View: Dashboard -----
function ViewDashboard({ content, setView }) {
  const counts = {
    services:     content.services.items.length,
    products:     content.products.items.length,
    testimonials: content.testimonials.items.length,
    routes:       content.club.routes.length,
  };
  return (
    <div>
      <div className="stat-tiles">
        <div className="stat-tile"><div className="lbl">Servicios</div><div className="num">{counts.services}</div></div>
        <div className="stat-tile"><div className="lbl">Productos</div><div className="num amber">{counts.products}</div></div>
        <div className="stat-tile"><div className="lbl">Testimonios</div><div className="num">{counts.testimonials}</div></div>
        <div className="stat-tile"><div className="lbl">Rutas Club</div><div className="num">{counts.routes}</div></div>
      </div>

      <div className="preview-mini">
        <div className="lbl">Vista previa — Hero</div>
        <div className="ttl">
          {content.hero.titleLine1} {content.hero.titleLine2} <span className="amb">{content.hero.titleLine3}</span>
        </div>
      </div>

        <div className="card">
          <div className="card__head">
            <h3>Accesos rápidos</h3>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="abtn" onClick={() => setView('home')}>Inicio</button>
            <button className="abtn" onClick={() => setView('hero')}>Hero</button>
            <button className="abtn" onClick={() => setView('about')}>Quienes Somos</button>
            <button className="abtn" onClick={() => setView('services')}>Servicios</button>
            <button className="abtn" onClick={() => setView('categories')}>Categorías</button>
            <button className="abtn" onClick={() => setView('products')}>Productos</button>
            <button className="abtn" onClick={() => setView('testimonials')}>Testimonios</button>
            <button className="abtn" onClick={() => setView('theme')}>Colores</button>
            <button className="abtn" onClick={() => setView('typography')}>Tipografía</button>
            <button className="abtn" onClick={() => setView('club')}>Club Secreto</button>
          </div>
        </div>

      <div className="card">
        <div className="card__head"><h3>Acerca del panel</h3></div>
        <p style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--gray)', lineHeight: 1.6 }}>
          Este panel controla cada texto, color, precio, imagen y enlace del sitio. Todo se guarda en tu navegador.
          Usa "Exportar" para descargar un respaldo en JSON, o "Importar" para restaurar uno.
        </p>
      </div>
    </div>
  );
}

// ----- View: Theme -----
function ViewTheme({ content, store }) {
  const { update } = store;
  return (
    <div className="card">
      <div className="card__head"><h3>Paleta de colores</h3><span className="meta">CSS Variables · Live</span></div>
      <div className="row">
        <ColorPicker label="Marfil / Ivory" value={content.theme.ivory} onChange={v => update('theme.ivory', v)} />
        <ColorPicker label="Ámbar / Acento" value={content.theme.amber} onChange={v => update('theme.amber', v)} />
        <ColorPicker label="Gris" value={content.theme.gray} onChange={v => update('theme.gray', v)} />
        <ColorPicker label="Negro / Tinta" value={content.theme.black} onChange={v => update('theme.black', v)} />
      </div>

      <div className="divider">Presets</div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {[
          { name: 'Ruah Original', ivory: '#f5f1e8', amber: '#eca10c', gray: '#6b6b62', black: '#0a0a0a' },
          { name: 'Hueso + Cobre', ivory: '#efe9d9', amber: '#c2410c', gray: '#574f44', black: '#0a0a0a' },
          { name: 'Marfil + Oliva', ivory: '#f5f1e8', amber: '#7c8c44', gray: '#5b5b50', black: '#0a0a0a' },
          { name: 'Crudo + Sangre', ivory: '#efe9d9', amber: '#9b1c1c', gray: '#5b554c', black: '#0a0a0a' },
        ].map(p => (
          <button key={p.name} className="abtn ghost" onClick={() => {
            update('theme.ivory', p.ivory);
            update('theme.amber', p.amber);
            update('theme.gray',  p.gray);
            update('theme.black', p.black);
          }}>
            <span style={{ display: 'inline-flex', gap: 2, marginRight: 4 }}>
              <span style={{ width: 12, height: 12, background: p.ivory, borderRadius: 2 }}></span>
              <span style={{ width: 12, height: 12, background: p.amber, borderRadius: 2 }}></span>
              <span style={{ width: 12, height: 12, background: p.gray,  borderRadius: 2 }}></span>
            </span>
            {p.name}
          </button>
        ))}
      </div>
    </div>
  );
}

// ----- View: Brand -----
function ViewBrand({ content, store }) {
  const { update } = store;
  return (
    <div>
      <div className="card">
        <div className="card__head"><h3>Identidad</h3></div>
        <div className="row">
          <Text label="Nombre" value={content.brand.name} onChange={v => update('brand.name', v)} />
          <Text label="Tagline corto" value={content.brand.tagline} onChange={v => update('brand.tagline', v)} />
          <Text label="Instagram" value={content.brand.instagram} onChange={v => update('brand.instagram', v)} />
          <Text label="Ubicación / Envíos" value={content.brand.location} onChange={v => update('brand.location', v)} />
        </div>
      </div>
      <div className="card">
        <div className="card__head"><h3>Accesos</h3><span className="meta">Sensibles</span></div>
        <ChangePasswordField label="Contraseña admin" hint="Para el panel de administración" onSave={async (newPwd) => { const h = await hashPwd(newPwd); update('brand.adminPasswordHash', h); }} />
        <ChangePasswordField label="Contraseña Club" hint="Acceso al área secreta RUAH Club" onSave={async (newPwd) => { const h = await hashPwd(newPwd); update('brand.clubPasswordHash', h); }} />
      </div>
    </div>
  );
}

// ----- View: Home (Inicio) -----
function ViewHome({ content, store }) {
  const { update } = store;
  const h = content.home || {};
  const intro = h.intro || {};
  const featured = h.featured || [];

  function updateFeatured(idx, key, val) {
    const next = featured.map((it, i) => i === idx ? { ...it, [key]: val } : it);
    update('home.featured', next);
  }

  async function uploadFeat(idx, file, isGallery = false) {
    try {
      const url = await uploadToCloudinary(file);
      if (!url) return;
      if (isGallery) {
        const next = featured.map((it, i) => i === idx ? { ...it, gallery: [...(it.gallery || []), url] } : it);
        update('home.featured', next);
      } else {
        updateFeatured(idx, 'img', url);
      }
    } catch(e) { alert('Error al subir: ' + e.message); }
  }

  function removeGalleryImg(idx, gIdx) {
    const next = featured.map((it, i) => i === idx ? { ...it, gallery: (it.gallery || []).filter((_, j) => j !== gIdx) } : it);
    update('home.featured', next);
  }

  return (
    <div>
      <div className="card">
        <div className="card__head"><h3>Info ligera (post-hero)</h3></div>
        <Text label="Eyebrow" value={intro.eyebrow} onChange={v => update('home.intro.eyebrow', v)} />
        <Text label="Texto" value={intro.text} onChange={v => update('home.intro.text', v)} multiline rows={2} />
      </div>

      <div className="card">
        <div className="card__head"><h3>2 Prendas Destacadas</h3></div>
        <p style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--gray)', marginBottom: 16 }}>
          Las 2 prendas que aparecen lado a lado debajo del hero. Pon el ID de un producto existente para que abra su detalle al hacer click.
        </p>
        {featured.map((item, i) => (
          <div key={item.id} className="prod-edit" style={{ marginBottom: 24 }}>
            <div className="prod-edit__media">
              {item.img
                ? <img src={item.img} alt={item.name} style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover' }} />
                : <div className="prod-edit__ph" style={{ aspectRatio: '3/4' }}>{i + 1}</div>
              }
              <label className="abtn sm" style={{ marginTop: 8, display: 'block', textAlign: 'center', cursor: 'pointer' }}>
                Cambiar foto
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => e.target.files[0] && uploadFeat(i, e.target.files[0])} />
              </label>
              {item.img && <button className="abtn danger sm" style={{ marginTop: 4, width: '100%' }} onClick={() => updateFeatured(i, 'img', '')}>× Quitar</button>}
            </div>
            <div className="prod-edit__fields">
              <div className="row">
                <Text label={'Nombre prenda ' + (i + 1)} value={item.name} onChange={v => updateFeatured(i, 'name', v)} />
                <Text label="Precio (ej: 18.990)" value={item.price} onChange={v => updateFeatured(i, 'price', v)} />
              </div>
              <div className="row">
                <Text label="Tag (ej: NUEVO)" value={item.tag} onChange={v => updateFeatured(i, 'tag', v)} />
                <Text label="ID Producto del catálogo" value={item.productId} onChange={v => updateFeatured(i, 'productId', v)} hint="Ej: p1, p2, p3..." />
              </div>
              <Field label="Galería de fotos adicionales">
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                  {(item.gallery || []).map((g, gIdx) => (
                    <div key={gIdx} style={{ position: 'relative', width: 72, flexShrink: 0 }}>
                      <img src={g} alt="" style={{ width: 72, height: 96, objectFit: 'cover', display: 'block' }} />
                      <button
                        type="button"
                        onClick={() => removeGalleryImg(i, gIdx)}
                        style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.7)', color: '#fff', border: 'none', width: 20, height: 20, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >×</button>
                    </div>
                  ))}
                  <label style={{ width: 72, height: 96, border: '1px dashed var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 24, color: 'var(--gray)', flexShrink: 0 }}>
                    +
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => e.target.files[0] && uploadFeat(i, e.target.files[0], true)} />
                  </label>
                </div>
              </Field>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card__head"><h3>Carrusel de categorías</h3></div>
        <Text label="Título del carrusel" value={(h.carousel && h.carousel.title) || ''} onChange={v => update('home.carousel.title', v)} />
        <p style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--gray)', marginTop: 8 }}>
          El carrusel muestra automáticamente el primer producto con imagen de cada categoría.
        </p>
      </div>
    </div>
  );
}

// ----- View: Hero -----
function ViewHero({ content, store }) {
  const { update } = store;
  const h = content.hero;
  return (
    <React.Fragment>
      <SectionTokens groupName="Hero" content={content} store={store} />
    <div className="card">
      <div className="card__head"><h3>Hero principal</h3><span className="meta">A− / A+ para cambiar tamaño en vivo</span></div>
      <Text label="Eyebrow superior" value={h.eyebrow} onChange={v => update('hero.eyebrow', v)} />
      <div className="row-3">
        <EditText label="Título — línea 1" value={h.titleLine1} onChange={v => update('hero.titleLine1', v)} sizePath="heroMax" sizeMin={60} sizeMax={320} sizeStep={4} content={content} store={store} />
        <EditText label="Título — línea 2" value={h.titleLine2} onChange={v => update('hero.titleLine2', v)} sizePath="heroMax" sizeMin={60} sizeMax={320} sizeStep={4} content={content} store={store} />
        <EditText label="Título — línea 3 (acento ámbar)" value={h.titleLine3} onChange={v => update('hero.titleLine3', v)} sizePath="heroMax" sizeMin={60} sizeMax={320} sizeStep={4} content={content} store={store} />
      </div>
      <EditText label="Bajada / Lede" value={h.lede} onChange={v => update('hero.lede', v)} multiline rows={4} sizePath="lede" sizeMin={12} sizeMax={28} content={content} store={store} />
      <div className="row">
        <Text label="CTA primaria — texto" value={h.primaryCta.label} onChange={v => update('hero.primaryCta.label', v)} />
        <Text label="CTA primaria — enlace" value={h.primaryCta.href} onChange={v => update('hero.primaryCta.href', v)} />
        <Text label="CTA secundaria — texto" value={h.secondaryCta.label} onChange={v => update('hero.secondaryCta.label', v)} />
        <Text label="CTA secundaria — enlace" value={h.secondaryCta.href} onChange={v => update('hero.secondaryCta.href', v)} />
      </div>
      <Text label="Marquesina inferior (separa con ·)" value={h.marquee} onChange={v => update('hero.marquee', v)} multiline rows={2} />
    </div>
    </React.Fragment>
  );
}

// ----- View: Protocol -----
function ViewProtocol({ content, store }) {
  const { update, updateList } = store;
  const p = content.protocol;
  return (
    <div>
      <SectionTokens groupName="Protocolo 1×1" content={content} store={store} />
      <div className="card">
        <div className="card__head"><h3>Cabecera de sección</h3></div>
        <div className="row-3">
          <Text label="Índice (ej. §02 / 06)" value={p.headerIndex} onChange={v => update('protocol.headerIndex', v)} />
          <Text label="Título (centro)" value={p.headerTitle} onChange={v => update('protocol.headerTitle', v)} />
          <Text label="Derecha" value={p.headerRight} onChange={v => update('protocol.headerRight', v)} />
        </div>
      </div>

      <div className="card">
        <div className="card__head"><h3>Título grande (4 líneas)</h3><span className="meta">A− / A+ controla el tamaño</span></div>
        <p style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--gray)', marginBottom: 12 }}>
          Cada línea es una palabra independiente. Marca las casillas para que las líneas 2 y 4 salgan en color ámbar.
        </p>
        <div className="row">
          <EditText label="Línea 1" value={p.title1} onChange={v => update('protocol.title1', v)} sizePath="protocolTitleMax" sizeMin={60} sizeMax={240} sizeStep={4} content={content} store={store} />
          <EditText label="Línea 2" value={p.title2} onChange={v => update('protocol.title2', v)} sizePath="protocolTitleMax" sizeMin={60} sizeMax={240} sizeStep={4} content={content} store={store} />
        </div>
        <Toggle label="Línea 2 en ámbar" value={!!p.title2Amber} onChange={v => update('protocol.title2Amber', v)} />
        <div className="row">
          <EditText label="Línea 3" value={p.title3} onChange={v => update('protocol.title3', v)} sizePath="protocolTitleMax" sizeMin={60} sizeMax={240} sizeStep={4} content={content} store={store} />
          <EditText label="Línea 4" value={p.title4} onChange={v => update('protocol.title4', v)} sizePath="protocolTitleMax" sizeMin={60} sizeMax={240} sizeStep={4} content={content} store={store} />
        </div>
        <Toggle label="Línea 4 en ámbar" value={!!p.title4Amber} onChange={v => update('protocol.title4Amber', v)} />
      </div>

      <div className="card">
        <div className="card__head">
          <h3>Secciones — {(p.sections || []).length}</h3>
          <button className="abtn sm" onClick={() => updateList('protocol.sections', l => [...(l||[]), { id: 'ps' + Date.now(), heading: 'NUEVA SECCIÓN', body: '' }])}>+ Sección</button>
        </div>
        {(p.sections || []).map((s, i) => (
          <div className="prod-edit" key={s.id} style={{ gridTemplateColumns: '40px 1fr auto' }}>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 22, color: 'var(--amber)' }}>{String(i + 1).padStart(2, '0')}</div>
            <div className="prod-edit__fields">
              <Text label="Encabezado" value={s.heading} onChange={v => updateList('protocol.sections', l => l.map(x => x.id === s.id ? { ...x, heading: v } : x))} />
              <Text label="Cuerpo" value={s.body} onChange={v => updateList('protocol.sections', l => l.map(x => x.id === s.id ? { ...x, body: v } : x))} multiline rows={3} />
            </div>
            <div className="prod-edit__actions">
              <button className="abtn ghost sm" disabled={i === 0} onClick={() => updateList('protocol.sections', l => { const a = [...l]; [a[i-1], a[i]] = [a[i], a[i-1]]; return a; })}>↑</button>
              <button className="abtn ghost sm" disabled={i === (p.sections || []).length - 1} onClick={() => updateList('protocol.sections', l => { const a = [...l]; [a[i+1], a[i]] = [a[i], a[i+1]]; return a; })}>↓</button>
              <button className="abtn danger sm" onClick={() => updateList('protocol.sections', l => l.filter(x => x.id !== s.id))}>×</button>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card__head"><h3>Cita bíblica</h3></div>
        <Text label="Referencia (ej. MATEO 6:3-4)" value={p.quoteRef} onChange={v => update('protocol.quoteRef', v)} />
        <Text label="Texto de la cita" value={p.quoteText} onChange={v => update('protocol.quoteText', v)} multiline rows={4} />
      </div>

      <div className="card">
        <div className="card__head">
          <h3>Flujo interno — {(p.flow || []).length} pasos</h3>
          <button className="abtn sm" onClick={() => updateList('protocol.flow', l => [...(l||[]), { id: 'pf' + Date.now(), num: String(((l||[]).length + 1)).padStart(2, '0'), name: 'NUEVO', detail: '' }])}>+ Paso</button>
        </div>
        <Text label="Título del bloque" value={p.flowTitle} onChange={v => update('protocol.flowTitle', v)} hint="Ej: FLUJO INTERNO" />
        {(p.flow || []).map((f, i) => (
          <div className="prod-edit" key={f.id} style={{ gridTemplateColumns: '1fr auto' }}>
            <div className="prod-edit__fields">
              <div className="row-3">
                <Text label="Núm." value={f.num} onChange={v => updateList('protocol.flow', l => l.map(x => x.id === f.id ? { ...x, num: v } : x))} />
                <Text label="Nombre" value={f.name} onChange={v => updateList('protocol.flow', l => l.map(x => x.id === f.id ? { ...x, name: v } : x))} />
                <Text label="Detalle" value={f.detail} onChange={v => updateList('protocol.flow', l => l.map(x => x.id === f.id ? { ...x, detail: v } : x))} />
              </div>
            </div>
            <div className="prod-edit__actions">
              <button className="abtn ghost sm" disabled={i === 0} onClick={() => updateList('protocol.flow', l => { const a = [...l]; [a[i-1], a[i]] = [a[i], a[i-1]]; return a; })}>↑</button>
              <button className="abtn ghost sm" disabled={i === (p.flow||[]).length - 1} onClick={() => updateList('protocol.flow', l => { const a = [...l]; [a[i+1], a[i]] = [a[i], a[i+1]]; return a; })}>↓</button>
              <button className="abtn danger sm" onClick={() => updateList('protocol.flow', l => l.filter(x => x.id !== f.id))}>×</button>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card__head"><h3>Bloque "Equipo" + Botón de acción</h3></div>
        <div className="row-3">
          <Text label="Título" value={p.teamTitle} onChange={v => update('protocol.teamTitle', v)} hint="Ej: EQUIPO" />
          <Text label="Caption (sobre foto)" value={p.teamCaption} onChange={v => update('protocol.teamCaption', v)} hint="FOTO ESPALDA · RUTA" />
          <Text label="Meta" value={p.teamMeta} onChange={v => update('protocol.teamMeta', v)} hint="ANÓNIMO" />
        </div>
        <ImgPicker
          label="Foto del equipo (anónima · espalda)"
          value={p.teamImg}
          onChange={v => update('protocol.teamImg', v)}
          hint="Recomendado 16:10. Sube una foto o deja vacío para el patrón gráfico."
          ratio="16 / 10"
        />
        <div className="row">
          <Text label="Texto del botón" value={p.activateCta} onChange={v => update('protocol.activateCta', v)} />
          <Text label="Enlace del botón" value={p.activateHref} onChange={v => update('protocol.activateHref', v)} />
        </div>
      </div>
    </div>
  );
}

// ----- View: Services -----
function ViewServices({ content, store }) {
  const { update, updateList } = store;
  const s = content.services;
  return (
    <div>
      <SectionTokens groupName="Servicios" content={content} store={store} />
      <div className="card">
        <div className="card__head"><h3>Cabecera</h3><span className="meta">A− / A+ controla el tamaño</span></div>
        <Text label="Eyebrow" value={s.eyebrow} onChange={v => update('services.eyebrow', v)} />
        <div className="row">
          <EditText label="Título" value={s.title} onChange={v => update('services.title', v)} sizePath="servicesTitleMax" sizeMin={50} sizeMax={220} sizeStep={4} content={content} store={store} />
          <EditText label="Acento (ámbar)" value={s.titleEm} onChange={v => update('services.titleEm', v)} sizePath="servicesTitleMax" sizeMin={50} sizeMax={220} sizeStep={4} content={content} store={store} />
        </div>
        <Text label="Subtítulo" value={s.sub} onChange={v => update('services.sub', v)} multiline />
      </div>

      <div className="card">
        <div className="card__head">
          <h3>Servicios</h3>
          <button className="abtn amber sm" onClick={() => updateList('services.items', l => [...l, { id: 'sv' + Date.now(), name: 'Nuevo servicio', desc: 'Descripción...' }])}>+ Servicio</button>
        </div>
        {s.items.map((it, i) => (
          <div className="svc-edit" key={it.id}>
            <div style={{ display: 'grid', gap: 8 }}>
              <Text label={'Servicio ' + (i + 1) + ' — Nombre'} value={it.name} onChange={v => updateList('services.items', l => l.map(x => x.id === it.id ? { ...x, name: v } : x))} />
              <Text label="Descripción" value={it.desc} onChange={v => updateList('services.items', l => l.map(x => x.id === it.id ? { ...x, desc: v } : x))} multiline rows={2} />
            </div>
            <div className="prod-edit__actions">
              <button className="abtn ghost sm" disabled={i === 0} onClick={() => updateList('services.items', l => { const a = [...l]; [a[i-1], a[i]] = [a[i], a[i-1]]; return a; })}>↑</button>
              <button className="abtn ghost sm" disabled={i === s.items.length - 1} onClick={() => updateList('services.items', l => { const a = [...l]; [a[i+1], a[i]] = [a[i], a[i+1]]; return a; })}>↓</button>
              <button className="abtn danger sm" onClick={() => updateList('services.items', l => l.filter(x => x.id !== it.id))}>Eliminar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ----- View: Products -----
function ViewProducts({ content, store }) {
  const { update, updateList } = store;
  const p = content.products;
  const [expandedId, setExpandedId] = React.useState(null);

  async function uploadImage(id, file) {
    try {
      const url = await uploadToCloudinary(file);
      updateList('products.items', l => l.map(x => x.id === id ? { ...x, img: url } : x));
    } catch(e) { alert('Error al subir: ' + e.message); }
  }

  async function addGalleryImage(id, file) {
    try {
      const url = await uploadToCloudinary(file);
      updateList('products.items', l => l.map(x => x.id === id ? { ...x, gallery: [...(x.gallery || []), url] } : x));
    } catch(e) { alert('Error al subir: ' + e.message); }
  }

  function removeGalleryAt(id, idx) {
    updateList('products.items', l => l.map(x => x.id === id ? { ...x, gallery: (x.gallery || []).filter((_, i) => i !== idx) } : x));
  }

  const realCategories = p.categories.filter(c => c.slug !== 'todo');

  return (
    <div>
      <SectionTokens groupName="Productos" content={content} store={store} />
      <div className="card">
        <div className="card__head"><h3>Cabecera</h3><span className="meta">A− / A+ controla el tamaño</span></div>
        <Text label="Eyebrow" value={p.eyebrow} onChange={v => update('products.eyebrow', v)} />
        <div className="row">
          <EditText label="Título" value={p.title} onChange={v => update('products.title', v)} sizePath="productsTitleMax" sizeMin={50} sizeMax={220} sizeStep={4} content={content} store={store} />
          <EditText label="Acento (ámbar)" value={p.titleEm} onChange={v => update('products.titleEm', v)} sizePath="productsTitleMax" sizeMin={50} sizeMax={220} sizeStep={4} content={content} store={store} />
        </div>
        <Text label="Subtítulo" value={p.sub} onChange={v => update('products.sub', v)} multiline />
      </div>

      <div className="card">
        <div className="card__head">
          <h3>Catálogo — {p.items.length} producto{p.items.length !== 1 ? 's' : ''}</h3>
          <button className="abtn amber sm" onClick={() => updateList('products.items', l => [...l, { id: 'p' + Date.now(), name: 'Nueva prenda', verse: 'GEN. 1:1', price: '0', tag: '', tagStyle: 'amber', img: '', gallery: [], categoryId: realCategories[0]?.id || '', description: '', details: [] }])}>+ Producto</button>
        </div>

        {p.items.map((it, i) => {
          const isOpen = expandedId === it.id;
          const cat = p.categories.find(c => c.id === it.categoryId);
          return (
            <div className="prod-edit" key={it.id} style={{ gridTemplateColumns: '100px 1fr auto' }}>
              <label className="prod-edit__media">
                {it.img
                  ? <img src={it.img} alt={it.name} />
                  : <span>Subir<br/>imagen</span>}
                <input type="file" accept="image/*" onChange={e => e.target.files[0] && uploadImage(it.id, e.target.files[0])} />
              </label>

              <div className="prod-edit__fields">
                <div className="row">
                  <Text label="Nombre" value={it.name} onChange={v => updateList('products.items', l => l.map(x => x.id === it.id ? { ...x, name: v } : x))} />
                  <Text label="Versículo / Subtítulo" value={it.verse} onChange={v => updateList('products.items', l => l.map(x => x.id === it.id ? { ...x, verse: v } : x))} />
                </div>
                <div className="row-3">
                  <Text label="Precio CLP" value={it.price} onChange={v => updateList('products.items', l => l.map(x => x.id === it.id ? { ...x, price: v } : x))} />
                  <Text label="Etiqueta" value={it.tag} onChange={v => updateList('products.items', l => l.map(x => x.id === it.id ? { ...x, tag: v } : x))} hint="DROP 04 / EXCLUSIVO / BÁSICO" />
                  <Field label="Categoría">
                    <select
                      className="select"
                      value={it.categoryId || ''}
                      onChange={e => updateList('products.items', l => l.map(x => x.id === it.id ? { ...x, categoryId: e.target.value } : x))}
                    >
                      <option value="">— Sin categoría —</option>
                      {realCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </Field>
                </div>

                <Field label="Estilo etiqueta">
                  <div style={{ display: 'flex', gap: 8 }}>
                    {['amber', 'soft'].map(s => (
                      <button key={s} type="button" className={'abtn sm ' + (it.tagStyle === s ? 'amber' : 'ghost')} onClick={() => updateList('products.items', l => l.map(x => x.id === it.id ? { ...x, tagStyle: s } : x))}>{s.toUpperCase()}</button>
                    ))}
                  </div>
                </Field>

                <Field label="Tipo de talla">
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {[['adulto', 'De Adulto'], ['nino', 'De Niño'], ['unica', 'Talla Única']].map(([val, lbl]) => (
                      <button key={val} type="button"
                        className={'abtn sm ' + ((it.sizeType || 'adulto') === val ? 'amber' : 'ghost')}
                        onClick={() => updateList('products.items', l => l.map(x => x.id === it.id ? { ...x, sizeType: val } : x))}
                      >{lbl}</button>
                    ))}
                  </div>
                </Field>

                <Field label="Tipo de stock">
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {[['permanente', 'Stock permanente'], ['limitado', 'Stock limitado'], ['unica', 'Pieza única']].map(([val, lbl]) => (
                      <button key={val} type="button"
                        className={'abtn sm ' + ((it.stockType || 'permanente') === val ? 'amber' : 'ghost')}
                        onClick={() => updateList('products.items', l => l.map(x => x.id === it.id ? { ...x, stockType: val } : x))}
                      >{lbl}</button>
                    ))}
                  </div>
                </Field>
                {(it.stockType === 'limitado') && (
                  <div className="row" style={{ gridTemplateColumns: '1fr 1fr' }}>
                    <Text label="Stock total (unidades)" value={String(it.stockTotal || 0)}
                      onChange={v => updateList('products.items', l => l.map(x => x.id === it.id ? { ...x, stockTotal: Math.max(0, parseInt(v) || 0), stockActual: Math.min(x.stockActual != null ? x.stockActual : (parseInt(v) || 0), parseInt(v) || 0) } : x))} />
                    <Text label="Disponibles actuales" value={String(it.stockActual != null ? it.stockActual : (it.stockTotal || 0))}
                      onChange={v => updateList('products.items', l => l.map(x => x.id === it.id ? { ...x, stockActual: Math.max(0, Math.min(parseInt(v) || 0, x.stockTotal || 0)) } : x))} />
                  </div>
                )}

                <Toggle
                  label="Mostrar en carrusel de inicio"
                  value={!!it.featuredInCarousel}
                  onChange={v => updateList('products.items', l => l.map(x => x.id === it.id ? { ...x, featuredInCarousel: v } : x))}
                />

                <button className="abtn ghost sm" type="button" onClick={() => setExpandedId(isOpen ? null : it.id)} style={{ alignSelf: 'flex-start', marginTop: 4 }}>
                  {isOpen ? '▴ Ocultar descripción y detalles' : '▾ Descripción + detalles + galería'}
                </button>

                {isOpen && (
                  <div style={{ marginTop: 12, padding: 14, background: '#fff', border: '1px solid var(--line)', borderRadius: 6 }}>
                    <Text label="Descripción completa" value={it.description || ''} onChange={v => updateList('products.items', l => l.map(x => x.id === it.id ? { ...x, description: v } : x))} multiline rows={5} placeholder="Material, fit, inspiración, versículo, etc." />

                    <div className="divider">Ficha técnica · atributos</div>
                    {(it.details || []).map((d, di) => (
                      <div key={d.id} className="row" style={{ gridTemplateColumns: '160px 1fr auto', alignItems: 'end', marginBottom: 6 }}>
                        <Text label={'Atributo ' + (di + 1)} value={d.label} onChange={v => updateList('products.items', l => l.map(x => x.id === it.id ? { ...x, details: x.details.map(y => y.id === d.id ? { ...y, label: v } : y) } : x))} />
                        <Text label="Valor" value={d.value} onChange={v => updateList('products.items', l => l.map(x => x.id === it.id ? { ...x, details: x.details.map(y => y.id === d.id ? { ...y, value: v } : y) } : x))} />
                        <button className="abtn danger sm" style={{ marginBottom: 14 }} onClick={() => updateList('products.items', l => l.map(x => x.id === it.id ? { ...x, details: x.details.filter(y => y.id !== d.id) } : x))}>×</button>
                      </div>
                    ))}
                    <button className="abtn sm" type="button" onClick={() => updateList('products.items', l => l.map(x => x.id === it.id ? { ...x, details: [...(x.details || []), { id: 'd' + Date.now(), label: 'Material', value: '' }] } : x))}>+ Atributo</button>

                    <div className="divider">Galería · imágenes extra</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                      {(it.gallery || []).map((g, gi) => (
                        <div key={gi} style={{ position: 'relative', width: 80, height: 96, background: '#f0ecdf', borderRadius: 4, overflow: 'hidden' }}>
                          <img src={g} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <button className="abtn danger sm" style={{ position: 'absolute', top: 4, right: 4, padding: '2px 6px', minHeight: 0 }} onClick={() => removeGalleryAt(it.id, gi)}>×</button>
                        </div>
                      ))}
                      <label className="abtn ghost sm" style={{ position: 'relative', cursor: 'pointer', width: 80, height: 96, display: 'flex', alignItems: 'center', justifyContent: 'center', borderStyle: 'dashed' }}>
                        + IMG
                        <input type="file" accept="image/*" style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} onChange={e => e.target.files[0] && addGalleryImage(it.id, e.target.files[0])} />
                      </label>
                    </div>
                  </div>
                )}
              </div>

              <div className="prod-edit__actions">
                <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.16em', color: 'var(--gray)', textAlign: 'right', padding: '4px 0' }}>
                  {cat ? cat.name.toUpperCase() : 'SIN CAT.'}
                </div>
                <button className="abtn ghost sm" disabled={i === 0} onClick={() => updateList('products.items', l => { const a = [...l]; [a[i-1], a[i]] = [a[i], a[i-1]]; return a; })}>↑</button>
                <button className="abtn ghost sm" disabled={i === p.items.length - 1} onClick={() => updateList('products.items', l => { const a = [...l]; [a[i+1], a[i]] = [a[i], a[i+1]]; return a; })}>↓</button>
                {it.img && <button className="abtn ghost sm" onClick={() => updateList('products.items', l => l.map(x => x.id === it.id ? { ...x, img: '' } : x))}>Quitar img</button>}
                <button className="abtn danger sm" onClick={() => { if (confirm('¿Eliminar producto?')) updateList('products.items', l => l.filter(x => x.id !== it.id)); }}>Eliminar</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ----- View: Categories -----
function ViewCategories({ content, store }) {
  const { updateList } = store;
  const cats = content.products.categories;

  function slugify(s) {
    return (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  return (
    <div>
      <SectionTokens groupName="Categorías" content={content} store={store} />
      <div className="card">
        <div className="card__head">
          <h3>Subcategorías del menú Productos</h3>
          <button
            className="abtn amber sm"
            onClick={() => updateList('products.categories', l => [...l, { id: 'c' + Date.now(), name: 'Nueva', slug: 'nueva-' + Date.now() }])}
          >+ Categoría</button>
        </div>
        <p style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--gray)', marginBottom: 16, lineHeight: 1.5 }}>
          Aparecen en el menú principal como dropdown y como chips de filtro en la sección Productos. La categoría <strong>"Todo"</strong> es virtual: muestra todos los productos.
        </p>

        {cats.map((c, i) => {
          const productCount = content.products.items.filter(p => p.categoryId === c.id).length;
          const isVirtual = c.slug === 'todo';
          return (
            <div className="prod-edit" key={c.id} style={{ gridTemplateColumns: '40px 1fr auto' }}>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 28, color: isVirtual ? 'var(--gray-soft)' : 'var(--amber)' }}>{String(i + 1).padStart(2, '0')}</div>
              <div className="prod-edit__fields">
                <div className="row">
                  <Text
                    label="Nombre visible"
                    value={c.name}
                    onChange={v => updateList('products.categories', l => l.map(x => x.id === c.id ? { ...x, name: v, slug: x.slug === 'todo' ? 'todo' : slugify(v) } : x))}
                  />
                  <Text
                    label="Slug (URL)"
                    value={c.slug}
                    onChange={v => updateList('products.categories', l => l.map(x => x.id === c.id ? { ...x, slug: slugify(v) } : x))}
                    hint={isVirtual ? 'reservado' : (productCount + ' producto' + (productCount !== 1 ? 's' : ''))}
                  />
                </div>
              </div>
              <div className="prod-edit__actions">
                <button className="abtn ghost sm" disabled={i === 0} onClick={() => updateList('products.categories', l => { const a = [...l]; [a[i-1], a[i]] = [a[i], a[i-1]]; return a; })}>↑</button>
                <button className="abtn ghost sm" disabled={i === cats.length - 1} onClick={() => updateList('products.categories', l => { const a = [...l]; [a[i+1], a[i]] = [a[i], a[i+1]]; return a; })}>↓</button>
                <button className="abtn danger sm" disabled={isVirtual} onClick={() => {
                  if (productCount > 0) { alert('Esta categoría tiene productos. Reasígnalos antes de eliminarla.'); return; }
                  if (confirm('¿Eliminar categoría?')) updateList('products.categories', l => l.filter(x => x.id !== c.id));
                }}>×</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ----- View: About -----
function ViewAbout({ content, store }) {
  const { update, updateList } = store;
  const a = content.about;
  return (
    <div>
      <SectionTokens groupName="Quiénes Somos" content={content} store={store} />
      <div className="card">
        <div className="card__head"><h3>Cabecera Quienes Somos</h3><span className="meta">A− / A+ controla el tamaño del título</span></div>
        <Text label="Eyebrow" value={a.eyebrow} onChange={v => update('about.eyebrow', v)} />
        <div className="row">
          <EditText label="Título" value={a.title} onChange={v => update('about.title', v)} sizePath="aboutTitleMax" sizeMin={50} sizeMax={220} sizeStep={4} content={content} store={store} />
          <EditText label="Acento (ámbar)" value={a.titleEm} onChange={v => update('about.titleEm', v)} sizePath="aboutTitleMax" sizeMin={50} sizeMax={220} sizeStep={4} content={content} store={store} />
        </div>
        <Text label="Subtítulo" value={a.sub} onChange={v => update('about.sub', v)} multiline />
      </div>

      <div className="card">
        <div className="card__head"><h3>Historia · cuerpo de texto</h3></div>
        <p style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--gray)', marginBottom: 10 }}>
          Separa cada párrafo con una línea en blanco.
        </p>
        <textarea
          className="textarea"
          rows={10}
          value={a.body.join('\n\n')}
          onChange={e => update('about.body', e.target.value.split(/\n\n+/))}
        />
      </div>

      <div className="card">
        <div className="card__head">
          <h3>Pilares — {a.pillars.length}</h3>
          <button className="abtn amber sm" onClick={() => updateList('about.pillars', l => [...l, { id: 'a' + Date.now(), num: String(l.length + 1).padStart(2, '0'), title: 'Nuevo pilar', desc: 'Descripción…' }])}>+ Pilar</button>
        </div>
        {a.pillars.map((p, i) => (
          <div className="prod-edit" key={p.id} style={{ gridTemplateColumns: '60px 1fr auto' }}>
            <Text label="Núm." value={p.num} onChange={v => updateList('about.pillars', l => l.map(x => x.id === p.id ? { ...x, num: v } : x))} />
            <div className="prod-edit__fields">
              <Text label="Título" value={p.title} onChange={v => updateList('about.pillars', l => l.map(x => x.id === p.id ? { ...x, title: v } : x))} />
              <Text label="Descripción" value={p.desc} onChange={v => updateList('about.pillars', l => l.map(x => x.id === p.id ? { ...x, desc: v } : x))} multiline rows={2} />
            </div>
            <div className="prod-edit__actions">
              <button className="abtn ghost sm" disabled={i === 0} onClick={() => updateList('about.pillars', l => { const a2 = [...l]; [a2[i-1], a2[i]] = [a2[i], a2[i-1]]; return a2; })}>↑</button>
              <button className="abtn ghost sm" disabled={i === a.pillars.length - 1} onClick={() => updateList('about.pillars', l => { const a2 = [...l]; [a2[i+1], a2[i]] = [a2[i], a2[i+1]]; return a2; })}>↓</button>
              <button className="abtn danger sm" onClick={() => updateList('about.pillars', l => l.filter(x => x.id !== p.id))}>×</button>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card__head">
          <h3>Métricas — {a.metrics.length}</h3>
          <button className="abtn sm" onClick={() => updateList('about.metrics', l => [...l, { id: 'am' + Date.now(), num: '0', lbl: 'Nueva métrica' }])}>+ Métrica</button>
        </div>
        {a.metrics.map(m => (
          <div className="prod-edit" key={m.id} style={{ gridTemplateColumns: '1fr auto' }}>
            <div className="prod-edit__fields">
              <div className="row">
                <Text label="Número" value={m.num} onChange={v => updateList('about.metrics', l => l.map(x => x.id === m.id ? { ...x, num: v } : x))} />
                <Text label="Etiqueta" value={m.lbl} onChange={v => updateList('about.metrics', l => l.map(x => x.id === m.id ? { ...x, lbl: v } : x))} />
              </div>
            </div>
            <div className="prod-edit__actions">
              <button className="abtn danger sm" onClick={() => updateList('about.metrics', l => l.filter(x => x.id !== m.id))}>×</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ----- View: Typography -----
function ViewTypography({ content, store }) {
  const { update } = store;
  const t = content.typography;

  function Slider({ label, path, min, max, step = 1 }) {
    const v = t[path];
    return (
      <Field label={label} hint={(v || 0) + 'px'}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <input
            type="range"
            min={min} max={max} step={step}
            value={v || min}
            onChange={e => update('typography.' + path, Number(e.target.value))}
            style={{ flex: 1, accentColor: 'var(--amber)' }}
          />
          <input
            type="number"
            className="input"
            value={v || ''}
            min={min} max={max}
            onChange={e => update('typography.' + path, Number(e.target.value))}
            style={{ width: 80 }}
          />
        </div>
      </Field>
    );
  }

  return (
    <div>
      <div className="card">
        <div className="card__head">
          <h3>Títulos de sección · Página principal</h3>
          <span className="meta">Máx. en pantalla grande · Live</span>
        </div>
        <p style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--gray)', marginBottom: 16, lineHeight: 1.55 }}>
          Cada slider controla un título distinto. En mobile se reducen automáticamente.
        </p>
        <div className="row">
          <Slider label="Hero · Título principal"  path="heroMax"               min={60}  max={320} />
          <Slider label="Quiénes Somos · Título"   path="aboutTitleMax"         min={50}  max={220} />
          <Slider label="Servicios · Título"       path="servicesTitleMax"      min={50}  max={220} />
          <Slider label="Productos · Título"       path="productsTitleMax"      min={50}  max={220} />
          <Slider label="Cuadros · Título grande"  path="cuadrosTitleMax"       min={60}  max={240} />
          <Slider label="Iglesias · Título grande" path="iglesiasTitleMax"      min={50}  max={220} />
          <Slider label="Protocolo · Título grande" path="protocolTitleMax"     min={60}  max={240} />
          <Slider label="Manifiesto"               path="manifestoMax"          min={40}  max={180} />
          <Slider label="Testimonios · Título"     path="testimonialsTitleMax"  min={50}  max={220} />
          <Slider label="CTA Final · Título"       path="ctaMax"                min={60}  max={260} />
          <Slider label="Wordmark del Footer"      path="wordmarkMax"           min={80}  max={420} />
          <Slider label="Sección genérica (fallback)" path="sectionMax"         min={60}  max={220} />
        </div>
      </div>

      <div className="card">
        <div className="card__head"><h3>Iglesias · sub-elementos</h3></div>
        <div className="row">
          <Slider label="Nombre del servicio"     path="iglesiasServiceName"     min={14} max={48} />
          <Slider label="Nombre del proyecto"     path="iglesiasProjectName"     min={20} max={64} />
          <Slider label="Título Portafolio"       path="iglesiasPortfolioTitle"  min={40} max={160} />
          <Slider label="Título Formulario"       path="iglesiasFormTitle"       min={28} max={120} />
          <Slider label="Nombre pieza destacada"  path="iglesiasFeatureName"     min={28} max={140} />
        </div>
      </div>

      <div className="card">
        <div className="card__head"><h3>Cuadros · sub-elementos</h3></div>
        <div className="row">
          <Slider label="Tag de estilo"           path="cuadrosStyleTag"   min={12} max={36} />
          <Slider label="Brief · Título"          path="cuadrosBriefTitle" min={28} max={120} />
          <Slider label="Número de paso"          path="cuadrosStepNum"    min={20} max={72} />
          <Slider label="Nombre de referencia"    path="cuadrosRefName"    min={24} max={96} />
          <Slider label="Número de formato (px40)" path="cuadrosFormatNum" min={20} max={72} />
        </div>
      </div>

      <div className="card">
        <div className="card__head"><h3>Protocolo · sub-elementos</h3></div>
        <div className="row">
          <Slider label="Nombre del flujo"        path="protocolFlowName"   min={10} max={20} />
          <Slider label="Encabezado de sección"   path="protocolSectionHd"  min={9}  max={18} />
          <Slider label="Cita bíblica"            path="protocolQuote"      min={13} max={32} />
        </div>
      </div>

      <div className="card">
        <div className="card__head"><h3>Club Secreto · tamaños</h3></div>
        <div className="row">
          <Slider label="Club · Título grande"    path="clubTitleMax"      min={50} max={220} />
          <Slider label="Panel · número grande"   path="clubPanelBig"      min={32} max={120} />
          <Slider label="Nombre de ruta"          path="clubRouteName"     min={14} max={48} />
          <Slider label="Día de reunión"          path="clubMeetingDay"    min={20} max={72} />
        </div>
      </div>

      <div className="card">
        <div className="card__head"><h3>Otros componentes</h3></div>
        <div className="row">
          <Slider label="Producto · Título"       path="productTitle"  min={16} max={48} />
          <Slider label="Testimonio · Cita"       path="testiQuote"    min={16} max={48} />
          <Slider label="Pilar · Título"          path="pillarTitle"   min={20} max={64} />
          <Slider label="Métrica · número"        path="statNum"       min={40} max={160} />
          <Slider label="Nav · Brand (no usado, logo es imagen)" path="navBrand" min={14} max={40} />
        </div>
      </div>

      <div className="card">
        <div className="card__head"><h3>Cuerpo · texto</h3></div>
        <div className="row">
          <Slider label="Texto base"               path="bodyBase" min={12} max={22} />
          <Slider label="Lede / Subtítulos"        path="lede"     min={12} max={24} />
          <Slider label="Etiquetas mono"           path="label"    min={9}  max={18} />
        </div>
      </div>

      <div className="card">
        <div className="card__head"><h3>Presets</h3></div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <button className="abtn ghost" onClick={() => {
            update('typography.heroMax', 220); update('typography.sectionMax', 120);
            update('typography.aboutTitleMax', 120); update('typography.servicesTitleMax', 120);
            update('typography.productsTitleMax', 120); update('typography.cuadrosTitleMax', 140);
            update('typography.iglesiasTitleMax', 120); update('typography.protocolTitleMax', 140);
            update('typography.testimonialsTitleMax', 120);
            update('typography.ctaMax', 160); update('typography.wordmarkMax', 280);
            update('typography.manifestoMax', 92); update('typography.clubTitleMax', 140);
            update('typography.productTitle', 28); update('typography.testiQuote', 28);
            update('typography.bodyBase', 15); update('typography.lede', 16);
            update('typography.label', 11); update('typography.navBrand', 24);
            update('typography.pillarTitle', 32); update('typography.statNum', 92);
            update('typography.iglesiasServiceName', 22); update('typography.iglesiasProjectName', 38);
            update('typography.iglesiasPortfolioTitle', 92); update('typography.iglesiasFormTitle', 72);
            update('typography.iglesiasFeatureName', 88);
            update('typography.cuadrosStyleTag', 18); update('typography.cuadrosBriefTitle', 64);
            update('typography.cuadrosStepNum', 38); update('typography.cuadrosRefName', 56);
            update('typography.cuadrosFormatNum', 36);
            update('typography.protocolFlowName', 13); update('typography.protocolSectionHd', 11);
            update('typography.protocolQuote', 18);
            update('typography.clubPanelBig', 64); update('typography.clubRouteName', 22); update('typography.clubMeetingDay', 36);
          }}>↺ Ruah Original</button>
          <button className="abtn ghost" onClick={() => {
            update('typography.heroMax', 280); update('typography.aboutTitleMax', 140); update('typography.servicesTitleMax', 140);
            update('typography.productsTitleMax', 140); update('typography.cuadrosTitleMax', 170); update('typography.iglesiasTitleMax', 140);
            update('typography.protocolTitleMax', 170); update('typography.testimonialsTitleMax', 140);
            update('typography.ctaMax', 200); update('typography.wordmarkMax', 340); update('typography.manifestoMax', 110);
          }}>↑ Editorial XL</button>
          <button className="abtn ghost" onClick={() => {
            update('typography.heroMax', 180); update('typography.aboutTitleMax', 96); update('typography.servicesTitleMax', 96);
            update('typography.productsTitleMax', 96); update('typography.cuadrosTitleMax', 110); update('typography.iglesiasTitleMax', 96);
            update('typography.protocolTitleMax', 110); update('typography.testimonialsTitleMax', 96);
            update('typography.ctaMax', 130); update('typography.wordmarkMax', 220); update('typography.manifestoMax', 72);
          }}>↓ Compacto</button>
        </div>
      </div>
    </div>
  );
}

// ----- View: Manifesto -----
function ViewManifesto({ content, store }) {
  const { update, updateList } = store;
  const segs = content.manifesto.text;
  return (
    <React.Fragment>
      <SectionTokens groupName="Manifiesto" content={content} store={store} />
    <div className="card">
      <div className="card__head">
        <h3>Manifiesto (texto grande)</h3>
        <span className="meta">A− / A+ controla el tamaño</span>
      </div>
      <div style={{ marginBottom: 16 }}>
        <EditText
          label="Tamaño del manifiesto"
          value={'—'}
          onChange={() => {}}
          sizePath="manifestoMax"
          sizeMin={40}
          sizeMax={180}
          sizeStep={4}
          content={content}
          store={store}
          hint="Aplica a todas las líneas del manifiesto"
        />
      </div>
      <div className="card__head" style={{ marginBottom: 12 }}>
        <span className="meta">Líneas individuales</span>
        <button className="abtn sm" onClick={() => updateList('manifesto.text', l => [...l, { txt: 'Nueva frase', em: false, strike: false }])}>+ Línea</button>
      </div>
      {segs.map((seg, i) => (
        <div className="prod-edit" key={i} style={{ gridTemplateColumns: '40px 1fr auto' }}>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 24 }}>#{i + 1}</div>
          <div className="prod-edit__fields">
            <Text label="Texto" value={seg.txt} onChange={v => updateList('manifesto.text', l => l.map((s, j) => j === i ? { ...s, txt: v } : s))} />
            <div style={{ display: 'flex', gap: 12 }}>
              <Toggle label="Itálica/Ámbar" value={seg.em} onChange={v => updateList('manifesto.text', l => l.map((s, j) => j === i ? { ...s, em: v } : s))} />
              <Toggle label="Tachado" value={seg.strike} onChange={v => updateList('manifesto.text', l => l.map((s, j) => j === i ? { ...s, strike: v } : s))} />
            </div>
          </div>
          <div className="prod-edit__actions">
            <button className="abtn danger sm" onClick={() => updateList('manifesto.text', l => l.filter((_, j) => j !== i))}>Eliminar</button>
          </div>
        </div>
      ))}
    </div>
    </React.Fragment>
  );
}

// ----- View: Testimonials -----
function ViewTestimonials({ content, store }) {
  const { update, updateList } = store;
  const t = content.testimonials;
  return (
    <div>
      <SectionTokens groupName="Testimonios" content={content} store={store} />
      <div className="card">
        <div className="card__head"><h3>Cabecera</h3><span className="meta">A− / A+ controla el tamaño</span></div>
        <Text label="Eyebrow" value={t.eyebrow} onChange={v => update('testimonials.eyebrow', v)} />
        <div className="row">
          <EditText label="Título" value={t.title} onChange={v => update('testimonials.title', v)} sizePath="testimonialsTitleMax" sizeMin={50} sizeMax={220} sizeStep={4} content={content} store={store} />
          <EditText label="Acento" value={t.titleEm} onChange={v => update('testimonials.titleEm', v)} sizePath="testimonialsTitleMax" sizeMin={50} sizeMax={220} sizeStep={4} content={content} store={store} />
        </div>
        <Text label="Subtítulo" value={t.sub} onChange={v => update('testimonials.sub', v)} multiline />
      </div>

      <div className="card">
        <div className="card__head">
          <h3>Testimonios</h3>
          <button className="abtn amber sm" onClick={() => updateList('testimonials.items', l => [...l, { id: 't' + Date.now(), quote: 'Nuevo testimonio…', name: 'NOMBRE', role: 'rol', initial: 'X' }])}>+ Testimonio</button>
        </div>
        {t.items.map((it, i) => (
          <div className="testi-edit" key={it.id}>
            <div style={{ display: 'grid', gap: 8 }}>
              <Text label={'Cita #' + (i + 1)} value={it.quote} onChange={v => updateList('testimonials.items', l => l.map(x => x.id === it.id ? { ...x, quote: v } : x))} multiline rows={3} />
              <div className="row-3">
                <Text label="Nombre" value={it.name} onChange={v => updateList('testimonials.items', l => l.map(x => x.id === it.id ? { ...x, name: v } : x))} />
                <Text label="Rol / Iglesia" value={it.role} onChange={v => updateList('testimonials.items', l => l.map(x => x.id === it.id ? { ...x, role: v } : x))} />
                <Text label="Inicial avatar" value={it.initial} onChange={v => updateList('testimonials.items', l => l.map(x => x.id === it.id ? { ...x, initial: v.slice(0,1).toUpperCase() } : x))} />
              </div>
            </div>
            <div className="prod-edit__actions">
              <button className="abtn ghost sm" disabled={i === 0} onClick={() => updateList('testimonials.items', l => { const a = [...l]; [a[i-1], a[i]] = [a[i], a[i-1]]; return a; })}>↑</button>
              <button className="abtn ghost sm" disabled={i === t.items.length - 1} onClick={() => updateList('testimonials.items', l => { const a = [...l]; [a[i+1], a[i]] = [a[i], a[i+1]]; return a; })}>↓</button>
              <button className="abtn danger sm" onClick={() => updateList('testimonials.items', l => l.filter(x => x.id !== it.id))}>Eliminar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ----- View: CTA -----
function ViewCTA({ content, store }) {
  const { update } = store;
  const c = content.cta;
  return (
    <React.Fragment>
      <SectionTokens groupName="CTA Final" content={content} store={store} />
    <div className="card">
      <div className="card__head"><h3>Bloque CTA final</h3><span className="meta">A− / A+ controla el tamaño</span></div>
      <div className="row-3">
        <EditText label="Título" value={c.title} onChange={v => update('cta.title', v)} sizePath="ctaMax" sizeMin={60} sizeMax={260} sizeStep={4} content={content} store={store} />
        <EditText label="Acento (ámbar)" value={c.titleEm} onChange={v => update('cta.titleEm', v)} sizePath="ctaMax" sizeMin={60} sizeMax={260} sizeStep={4} content={content} store={store} />
        <EditText label="Texto final" value={c.titleAfter} onChange={v => update('cta.titleAfter', v)} sizePath="ctaMax" sizeMin={60} sizeMax={260} sizeStep={4} content={content} store={store} />
      </div>
      <Text label="Cuerpo" value={c.body} onChange={v => update('cta.body', v)} multiline />
      <div className="row">
        <Text label="CTA 1 — texto" value={c.primaryCta.label} onChange={v => update('cta.primaryCta.label', v)} />
        <Text label="CTA 1 — enlace" value={c.primaryCta.href} onChange={v => update('cta.primaryCta.href', v)} />
        <Text label="CTA 2 — texto" value={c.secondaryCta.label} onChange={v => update('cta.secondaryCta.label', v)} />
        <Text label="CTA 2 — enlace" value={c.secondaryCta.href} onChange={v => update('cta.secondaryCta.href', v)} />
      </div>
    </div>
    </React.Fragment>
  );
}

// ----- View: Footer -----
function ViewFooter({ content, store }) {
  const { update, updateList } = store;
  const f = content.footer;
  return (
    <div>
      <SectionTokens groupName="Footer" content={content} store={store} />
      <div className="card">
        <div className="card__head"><h3>Wordmark y descripción</h3></div>
        <div className="row">
          <Text label="Wordmark — parte 1" value={f.wordmark} onChange={v => update('footer.wordmark', v)} />
          <Text label="Wordmark — parte 2 (acceso secreto al Club)" value={f.wordmarkSecret} onChange={v => update('footer.wordmarkSecret', v)} hint="Click abre el Club" />
        </div>
        <Text label="Descripción" value={f.about} onChange={v => update('footer.about', v)} multiline />
        <div className="row">
          <Text label="Línea inferior izquierda" value={f.bottomLeft} onChange={v => update('footer.bottomLeft', v)} />
          <Text label="Línea inferior derecha" value={f.bottomRight} onChange={v => update('footer.bottomRight', v)} />
        </div>
      </div>

      {f.cols.map((col, ci) => (
        <div className="card" key={col.id}>
          <div className="card__head">
            <h3>Columna — {col.title}</h3>
            <button className="abtn sm" onClick={() => updateList('footer.cols', l => l.map(c => c.id === col.id ? { ...c, items: [...c.items, { id: 'i' + Date.now(), label: 'Nuevo', href: '#' }] } : c))}>+ Item</button>
          </div>
          <Text label="Título columna" value={col.title} onChange={v => updateList('footer.cols', l => l.map(c => c.id === col.id ? { ...c, title: v } : c))} />
          {col.items.map(it => (
            <div className="row" key={it.id} style={{ gridTemplateColumns: '1fr 1fr auto', alignItems: 'end' }}>
              <Text label="Etiqueta" value={it.label} onChange={v => updateList('footer.cols', l => l.map(c => c.id === col.id ? { ...c, items: c.items.map(x => x.id === it.id ? { ...x, label: v } : x) } : c))} />
              <Text label="Enlace" value={it.href} onChange={v => updateList('footer.cols', l => l.map(c => c.id === col.id ? { ...c, items: c.items.map(x => x.id === it.id ? { ...x, href: v } : x) } : c))} />
              <button className="abtn danger sm" style={{ marginBottom: 14 }} onClick={() => updateList('footer.cols', l => l.map(c => c.id === col.id ? { ...c, items: c.items.filter(x => x.id !== it.id) } : c))}>×</button>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ----- View: Navigation -----
function ViewNav({ content, store }) {
  const { update, updateList } = store;
  const n = content.nav;
  return (
    <div>
      <SectionTokens groupName="Nav (menú superior)" content={content} store={store} />
      <div className="card">
        <div className="card__head">
          <h3>Enlaces del menú</h3>
          <button className="abtn sm" onClick={() => updateList('nav.links', l => [...l, { id: 'l' + Date.now(), label: 'Nuevo', href: '#' }])}>+ Link</button>
        </div>
        <p style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--gray)', marginBottom: 14, lineHeight: 1.5 }}>
          Marca <strong>"Dropdown"</strong> en un enlace para que despliegue las subcategorías de Productos.
        </p>
        {n.links.map((l, i) => (
          <div className="prod-edit" key={l.id} style={{ gridTemplateColumns: '1fr auto' }}>
            <div className="prod-edit__fields">
              <div className="row">
                <Text label="Etiqueta" value={l.label} onChange={v => updateList('nav.links', list => list.map(x => x.id === l.id ? { ...x, label: v } : x))} />
                <Text label="Enlace (#ancla)" value={l.href} onChange={v => updateList('nav.links', list => list.map(x => x.id === l.id ? { ...x, href: v } : x))} />
              </div>
              <Toggle
                label="Mostrar subcategorías de Productos como dropdown"
                value={!!l.dropdown}
                onChange={v => updateList('nav.links', list => list.map(x => x.id === l.id ? { ...x, dropdown: v } : x))}
              />
            </div>
            <div className="prod-edit__actions">
              <button className="abtn ghost sm" disabled={i === 0} onClick={() => updateList('nav.links', list => { const a = [...list]; [a[i-1], a[i]] = [a[i], a[i-1]]; return a; })}>↑</button>
              <button className="abtn ghost sm" disabled={i === n.links.length - 1} onClick={() => updateList('nav.links', list => { const a = [...list]; [a[i+1], a[i]] = [a[i], a[i+1]]; return a; })}>↓</button>
              <button className="abtn danger sm" onClick={() => updateList('nav.links', list => list.filter(x => x.id !== l.id))}>×</button>
            </div>
          </div>
        ))}
      </div>
      <div className="card">
        <div className="card__head"><h3>CTA del nav</h3></div>
        <div className="row">
          <Text label="Texto" value={n.cta.label} onChange={v => update('nav.cta.label', v)} />
          <Text label="Enlace" value={n.cta.href} onChange={v => update('nav.cta.href', v)} />
        </div>
      </div>
    </div>
  );
}

// ----- Club: Panel de Miembros y Anotados -----
function ClubMembersPanel() {
  const [members, setMembers]   = React.useState(null);
  const [signups, setSignups]   = React.useState(null);
  const [log, setLog]           = React.useState(null);
  const [tab, setTab]           = React.useState('members');
  const [form, setForm]         = React.useState({ name: '', email: '', notes: '' });
  const [newMember, setNewMember] = React.useState(null);
  const [busy, setBusy]         = React.useState(false);
  const SVC = sessionStorage.getItem('ruah-admin-session') || '';

  function load() {
    fetch('' + window.RUAH_API + '/api/club/members',    { headers: { 'x-admin-key': SVC } }).then(r => r.json()).then(setMembers).catch(() => setMembers([]));
    fetch('' + window.RUAH_API + '/api/club/signups',    { headers: { 'x-admin-key': SVC } }).then(r => r.json()).then(setSignups).catch(() => setSignups([]));
    fetch('' + window.RUAH_API + '/api/club/access-log', { headers: { 'x-admin-key': SVC } }).then(r => r.json()).then(setLog).catch(() => setLog([]));
  }
  React.useEffect(load, []);

  function createMember(e) {
    e.preventDefault();
    setBusy(true);
    fetch('' + window.RUAH_API + '/api/club/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': SVC },
      body: JSON.stringify(form),
    }).then(r => r.json()).then(d => {
      setBusy(false);
      if (d.error) { alert('Error: ' + JSON.stringify(d.error)); return; }
      setNewMember(d);
      setForm({ name: '', email: '', notes: '' });
      load();
    }).catch(() => setBusy(false));
  }

  function deactivate(email) {
    if (!confirm('¿Desactivar acceso de ' + email + '?')) return;
    fetch('' + window.RUAH_API + '/api/club/members/' + encodeURIComponent(email), {
      method: 'DELETE', headers: { 'x-admin-key': SVC },
    }).then(load);
  }

  function fmt(d) { return d ? new Date(d).toLocaleString('es-CL', { dateStyle: 'short', timeStyle: 'short' }) : '—'; }

  return (
    <div className="card" style={{ marginTop: 24 }}>
      <div className="card__head">
        <h3>Club · Miembros y Accesos</h3>
        <div style={{ display: 'flex', gap: 6 }}>
          {['members','signups','log'].map(t => (
            <button key={t} className={'abtn sm' + (tab === t ? ' amber' : '')} onClick={() => setTab(t)}>
              {t === 'members' ? 'Miembros' : t === 'signups' ? 'Anotados' : 'Log'}
            </button>
          ))}
          <button className="abtn sm" onClick={load}>↺</button>
        </div>
      </div>

      {tab === 'members' && (
        <div>
          <form onSubmit={createMember} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', padding: '0 0 16px' }}>
            <input className="inp" placeholder="Nombre" value={form.name}  onChange={e => setForm(f => ({...f, name: e.target.value}))}  required style={{ flex: 1, minWidth: 120 }} />
            <input className="inp" placeholder="Email"  value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} required type="email" style={{ flex: 1, minWidth: 160 }} />
            <input className="inp" placeholder="Notas"  value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))} style={{ flex: 1, minWidth: 120 }} />
            <button className="abtn amber" type="submit" disabled={busy}>{busy ? '...' : '+ Crear'}</button>
          </form>

          {newMember && (
            <div style={{ background: '#0a2a0a', border: '1px solid #2a6a2a', padding: '10px 14px', marginBottom: 12, fontSize: 13, fontFamily: 'monospace' }}>
              ✅ Miembro creado — envía estas credenciales por correo:<br/>
              <strong>Email:</strong> {newMember.email} &nbsp;|&nbsp;
              <strong>Contraseña inicial:</strong> <code style={{ color: '#eca10c' }}>{newMember.password}</code>
              <button className="abtn sm" style={{ marginLeft: 12 }} onClick={() => setNewMember(null)}>×</button>
            </div>
          )}

          {!members ? <p style={{ color: '#888', padding: 8 }}>Cargando…</p> : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead><tr style={{ borderBottom: '1px solid #333', color: '#888' }}>
                <th style={{ textAlign: 'left', padding: '4px 8px' }}>Nombre</th>
                <th style={{ textAlign: 'left', padding: '4px 8px' }}>Email</th>
                <th style={{ textAlign: 'left', padding: '4px 8px' }}>Último acceso</th>
                <th style={{ textAlign: 'left', padding: '4px 8px' }}>Estado</th>
                <th></th>
              </tr></thead>
              <tbody>{members.map(m => (
                <tr key={m.id} style={{ borderBottom: '1px solid #1a1a1a' }}>
                  <td style={{ padding: '6px 8px' }}>{m.name}</td>
                  <td style={{ padding: '6px 8px', color: '#eca10c' }}>{m.email}</td>
                  <td style={{ padding: '6px 8px', color: '#888' }}>{fmt(m.last_login_at)}</td>
                  <td style={{ padding: '6px 8px' }}>
                    <span style={{ color: m.is_active ? '#4caf50' : '#f44336' }}>{m.is_active ? '● Activo' : '○ Inactivo'}</span>
                    {m.must_change_password && <span style={{ color: '#888', marginLeft: 8, fontSize: 11 }}>clave pendiente</span>}
                  </td>
                  <td style={{ padding: '6px 8px' }}>
                    {m.is_active && <button className="abtn danger sm" onClick={() => deactivate(m.email)}>Desactivar</button>}
                  </td>
                </tr>
              ))}</tbody>
            </table>
          )}
        </div>
      )}

      {tab === 'signups' && (
        <div>
          {!signups ? <p style={{ color: '#888', padding: 8 }}>Cargando…</p> : signups.length === 0 ? <p style={{ color: '#888', padding: 8 }}>Sin anotaciones aún.</p> : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead><tr style={{ borderBottom: '1px solid #333', color: '#888' }}>
                <th style={{ textAlign: 'left', padding: '4px 8px' }}>Email</th>
                <th style={{ textAlign: 'left', padding: '4px 8px' }}>Ruta</th>
                <th style={{ textAlign: 'left', padding: '4px 8px' }}>Fecha</th>
              </tr></thead>
              <tbody>{signups.map(s => (
                <tr key={s.id} style={{ borderBottom: '1px solid #1a1a1a' }}>
                  <td style={{ padding: '6px 8px', color: '#eca10c' }}>{s.email}</td>
                  <td style={{ padding: '6px 8px' }}>{s.route_name}</td>
                  <td style={{ padding: '6px 8px', color: '#888' }}>{fmt(s.created_at)}</td>
                </tr>
              ))}</tbody>
            </table>
          )}
        </div>
      )}

      {tab === 'log' && (
        <div>
          {!log ? <p style={{ color: '#888', padding: 8 }}>Cargando…</p> : log.length === 0 ? <p style={{ color: '#888', padding: 8 }}>Sin accesos registrados.</p> : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead><tr style={{ borderBottom: '1px solid #333', color: '#888' }}>
                <th style={{ textAlign: 'left', padding: '4px 8px' }}>Email</th>
                <th style={{ textAlign: 'left', padding: '4px 8px' }}>Acción</th>
                <th style={{ textAlign: 'left', padding: '4px 8px' }}>Fecha</th>
              </tr></thead>
              <tbody>{log.map(l => (
                <tr key={l.id} style={{ borderBottom: '1px solid #1a1a1a' }}>
                  <td style={{ padding: '6px 8px', color: '#eca10c' }}>{l.email}</td>
                  <td style={{ padding: '6px 8px' }}>
                    <span style={{ color: l.action === 'login_ok' ? '#4caf50' : l.action === 'login_fail' ? '#f44336' : '#eca10c' }}>
                      {l.action}
                    </span>
                  </td>
                  <td style={{ padding: '6px 8px', color: '#888' }}>{fmt(l.created_at)}</td>
                </tr>
              ))}</tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

// ----- View: Club -----
function ViewClub({ content, store }) {
  const { update, updateList } = store;
  const c = content.club;
  return (
    <div>
      <ClubMembersPanel />
      <SectionTokens groupName="Club Secreto" content={content} store={store} />
      <div className="card">
        <div className="card__head"><h3>Cabecera del Club</h3></div>
        <Text label="Eyebrow" value={c.heroEyebrow} onChange={v => update('club.heroEyebrow', v)} />
        <div className="row">
          <Text label="Título" value={c.title} onChange={v => update('club.title', v)} />
          <Text label="Acento" value={c.titleEm} onChange={v => update('club.titleEm', v)} />
        </div>
        <Text label="Frase introductoria" value={c.frase} onChange={v => update('club.frase', v)} multiline rows={4} />
      </div>

      <div className="card">
        <div className="card__head">
          <h3>Paneles destacados (3)</h3>
          <button className="abtn sm" onClick={() => updateList('club.panels', l => [...l, { id: 'cp' + Date.now(), ttl: 'NUEVO', big: '0', desc: '' }])}>+ Panel</button>
        </div>
        {c.panels.map((p, i) => (
          <div className="prod-edit" key={p.id} style={{ gridTemplateColumns: '60px 1fr auto' }}>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 28 }}>#{i + 1}</div>
            <div className="prod-edit__fields">
              <div className="row-3">
                <Text label="Etiqueta" value={p.ttl} onChange={v => updateList('club.panels', l => l.map(x => x.id === p.id ? { ...x, ttl: v } : x))} />
                <Text label="Número grande" value={p.big} onChange={v => updateList('club.panels', l => l.map(x => x.id === p.id ? { ...x, big: v } : x))} />
                <Text label="Descripción" value={p.desc} onChange={v => updateList('club.panels', l => l.map(x => x.id === p.id ? { ...x, desc: v } : x))} />
              </div>
            </div>
            <div className="prod-edit__actions">
              <button className="abtn danger sm" onClick={() => updateList('club.panels', l => l.filter(x => x.id !== p.id))}>×</button>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card__head">
          <h3>Rutas — {c.routes.length}</h3>
          <button className="abtn amber sm" onClick={() => updateList('club.routes', l => [...l, { id: 'r' + Date.now(), name: 'Nueva ruta', date: '00 MES · 00:00', meta: '', joined: false }])}>+ Ruta</button>
        </div>
        {c.routes.map(r => (
          <div className="prod-edit" key={r.id} style={{ gridTemplateColumns: '1fr auto' }}>
            <div className="prod-edit__fields">
              <div className="row">
                <Text label="Nombre" value={r.name} onChange={v => updateList('club.routes', l => l.map(x => x.id === r.id ? { ...x, name: v } : x))} />
                <Text label="Fecha · Hora" value={r.date} onChange={v => updateList('club.routes', l => l.map(x => x.id === r.id ? { ...x, date: v } : x))} />
              </div>
              <Text label="Detalle (punto, cupos, prendas)" value={r.meta} onChange={v => updateList('club.routes', l => l.map(x => x.id === r.id ? { ...x, meta: v } : x))} multiline rows={2} />
            </div>
            <div className="prod-edit__actions">
              <button className="abtn danger sm" onClick={() => updateList('club.routes', l => l.filter(x => x.id !== r.id))}>×</button>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card__head">
          <h3>Reuniones — {c.meetings.length}</h3>
          <button className="abtn amber sm" onClick={() => updateList('club.meetings', l => [...l, { id: 'm' + Date.now(), day: '00', mon: 'MES', name: 'Nueva reunión', det: '' }])}>+ Reunión</button>
        </div>
        {c.meetings.map(m => (
          <div className="prod-edit" key={m.id} style={{ gridTemplateColumns: '1fr auto' }}>
            <div className="prod-edit__fields">
              <div className="row-3">
                <Text label="Día" value={m.day} onChange={v => updateList('club.meetings', l => l.map(x => x.id === m.id ? { ...x, day: v } : x))} />
                <Text label="Mes" value={m.mon} onChange={v => updateList('club.meetings', l => l.map(x => x.id === m.id ? { ...x, mon: v } : x))} />
                <Text label="Nombre" value={m.name} onChange={v => updateList('club.meetings', l => l.map(x => x.id === m.id ? { ...x, name: v } : x))} />
              </div>
              <Text label="Detalle" value={m.det} onChange={v => updateList('club.meetings', l => l.map(x => x.id === m.id ? { ...x, det: v } : x))} />
            </div>
            <div className="prod-edit__actions">
              <button className="abtn danger sm" onClick={() => updateList('club.meetings', l => l.filter(x => x.id !== m.id))}>×</button>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card__head">
          <h3>Feed inicial — {c.feed.length}</h3>
          <button className="abtn sm" onClick={() => updateList('club.feed', l => [...l, { id: 'f' + Date.now(), when: 'HOY · ANÓNIMO', what: '' }])}>+ Mensaje</button>
        </div>
        {c.feed.map(f => (
          <div className="prod-edit" key={f.id} style={{ gridTemplateColumns: '1fr auto' }}>
            <div className="prod-edit__fields">
              <Text label="Cuándo · Quién" value={f.when} onChange={v => updateList('club.feed', l => l.map(x => x.id === f.id ? { ...x, when: v } : x))} />
              <Text label="Mensaje" value={f.what} onChange={v => updateList('club.feed', l => l.map(x => x.id === f.id ? { ...x, what: v } : x))} multiline rows={2} />
            </div>
            <div className="prod-edit__actions">
              <button className="abtn danger sm" onClick={() => updateList('club.feed', l => l.filter(x => x.id !== f.id))}>×</button>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card__head">
          <h3>Registro Fotográfico — {(c.photos || []).length} fotos</h3>
          <button className="abtn amber sm" onClick={() => updateList('club.photos', l => [...(l || []), { id: 'ph' + Date.now(), img: '', caption: 'Nueva foto' }])}>+ Foto</button>
        </div>
        <p style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--gray)', marginBottom: 16, lineHeight: 1.55 }}>
          Estas fotos aparecen en la pestaña D / REGISTRO FOTOGRÁFICO del Club, con fondo negro y letras en ámbar. Sólo ven los miembros autenticados.
        </p>
        <div className="row">
          <Text label="Título de sección" value={c.photoRegistryTitle || ''} onChange={v => update('club.photoRegistryTitle', v)} />
          <Text label="Subtítulo" value={c.photoRegistrySubtitle || ''} onChange={v => update('club.photoRegistrySubtitle', v)} />
        </div>
        <div className="divider">Fotos — {(c.photos || []).length}</div>
        {(c.photos || []).map((p, i) => (
          <div className="prod-edit" key={p.id} style={{ gridTemplateColumns: '120px 1fr auto' }}>
            <label className="prod-edit__media" style={{ aspectRatio: '1 / 1', height: 'auto' }}>
              {p.img
                ? <img src={p.img} alt={p.caption} />
                : <span>Subir<br/>foto</span>}
              <input
                type="file" accept="image/*"
                onChange={async e => {
                  const f = e.target.files && e.target.files[0]; if (!f) return;
                  const url = await uploadToCloudinary(f);
                  updateList('club.photos', l => l.map(x => x.id === p.id ? { ...x, img: url } : x));
                }}
              />
            </label>
            <div className="prod-edit__fields">
              <Text label="Caption / descripción" value={p.caption} onChange={v => updateList('club.photos', l => l.map(x => x.id === p.id ? { ...x, caption: v } : x))} />
              {p.img && <button type="button" className="abtn danger sm" style={{ alignSelf: 'flex-start', marginTop: 6 }} onClick={() => updateList('club.photos', l => l.map(x => x.id === p.id ? { ...x, img: '' } : x))}>Quitar foto</button>}
            </div>
            <div className="prod-edit__actions">
              <button className="abtn ghost sm" disabled={i === 0} onClick={() => updateList('club.photos', l => { const a = [...l]; [a[i-1], a[i]] = [a[i], a[i-1]]; return a; })}>↑</button>
              <button className="abtn ghost sm" disabled={i === (c.photos || []).length - 1} onClick={() => updateList('club.photos', l => { const a = [...l]; [a[i+1], a[i]] = [a[i], a[i+1]]; return a; })}>↓</button>
              <button className="abtn danger sm" onClick={() => updateList('club.photos', l => l.filter(x => x.id !== p.id))}>×</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChangePasswordField({ label, hint, onSave }) {
  const [open, setOpen] = React.useState(false);
  const [val, setVal]   = React.useState('');
  const [done, setDone] = React.useState(false);

  async function save(e) {
    e && e.preventDefault();
    if (!val.trim()) return;
    await onSave(val.trim());
    setVal(''); setOpen(false); setDone(true);
    setTimeout(() => setDone(false), 3000);
  }

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 11, letterSpacing: '0.08em', color: 'var(--gray-soft)', marginBottom: 6 }}>{label}</div>
      {hint && <div style={{ fontSize: 11, color: 'var(--gray-soft)', marginBottom: 8, opacity: 0.7 }}>{hint}</div>}
      {!open ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontFamily: 'var(--mono)', letterSpacing: '0.1em', fontSize: 14 }}>••••••••</span>
          <button type="button" className="abtn sm ghost" onClick={() => setOpen(true)}>Cambiar</button>
          {done && <span style={{ fontSize: 11, color: 'var(--amber)' }}>✓ Guardado</span>}
        </div>
      ) : (
        <form onSubmit={save} style={{ display: 'flex', gap: 8 }}>
          <input className="input" type="password" value={val} onChange={e => setVal(e.target.value)} placeholder="Nueva contraseña" autoFocus style={{ flex: 1, fontSize: 13 }} />
          <button type="submit" className="abtn sm amber">Guardar</button>
          <button type="button" className="abtn sm ghost" onClick={() => { setOpen(false); setVal(''); }}>Cancelar</button>
        </form>
      )}
    </div>
  );
}

// ----- View: Settings -----
function ViewSettings({ store }) {
  const fileRef = React.useRef(null);
  return (
    <div>
      <div className="card">
        <div className="card__head"><h3>Respaldos</h3></div>
        <p style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--gray)', marginBottom: 16, lineHeight: 1.55 }}>
          Exporta todo el contenido como archivo JSON para respaldarlo o transferirlo. Importa un archivo para restaurar.
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="abtn amber" onClick={store.exportJSON}>↓ Exportar JSON</button>
          <button className="abtn ghost" onClick={() => fileRef.current?.click()}>↑ Importar JSON</button>
          <input ref={fileRef} type="file" accept="application/json" style={{ display: 'none' }} onChange={e => e.target.files[0] && store.importJSON(e.target.files[0])} />
        </div>
      </div>
      <div className="card">
        <div className="card__head"><h3>Zona peligrosa</h3></div>
        <p style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--gray)', marginBottom: 16 }}>
          Esto borra todos los cambios y restaura el contenido original.
        </p>
        <button className="abtn danger" onClick={store.reset}>⨯ Restablecer todo</button>
      </div>
    </div>
  );
}

// ----- View: Cuadros -----
function ViewCuadros({ content, store }) {
  const { update, updateList } = store;
  const c = content.cuadros;
  return (
    <div>
      <SectionTokens groupName="Cuadros" content={content} store={store} />
      <div className="card">
        <div className="card__head"><h3>Cabecera de sección</h3></div>
        <div className="row-3">
          <Text label="Índice (ej. §05 / 06)" value={c.headerIndex} onChange={v => update('cuadros.headerIndex', v)} />
          <Text label="Título" value={c.headerTitle} onChange={v => update('cuadros.headerTitle', v)} />
          <Text label="Derecha" value={c.headerRight} onChange={v => update('cuadros.headerRight', v)} />
        </div>
      </div>

      <div className="card">
        <div className="card__head"><h3>Hero · Cuadros</h3><span className="meta">A− / A+ controla el tamaño del título grande</span></div>
        <div className="row-3">
          <EditText label="Título — línea 1" value={c.title1} onChange={v => update('cuadros.title1', v)} sizePath="cuadrosTitleMax" sizeMin={60} sizeMax={240} sizeStep={4} content={content} store={store} />
          <EditText label="Título — línea 2" value={c.title2} onChange={v => update('cuadros.title2', v)} sizePath="cuadrosTitleMax" sizeMin={60} sizeMax={240} sizeStep={4} content={content} store={store} />
          <EditText label="Título — línea 3" value={c.title3} onChange={v => update('cuadros.title3', v)} sizePath="cuadrosTitleMax" sizeMin={60} sizeMax={240} sizeStep={4} content={content} store={store} />
        </div>
        <Text label="Bajada / Lede" value={c.lede} onChange={v => update('cuadros.lede', v)} multiline rows={4} />
      </div>

      <div className="card">
        <div className="card__head">
          <h3>Estilos (cards) — {c.styles.length}</h3>
          <button className="abtn sm" onClick={() => updateList('cuadros.styles', l => [...l, { id: 'cs' + Date.now(), tag: 'NUEVO', desc: 'DESCRIPCIÓN' }])}>+ Estilo</button>
        </div>
        {c.styles.map((s, i) => (
          <div className="prod-edit" key={s.id} style={{ gridTemplateColumns: '120px 1fr auto' }}>
            <label className="prod-edit__media" style={{ aspectRatio: '1 / 1', height: 'auto' }}>
              {s.img
                ? <img src={s.img} alt={s.tag} />
                : <span>Subir<br/>foto</span>}
              <input
                type="file" accept="image/*"
                onChange={async e => {
                  const f = e.target.files && e.target.files[0]; if (!f) return;
                  const url = await uploadToCloudinary(f);
                  updateList('cuadros.styles', l => l.map(x => x.id === s.id ? { ...x, img: url } : x));
                }}
              />
            </label>
            <div className="prod-edit__fields">
              <div className="row">
                <Text label="Tag" value={s.tag} onChange={v => updateList('cuadros.styles', l => l.map(x => x.id === s.id ? { ...x, tag: v } : x))} />
                <Text label="Descripción corta" value={s.desc} onChange={v => updateList('cuadros.styles', l => l.map(x => x.id === s.id ? { ...x, desc: v } : x))} />
              </div>
              {s.img && <button type="button" className="abtn danger sm" style={{ alignSelf: 'flex-start' }} onClick={() => updateList('cuadros.styles', l => l.map(x => x.id === s.id ? { ...x, img: '' } : x))}>Quitar foto</button>}
            </div>
            <div className="prod-edit__actions">
              <button className="abtn ghost sm" disabled={i === 0} onClick={() => updateList('cuadros.styles', l => { const a = [...l]; [a[i-1], a[i]] = [a[i], a[i-1]]; return a; })}>↑</button>
              <button className="abtn ghost sm" disabled={i === c.styles.length - 1} onClick={() => updateList('cuadros.styles', l => { const a = [...l]; [a[i+1], a[i]] = [a[i], a[i+1]]; return a; })}>↓</button>
              <button className="abtn danger sm" onClick={() => updateList('cuadros.styles', l => l.filter(x => x.id !== s.id))}>×</button>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card__head"><h3>Brief · cabecera</h3></div>
        <Text label="Eyebrow" value={c.briefEyebrow} onChange={v => update('cuadros.briefEyebrow', v)} />
        <Text label="Título" value={c.briefTitle} onChange={v => update('cuadros.briefTitle', v)} />
        <Text label="Subtítulo" value={c.briefSub} onChange={v => update('cuadros.briefSub', v)} multiline rows={3} />
      </div>

      <div className="card">
        <div className="card__head">
          <h3>Pasos del brief — {c.steps.length}</h3>
        </div>
        <p style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--gray)', marginBottom: 12, lineHeight: 1.55 }}>
          Los 4 pasos (01-EXPLORAR, 02-ESTILO, 03-FORMATO, 04-ENVIAR) controlan los tabs. Edita su nombre y número aquí.
        </p>
        {c.steps.map((s) => (
          <div className="prod-edit" key={s.id} style={{ gridTemplateColumns: '1fr auto' }}>
            <div className="prod-edit__fields">
              <div className="row">
                <Text label="Número" value={s.num} onChange={v => updateList('cuadros.steps', l => l.map(x => x.id === s.id ? { ...x, num: v } : x))} />
                <Text label="Nombre" value={s.name} onChange={v => updateList('cuadros.steps', l => l.map(x => x.id === s.id ? { ...x, name: v } : x))} />
              </div>
            </div>
            <div className="prod-edit__actions">
              <button className="abtn danger sm" onClick={() => updateList('cuadros.steps', l => l.filter(x => x.id !== s.id))}>×</button>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card__head"><h3>Paso 01 · EXPLORAR</h3></div>
        <Text label="Texto introductorio" value={c.step1Body} onChange={v => update('cuadros.step1Body', v)} multiline rows={3} />
        <div className="divider">Referencias (3-6)</div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
          <button className="abtn amber sm" onClick={() => updateList('cuadros.refs', l => [...l, { id: 'cr' + Date.now(), code: 'REF ' + String(l.length + 1).padStart(2, '0'), name: 'NUEVO', meta: '' }])}>+ Referencia</button>
        </div>
        {c.refs.map((r, i) => (
          <div className="prod-edit" key={r.id} style={{ gridTemplateColumns: '120px 1fr auto' }}>
            <label className="prod-edit__media" style={{ aspectRatio: '4 / 3', height: 'auto' }}>
              {r.img
                ? <img src={r.img} alt={r.name} />
                : <span>Subir<br/>foto</span>}
              <input
                type="file" accept="image/*"
                onChange={async e => {
                  const f = e.target.files && e.target.files[0]; if (!f) return;
                  const url = await uploadToCloudinary(f);
                  updateList('cuadros.refs', l => l.map(x => x.id === r.id ? { ...x, img: url } : x));
                }}
              />
            </label>
            <div className="prod-edit__fields">
              <div className="row-3">
                <Text label="Código" value={r.code} onChange={v => updateList('cuadros.refs', l => l.map(x => x.id === r.id ? { ...x, code: v } : x))} />
                <Text label="Nombre" value={r.name} onChange={v => updateList('cuadros.refs', l => l.map(x => x.id === r.id ? { ...x, name: v } : x))} />
                <Text label="Meta" value={r.meta} onChange={v => updateList('cuadros.refs', l => l.map(x => x.id === r.id ? { ...x, meta: v } : x))} />
              </div>
              {r.img && <button type="button" className="abtn danger sm" style={{ alignSelf: 'flex-start', marginTop: 6 }} onClick={() => updateList('cuadros.refs', l => l.map(x => x.id === r.id ? { ...x, img: '' } : x))}>Quitar foto</button>}
            </div>
            <div className="prod-edit__actions">
              <button className="abtn ghost sm" disabled={i === 0} onClick={() => updateList('cuadros.refs', l => { const a = [...l]; [a[i-1], a[i]] = [a[i], a[i-1]]; return a; })}>↑</button>
              <button className="abtn ghost sm" disabled={i === c.refs.length - 1} onClick={() => updateList('cuadros.refs', l => { const a = [...l]; [a[i+1], a[i]] = [a[i], a[i+1]]; return a; })}>↓</button>
              <button className="abtn danger sm" onClick={() => updateList('cuadros.refs', l => l.filter(x => x.id !== r.id))}>×</button>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card__head">
          <h3>Paso 02 · ESTILO — {(c.estilos || []).length} opciones</h3>
          <button className="abtn sm" onClick={() => updateList('cuadros.estilos', l => [...(l||[]), { id: 'ce' + Date.now(), name: 'NUEVO ESTILO' }])}>+ Opción</button>
        </div>
        {(c.estilos || []).map((e, i) => (
          <div className="prod-edit" key={e.id} style={{ gridTemplateColumns: '1fr auto' }}>
            <div className="prod-edit__fields">
              <Text label={'Estilo ' + (i + 1)} value={e.name} onChange={v => updateList('cuadros.estilos', l => l.map(x => x.id === e.id ? { ...x, name: v } : x))} />
            </div>
            <div className="prod-edit__actions">
              <button className="abtn ghost sm" disabled={i === 0} onClick={() => updateList('cuadros.estilos', l => { const a = [...l]; [a[i-1], a[i]] = [a[i], a[i-1]]; return a; })}>↑</button>
              <button className="abtn ghost sm" disabled={i === (c.estilos||[]).length - 1} onClick={() => updateList('cuadros.estilos', l => { const a = [...l]; [a[i+1], a[i]] = [a[i], a[i+1]]; return a; })}>↓</button>
              <button className="abtn danger sm" onClick={() => updateList('cuadros.estilos', l => l.filter(x => x.id !== e.id))}>×</button>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card__head">
          <h3>Paso 03 · FORMATO — {(c.formatos || []).length} opciones</h3>
          <button className="abtn amber sm" onClick={() => updateList('cuadros.formatos', l => [...(l||[]), { id: 'cf' + Date.now(), size: 'NUEVO', price: '$0' }])}>+ Formato</button>
        </div>
        {(c.formatos || []).map((f, i) => (
          <div className="prod-edit" key={f.id} style={{ gridTemplateColumns: '1fr auto' }}>
            <div className="prod-edit__fields">
              <div className="row">
                <Text label="Tamaño" value={f.size} onChange={v => updateList('cuadros.formatos', l => l.map(x => x.id === f.id ? { ...x, size: v } : x))} />
                <Text label="Precio" value={f.price} onChange={v => updateList('cuadros.formatos', l => l.map(x => x.id === f.id ? { ...x, price: v } : x))} />
              </div>
            </div>
            <div className="prod-edit__actions">
              <button className="abtn ghost sm" disabled={i === 0} onClick={() => updateList('cuadros.formatos', l => { const a = [...l]; [a[i-1], a[i]] = [a[i], a[i-1]]; return a; })}>↑</button>
              <button className="abtn ghost sm" disabled={i === (c.formatos||[]).length - 1} onClick={() => updateList('cuadros.formatos', l => { const a = [...l]; [a[i+1], a[i]] = [a[i], a[i+1]]; return a; })}>↓</button>
              <button className="abtn danger sm" onClick={() => updateList('cuadros.formatos', l => l.filter(x => x.id !== f.id))}>×</button>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card__head">
          <h3>Paso 04 · ENVIAR — {(c.sendFields || []).length} campos</h3>
          <button className="abtn sm" onClick={() => updateList('cuadros.sendFields', l => [...(l||[]), { id: 'cf' + Date.now(), label: 'NUEVO', placeholder: '', type: 'text' }])}>+ Campo</button>
        </div>
        <Text label="Texto del botón" value={c.sendSubmit} onChange={v => update('cuadros.sendSubmit', v)} />
        <div className="divider">Campos del formulario</div>
        {(c.sendFields || []).map((f, i) => (
          <div className="prod-edit" key={f.id} style={{ gridTemplateColumns: '1fr auto' }}>
            <div className="prod-edit__fields">
              <div className="row-3">
                <Text label="Etiqueta" value={f.label} onChange={v => updateList('cuadros.sendFields', l => l.map(x => x.id === f.id ? { ...x, label: v } : x))} />
                <Text label="Placeholder" value={f.placeholder} onChange={v => updateList('cuadros.sendFields', l => l.map(x => x.id === f.id ? { ...x, placeholder: v } : x))} />
                <Field label="Tipo">
                  <select className="select" value={f.type || 'text'} onChange={e => updateList('cuadros.sendFields', l => l.map(x => x.id === f.id ? { ...x, type: e.target.value } : x))}>
                    <option value="text">Texto</option>
                    <option value="email">Email</option>
                    <option value="textarea">Textarea</option>
                  </select>
                </Field>
              </div>
            </div>
            <div className="prod-edit__actions">
              <button className="abtn ghost sm" disabled={i === 0} onClick={() => updateList('cuadros.sendFields', l => { const a = [...l]; [a[i-1], a[i]] = [a[i], a[i-1]]; return a; })}>↑</button>
              <button className="abtn ghost sm" disabled={i === (c.sendFields||[]).length - 1} onClick={() => updateList('cuadros.sendFields', l => { const a = [...l]; [a[i+1], a[i]] = [a[i], a[i+1]]; return a; })}>↓</button>
              <button className="abtn danger sm" onClick={() => updateList('cuadros.sendFields', l => l.filter(x => x.id !== f.id))}>×</button>
            </div>
          </div>
        ))}
      </div>

      {/* ── Catálogo de cuadros en venta ── */}
      <div className="card">
        <div className="card__head">
          <h3>Catálogo en Venta — {(c.products || []).length} cuadros</h3>
          <button className="abtn amber sm" onClick={() => updateList('cuadros.products', l => [...(l||[]), { id: 'cq' + Date.now(), name: 'Nuevo cuadro', style: 'MINIMAL', price: '59.990', size: '30×40 cm', tag: 'STOCK', img: '', gallery: [], description: '', details: [] }])}>+ Cuadro</button>
        </div>
        <div className="divider">Cabecera del catálogo</div>
        <div className="row-3">
          <Text label="Eyebrow" value={c.productsEyebrow || ''} onChange={v => update('cuadros.productsEyebrow', v)} />
          <Text label="Título" value={c.productsTitle || ''} onChange={v => update('cuadros.productsTitle', v)} />
          <Text label="Título (acento ámbar)" value={c.productsTitleEm || ''} onChange={v => update('cuadros.productsTitleEm', v)} />
        </div>
        <Text label="Subtítulo" value={c.productsSub || ''} onChange={v => update('cuadros.productsSub', v)} multiline rows={2} />
        <div className="divider">Piezas</div>
        {(c.products || []).map((it, i) => (
          <div key={it.id} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 16, marginBottom: 12 }}>
            <div className="prod-edit" style={{ gridTemplateColumns: '120px 1fr auto' }}>
              <label className="prod-edit__media" style={{ aspectRatio: '3/4', height: 'auto' }}>
                {it.img ? <img src={it.img} alt={it.name} /> : <span>Subir<br/>foto</span>}
                <input type="file" accept="image/*" onChange={async e => {
                  const f = e.target.files && e.target.files[0]; if (!f) return;
                  const url = await uploadToCloudinary(f);
                  updateList('cuadros.products', l => l.map(x => x.id === it.id ? { ...x, img: url } : x));
                }} />
              </label>
              <div className="prod-edit__fields">
                <div className="row">
                  <Text label="Nombre" value={it.name} onChange={v => updateList('cuadros.products', l => l.map(x => x.id === it.id ? { ...x, name: v } : x))} />
                  <Text label="Estilo" value={it.style} onChange={v => updateList('cuadros.products', l => l.map(x => x.id === it.id ? { ...x, style: v } : x))} />
                </div>
                <div className="row-3">
                  <Text label="Precio (CLP)" value={it.price} onChange={v => updateList('cuadros.products', l => l.map(x => x.id === it.id ? { ...x, price: v } : x))} />
                  <Text label="Tamaño" value={it.size} onChange={v => updateList('cuadros.products', l => l.map(x => x.id === it.id ? { ...x, size: v } : x))} />
                  <Text label="Tag (STOCK/ENCARGO)" value={it.tag} onChange={v => updateList('cuadros.products', l => l.map(x => x.id === it.id ? { ...x, tag: v } : x))} />
                </div>
                <Text label="Descripción" value={it.description || ''} onChange={v => updateList('cuadros.products', l => l.map(x => x.id === it.id ? { ...x, description: v } : x))} multiline rows={2} />
                {it.img && <button type="button" className="abtn danger sm" style={{ alignSelf: 'flex-start', marginTop: 4 }} onClick={() => updateList('cuadros.products', l => l.map(x => x.id === it.id ? { ...x, img: '' } : x))}>Quitar foto principal</button>}
              </div>
              <div className="prod-edit__actions">
                <button className="abtn ghost sm" disabled={i === 0} onClick={() => updateList('cuadros.products', l => { const a = [...l]; [a[i-1], a[i]] = [a[i], a[i-1]]; return a; })}>↑</button>
                <button className="abtn ghost sm" disabled={i === (c.products||[]).length - 1} onClick={() => updateList('cuadros.products', l => { const a = [...l]; [a[i+1], a[i]] = [a[i], a[i+1]]; return a; })}>↓</button>
                <button className="abtn danger sm" onClick={() => { if(confirm('¿Eliminar cuadro?')) updateList('cuadros.products', l => l.filter(x => x.id !== it.id)); }}>×</button>
              </div>
            </div>
            {/* Gallery of extra images */}
            <div style={{ marginTop: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--gray)', letterSpacing: '0.12em' }}>GALERÍA EXTRA — {(it.gallery||[]).length} foto{(it.gallery||[]).length !== 1 ? 's' : ''}</span>
                <label className="abtn ghost sm" style={{ position: 'relative', cursor: 'pointer' }}>
                  + Añadir foto
                  <input type="file" accept="image/*" multiple style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} onChange={async e => {
                    const files = Array.from(e.target.files || []);
                    for (const f of files) {
                      const url = await uploadToCloudinary(f);
                      updateList('cuadros.products', l => l.map(x => x.id === it.id ? { ...x, gallery: [...(x.gallery||[]), url] } : x));
                    }
                  }} />
                </label>
              </div>
              {(it.gallery||[]).length > 0 && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {(it.gallery||[]).map((url, gi) => (
                    <div key={gi} style={{ position: 'relative', width: 64, height: 64 }}>
                      <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4, border: '1px solid var(--border)' }} />
                      <button type="button" onClick={() => updateList('cuadros.products', l => l.map(x => x.id === it.id ? { ...x, gallery: x.gallery.filter((_, idx) => idx !== gi) } : x))}
                        style={{ position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: '50%', background: '#e53e3e', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, lineHeight: '18px', textAlign: 'center', padding: 0 }}>×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ----- View: Iglesias -----
function ViewIglesias({ content, store }) {
  const { update, updateList } = store;
  const ig = content.iglesias;
  return (
    <div>
      <SectionTokens groupName="Iglesias" content={content} store={store} />
      <div className="card">
        <div className="card__head"><h3>Cabecera de sección</h3></div>
        <div className="row-3">
          <Text label="Índice (ej. §04 / 06)" value={ig.headerIndex} onChange={v => update('iglesias.headerIndex', v)} />
          <Text label="Título" value={ig.headerTitle} onChange={v => update('iglesias.headerTitle', v)} />
          <Text label="Derecha" value={ig.headerRight} onChange={v => update('iglesias.headerRight', v)} />
        </div>
      </div>

      <div className="card">
        <div className="card__head"><h3>Hero · Iglesias</h3><span className="meta">A− / A+ controla el tamaño del título</span></div>
        <div className="row">
          <EditText label="Título — línea 1" value={ig.title1} onChange={v => update('iglesias.title1', v)} sizePath="iglesiasTitleMax" sizeMin={50} sizeMax={220} sizeStep={4} content={content} store={store} />
          <EditText label="Título — línea 2" value={ig.title2} onChange={v => update('iglesias.title2', v)} sizePath="iglesiasTitleMax" sizeMin={50} sizeMax={220} sizeStep={4} content={content} store={store} />
        </div>
        <Text label="Bajada / Lede" value={ig.lede} onChange={v => update('iglesias.lede', v)} multiline rows={4} />
      </div>

      <div className="card">
        <div className="card__head"><h3>Pieza destacada</h3></div>
        <div className="row">
          <Text label="Tag" value={ig.featureTag} onChange={v => update('iglesias.featureTag', v)} hint="PORTAFOLIO" />
          <Text label="Nombre del proyecto" value={ig.featureName} onChange={v => update('iglesias.featureName', v)} />
        </div>
        <ImgPicker
          label="Foto del proyecto destacado"
          value={ig.featureImg}
          onChange={v => update('iglesias.featureImg', v)}
          hint="Recomendado 16:10. Reemplaza la card pattern por una foto real."
          ratio="16 / 10"
        />
      </div>

      <div className="card">
        <div className="card__head">
          <h3>Servicios — {ig.services.length}</h3>
          <button className="abtn sm" onClick={() => updateList('iglesias.services', l => [...l, { id: 'is' + Date.now(), num: String(l.length + 1).padStart(2, '0'), name: 'Nuevo', desc: '' }])}>+ Servicio</button>
        </div>
        {ig.services.map((s, i) => (
          <div className="prod-edit" key={s.id} style={{ gridTemplateColumns: '60px 1fr auto' }}>
            <Text label="Núm." value={s.num} onChange={v => updateList('iglesias.services', l => l.map(x => x.id === s.id ? { ...x, num: v } : x))} />
            <div className="prod-edit__fields">
              <Text label="Nombre" value={s.name} onChange={v => updateList('iglesias.services', l => l.map(x => x.id === s.id ? { ...x, name: v } : x))} />
              <Text label="Descripción" value={s.desc} onChange={v => updateList('iglesias.services', l => l.map(x => x.id === s.id ? { ...x, desc: v } : x))} multiline rows={2} />
            </div>
            <div className="prod-edit__actions">
              <button className="abtn ghost sm" disabled={i === 0} onClick={() => updateList('iglesias.services', l => { const a = [...l]; [a[i-1], a[i]] = [a[i], a[i-1]]; return a; })}>↑</button>
              <button className="abtn ghost sm" disabled={i === ig.services.length - 1} onClick={() => updateList('iglesias.services', l => { const a = [...l]; [a[i+1], a[i]] = [a[i], a[i+1]]; return a; })}>↓</button>
              <button className="abtn danger sm" onClick={() => updateList('iglesias.services', l => l.filter(x => x.id !== s.id))}>×</button>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card__head"><h3>Portafolio · cabecera</h3></div>
        <div className="row-3">
          <Text label="Índice (ej. §04.01 / 06)" value={ig.portfolioIndex} onChange={v => update('iglesias.portfolioIndex', v)} />
          <Text label="Título" value={ig.portfolioTitle} onChange={v => update('iglesias.portfolioTitle', v)} />
          <Text label="Derecha" value={ig.portfolioRight} onChange={v => update('iglesias.portfolioRight', v)} hint="Ej: ALGUNOS TRABAJOS" />
        </div>
      </div>

      <div className="card">
        <div className="card__head">
          <h3>Proyectos — {ig.projects.length}</h3>
          <button className="abtn amber sm" onClick={() => updateList('iglesias.projects', l => [...l, { id: 'ip' + Date.now(), code: 'PROYECTO ' + String(l.length + 1).padStart(2, '0'), name: 'NUEVO', meta: '', img: '', gallery: [] }])}>+ Proyecto</button>
        </div>
        {ig.projects.map((p, i) => (
          <div key={p.id} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 16, marginBottom: 12 }}>
            <div className="prod-edit" style={{ gridTemplateColumns: '120px 1fr auto' }}>
              <label className="prod-edit__media" style={{ aspectRatio: '4 / 3', height: 'auto' }}>
                {p.img ? <img src={p.img} alt={p.name} /> : <span>Subir<br/>foto</span>}
                <input type="file" accept="image/*" onChange={async e => {
                  const f = e.target.files && e.target.files[0]; if (!f) return;
                  const url = await uploadToCloudinary(f);
                  updateList('iglesias.projects', l => l.map(x => x.id === p.id ? { ...x, img: url } : x));
                }} />
              </label>
              <div className="prod-edit__fields">
                <div className="row-3">
                  <Text label="Código" value={p.code} onChange={v => updateList('iglesias.projects', l => l.map(x => x.id === p.id ? { ...x, code: v } : x))} />
                  <Text label="Nombre" value={p.name} onChange={v => updateList('iglesias.projects', l => l.map(x => x.id === p.id ? { ...x, name: v } : x))} />
                  <Text label="Meta" value={p.meta} onChange={v => updateList('iglesias.projects', l => l.map(x => x.id === p.id ? { ...x, meta: v } : x))} />
                </div>
                {p.img && <button type="button" className="abtn danger sm" style={{ alignSelf: 'flex-start', marginTop: 4 }} onClick={() => updateList('iglesias.projects', l => l.map(x => x.id === p.id ? { ...x, img: '' } : x))}>Quitar foto portada</button>}
              </div>
              <div className="prod-edit__actions">
                <button className="abtn ghost sm" disabled={i === 0} onClick={() => updateList('iglesias.projects', l => { const a = [...l]; [a[i-1], a[i]] = [a[i], a[i-1]]; return a; })}>↑</button>
                <button className="abtn ghost sm" disabled={i === ig.projects.length - 1} onClick={() => updateList('iglesias.projects', l => { const a = [...l]; [a[i+1], a[i]] = [a[i], a[i+1]]; return a; })}>↓</button>
                <button className="abtn danger sm" onClick={() => updateList('iglesias.projects', l => l.filter(x => x.id !== p.id))}>×</button>
              </div>
            </div>
            {/* Gallery per project — infinite photos */}
            <div style={{ marginTop: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--gray)', letterSpacing: '0.12em' }}>GALERÍA DEL PROYECTO — {(p.gallery||[]).length} foto{(p.gallery||[]).length !== 1 ? 's' : ''} (aparece al hacer click)</span>
                <label className="abtn ghost sm" style={{ position: 'relative', cursor: 'pointer' }}>
                  + Añadir fotos
                  <input type="file" accept="image/*" multiple style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} onChange={async e => {
                    const files = Array.from(e.target.files || []);
                    for (const f of files) {
                      const url = await uploadToCloudinary(f);
                      updateList('iglesias.projects', l => l.map(x => x.id === p.id ? { ...x, gallery: [...(x.gallery||[]), url] } : x));
                    }
                  }} />
                </label>
              </div>
              {(p.gallery||[]).length > 0 && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {(p.gallery||[]).map((url, gi) => (
                    <div key={gi} style={{ position: 'relative', width: 72, height: 72 }}>
                      <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4, border: '1px solid var(--border)' }} />
                      <button type="button" onClick={() => updateList('iglesias.projects', l => l.map(x => x.id === p.id ? { ...x, gallery: x.gallery.filter((_, idx) => idx !== gi) } : x))}
                        style={{ position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: '50%', background: '#e53e3e', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, lineHeight: '18px', textAlign: 'center', padding: 0 }}>×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card__head"><h3>Formulario de cotización</h3></div>
        <Text label="Eyebrow" value={ig.formEyebrow} onChange={v => update('iglesias.formEyebrow', v)} />
        <div className="row">
          <Text label="Título" value={ig.formTitle} onChange={v => update('iglesias.formTitle', v)} />
          <Text label="Botón — texto" value={ig.formSubmit} onChange={v => update('iglesias.formSubmit', v)} />
        </div>
        <Text label="Subtítulo" value={ig.formSub} onChange={v => update('iglesias.formSub', v)} multiline rows={2} />
        <Text
          label="Opciones de evento (separar con coma)"
          value={(ig.eventOptions || []).join(', ')}
          onChange={v => update('iglesias.eventOptions', v.split(',').map(s => s.trim()).filter(Boolean))}
          multiline rows={2}
          hint="Aparecen en el dropdown EVENTO"
        />
      </div>
    </div>
  );
}

// ----- Token catalog: every editable text slot on the page -----
// Each entry: [label, sizePath (typography.*), colorKey (colors.*), defaultColor]
// sizePath or colorKey may be null when that dimension doesn't apply.
const TOKEN_GROUPS = [
  ['Hero', [
    ['Hero · Eyebrow',           'label',             'heroEyebrow',     '#cfcabe'],
    ['Hero · Título línea 1',    'heroMax',           'heroTitle',       '#f5f1e8'],
    ['Hero · Título línea 2',    'heroMax',           'heroTitle',       '#f5f1e8'],
    ['Hero · Acento ámbar',      'heroMax',           'heroTitleEm',     '#eca10c'],
    ['Hero · Bajada/Lede',       'lede',              'heroLede',        '#f5f1e8'],
  ]],
  ['Quiénes Somos', [
    ['Quiénes Somos · Título',           'aboutTitleMax',  'aboutTitle',     '#f5f1e8'],
    ['Quiénes Somos · Acento ámbar',     'aboutTitleMax',  'aboutTitleEm',   '#eca10c'],
    ['Quiénes Somos · Subtítulo',        'lede',           'aboutSub',       '#f5f1e8'],
    ['Quiénes Somos · Cuerpo párrafos',  'bodyBase',       'aboutBody',      '#f5f1e8'],
    ['Quiénes Somos · Eyebrow / Núm.',    'label',          'aboutEyebrow',   '#f5f1e8'],
    ['Pilar · Núm.',                     'label',          'pillarNum',      '#eca10c'],
    ['Pilar · Título',                   'pillarTitle',    'pillarTitle',    '#f5f1e8'],
    ['Pilar · Descripción',              'bodyBase',       'pillarDesc',     '#cfcabe'],
    ['Métrica · Número grande',          'statNum',        'metricNum',      '#eca10c'],
    ['Métrica · Etiqueta',               'label',          'metricLbl',      '#cfcabe'],
  ]],
  ['Protocolo 1×1', [
    ['Protocolo · Título',           'protocolTitleMax', 'protocolTitle',      '#f5f1e8'],
    ['Protocolo · Acento ámbar',     'protocolTitleMax', 'protocolTitleAmber','#eca10c'],
    ['Protocolo · Encabezado sección', 'protocolSectionHd','protocolSectionHd','#eca10c'],
    ['Protocolo · Cuerpo',           'bodyBase',         'protocolBody',       '#cfcabe'],
    ['Protocolo · Ref. cita',        'label',            'protocolQuoteRef',   '#b8b5ad'],
    ['Protocolo · Cita bíblica',     'protocolQuote',    'protocolQuoteText',  '#f5f1e8'],
    ['Protocolo · Nombre flujo',     'protocolFlowName', 'protocolFlowName',   '#eca10c'],
    ['Protocolo · Detalle flujo',    'protocolFlowDet',  'protocolFlowDet',    '#a8a59c'],
  ]],
  ['Servicios', [
    ['Servicios · Título',           'servicesTitleMax', 'servicesTitle',     '#1a1a1a'],
    ['Servicios · Acento ámbar',     'servicesTitleMax', 'servicesTitleEm',   '#eca10c'],
    ['Servicios · Núm. fila',        'servicesNum',      'servicesNum',       '#6b6b62'],
    ['Servicios · Nombre',           'servicesName',     'servicesName',      '#1a1a1a'],
    ['Servicios · Descripción',      'servicesDesc',     'servicesDesc',      '#6b6b62'],
  ]],
  ['Productos', [
    ['Productos · Título',           'productsTitleMax', 'productsTitle',     '#f5f1e8'],
    ['Productos · Acento ámbar',     'productsTitleMax', 'productsTitleEm',   '#eca10c'],
    ['Producto · Nombre',            'productTitle',     'productsName',      '#f5f1e8'],
    ['Producto · Versículo',         'productsVerse',    'productsVerse',     '#eca10c'],
    ['Producto · Precio',            'productsPrice',    'productsPrice',     '#f5f1e8'],
  ]],
  ['Categorías', [
    ['Categoría · Chip / filtro',    'catChip',          'navLink',           '#f5f1e8'],
  ]],
  ['Cuadros', [
    ['Cuadros · Título grande',      'cuadrosTitleMax',  'cuadrosTitle',      '#1a1a1a'],
    ['Cuadros · Bajada',             'cuadrosLede',      'cuadrosLede',       '#6b6b62'],
    ['Cuadros · Brief Título',       'cuadrosBriefTitle','cuadrosBriefTitle', '#1a1a1a'],
    ['Cuadros · Tag de estilo',      'cuadrosStyleTag',  null,                null],
    ['Cuadros · Núm. paso',          'cuadrosStepNum',   null,                null],
    ['Cuadros · Nombre ref.',        'cuadrosRefName',   null,                null],
    ['Cuadros · Núm. formato',       'cuadrosFormatNum', null,                null],
  ]],
  ['Iglesias', [
    ['Iglesias · Título',            'iglesiasTitleMax', 'iglesiasTitle',     '#f5f1e8'],
    ['Iglesias · Bajada',            'iglesiasLede',     'iglesiasLede',      '#a8a59c'],
    ['Iglesias · Nombre servicio',   'iglesiasServiceName', null,             null],
    ['Iglesias · Nombre proyecto',   'iglesiasProjectName', null,             null],
    ['Iglesias · Título portafolio', 'iglesiasPortfolioTitle', null,          null],
    ['Iglesias · Título formulario', 'iglesiasFormTitle', null,               null],
    ['Iglesias · Nombre feature',    'iglesiasFeatureName', null,             null],
  ]],
  ['Evento (Ruah Evento)', [
    ['Evento · Eyebrow',             'eventosEyebrow',   'eventosEyebrow',    '#6b6b62'],
    ['Evento · Título',              'heroMax',          'eventosTitle',      '#1a1a1a'],
    ['Evento · Acento ámbar',        'heroMax',          'eventosTitleEm',    '#eca10c'],
    ['Evento · Bajada',              'lede',             'eventosLede',       '#1a1a1a'],
    ['Evento · Cuerpo párrafos',     'bodyBase',         'eventosBody',       '#1a1a1a'],
    ['Evento · Título de bloque',    'eventosBlockTitle','eventosBlockTitle', '#1a1a1a'],
  ]],
  ['Manifiesto', [
    ['Manifiesto · Texto',           'manifestoMax',     'manifestoTxt',      '#1a1a1a'],
    ['Manifiesto · Acento ámbar',    'manifestoMax',     'manifestoAmber',    '#eca10c'],
  ]],
  ['Testimonios', [
    ['Testimonios · Núm. eyebrow',   'label',           'testiNum',         '#cfcabe'],
    ['Testimonios · Título',         'testimonialsTitleMax','testiTitle',     '#f5f1e8'],
    ['Testimonios · Acento ámbar',   'testimonialsTitleMax','testiTitleEm',   '#eca10c'],
    ['Testimonios · Subtítulo',      'lede',            'testiSub',         '#f5f1e8'],
    ['Testimonios · Cita',           'testiQuote',       'testiQuote',        '#1a1a1a'],
    ['Testimonios · Nombre',         'testiName',        'testiName',         '#1a1a1a'],
    ['Testimonios · Rol',            'testiRole',        'testiRole',         '#6b6b62'],
  ]],
  ['CTA Final', [
    ['CTA · Título',                 'ctaMax',           'ctaTitle',          '#0a0a0a'],
    ['CTA · Cuerpo',                 'ctaBody',          'ctaBody',           '#0a0a0a'],
  ]],
  ['Footer', [
    ['Footer · Wordmark',            'wordmarkMax',      'footerWordmark',    '#f5f1e8'],
    ['Footer · Descripción',         'footerAbout',      'footerAbout',       '#b8b5ad'],
    ['Footer · Columna título',      'footerColTitle',   'footerColTitle',    '#b8b5ad'],
    ['Footer · Columna item',        'footerColItem',    'footerColItem',     '#f5f1e8'],
  ]],
  ['Nav (menú superior)', [
    ['Nav · Tamaño del logo',        'navLogo',          null,                null],
    ['Nav · Enlace',                 'navLink',          'navLink',           '#1a1a1a'],
  ]],
  ['Club Secreto', [
    ['Club · Título portada (gate)', 'clubGateTitle',    null,                null],
    ['Club · Título principal',      'clubHeroTitle',    null,                null],
    ['Club · Título de sección',     'clubSectionTitle', null,                null],
    ['Club · Número de panel',       'clubPanelBig',     null,                null],
    ['Club · Nombre de ruta',        'clubRouteName',    null,                null],
    ['Club · Día de reunión',        'clubMeetingDay',   null,                null],
    ['Club · Cuerpo de texto',       'clubBody',         null,                null],
  ]],
];

// ----- View: Colors (text-color + size for every editable slot) -----
function ViewColors({ content, store }) {
  return (
    <div>
      <div className="card">
        <div className="card__head">
          <h3>Colores y tamaños de TODO el texto</h3>
          <button
            className="abtn ghost sm"
            onClick={() => { if (confirm('¿Restablecer todos los colores de texto a los valores por defecto?')) store.update('colors', {}); }}
          >↺ Restablecer todos los colores</button>
        </div>
        <p style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--gray)', marginBottom: 16, lineHeight: 1.55 }}>
          Cada fila controla el <strong>tamaño</strong> y el <strong>color</strong> de un texto de la página. Si dejas el color vacío, se usa el color original del diseño. Los cambios se aplican en vivo.
        </p>
      </div>

      {TOKEN_GROUPS.map(([groupName, slots], gi) => (
        <div className="card" key={groupName}>
          <div className="card__head">
            <h3>{groupName}</h3>
            <span className="meta">{slots.length} elemento{slots.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="token-list">
            {slots.map(([label, sizePath, colorKey, fallback], i) => (
              <TokenRow
                key={i}
                label={label}
                sizePath={sizePath}
                colorKey={colorKey}
                store={store}
                content={content}
                fallback={fallback}
                sizeMin={sizePath === 'label' ? 9 : (sizePath === 'bodyBase' ? 12 : 10)}
                sizeMax={sizePath && sizePath.includes('itleMax') ? 320 : (sizePath === 'heroMax' ? 320 : 200)}
                sizeStep={sizePath && (sizePath.includes('itleMax') || sizePath === 'heroMax') ? 4 : 1}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ----- View: Eventos (Ruah Evento) -----
function ViewEventos({ content, store }) {
  const { update, updateList } = store;
  const ev = content.eventos;
  return (
    <div>
      <SectionTokens groupName="Evento (Ruah Evento)" content={content} store={store} />
      <div className="card">
        <div className="card__head"><h3>Cabecera</h3><span className="meta">A− / A+ controla el tamaño</span></div>
        <Text label="Eyebrow" value={ev.eyebrow} onChange={v => update('eventos.eyebrow', v)} />
        <div className="row-3">
          <Text label="Título — línea 1"  value={ev.title}      onChange={v => update('eventos.title', v)} />
          <Text label="Título — línea 2 (acento ámbar)" value={ev.titleEm}    onChange={v => update('eventos.titleEm', v)} />
          <Text label="Título — línea 3"  value={ev.titleAfter} onChange={v => update('eventos.titleAfter', v)} />
        </div>
        <Text label="Bajada / Subtítulo" value={ev.sub} onChange={v => update('eventos.sub', v)} multiline rows={3} />
      </div>

      <div className="card">
        <div className="card__head"><h3>El problema</h3></div>
        <Text label="Eyebrow" value={ev.problemEyebrow} onChange={v => update('eventos.problemEyebrow', v)} />
        <Text label="Título"  value={ev.problemTitle}   onChange={v => update('eventos.problemTitle', v)} />
        <Text label="Cuerpo"  value={ev.problemBody}    onChange={v => update('eventos.problemBody', v)} multiline rows={4} />
      </div>

      <div className="card">
        <div className="card__head"><h3>Lo que hacemos</h3></div>
        <Text label="Eyebrow"  value={ev.weDoEyebrow} onChange={v => update('eventos.weDoEyebrow', v)} />
        <Text label="Título"   value={ev.weDoTitle}   onChange={v => update('eventos.weDoTitle', v)} multiline rows={2} />
        <Text label="Cuerpo"   value={ev.weDoBody}    onChange={v => update('eventos.weDoBody', v)} multiline rows={3} />
        <Text label="Tagline"  value={ev.weDoTagline} onChange={v => update('eventos.weDoTagline', v)} />
      </div>

      <div className="card">
        <div className="card__head">
          <h3>Por qué funciona — Pilares ({ev.pillars.length})</h3>
          <button className="abtn amber sm" onClick={() => updateList('eventos.pillars', l => [...l, { id: 'ev' + Date.now(), num: String(l.length + 1).padStart(2, '0'), title: 'Nuevo', desc: '' }])}>+ Pilar</button>
        </div>
        {ev.pillars.map((p, i) => (
          <div className="prod-edit" key={p.id} style={{ gridTemplateColumns: '60px 1fr auto' }}>
            <Text label="Núm." value={p.num} onChange={v => updateList('eventos.pillars', l => l.map(x => x.id === p.id ? { ...x, num: v } : x))} />
            <div className="prod-edit__fields">
              <Text label="Título" value={p.title} onChange={v => updateList('eventos.pillars', l => l.map(x => x.id === p.id ? { ...x, title: v } : x))} />
              <Text label="Descripción" value={p.desc} onChange={v => updateList('eventos.pillars', l => l.map(x => x.id === p.id ? { ...x, desc: v } : x))} multiline rows={2} />
            </div>
            <div className="prod-edit__actions">
              <button className="abtn ghost sm" disabled={i === 0} onClick={() => updateList('eventos.pillars', l => { const a = [...l]; [a[i-1], a[i]] = [a[i], a[i-1]]; return a; })}>↑</button>
              <button className="abtn ghost sm" disabled={i === ev.pillars.length - 1} onClick={() => updateList('eventos.pillars', l => { const a = [...l]; [a[i+1], a[i]] = [a[i], a[i+1]]; return a; })}>↓</button>
              <button className="abtn danger sm" onClick={() => updateList('eventos.pillars', l => l.filter(x => x.id !== p.id))}>×</button>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card__head"><h3>Para qué eventos · Sobre qué estampamos</h3></div>
        <div className="row">
          <Text label="Título 1 · Para qué eventos" value={ev.forWhatTitle} onChange={v => update('eventos.forWhatTitle', v)} />
          <Text label="Cuerpo 1" value={ev.forWhatBody} onChange={v => update('eventos.forWhatBody', v)} multiline rows={3} />
          <Text label="Título 2 · Sobre qué estampamos" value={ev.onWhatTitle} onChange={v => update('eventos.onWhatTitle', v)} />
          <Text label="Cuerpo 2" value={ev.onWhatBody} onChange={v => update('eventos.onWhatBody', v)} multiline rows={3} />
        </div>
      </div>

      <div className="card">
        <div className="card__head"><h3>El detalle que cambia todo</h3></div>
        <Text label="Título" value={ev.detailTitle} onChange={v => update('eventos.detailTitle', v)} />
        <Text label="Cuerpo" value={ev.detailBody}  onChange={v => update('eventos.detailBody', v)} multiline rows={4} />
      </div>

      <div className="card">
        <div className="card__head">
          <h3>Muestra de fotos ({(ev.gallery || []).length})</h3>
          <button className="abtn amber sm" onClick={() => updateList('eventos.gallery', l => [...(l || []), { id: 'eg' + Date.now(), img: '', caption: '', photos: [] }])}>+ Foto</button>
        </div>
        <Text label="Título de la sección" value={ev.galleryTitle || ''} onChange={v => update('eventos.galleryTitle', v)} />
        <Text label="Bajada" value={ev.gallerySub || ''} onChange={v => update('eventos.gallerySub', v)} multiline rows={2} />
        {(ev.gallery || []).map((g, i) => (
          <div key={g.id} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 16, marginBottom: 12 }}>
            <div className="prod-edit" style={{ gridTemplateColumns: '120px 1fr auto' }}>
              <label className="prod-edit__media" style={{ aspectRatio: '3 / 4', height: 'auto' }}>
                {g.img ? <img src={g.img} alt={g.caption || ''} /> : <span>Subir<br/>foto portada</span>}
                <input type="file" accept="image/*" onChange={async e => {
                  const f = e.target.files && e.target.files[0]; if (!f) return;
                  const url = await uploadToCloudinary(f);
                  updateList('eventos.gallery', l => l.map(x => x.id === g.id ? { ...x, img: url } : x));
                }} />
              </label>
              <div className="prod-edit__fields">
                <Text label={'Foto ' + (i + 1) + ' · Caption'} value={g.caption} onChange={v => updateList('eventos.gallery', l => l.map(x => x.id === g.id ? { ...x, caption: v } : x))} multiline rows={2} />
                {g.img && <button type="button" className="abtn danger sm" style={{ alignSelf: 'flex-start', marginTop: 4 }} onClick={() => updateList('eventos.gallery', l => l.map(x => x.id === g.id ? { ...x, img: '' } : x))}>Quitar portada</button>}
              </div>
              <div className="prod-edit__actions">
                <button className="abtn ghost sm" disabled={i === 0} onClick={() => updateList('eventos.gallery', l => { const a = [...l]; [a[i-1], a[i]] = [a[i], a[i-1]]; return a; })}>↑</button>
                <button className="abtn ghost sm" disabled={i === (ev.gallery || []).length - 1} onClick={() => updateList('eventos.gallery', l => { const a = [...l]; [a[i+1], a[i]] = [a[i], a[i+1]]; return a; })}>↓</button>
                <button className="abtn danger sm" onClick={() => { if (confirm('¿Eliminar foto?')) updateList('eventos.gallery', l => l.filter(x => x.id !== g.id)); }}>×</button>
              </div>
            </div>
            {/* Sub-galería — fotos al hacer click */}
            <div style={{ marginTop: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--gray)', letterSpacing: '0.12em' }}>GALERÍA INTERIOR — {(g.photos||[]).length} foto{(g.photos||[]).length !== 1 ? 's' : ''} (aparece al hacer click)</span>
                <label className="abtn ghost sm" style={{ position: 'relative', cursor: 'pointer' }}>
                  + Añadir fotos
                  <input type="file" accept="image/*" multiple style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} onChange={async e => {
                    const files = Array.from(e.target.files || []);
                    for (const f of files) {
                      const url = await uploadToCloudinary(f);
                      updateList('eventos.gallery', l => l.map(x => x.id === g.id ? { ...x, photos: [...(x.photos||[]), url] } : x));
                    }
                  }} />
                </label>
              </div>
              {(g.photos||[]).length > 0 && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {(g.photos||[]).map((url, pi) => (
                    <div key={pi} style={{ position: 'relative', width: 72, height: 72 }}>
                      <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4, border: '1px solid var(--border)' }} />
                      <button type="button" onClick={() => updateList('eventos.gallery', l => l.map(x => x.id === g.id ? { ...x, photos: x.photos.filter((_, idx) => idx !== pi) } : x))}
                        style={{ position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: '50%', background: '#e53e3e', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, lineHeight: '18px', textAlign: 'center', padding: 0 }}>×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card__head">
          <h3>Lo que recibes ({ev.receiveItems.length})</h3>
          <button className="abtn sm" onClick={() => updateList('eventos.receiveItems', l => [...l, { id: 'evr' + Date.now(), txt: 'Nuevo item' }])}>+ Item</button>
        </div>
        <Text label="Título del bloque" value={ev.receiveTitle} onChange={v => update('eventos.receiveTitle', v)} />
        {ev.receiveItems.map((it, i) => (
          <div className="prod-edit" key={it.id} style={{ gridTemplateColumns: '40px 1fr auto' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--amber)' }}>{String(i + 1).padStart(2, '0')}</div>
            <Text label={'Item ' + (i + 1)} value={it.txt} onChange={v => updateList('eventos.receiveItems', l => l.map(x => x.id === it.id ? { ...x, txt: v } : x))} />
            <div className="prod-edit__actions">
              <button className="abtn ghost sm" disabled={i === 0} onClick={() => updateList('eventos.receiveItems', l => { const a = [...l]; [a[i-1], a[i]] = [a[i], a[i-1]]; return a; })}>↑</button>
              <button className="abtn ghost sm" disabled={i === ev.receiveItems.length - 1} onClick={() => updateList('eventos.receiveItems', l => { const a = [...l]; [a[i+1], a[i]] = [a[i], a[i+1]]; return a; })}>↓</button>
              <button className="abtn danger sm" onClick={() => updateList('eventos.receiveItems', l => l.filter(x => x.id !== it.id))}>×</button>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card__head">
          <h3>Paquetes ({ev.packs.length})</h3>
          <button className="abtn amber sm" onClick={() => updateList('eventos.packs', l => [...l, { id: 'evp' + Date.now(), name: 'NUEVO', limit: '', detail: '' }])}>+ Paquete</button>
        </div>
        <Text label="Título del bloque" value={ev.packsTitle} onChange={v => update('eventos.packsTitle', v)} />
        {ev.packs.map((p, i) => (
          <div className="prod-edit" key={p.id} style={{ gridTemplateColumns: '1fr auto' }}>
            <div className="prod-edit__fields">
              <div className="row-3">
                <Text label="Nombre"  value={p.name}   onChange={v => updateList('eventos.packs', l => l.map(x => x.id === p.id ? { ...x, name: v } : x))} />
                <Text label="Límite"  value={p.limit}  onChange={v => updateList('eventos.packs', l => l.map(x => x.id === p.id ? { ...x, limit: v } : x))} />
                <Text label="Detalle" value={p.detail} onChange={v => updateList('eventos.packs', l => l.map(x => x.id === p.id ? { ...x, detail: v } : x))} />
              </div>
            </div>
            <div className="prod-edit__actions">
              <button className="abtn danger sm" onClick={() => updateList('eventos.packs', l => l.filter(x => x.id !== p.id))}>×</button>
            </div>
          </div>
        ))}
        <Text label="Texto al pie del bloque" value={ev.packsFoot} onChange={v => update('eventos.packsFoot', v)} multiline rows={2} />
      </div>

      <div className="card">
        <div className="card__head"><h3>Cobertura</h3></div>
        <div className="row">
          <Text label="Etiqueta" value={ev.coverageTitle} onChange={v => update('eventos.coverageTitle', v)} />
          <Text label="Valor"    value={ev.coverageBody}  onChange={v => update('eventos.coverageBody', v)} />
        </div>
      </div>

      <div className="card">
        <div className="card__head"><h3>CTA final · El siguiente paso</h3></div>
        <Text label="Eyebrow" value={ev.ctaEyebrow} onChange={v => update('eventos.ctaEyebrow', v)} />
        <Text label="Título"  value={ev.ctaTitle}   onChange={v => update('eventos.ctaTitle', v)} />
        <Text label="Cuerpo"  value={ev.ctaBody}    onChange={v => update('eventos.ctaBody', v)} multiline rows={3} />
        <div className="row">
          <Text label="CTA 1 · Texto"  value={ev.ctaBtn.label}  onChange={v => update('eventos.ctaBtn.label', v)} />
          <Text label="CTA 1 · Enlace" value={ev.ctaBtn.href}   onChange={v => update('eventos.ctaBtn.href', v)} />
          <Text label="CTA 2 · Texto"  value={ev.ctaBtn2.label} onChange={v => update('eventos.ctaBtn2.label', v)} />
          <Text label="CTA 2 · Enlace" value={ev.ctaBtn2.href}  onChange={v => update('eventos.ctaBtn2.href', v)} />
        </div>
        <Text label="Instagram" value={ev.instagram} onChange={v => update('eventos.instagram', v)} />
        <Text label="Cierre (frase final)" value={ev.closing} onChange={v => update('eventos.closing', v)} multiline rows={3} />
      </div>
    </div>
  );
}

// ----- View: Checkout (pasarela de pago) -----
function ViewCheckout({ content, store }) {
  const { update } = store;
  const ck = content.checkout || {};
  const s  = ck.style || {};

  function setStyle(key, val) {
    store.update('checkout.style.' + key, val);
  }

  return (
    <div>
      <div className="card">
        <div className="card__head"><h3>Textos del checkout</h3><span className="meta">3 pasos + confirmación</span></div>
        <Text label="Etiqueta de la barra superior" value={ck.topTag} onChange={v => update('checkout.topTag', v)} />
        <Text label="Etiquetas de los 3 pasos (separar con coma)"
              value={(ck.stepLabels || []).join(', ')}
              onChange={v => update('checkout.stepLabels', v.split(',').map(s => s.trim()).filter(Boolean))} />
        <div className="row">
          <Text label="Paso 1 · Título"     value={ck.infoTitle}     onChange={v => update('checkout.infoTitle', v)} />
          <Text label="Paso 1 · Subtítulo"  value={ck.infoSub}       onChange={v => update('checkout.infoSub', v)} multiline rows={2} />
          <Text label="Dir. envío · Título" value={ck.addressTitle}  onChange={v => update('checkout.addressTitle', v)} />
        </div>
        <div className="row">
          <Text label="Paso 2 · Título"     value={ck.shippingTitle} onChange={v => update('checkout.shippingTitle', v)} />
          <Text label="Paso 2 · Subtítulo"  value={ck.shippingSub}   onChange={v => update('checkout.shippingSub', v)} multiline rows={2} />
          <Text label="Paso 3 · Título"     value={ck.payTitle}      onChange={v => update('checkout.payTitle', v)} />
        </div>
        <div className="row">
          <Text label="Botón Continuar a envío" value={ck.nextLabel}    onChange={v => update('checkout.nextLabel', v)} />
          <Text label="Botón Continuar a pago"   value={ck.nextPayLabel} onChange={v => update('checkout.nextPayLabel', v)} />
          <Text label="Botón Volver"             value={ck.backLabel}    onChange={v => update('checkout.backLabel', v)} />
          <Text label="Botón Pagar · prefijo"     value={ck.payCtaLabel} onChange={v => update('checkout.payCtaLabel', v)} />
        </div>
        <Text label="Mensaje de confianza (footer)" value={ck.trustTxt} onChange={v => update('checkout.trustTxt', v)} multiline rows={2} />
        <div className="row">
          <Text label="Resumen · Encabezado"  value={ck.summaryHd}       onChange={v => update('checkout.summaryHd', v)} />
          <Text label="Resumen · Protocolo"    value={ck.summaryProtocol} onChange={v => update('checkout.summaryProtocol', v)} multiline rows={2} />
        </div>
        <Text label="Confirmación · Título" value={ck.confirmedTitle} onChange={v => update('checkout.confirmedTitle', v)} />
      </div>

      <div className="card">
        <div className="card__head"><h3>Colores del checkout</h3></div>
        <div className="row">
          <ColorPicker label="Fondo principal (negro)"      value={s.cardBg || '#0a0a0a'}    onChange={v => setStyle('cardBg', v)} />
          <ColorPicker label="Texto principal (blanco)"      value={s.textOnCard || '#ffffff'} onChange={v => setStyle('textOnCard', v)} />
          <ColorPicker label="Color de acento (CTA / foco)" value={s.accent || '#eca10c'}     onChange={v => setStyle('accent', v)} />
          <ColorPicker label="Resumen · Fondo"               value={s.sumBg || '#0a0a0a'}      onChange={v => setStyle('sumBg', v)} />
          <ColorPicker label="Resumen · Texto"               value={s.sumText || '#f5f1e8'}    onChange={v => setStyle('sumText', v)} />
        </div>
      </div>

      <div className="card">
        <div className="card__head"><h3>Tamaños del checkout</h3></div>
        <div className="row">
          <Field label={'Título de paso · ' + (s.titleSize || 28) + 'px'}>
            <input type="range" min={20} max={64} value={s.titleSize || 28} onChange={e => setStyle('titleSize', Number(e.target.value))} style={{ accentColor: 'var(--amber)', width: '100%' }} />
          </Field>
          <Field label={'Subtítulo · ' + (s.subSize || 14) + 'px'}>
            <input type="range" min={11} max={22} value={s.subSize || 14} onChange={e => setStyle('subSize', Number(e.target.value))} style={{ accentColor: 'var(--amber)', width: '100%' }} />
          </Field>
          <Field label={'Etiquetas de pasos · ' + (s.stepLabelSize || 11) + 'px'}>
            <input type="range" min={9} max={18} value={s.stepLabelSize || 11} onChange={e => setStyle('stepLabelSize', Number(e.target.value))} style={{ accentColor: 'var(--amber)', width: '100%' }} />
          </Field>
          <Field label={'Etiquetas de campos · ' + (s.fieldLabelSize || 10) + 'px'}>
            <input type="range" min={9} max={16} value={s.fieldLabelSize || 10} onChange={e => setStyle('fieldLabelSize', Number(e.target.value))} style={{ accentColor: 'var(--amber)', width: '100%' }} />
          </Field>
          <Field label={'Texto en inputs · ' + (s.fieldInputSize || 16) + 'px'}>
            <input type="range" min={12} max={24} value={s.fieldInputSize || 16} onChange={e => setStyle('fieldInputSize', Number(e.target.value))} style={{ accentColor: 'var(--amber)', width: '100%' }} />
          </Field>
          <Field label={'Resumen · Encabezado · ' + (s.summaryHdSize || 11) + 'px'}>
            <input type="range" min={9} max={18} value={s.summaryHdSize || 11} onChange={e => setStyle('summaryHdSize', Number(e.target.value))} style={{ accentColor: 'var(--amber)', width: '100%' }} />
          </Field>
          <Field label={'Resumen · Items · ' + (s.summaryItemSize || 12) + 'px'}>
            <input type="range" min={10} max={18} value={s.summaryItemSize || 12} onChange={e => setStyle('summaryItemSize', Number(e.target.value))} style={{ accentColor: 'var(--amber)', width: '100%' }} />
          </Field>
          <Field label={'Resumen · Total · ' + (s.summaryTotalSize || 18) + 'px'}>
            <input type="range" min={14} max={32} value={s.summaryTotalSize || 18} onChange={e => setStyle('summaryTotalSize', Number(e.target.value))} style={{ accentColor: 'var(--amber)', width: '100%' }} />
          </Field>
        </div>
      </div>

      <div className="card">
        <div className="card__head"><h3>Restablecer</h3></div>
        <button className="abtn ghost" onClick={() => {
          if (confirm('¿Restablecer estilos del checkout?')) store.update('checkout.style', DEFAULT_CONTENT.checkout.style);
        }}>↺ Restablecer estilos del checkout</button>
      </div>
    </div>
  );
}

// ----- Design Gallery Admin -----
function PiezaEditor({ pieza: initial, onSave, onCancel }) {
  const [p, setP] = React.useState(initial);
  const [uploading, setUploading] = React.useState(false);

  function set(key, val) { setP(x => ({ ...x, [key]: val })); }

  async function uploadMain(file) {
    setUploading(true);
    try { const url = await uploadToCloudinary(file); set('imagen_principal', url); }
    catch(e) { alert('Error: ' + e.message); }
    finally { setUploading(false); }
  }

  async function uploadDetail(file) {
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      setP(x => ({ ...x, imagenes_detalle: [...(x.imagenes_detalle || []), url] }));
    } catch(e) { alert('Error: ' + e.message); }
    finally { setUploading(false); }
  }

  const FRAMES = ['', 'Dorado Clásico', 'Metal Negro', 'Madera Rústica', 'Blanco Moderno', 'Bronce Vintage'];

  return (
    <div className="card" style={{ border: '1px solid var(--amber)' }}>
      <div className="card__head"><h3>{p.nombre || 'Nueva pieza'}</h3></div>
      <div className="field-grid">
        <Field label="Nombre">
          <input className="ainput" value={p.nombre || ''} onChange={e => set('nombre', e.target.value)} />
        </Field>
        <Field label="Cliente">
          <input className="ainput" value={p.cliente || ''} onChange={e => set('cliente', e.target.value)} />
        </Field>
        <Field label="Fecha">
          <input className="ainput" value={p.fecha_creacion || ''} onChange={e => set('fecha_creacion', e.target.value)} />
        </Field>
        <Field label="Visible">
          <Toggle label="Visible en galería" value={p.estado === 'visible'} onChange={v => set('estado', v ? 'visible' : 'oculto')} />
        </Field>
      </div>
      <Field label="Descripción breve (cartela)">
        <textarea className="ainput" rows={3} value={p.descripcion_breve || ''} onChange={e => set('descripcion_breve', e.target.value)} />
      </Field>
      <Field label="Historia completa (modal)">
        <textarea className="ainput" rows={6} value={p.descripcion_historia || ''} onChange={e => set('descripcion_historia', e.target.value)} />
      </Field>
      <Field label="Marco">
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[1,2,3,4,5].map(t => (
            <button key={t} type="button"
              className={'abtn' + (p.tipo_marco === t ? '' : ' ghost')}
              onClick={() => set('tipo_marco', t)}
              style={{ fontSize: 12 }}
            >{t}. {FRAMES[t]}</button>
          ))}
        </div>
      </Field>
      <Field label="Imagen principal">
        {p.imagen_principal
          ? <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
              <img src={p.imagen_principal} alt="" style={{ width: 80, height: 106, objectFit: 'cover', borderRadius: 2 }} />
              <button className="abtn ghost" onClick={() => set('imagen_principal', '')}>✕ Quitar</button>
            </div>
          : null
        }
        <label className="abtn ghost" style={{ cursor: 'pointer', display: 'inline-block' }}>
          {uploading ? 'Subiendo…' : '↑ Subir imagen principal'}
          <input type="file" accept="image/*" style={{ display: 'none' }}
            onChange={e => { const f = e.target.files && e.target.files[0]; if (f) uploadMain(f); e.target.value = ''; }} />
        </label>
      </Field>
      <Field label={'Imágenes de detalle (' + (p.imagenes_detalle || []).length + ')'}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
          {(p.imagenes_detalle || []).map((url, i) => (
            <div key={i} style={{ position: 'relative' }}>
              <img src={url} alt="" style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 2 }} />
              <button
                onClick={() => setP(x => ({ ...x, imagenes_detalle: x.imagenes_detalle.filter((_, j) => j !== i) }))}
                style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', border: '1px solid #ccc', background: '#fff', fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
              >✕</button>
            </div>
          ))}
        </div>
        <label className="abtn ghost" style={{ cursor: 'pointer', display: 'inline-block' }}>
          {uploading ? 'Subiendo…' : '↑ Agregar imagen de detalle'}
          <input type="file" accept="image/*" style={{ display: 'none' }}
            onChange={e => { const f = e.target.files && e.target.files[0]; if (f) uploadDetail(f); e.target.value = ''; }} />
        </label>
      </Field>
      <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
        <button className="abtn" onClick={() => onSave(p)}>Guardar</button>
        <button className="abtn ghost" onClick={onCancel}>Cancelar</button>
      </div>
    </div>
  );
}

function ViewDesign({ content, store }) {
  const piezas = (content.design && content.design.piezas) || [];
  const [editId, setEditId] = React.useState(null);
  const [creating, setCreating] = React.useState(false);

  function save(pieza) {
    const exists = piezas.find(p => p.id === pieza.id);
    if (exists) store.update('design.piezas', piezas.map(p => p.id === pieza.id ? pieza : p));
    else        store.update('design.piezas', [...piezas, pieza]);
    setEditId(null); setCreating(false);
  }

  function del(id) {
    if (!confirm('¿Eliminar esta pieza?')) return;
    store.update('design.piezas', piezas.filter(p => p.id !== id));
  }

  const editPieza = creating
    ? { id: 'pz-' + Date.now(), nombre: '', cliente: '', fecha_creacion: new Date().getFullYear().toString(), imagen_principal: '', imagenes_detalle: [], descripcion_breve: '', descripcion_historia: '', tipo_marco: 1, orden: piezas.length, estado: 'visible' }
    : (editId ? piezas.find(p => p.id === editId) : null);

  return (
    <div>
      <div className="card">
        <div className="card__head">
          <h3>Galería Design — {piezas.length} {piezas.length === 1 ? 'pieza' : 'piezas'}</h3>
          {!creating && !editId &&
            <button className="abtn" onClick={() => { setCreating(true); setEditId(null); }}>+ Nueva pieza</button>
          }
        </div>
      </div>

      {editPieza &&
        <PiezaEditor pieza={editPieza} onSave={save} onCancel={() => { setEditId(null); setCreating(false); }} />
      }

      {piezas.map(pieza => (
        <div key={pieza.id} className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {pieza.imagen_principal
              ? <img src={pieza.imagen_principal} alt={pieza.nombre} style={{ width: 56, height: 74, objectFit: 'cover', borderRadius: 2, flexShrink: 0 }} />
              : <div style={{ width: 56, height: 74, background: 'var(--surface)', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: 'var(--muted)', flexShrink: 0 }}>Sin img</div>
            }
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 15, letterSpacing: '0.06em', marginBottom: 4 }}>{pieza.nombre || '(sin nombre)'}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                {pieza.cliente} · {pieza.fecha_creacion} · Marco {pieza.tipo_marco}
                {' · '}<span style={{ color: pieza.estado === 'visible' ? 'var(--green, #4a9)' : 'var(--muted)' }}>{pieza.estado}</span>
              </div>
            </div>
            {!editId && !creating && (
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="abtn ghost" onClick={() => { setEditId(pieza.id); setCreating(false); }}>Editar</button>
                <button className="abtn ghost" onClick={() => del(pieza.id)}>✕</button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ----- Admin shell -----
const ADMIN_VIEWS = [
  { id: 'dash',         label: 'Panel',         comp: ViewDashboard },
  { id: 'colors',       label: 'Colores texto', comp: ViewColors },
  { id: 'theme',        label: 'Paleta',        comp: ViewTheme },
  { id: 'typography',   label: 'Tipografía',    comp: ViewTypography },
  { id: 'brand',        label: 'Marca',         comp: ViewBrand },
  { id: 'nav',          label: 'Menú',          comp: ViewNav },
  { id: 'home',         label: 'Inicio',        comp: ViewHome },
  { id: 'design',       label: 'Personalizado', comp: ViewDesign },
  { id: 'hero',         label: 'Hero',          comp: ViewHero },
  { id: 'about',        label: 'Quienes Somos', comp: ViewAbout },
  { id: 'protocol',     label: 'Protocolo 1×1', comp: ViewProtocol },
  { id: 'services',     label: 'Servicios',     comp: ViewServices },
  { id: 'categories',   label: 'Categorías',    comp: ViewCategories },
  { id: 'products',     label: 'Productos',     comp: ViewProducts },
  { id: 'cuadros',      label: 'Cuadros',       comp: ViewCuadros },
  { id: 'iglesias',     label: 'Iglesias',      comp: ViewIglesias },
  { id: 'eventos',      label: 'Evento',        comp: ViewEventos },
  { id: 'manifesto',    label: 'Manifiesto',    comp: ViewManifesto },
  { id: 'testimonials', label: 'Testimonios',   comp: ViewTestimonials },
  { id: 'cta',          label: 'CTA Final',     comp: ViewCTA },
  { id: 'footer',       label: 'Footer',        comp: ViewFooter },
  { id: 'club',         label: 'Club Secreto',  comp: ViewClub },
  { id: 'checkout',     label: 'Pasarela pago', comp: ViewCheckout },
  { id: 'settings',     label: 'Ajustes',       comp: ViewSettings },
];

function Admin({ open, content, store, onClose }) {
  const [authed, setAuthed] = React.useState(() => sessionStorage.getItem('ruah-admin-auth') === '1');
  const [pwd, setPwd]       = React.useState('');
  const [err, setErr]       = React.useState('');
  const [view, setView]     = React.useState('dash');

  React.useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
  }, [open]);

  async function authenticate(e) {
    e && e.preventDefault();
    const hash = await hashPwd(pwd);
    if (hash === content.brand.adminPasswordHash) {
      setAuthed(true);
      sessionStorage.setItem('ruah-admin-auth', '1');
      sessionStorage.setItem('ruah-admin-session', pwd);
      setErr('');
      setPwd('');
    } else {
      setErr('CONTRASEÑA INCORRECTA');
    }
  }

  function logout() {
    sessionStorage.removeItem('ruah-admin-auth');
    sessionStorage.removeItem('ruah-admin-session');
    setAuthed(false);
  }

  const Active = ADMIN_VIEWS.find(v => v.id === view)?.comp || ViewDashboard;
  const activeMeta = ADMIN_VIEWS.find(v => v.id === view);

  return (
    <div className={'admin-overlay' + (open ? ' open' : '')} role="dialog" aria-hidden={!open}>
      <div className="admin">
        {!authed ? (
          <form className="admin-login" onSubmit={authenticate} style={{ gridColumn: '1 / -1', alignSelf: 'center' }}>
            <h2>PANEL <span style={{ color: 'var(--amber)' }}>ADMIN</span></h2>
            <p>RUAH LABS · CONTROL TOTAL</p>
            <Field label="Contraseña">
              <input
                className="input"
                type="password"
                value={pwd}
                onChange={e => setPwd(e.target.value)}
                autoFocus
                placeholder="••••••••"
              />
            </Field>
            <div className="err">{err}</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button type="submit" className="abtn amber" style={{ flex: 1 }}>Entrar →</button>
              <button type="button" className="abtn ghost" onClick={onClose}>Cancelar</button>
            </div>
          </form>
        ) : (
          <React.Fragment>
            <aside className="admin__side">
              <div className="admin__brand">
                <span className="dot"></span>
                ADMIN
              </div>
              <nav className="admin__nav">
                {ADMIN_VIEWS.map((v, i) => (
                  <button key={v.id} className={view === v.id ? 'active' : ''} onClick={() => setView(v.id)}>
                    <span>{v.label}</span>
                    <span className="num">{String(i).padStart(2, '0')}</span>
                  </button>
                ))}
              </nav>
              <div className="admin__footer">
                <button onClick={() => window.open(window.location.href, '_blank')}>↗ VER SITIO EN NUEVA PESTAÑA</button>
                <button onClick={logout}>← CERRAR SESIÓN</button>
                <button className="danger" onClick={onClose}>× CERRAR PANEL</button>
              </div>
            </aside>

            <main className="admin__main">
              <header className="admin__top">
                <div>
                  <h2>{activeMeta?.label || 'Panel'}</h2>
                  <div className="sub">RUAH LABS · ADMIN · LIVE</div>
                </div>
                <div className="admin__top__actions">
                  <span className="pulse"><span className="d"></span> guardado automáticamente</span>
                  <button className="abtn ghost" onClick={onClose}>← Volver al sitio</button>
                </div>
              </header>
              <div className="admin__body">
                <Active content={content} store={store} setView={setView} />
              </div>
            </main>
          </React.Fragment>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { Admin });
