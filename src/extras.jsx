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
  el._t = setTimeout(function() { el.textContent = ''; }, 10000);
}

// ============================================================
// CUADRO PRODUCT MODAL
// ============================================================
function CuadroProductModal({ productId, cuadros, onClose, onAddToCart, onBuyNow }) {
  const open = !!productId;
  const product = open ? (cuadros.products || []).find(p => p.id === productId) : null;
  const [idx, setIdx] = React.useState(0);

  React.useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    setIdx(0);
  }, [open, productId]);

  React.useEffect(() => {
    function onKey(e) { if (e.key === 'Escape' && open) onClose(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open || !product) return null;

  const gallery = [product.img, ...(product.gallery || [])].filter(Boolean);
  const currentImg = gallery[idx] || null;

  return ReactDOM.createPortal(
    <div className="pd-overlay open" onClick={onClose} role="dialog" aria-modal="true">
      <div className="pd" onClick={e => e.stopPropagation()}>
        <button className="pd__close" onClick={onClose} aria-label="Cerrar">×</button>
        <div className="pd__media">
          <div className="pd__main pd__main--artwork">
            {currentImg
              ? <img src={currentImg} alt={product.name} />
              : <div className="pd__ph" style={{ fontFamily: 'var(--mono)', fontSize: 14, letterSpacing: '0.2em' }}>{product.style || 'CU'}</div>}
          </div>
          {gallery.length > 1 && (
            <div className="pd__thumbs">
              {gallery.map((g, i) => (
                <button key={i} className={'pd__thumb' + (i === idx ? ' active' : '')} onClick={() => setIdx(i)} aria-label={'Imagen ' + (i + 1)}>
                  <img src={g} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="pd__body">
          <div className="pd__verse">{product.style}{product.size ? ' · ' + product.size : ''}{product.tag ? ' · ' + product.tag : ''}</div>
          <h2 className="pd__title">{product.name}</h2>
          <div className="pd__price"><span className="clp">CLP</span>${product.price}</div>
          <div className="pd__scrollable">
            {product.description && <p className="pd__desc">{product.description}</p>}
            {(product.details || []).length > 0 && (
              <div className="pd__details">
                {product.details.map(d => (
                  <div className="pd__detail" key={d.id}>
                    <span className="lbl">{d.label}</span>
                    <span className="val">{d.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="pd__protocol">
            <span className="icon">1×</span>
            <span className="txt"><strong>PROTOCOLO 1×1 ACTIVO.</strong>&nbsp;Esta compra dona una prenda a alguien en situación de calle.</span>
          </div>
          <div className="pd__cta">
            <button type="button" className="btn btn--amber" onClick={() => { if (onBuyNow) onBuyNow(product.id); else onClose(); }}>
              Ir a pagar <span className="arrow">→</span>
            </button>
            <button type="button" className="btn btn--ghost" onClick={() => { if (onAddToCart) onAddToCart(product.id, 1); }}>
              Añadir al carrito
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ============================================================
// GALLERY MODAL (shared: Iglesias + Eventos)
// ============================================================
function GalleryModal({ title, subtitle, photos, onClose }) {
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
      if (e.key === 'ArrowLeft'  && photos) setIdx(i => Math.max(i - 1, 0));
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose, photos]);

  if (!open) return null;
  const imgs = (photos || []).filter(Boolean);
  const total = imgs.length;

  function prev(e) { e && e.stopPropagation(); setIdx(i => Math.max(i - 1, 0)); }
  function next(e) { e && e.stopPropagation(); setIdx(i => Math.min(i + 1, total - 1)); }

  return (
    <div className="gallery-overlay open" role="dialog" aria-modal="true">
      <div className="gallery-modal" onClick={e => e.stopPropagation()}>

        {/* Cabecera con título + botón regresar */}
        <div className="gallery-modal__top">
          <div className="gallery-modal__info">
            {subtitle && <span className="gallery-modal__code">{subtitle}</span>}
            <h3 className="gallery-modal__name">{title}</h3>
          </div>
          <button className="gallery-modal__back" onClick={onClose}>
            ← REGRESAR
          </button>
        </div>

        {imgs.length === 0 ? (
          <div className="gallery-modal__empty">— SIN FOTOGRAFÍAS AÚN —</div>
        ) : (
          <React.Fragment>
            {/* Imagen principal */}
            <div
              className="gallery-modal__main"
              onTouchStart={e => { touchRef.current = e.touches[0].clientX; }}
              onTouchEnd={e => {
                var dx = e.changedTouches[0].clientX - (touchRef.current || 0);
                if (Math.abs(dx) > 40) { if (dx < 0) next(); else prev(); }
              }}
            >
              <img src={imgs[idx]} alt={title + ' · ' + (idx + 1)} />
              {total > 1 && (
                <React.Fragment>
                  <button className="gm__arr gm__arr--prev" onClick={prev} disabled={idx === 0}>&#8249;</button>
                  <button className="gm__arr gm__arr--next" onClick={next} disabled={idx === total - 1}>&#8250;</button>
                  <div className="gm__count">{idx + 1} / {total}</div>
                </React.Fragment>
              )}
            </div>

            {/* Strip de miniaturas con scroll horizontal */}
            {total > 1 && (
              <div className="gallery-modal__strip" ref={trackRef}>
                {imgs.map((ph, i) => (
                  <button
                    key={i}
                    className={'gm__thumb' + (i === idx ? ' active' : '')}
                    onClick={() => setIdx(i)}
                    aria-label={'Foto ' + (i + 1)}
                  >
                    <img src={ph} alt="" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </React.Fragment>
        )}
      </div>
    </div>
  );
}

// ============================================================
// CUADROS
// ============================================================
function LaunchScreen({ imageMobile, imageDesktop }) {
  return (
    <div style={{ position:'fixed', inset:0, zIndex:9999, background:'#000', overflow:'hidden' }}>
      {imageMobile  && <img src={imageMobile}  className="ls-img ls-img--mobile"  alt="" />}
      {imageDesktop && <img src={imageDesktop} className="ls-img ls-img--desktop" alt="" />}
    </div>
  );
}

function CuadrosComingSoon({ videoMobile, videoDesktop }) {
  return (
    <div style={{ position:'fixed', inset:0, zIndex:58, background:'#000', overflow:'hidden' }}>
      {videoMobile && (
        <video
          key={videoMobile}
          src={videoMobile}
          autoPlay loop muted playsInline
          className="cs-video cs-video--mobile"
        />
      )}
      {videoDesktop && (
        <video
          key={videoDesktop}
          src={videoDesktop}
          autoPlay loop muted playsInline
          className="cs-video cs-video--desktop"
        />
      )}
    </div>
  );
}

function Cuadros({ content, onAddToCart, onBuyNow, onOpenCuadro }) {
  const c = content.cuadros;
  const [activeStep, setActiveStep] = React.useState(0);
  const openCuadro = (id) => { if (onOpenCuadro) onOpenCuadro(id); };
  const [selectedEstilo, setSelectedEstilo] = React.useState(null);
  const [selectedFormato, setSelectedFormato] = React.useState(null);

  return (
    <section className="cuadros" id="cuadros">
      <div className="shell">
        <SectionHeader index={c.headerIndex} title={c.headerTitle} right={c.headerRight} />

        {/* Hero: title on left, style boxes on right */}
        <div className="cu-hero">
          <div className="cu-hero__text">
            <h3 className="cu-hero__title">
              <div><RevealLine delay={20}>{c.title1}</RevealLine></div>
              <div><RevealLine delay={140}>{c.title2}</RevealLine></div>
              <div><RevealLine delay={260}>{c.title3}</RevealLine></div>
            </h3>
            <Reveal delay={400} className="cu-hero__lede">
              <p>{c.lede}</p>
            </Reveal>
          </div>
          <div className="cu-hero__styles">
            {(c.styles || []).map((s, i) => (
              <Reveal key={s.id} delay={i * 70} className={'cu-style' + (s.img ? ' has-img' : '')}>
                {s.img && <img src={s.img} alt={s.tag} className="cu-style__img" />}
                <div className="cu-style__top">
                  <span className="cu-style__sq">▪</span>
                  <span className="cu-style__tag">{s.tag}</span>
                </div>
                <div className="cu-style__pattern"></div>
                <div className="cu-style__foot">
                  <span className="cu-style__bar"></span>
                  <span className="cu-style__desc">{s.desc}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* ── Catálogo de cuadros en venta ── */}
        {(c.products && c.products.length > 0) && (
          <div className="cu-catalog">
            <div className="cu-catalog__head">
              <Reveal><div className="mono-label">{c.productsEyebrow || '[ CATÁLOGO CUADROS ]'}</div></Reveal>
              <h3 className="cu-catalog__title">
                <RevealLine>{c.productsTitle || 'CUADROS'}</RevealLine>{' '}
                <RevealLine delay={120}><span className="amb">{c.productsTitleEm || 'EN VENTA'}</span></RevealLine>
              </h3>
              <Reveal delay={250}><p className="cu-catalog__sub">{c.productsSub}</p></Reveal>
            </div>
            <div className="cu-prod-grid">
              {(c.products || []).map((it, i) => (
                <Reveal key={it.id} delay={i * 70} className="cu-prod" onClick={() => openCuadro(it.id)}>
                  <div className="cu-prod__media">
                    {it.img
                      ? <img src={it.img} alt={it.name} loading="lazy" />
                      : <div className="cu-prod__ph">{(it.name || '').split(' ').slice(-1)[0].slice(0, 2)}</div>}
                    {it.tag && <span className="cu-prod__tag">{it.tag}</span>}
                    <span className="cu-prod__view">Ver detalle →</span>
                  </div>
                  <div className="cu-prod__body">
                    <div className="cu-prod__style">{it.style}</div>
                    <h4 className="cu-prod__name">{it.name}</h4>
                    <div className="cu-prod__row">
                      <div className="cu-prod__price"><span className="clp">CLP</span>${it.price}</div>
                      <button className="cu-prod__buy" onClick={e => { e.stopPropagation(); openCuadro(it.id); }}>Ver →</button>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        )}

        {/* Brief en 4 pasos */}
        <div className="cu-brief">
          <div className="cu-brief__left">
            <Reveal><div className="mono-label cu-brief__eyebrow">{c.briefEyebrow}</div></Reveal>
            <h3 className="cu-brief__title"><RevealLine>{c.briefTitle}</RevealLine></h3>
            <Reveal delay={200} className="cu-brief__sub"><p>{c.briefSub}</p></Reveal>
          </div>
          <div className="cu-brief__right">
            <div className="cu-tabs" role="tablist">
              {(c.steps || []).map((s, i) => (
                <button key={s.id} className={'cu-tab' + (i === activeStep ? ' active' : '')} onClick={() => setActiveStep(i)} role="tab" aria-selected={i === activeStep} type="button">
                  {s.num}-{s.name}
                </button>
              ))}
            </div>
            <div className="cu-panel">
              <div className="cu-panel__hd">
                PASO {c.steps[activeStep]?.num || '01'} {activeStep === 3 ? '· ENVIAR BRIEF' : '· ' + (c.steps[activeStep]?.name || '')}
              </div>

              {activeStep === 0 && (
                <React.Fragment>
                  <p className="cu-panel__lead">{c.step1Body}</p>
                  <div className="cu-refs">
                    {(c.refs || []).map((r, i) => (
                      <Reveal key={r.id} delay={i * 70} className={'cu-ref' + (r.img ? ' has-img' : '')}>
                        <div className="cu-ref__ph">
                          {r.img ? <img src={r.img} alt={r.name} /> : <div className="cu-ref__placeholder">+</div>}
                        </div>
                        <div className="cu-ref__top">
                          <span className="cu-ref__sq">▪</span>
                          <span className="cu-ref__code">{r.code}</span>
                        </div>
                        <div className="cu-ref__foot">
                          <span className="cu-ref__bar"></span>
                          <span className="cu-ref__name">{r.name}</span>
                        </div>
                      </Reveal>
                    ))}
                  </div>
                </React.Fragment>
              )}

              {activeStep === 1 && (
                <div className="cu-estilos">
                  {(c.estilos || []).map(e => (
                    <button key={e.id}
                      className={'cu-estilo' + (selectedEstilo === e.id ? ' selected' : '')}
                      type="button"
                      onClick={() => { setSelectedEstilo(e.id); setTimeout(() => setActiveStep(2), 300); }}>
                      {e.name}
                    </button>
                  ))}
                </div>
              )}

              {activeStep === 2 && (
                <div className="cu-formatos">
                  {(c.formatos || []).map(f => (
                    <button key={f.id}
                      className={'cu-formato' + (selectedFormato === f.id ? ' selected' : '')}
                      type="button"
                      onClick={() => { setSelectedFormato(f.id); setTimeout(() => setActiveStep(3), 300); }}>
                      <span className="cu-formato__size">{f.size}</span>
                      <span className="cu-formato__price">{f.price}</span>
                    </button>
                  ))}
                </div>
              )}

              {activeStep === 3 && (
                <CuadrosSendForm
                  fields={c.sendFields || []}
                  submitLabel={c.sendSubmit || 'ENVIAR BRIEF'}
                  selectedEstilo={selectedEstilo ? (c.estilos || []).find(e => e.id === selectedEstilo)?.name : null}
                  selectedFormato={selectedFormato ? (c.formatos || []).find(f => f.id === selectedFormato)?.size : null}
                />
              )}
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}

function CuadrosSendForm({ fields, submitLabel, selectedEstilo, selectedFormato }) {
  const [status, setStatus] = React.useState('idle'); // idle | sending | ok | err-NNN | net-err
  function onSubmit(e) {
    e.preventDefault();
    var fd  = new FormData(e.target);
    var row = { name: '', email: '', versiculo: '', notas: '', estilo: selectedEstilo || '', formato: selectedFormato || '' };
    fields.forEach(function(f) {
      var val = (fd.get(f.id) || '').trim();
      var lbl = (f.label || '').toUpperCase();
      if      (lbl.indexOf('NOMBRE') >= 0) row.name      = val;
      else if (lbl.indexOf('EMAIL')  >= 0) row.email     = val;
      else if (lbl.indexOf('VERS')   >= 0) row.versiculo = val;
      else if (lbl.indexOf('NOTA')   >= 0) row.notas     = val;
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
    })
    .then(function(r) {
      var s = r.ok ? 'ok' : 'err-' + r.status;
      setStatus(s);
      ruahDebug('CUADROS: HTTP ' + r.status + (r.ok ? ' ✓ GUARDADO' : ' ✗ ERROR'));
      setTimeout(function() { setStatus('idle'); }, 8000);
    })
    .catch(function(err) {
      setStatus('net-err');
      ruahDebug('CUADROS: NET-ERR — ' + err.message);
      setTimeout(function() { setStatus('idle'); }, 8000);
    });
  }
  var btnLabel = submitLabel;
  if (status === 'sending') btnLabel = 'ENVIANDO...';
  if (status === 'ok')      btnLabel = '✓ GUARDADO EN BD';
  if (status.indexOf('err') === 0) btnLabel = '✗ ' + status.toUpperCase();
  return (
    <form className={'cu-form' + (status === 'ok' ? ' sent' : '')} onSubmit={onSubmit}>
      {(selectedEstilo || selectedFormato) && (
        <div className="cu-form__summary">
          {selectedEstilo  && <span className="cu-form__tag">ESTILO: {selectedEstilo}</span>}
          {selectedFormato && <span className="cu-form__tag">FORMATO: {selectedFormato}</span>}
        </div>
      )}
      {fields.map(f => (
        <label key={f.id} className="cu-field">
          <span>{f.label}</span>
          {f.type === 'textarea'
            ? <textarea name={f.id} rows={3} placeholder={f.placeholder} required></textarea>
            : <input name={f.id} type={f.type || 'text'} placeholder={f.placeholder} required />}
        </label>
      ))}
      <button type="submit" className="cu-submit" disabled={status === 'sending'}>
        {btnLabel}
        {status === 'idle' && <span className="arr">→</span>}
      </button>
    </form>
  );
}

// ============================================================
// IGLESIAS
// ============================================================
function Iglesias({ content }) {
  const ig = content.iglesias;
  const [eventType, setEventType] = React.useState(ig.eventOptions[0] || '');
  const [submitted, setSubmitted] = React.useState(false);
  const [galleryProject, setGalleryProject] = React.useState(null);

  function onSubmit(e) {
    e.preventDefault();
    var fd = new FormData(e.target);
    var row = {
      iglesia:     (fd.get('iglesia')  || '').trim(),
      nombre:      (fd.get('contacto') || '').trim(),
      email:       (fd.get('email')    || '').trim(),
      evento_tipo: eventType,
      descripcion: (fd.get('brief')    || '').trim(),
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
    })
    .then(function(r) {
      setSubmitted(r.ok ? 'ok' : 'err-' + r.status);
      ruahDebug('IGLESIAS: HTTP ' + r.status + (r.ok ? ' ✓ GUARDADO' : ' ✗ ERROR'));
      setTimeout(function() { setSubmitted(false); }, 8000);
    })
    .catch(function(err) {
      setSubmitted('net-err');
      ruahDebug('IGLESIAS: NET-ERR — ' + err.message);
      setTimeout(function() { setSubmitted(false); }, 8000);
    });
  }

  return (
    <section className="iglesias" id="iglesias">
      <div className="shell">
        <SectionHeader index={ig.headerIndex} title={ig.headerTitle} right={ig.headerRight} />

        <div className="ig-hero">
          <div className="ig-hero__text">
            <h3 className="ig-hero__title">
              <div><RevealLine delay={20}>{ig.title1}</RevealLine></div>
              <div><RevealLine delay={160}>{ig.title2}</RevealLine></div>
            </h3>
            <Reveal delay={350} className="ig-hero__lede"><p>{ig.lede}</p></Reveal>
          </div>
          <Reveal delay={120} className={'ig-feat' + (ig.featureImg ? ' has-img' : '')}>
            {ig.featureImg && <img src={ig.featureImg} alt={ig.featureName} className="ig-feat__img" />}
            <div className="ig-feat__top">
              <span className="ig-feat__sq">▪</span>
              <span className="ig-feat__tag">{ig.featureTag}</span>
            </div>
            <div className="ig-feat__pattern"></div>
            <div className="ig-feat__foot">
              <span className="ig-feat__bar"></span>
              <span className="ig-feat__name">{ig.featureName}</span>
            </div>
          </Reveal>
        </div>

        <div className="ig-svcs">
          {ig.services.map((s, i) => (
            <Reveal key={s.id} delay={i * 80} className="ig-svc">
              <div className="ig-svc__top">
                <span className="ig-svc__num">{s.num}</span>
                <span className="ig-svc__dot">●</span>
              </div>
              <h4 className="ig-svc__name">{s.name}</h4>
              <p className="ig-svc__desc">{s.desc}</p>
            </Reveal>
          ))}
        </div>

        <div className="ig-port">
          <SectionHeader index={ig.portfolioIndex} title={ig.portfolioTitle} right={ig.portfolioRight} />
          <div className="ig-projs">
            {ig.projects.map((p, i) => {
              const hasGallery = (p.gallery || []).length > 0;
              return (
                <Reveal key={p.id} delay={i * 60} className={'ig-proj' + (hasGallery ? ' clickable' : '')}
                  onClick={() => hasGallery && setGalleryProject(p)}>
                  <div className={'ig-proj__card' + (p.img ? ' has-img' : '')}>
                    {p.img && <img src={p.img} alt={p.name} className="ig-proj__img" />}
                    <div className="ig-proj__top">
                      <span className="ig-proj__sq">▪</span>
                      <span className="ig-proj__code">{p.code}</span>
                    </div>
                    <div className="ig-proj__pattern"></div>
                    <div className="ig-proj__foot">
                      <span className="ig-proj__bar"></span>
                      <span className="ig-proj__name">{p.name}</span>
                    </div>
                    {hasGallery && (
                      <div className="ig-proj__gallery-badge">
                        {(p.gallery || []).length} foto{(p.gallery || []).length !== 1 ? 's' : ''} →
                      </div>
                    )}
                  </div>
                  <div className="ig-proj__meta">{p.meta}</div>
                </Reveal>
              );
            })}
          </div>
        </div>

        <div className="ig-formWrap">
          <div className="ig-formWrap__left">
            <Reveal><div className="mono-label ig-formWrap__eyebrow">{ig.formEyebrow}</div></Reveal>
            <h3 className="ig-formWrap__title"><RevealLine>{ig.formTitle}</RevealLine></h3>
            <Reveal delay={200} className="ig-formWrap__sub"><p>{ig.formSub}</p></Reveal>
          </div>
          <form className={'ig-form' + (submitted ? ' sent' : '')} onSubmit={onSubmit}>
            <label className="ig-field"><span>IGLESIA / MINISTERIO</span><input name="iglesia" type="text" required placeholder="Nombre" /></label>
            <label className="ig-field"><span>CONTACTO</span><input name="contacto" type="text" required placeholder="Tu nombre" /></label>
            <label className="ig-field"><span>EMAIL</span><input name="email" type="email" required placeholder="email" /></label>
            <label className="ig-field">
              <span>EVENTO</span>
              <select value={eventType} onChange={e => setEventType(e.target.value)}>
                {ig.eventOptions.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </label>
            <label className="ig-field ig-field--full"><span>BRIEF</span><textarea name="brief" rows={3} required placeholder="Cantidad, fecha, formato..."></textarea></label>
            <button type="submit" className="ig-submit" disabled={submitted === 'sending'}>
              {submitted === 'ok' ? '✓ GUARDADO EN BD' : submitted && submitted !== false ? '✗ ' + String(submitted).toUpperCase() : (submitted ? '✓ SOLICITUD ENVIADA' : ig.formSubmit)}
              {!submitted && <span className="arr">→</span>}
            </button>
          </form>
        </div>
      </div>

      {galleryProject && (
        <GalleryModal
          title={galleryProject.name}
          subtitle={galleryProject.code + ' · ' + galleryProject.meta}
          photos={galleryProject.gallery || []}
          onClose={() => setGalleryProject(null)}
        />
      )}
    </section>
  );
}

Object.assign(window, { Cuadros, Iglesias, GalleryModal });
