/* global React */
// ============================================================
// RUAH LABS — Public site sections
// ============================================================

// --- Reveal helpers ---
function useInView(threshold = 0.15) {
  const ref = React.useRef(null);
  const [inView, setInView] = React.useState(false);
  React.useEffect(() => {
    if (!ref.current) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {setInView(true);return;}
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {setInView(true);obs.disconnect();}
      });
    }, { threshold });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

function Reveal({ children, delay = 0, as: Tag = 'div', className = '', style = {}, ...rest }) {
  const [ref, inView] = useInView();
  return (
    <Tag
      ref={ref}
      className={(className + ' reveal' + (inView ? ' in' : '')).trim()}
      style={{ transitionDelay: delay + 'ms', ...style }}
      {...rest}>
      
      {children}
    </Tag>);

}

function RevealLine({ children, delay = 0, className = '' }) {
  const [ref, inView] = useInView(0.3);
  return (
    <span ref={ref} className={('reveal-mask' + (inView ? ' in' : '') + ' ' + className).trim()}>
      <span style={{ transitionDelay: delay + 'ms' }}>{children}</span>
    </span>);

}

// --- Section Header bar (reused across Iglesias / Cuadros / Protocolo)
function SectionHeader({ index, title, right, amberTitle = false }) {
  return (
    <div className="sec-bar">
      <div className="sec-bar__index">{index}</div>
      <h2 className={'sec-bar__title' + (amberTitle ? ' amb' : '')}>{title}</h2>
      <div className="sec-bar__right">{right}</div>
    </div>);

}

// --- Nav ---
function MobileDropdown({ label, children, amber }) {
  var [open, setOpen] = React.useState(false);
  return (
    <div className={'m-drop' + (open ? ' open' : '')}>
      <button className={'m-link m-drop__head' + (amber ? ' m-link--amber' : '')} type="button" onClick={() => setOpen(o => !o)}>
        <span>{label}</span>
        <span className="m-link__arr">{open ? '↑' : '↓'}</span>
      </button>
      <div className="m-drop__list">{children}</div>
    </div>
  );
}

function Nav({ content, onOpenProduct, cartCount = 0, onOpenCheckout, activePage, onNavigate, onGoHome }) {
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [openDrop, setOpenDrop] = React.useState(null);
  const navRef = React.useRef(null);
  const tripleClicksRef = React.useRef([]);
  const { nav, products } = content;

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  React.useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
  }, [mobileOpen]);

  React.useEffect(() => {
    function onClick(e) {
      if (navRef.current && !navRef.current.contains(e.target)) setOpenDrop(null);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  // Map href anchors → page keys
  const HREF_TO_PAGE = {
    '#nosotros':  'nosotros',
    '#servicios': 'servicios',
    '#productos': 'productos',
    '#cuadros':   'cuadros',
    '#iglesias':  'iglesias',
    '#evento':    'evento',
    '#protocolo': 'protocolo',
    '#comunidad': 'comunidad',
    '#design':    'design',
  };

  function navigate(href) {
    setOpenDrop(null);
    setMobileOpen(false);
    const page = HREF_TO_PAGE[href];
    if (page && onNavigate) {
      onNavigate(page);
      return;
    }
    if (href === '#top' || href === '/') {
      if (onGoHome) onGoHome();
      return;
    }
    if (href.startsWith('#')) {
      const el = document.querySelector(href);
      if (el) {
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
        return;
      }
    }
    window.location.href = href;
  }

  function navigateCategory(slug) {
    setOpenDrop(null);
    setMobileOpen(false);
    if (onNavigate) onNavigate('productos', slug);
  }

  // Triple-click on logo: scroll to top + dispatch secret-portal trigger.
  function onBrandClick(e) {
    e.preventDefault();
    const now = Date.now();
    tripleClicksRef.current = tripleClicksRef.current.filter((t) => now - t < 500);
    tripleClicksRef.current.push(now);
    if (tripleClicksRef.current.length >= 3) {
      tripleClicksRef.current = [];
      window.dispatchEvent(new CustomEvent('ruah:triggerSecret'));
      return;
    }
    if (onGoHome) onGoHome();
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <React.Fragment>
      <nav className={'nav' + (scrolled ? ' scrolled' : '') + (activePage ? ' has-page' : '')} ref={navRef}>
        <a
          href="#top"
          className="nav__brand"
          onClick={onBrandClick}
          aria-label={content.brand.name}
          title="·">

          <img src={(window.__resources && window.__resources.logoWordmark) || "https://res.cloudinary.com/dh05zwrbp/image/upload/v1781323723/ruahlabs/s0c7jhjeiwvrjclesxmj.png"} alt="RUAH LABS" className="nav__brand-img" />
        </a>

        <div className="nav__links">
          {activePage && (
            <button type="button" className="nav__link nav__link--inicio" onClick={() => onGoHome && onGoHome()}>
              ← INICIO
            </button>
          )}
          {nav.links.map((l) =>
          <div className={'nav__link-wrap' + (openDrop === l.id ? ' open' : '')} key={l.id}>
              {l.dropdown ?
            <React.Fragment>
                  <button
                className={'nav__link' + (openDrop === l.id ? ' open' : '')}
                onClick={() => setOpenDrop((o) => o === l.id ? null : l.id)}
                aria-expanded={openDrop === l.id}>
                
                    {l.label}
                    <span className="caret">▼</span>
                  </button>
                  <div className="nav__dropdown" role="menu">
                    {products.categories.map((c) =>
                <a
                  key={c.id}
                  href="#productos"
                  onClick={(e) => {e.preventDefault();navigateCategory(c.slug);}}>
                  
                        <span>{c.name}</span>
                        <span className="arr">→</span>
                      </a>
                )}
                  </div>
                </React.Fragment> :

            <a
              className="nav__link"
              href={l.href}
              onClick={(e) => {e.preventDefault();navigate(l.href);}}>
              
                  {l.label}
                </a>
            }
            </div>
          )}
        </div>

        <a className="nav__cta" href={nav.cta.href} onClick={(e) => {e.preventDefault();navigate(nav.cta.href);}}>
          {nav.cta.label}
          <span className="arrow">→</span>
        </a>

        <button
          className="nav__cart"
          type="button"
          onClick={onOpenCheckout}
          aria-label={'Carrito (' + cartCount + ')'}
          title="Ir a pagar"
        >
          <img
            src={(window.__resources && window.__resources.cartIcon) || 'https://res.cloudinary.com/dh05zwrbp/image/upload/v1781323690/ruahlabs/lmlhjytfctlr3apdcebc.png'}
            alt=""
            className="nav__cart__img"
            aria-hidden="true"
          />
          {cartCount > 0 && <span className="nav__cart__b">{cartCount}</span>}
        </button>

        <button
          className={'hamb' + (mobileOpen ? ' open' : '')}
          aria-label="Menú"
          onClick={() => setMobileOpen((o) => !o)}>

          <span className="hamb__bars"></span>
        </button>
      </nav>

      <div className={'mobile-menu' + (mobileOpen ? ' open' : '')}>
        <div className="mobile-menu__inner">
          <div className="mobile-menu__head" style={{justifyContent:'flex-end'}}>
            <button className="mobile-menu__x" onClick={() => setMobileOpen(false)} aria-label="Cerrar menú">×</button>
          </div>
          <nav className="mobile-menu__nav">
            {(function() {
              var linkMap = {};
              (nav.links || []).forEach(function(l) { linkMap[l.id] = l; });
              var mobileOrder = ['l0','l3','l2','l8','l1','l5','l7','l6','l4'];
              return mobileOrder.map(function(id) {
                var l = linkMap[id];
                if (!l) return null;
                var isAmber = l.id === 'l2';
                if (l.dropdown) {
                  return (
                    <MobileDropdown key={l.id} label={l.label} amber={isAmber}>
                      {products.categories.map((c) =>
                        <a key={c.id} href="#productos" className="m-sub__link"
                           onClick={(e) => { e.preventDefault(); navigateCategory(c.slug); setMobileOpen(false); }}>
                          {c.name}
                        </a>
                      )}
                    </MobileDropdown>
                  );
                }
                return (
                  <a key={l.id} href={l.href} className={'m-link' + (isAmber ? ' m-link--amber' : '')}
                     onClick={(e) => { e.preventDefault(); navigate(l.href); }}>
                    <span>{l.label}</span>
                    <span className="m-link__arr">→</span>
                  </a>
                );
              });
            })()}
            <a href={nav.cta.href} className="m-link m-link--cta"
               onClick={(e) => { e.preventDefault(); navigate(nav.cta.href); }}>
              <span>{nav.cta.label}</span>
              <span className="m-link__arr">→</span>
            </a>
          </nav>
        </div>
      </div>
    </React.Fragment>);

}

// --- Hero ---
function Hero({ content }) {
  const { hero } = content;
  return (
    <section className="hero" id="top">
      <video className="hero__video-bg hero__video-bg--desktop" src="https://res.cloudinary.com/dh05zwrbp/video/upload/v1781323721/ruahlabs/dk5p5bmllg4bzap3kovl.mp4" autoPlay muted loop playsInline preload="metadata" aria-hidden="true" />
      <video className="hero__video-bg hero__video-bg--mobile" src="https://res.cloudinary.com/dh05zwrbp/video/upload/v1781323714/ruahlabs/kv8jqlkslwzfedpjcjia.mp4" autoPlay muted loop playsInline preload="metadata" aria-hidden="true" />
      <div className="hero__texture" aria-hidden="true"></div>
      <div className="shell">
        <div className="hero__eyebrow">
          <span className="line"></span>
          <span className="mono-label">{hero.eyebrow}</span>
        </div>

        <h1 className="hero__title">
          <div><RevealLine delay={50}>{hero.titleLine1}</RevealLine></div>
          <div><RevealLine delay={180}>{hero.titleLine2}</RevealLine></div>
          <div>
            <RevealLine delay={310}>
              <span className="amb">{hero.titleLine3}</span>
            </RevealLine>
          </div>
        </h1>

        <div className="hero__bottom">
          <Reveal delay={500} className="hero__lede">
            <p style={{whiteSpace:'pre-line'}}>{hero.lede}</p>
          </Reveal>
          <Reveal delay={650} className="hero__ctas">
            <a className="btn btn--amber" href={hero.primaryCta.href}
               onClick={e => {
                 e.preventDefault();
                 window.dispatchEvent(new CustomEvent('ruah:navigateTo', { detail: { page: 'productos' } }));
               }}>
              {hero.primaryCta.label}
              <span className="arrow">→</span>
            </a>
            <a className="btn btn--white" href={hero.secondaryCta.href}>
              {hero.secondaryCta.label}
            </a>
          </Reveal>
        </div>
      </div>

      <div className="hero__marquee">
        <div className="marquee__track" aria-hidden="true">
          <span>
            {Array.from({ length: 2 }).map((_, i) =>
            <React.Fragment key={i}>
                {hero.marquee.split('·').map((piece, j) =>
              <React.Fragment key={j}>
                    {piece.trim()}
                    <span className="star">✦</span>
                  </React.Fragment>
              )}
              </React.Fragment>
            )}
          </span>
        </div>
      </div>
    </section>);

}

// --- Home Intro (post-hero info strip) ---
function HomeIntro({ content }) {
  const h = content.home || {};
  const intro = h.intro || {};
  return (
    <section className="home-intro">
      <div className="shell">
        <Reveal className="home-intro__inner">
          <span className="mono-label home-intro__eye">{intro.eyebrow || 'SANTIAGO · CHILE'}</span>
          <p className="home-intro__text">{intro.text || ''}</p>
        </Reveal>
      </div>
    </section>
  );
}

// --- Featured Duo (2 prendas destacadas) ---
function FeaturedDuo({ content, onOpenProduct }) {
  const items = (content.products && content.products.items || []).filter(p => p.featuredOnHome).slice(0, 2);
  if (!items.length) return null;

  return (
    <section className="feat-duo">
      <div className="shell">
        <div className="feat-duo__grid">
          {items.map((item, i) => (
            <Reveal key={item.id} delay={i * 100} className="feat-card" onClick={() => onOpenProduct && onOpenProduct(item.id)}>
              <div className="feat-card__media">
                {item.img
                  ? <img src={item.img} alt={item.name} loading="lazy" />
                  : <div className="feat-card__ph">{(item.name || 'RL').slice(0, 2)}</div>
                }
                <span className="feat-card__hover">Ver detalle →</span>
              </div>
              <div className="feat-card__body">
                <h3 className="feat-card__name">{item.name}</h3>
                <div className="feat-card__row">
                  <span className="feat-card__price"><span className="clp">CLP</span>${item.price}</span>
                  <button
                    type="button"
                    className="btn btn--amber feat-card__cta"
                    onClick={(e) => { e.stopPropagation(); onOpenProduct && onOpenProduct(item.id); }}
                  >
                    Comprar <span>→</span>
                  </button>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// --- Home 3D Museum Carousel ---
function HomeCategoryCarousel({ content, onOpenProduct }) {
  const p = content.products || {};
  const cats = (p.categories || []).filter(c => c.slug !== 'todo');
  const items = p.items || [];
  const [idx, setIdx] = React.useState(0);

  // For each category: prefer featuredInCarousel item with img, else first with img, else first
  const carouselItems = cats.map(cat => {
    const catItems = items.filter(it => it.categoryId === cat.id);
    const featured = catItems.find(it => it.featuredInCarousel && it.img);
    const withImg = catItems.find(it => it.img);
    const pick = featured || withImg || catItems[0];
    return pick ? { ...pick, catName: cat.name, catSlug: cat.slug } : null;
  }).filter(Boolean);

  const total = carouselItems.length;
  function prev() { setIdx(i => (i - 1 + total) % total); }
  function next() { setIdx(i => (i + 1) % total); }

  function getPos(i) {
    if (i === idx) return 'center';
    if (i === (idx - 1 + total) % total) return 'left';
    if (i === (idx + 1) % total) return 'right';
    return 'hidden';
  }

  if (total === 0) return null;
  const current = carouselItems[idx];

  return (
    <section className="c3d">
      <div className="c3d__head">
        <p className="c3d__title">{(content.home && content.home.carousel && content.home.carousel.title) || 'EXPLORAR POR CATEGORÍA'}</p>
      </div>

      <div className="c3d__stage">
        <button type="button" className="c3d__arr c3d__arr--prev" onClick={prev} aria-label="Anterior">&#8592;</button>
        <div className="c3d__track">
          {carouselItems.map((item, i) => {
            const pos = getPos(i);
            return (
              <div
                key={item.id}
                className={'c3d__card c3d__card--' + pos}
                onClick={() => {
                  if (pos === 'center') { window.dispatchEvent(new CustomEvent('ruah:navigateTo', { detail: { page: 'productos', category: item.catSlug } })); }
                  else if (pos === 'left') prev();
                  else if (pos === 'right') next();
                }}
              >
                <div className="c3d__card-media">
                  {item.img
                    ? <img src={item.img} alt={item.name} loading="lazy" />
                    : <div className="c3d__ph">{(item.catName || '').slice(0, 2).toUpperCase()}</div>
                  }
                </div>
                <span className="c3d__cat-badge">{item.catName}</span>
              </div>
            );
          })}
        </div>
        <button type="button" className="c3d__arr c3d__arr--next" onClick={next} aria-label="Siguiente">&#8594;</button>
      </div>

      <div className="c3d__info">
        <div className="c3d__info-cat">{current.catName}</div>
        <h3 className="c3d__info-name">{current.name}</h3>
        {current.description && <p className="c3d__info-desc">{current.description}</p>}
        <div className="c3d__info-price"><span className="clp">CLP</span> ${current.price}</div>
        <button type="button" className="c3d__info-btn" onClick={() => window.dispatchEvent(new CustomEvent('ruah:navigateTo', { detail: { page: 'productos', category: current.catSlug } }))}>Ver categoría &#8594;</button>
      </div>

      <div className="c3d__dots">
        {carouselItems.map((_, i) => (
          <button
            key={i}
            type="button"
            className={'c3d__dot' + (i === idx ? ' active' : '')}
            onClick={() => setIdx(i)}
            aria-label={'Ir a ítem ' + (i + 1)}
          />
        ))}
      </div>
    </section>
  );
}

// --- Design Gallery (Museum) ---
function DesignGallery({ content }) {
  const piezas = ((content.design && content.design.piezas) || [])
    .filter(p => p.estado === 'visible')
    .sort((a, b) => (a.orden || 0) - (b.orden || 0));

  const [idx,   setIdx]  = React.useState(0);
  const [modal, setModal] = React.useState(null);
  const pausedRef    = React.useRef(false);
  const touchRef     = React.useRef(null);
  const modalTouchRef = React.useRef(null);
  const total = piezas.length;

  React.useEffect(() => {
    if (total < 2) return;
    const id = setInterval(() => {
      if (!pausedRef.current) setIdx(i => (i + 1) % total);
    }, 7000);
    return () => clearInterval(id);
  }, [total]);

  React.useEffect(() => {
    function onKey(e) {
      if (e.key === 'ArrowLeft')  { pausedRef.current = true; setIdx(i => (i - 1 + total) % total); }
      if (e.key === 'ArrowRight') { pausedRef.current = true; setIdx(i => (i + 1) % total); }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [total]);

  function goTo(i) { pausedRef.current = true; setIdx(((i % total) + total) % total); }

  const pieza = piezas[idx] || null;

  /* ── PLACEHOLDER cards when gallery is empty ── */
  const placeholders = ['MINIMAL', 'TIPOGRAFÍA', 'COLLAGE', 'ABSTRACTO', 'BÍBLICO', 'RETRATO'];

  return (
    <section
      id="design"
      className="dg"
      onMouseEnter={() => { pausedRef.current = true; }}
      onMouseLeave={() => { pausedRef.current = false; }}
      onTouchStart={e => { touchRef.current = e.touches[0].clientX; }}
      onTouchEnd={e => {
        const dx = e.changedTouches[0].clientX - (touchRef.current || 0);
        if (Math.abs(dx) > 44) { if (dx < 0) goTo(idx + 1); else goTo(idx - 1); }
      }}
    >
      {/* ── Card stage ── */}
      <div className="dg__stage">
        {(total > 0 ? piezas : placeholders).map((p, i) => {
          const isPlaceholder = total === 0;
          const name   = isPlaceholder ? p : p.nombre;
          const numStr = String(i + 1).padStart(2, '0');
          const offset = i - (isPlaceholder ? 2 : idx);
          const isCenter = offset === 0;
          const absOff = Math.abs(offset);
          const cls = ['dg__item',
            isCenter ? 'dg__item--active' : '',
            absOff === 1 ? 'dg__item--near' : '',
            absOff === 2 ? 'dg__item--far'  : '',
            absOff >= 3  ? 'dg__item--out'  : '',
          ].filter(Boolean).join(' ');

          return (
            <div
              key={isPlaceholder ? i : p.id}
              className={cls}
              onClick={() => { if (isPlaceholder) return; isCenter ? setModal({ pieza: p, imgIdx: 0 }) : goTo(i); }}
              role={isPlaceholder ? undefined : 'button'}
              tabIndex={isCenter && !isPlaceholder ? 0 : -1}
              aria-label={isPlaceholder ? name : (isCenter ? 'Ver: ' + name : 'Ir a ' + name)}
            >
              <div className="dg__item-label">
                <span className="dg__item-name">{name}</span>
                <span className="dg__item-num">{numStr}</span>
              </div>
              <div className="dg__card">
                <span className="dg__card-corner dg__card-corner--tl">1×<br/>▲</span>
                <div className="dg__card-img">
                  {(!isPlaceholder && p.imagen_principal)
                    ? <img src={p.imagen_principal} alt={name} loading="lazy" />
                    : <div className="dg__card-ph">{name.slice(0, 2).toUpperCase()}</div>
                  }
                </div>
                <span className="dg__card-corner dg__card-corner--br">1×<br/>▲</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Dots ── */}
      {total > 1 && (
        <div className="dg__dots">
          {piezas.map((_, i) => (
            <button key={i} className={'dg__dot' + (i === idx ? ' active' : '')} onClick={() => goTo(i)} aria-label={'Pieza ' + (i + 1)} />
          ))}
        </div>
      )}

      {/* ── Footer ── */}
      <div className="dg__footer">
        <div className="dg__footer-left">
          <p className="dg__footer-kicker">diseños que predican</p>
          <h2 className="dg__footer-word">PERSONALIZADOS</h2>
        </div>
        <div className="dg__footer-right">
          <p className="dg__footer-desc">Hacemos piezas únicas centradas en Cristo. Tú eliges el versículo, el estilo y el formato.</p>
          <a
            href="mailto:contacto@ruahlabs.cl?subject=Cotización%20diseño%20personalizado"
            className="dg__footer-cta"
          >COTIZAR →</a>
        </div>
      </div>

      {/* ── Modal (imagen pantalla completa + info abajo) ── */}
      {modal && (
        <div
          className="museum__modal-overlay"
          onClick={() => setModal(null)}
          role="dialog" aria-modal="true"
          aria-label={'Ver: ' + modal.pieza.nombre}
        >
          <div className="museum__modal" onClick={e => e.stopPropagation()}>
            <button className="museum__modal-x" onClick={() => setModal(null)} aria-label="Cerrar">&#x2715;</button>

            {/* Imagen principal con swipe y flechas */}
            {(() => {
              const imgs = modal.pieza.imagenes_detalle && modal.pieza.imagenes_detalle.length > 0
                ? modal.pieza.imagenes_detalle
                : modal.pieza.imagen_principal ? [modal.pieza.imagen_principal] : [];
              const totalImgs = imgs.length;
              function modalPrev() { if (totalImgs > 1) setModal(m => ({ ...m, imgIdx: (m.imgIdx - 1 + totalImgs) % totalImgs })); }
              function modalNext() { if (totalImgs > 1) setModal(m => ({ ...m, imgIdx: (m.imgIdx + 1) % totalImgs })); }
              return (
                <div className="museum__modal-imgwrap"
                  onTouchStart={e => { modalTouchRef.current = e.touches[0].clientX; }}
                  onTouchEnd={e => {
                    var dx = e.changedTouches[0].clientX - (modalTouchRef.current || 0);
                    if (Math.abs(dx) > 40) { if (dx < 0) modalNext(); else modalPrev(); }
                  }}>
                  {imgs.length > 0
                    ? <img src={imgs[modal.imgIdx] || imgs[0]} alt={'Detalle ' + (modal.imgIdx + 1)} loading="lazy" />
                    : <div className="museum__modal-ph">{(modal.pieza.nombre || 'RL').slice(0, 2)}</div>}
                  {totalImgs > 1 && (
                    <React.Fragment>
                      <button className="museum__modal-arr museum__modal-arr--prev" onClick={e => { e.stopPropagation(); modalPrev(); }} aria-label="Anterior">&#8249;</button>
                      <button className="museum__modal-arr museum__modal-arr--next" onClick={e => { e.stopPropagation(); modalNext(); }} aria-label="Siguiente">&#8250;</button>
                      <div className="museum__modal-count">{(modal.imgIdx || 0) + 1} / {totalImgs}</div>
                    </React.Fragment>
                  )}
                </div>
              );
            })()}

            {/* Info strip en la parte inferior */}
            <div className="museum__modal-info">
              <div className="museum__modal-meta">
                {(modal.pieza.cliente || modal.pieza.fecha_creacion) && (
                  <p className="museum__modal-eyebrow">
                    {[modal.pieza.cliente, modal.pieza.fecha_creacion].filter(Boolean).join(' · ')}
                  </p>
                )}
                <h2 className="museum__modal-title">{modal.pieza.nombre}</h2>
                {(modal.pieza.descripcion_historia || modal.pieza.descripcion_breve) && (
                  <p className="museum__modal-desc">
                    {modal.pieza.descripcion_historia || modal.pieza.descripcion_breve}
                  </p>
                )}
              </div>
              {modal.pieza.imagenes_detalle && modal.pieza.imagenes_detalle.length > 1 && (
                <div className="museum__modal-thumbs">
                  {modal.pieza.imagenes_detalle.map((url, ti) => (
                    <button
                      key={ti}
                      className={'museum__modal-thumb' + (ti === modal.imgIdx ? ' active' : '')}
                      onClick={() => setModal(m => ({ ...m, imgIdx: ti }))}
                      aria-label={'Detalle ' + (ti + 1)}
                    >
                      <img src={url} alt={'Detalle ' + (ti + 1)} loading="lazy" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

// --- Page wrapper for section views ---
function PageView({ title, onBack, children }) {
  return (
    <div className="page-view">
      {children}
    </div>
  );
}

// --- About / Quienes Somos ---
function About({ content }) {
  const a = content.about;
  return (
    <section className="about" id="nosotros">
      <div className="shell">
        <div className="sec-head">
          <Reveal>
            <div className="sec-head__num">{a.eyebrow}</div>
          </Reveal>
          <div>
            <h2 className="sec-head__title sec-head__title--about">
              <RevealLine>{a.title}</RevealLine>{' '}
              <RevealLine delay={120}><span className="amb">{a.titleEm}</span></RevealLine>
            </h2>
            <Reveal delay={250} className="sec-head__sub">
              <p>{a.sub}</p>
            </Reveal>
          </div>
        </div>

        <div className="about__grid">
          <Reveal delay={50}>
            <div className="mono-label" style={{ marginBottom: 12 }}>NUESTRA HISTORIA</div>
          </Reveal>
          <Reveal delay={150} className="about__body">
            {a.body.map((p, i) => <p key={i}>{p}</p>)}
          </Reveal>
        </div>

        <div className="about__pillars">
          {a.pillars.map((p, i) =>
          <Reveal key={p.id} delay={i * 80} className="pillar">
              <div className="pillar__num">{p.num} / PILAR</div>
              <h3 className="pillar__title">{p.title}</h3>
              <p className="pillar__desc">{p.desc}</p>
            </Reveal>
          )}
        </div>

        <div className="about__metrics">
          {a.metrics.map((m, i) =>
          <Reveal key={m.id} delay={i * 100} className="about__metric">
              <div className="num">{m.num}</div>
              <div className="lbl">{m.lbl}</div>
            </Reveal>
          )}
        </div>
      </div>
    </section>);

}

// --- Protocol (1×1) — NUEVO DISEÑO (matches reference) ---
function Protocol({ content }) {
  const p = content.protocol;
  return (
    <section className="protocol" id="protocolo">
      <div className="shell">
        <SectionHeader
          index={p.headerIndex}
          title={p.headerTitle}
          right={p.headerRight}
          amberTitle={true} />
        

        <div className="pr-grid">
          {/* Left column */}
          <div className="pr-left">
            <h3 className="pr-bigtitle">
              <div><RevealLine delay={20}>{p.title1}</RevealLine></div>
              <div>
                <RevealLine delay={140}>
                  <span className={p.title2Amber ? 'amb' : ''}>{p.title2}</span>
                </RevealLine>
              </div>
              <div><RevealLine delay={260}>{p.title3}</RevealLine></div>
              <div>
                <RevealLine delay={380}>
                  <span className={p.title4Amber ? 'amb' : ''}>{p.title4}</span>
                </RevealLine>
              </div>
            </h3>

            <div className="pr-sections">
              {(p.sections || []).map((s, i) =>
              <Reveal key={s.id} delay={i * 80} className="pr-sec">
                  <h4 className="pr-sec__hd">{s.heading}</h4>
                  <p className="pr-sec__body">{s.body}</p>
                </Reveal>
              )}
            </div>

            <Reveal delay={300} className="pr-quote">
              <div className="pr-quote__ref">{p.quoteRef}</div>
              <p className="pr-quote__text">{p.quoteText}</p>
            </Reveal>
          </div>

          {/* Right column */}
          <aside className="pr-right">
            <div className="pr-flow">
              <div className="pr-flow__hd">{p.flowTitle}</div>
              <ol className="pr-flow__list">
                {(p.flow || []).map((f) =>
                <li key={f.id} className="pr-flow__item">
                    <span className="pr-flow__num">{f.num}</span>
                    <span className="pr-flow__name">{f.name}</span>
                    <span className="pr-flow__sep">→</span>
                    <span className="pr-flow__det">{f.detail}</span>
                  </li>
                )}
              </ol>
            </div>

            <div className="pr-team">
              <div className="pr-team__top">
                <span className="pr-team__lbl">▪ {p.teamTitle}</span>
                <span className="pr-team__meta">{p.teamMeta}</span>
              </div>
              <div className="pr-team__ph">
                {p.teamImg
                  ? <img src={p.teamImg} alt={p.teamCaption} className="pr-team__img" />
                  : <div className="pr-team__grid"></div>}
              </div>
              <div className="pr-team__cap">
                <span className="pr-team__dot">▍</span>
                <span>{p.teamCaption}</span>
              </div>
            </div>

            <a href={p.activateHref || '#productos'} className="pr-activate">
              <span>{p.activateCta}</span>
              <span className="pr-activate__arr">→</span>
            </a>
          </aside>
        </div>
      </div>
    </section>);

}

// --- Services ---
function Services({ content }) {
  const s = content.services;
  return (
    <section className="services" id="servicios">
      <div className="shell">
        <div className="sec-head">
          <Reveal>
            <div className="sec-head__num">{s.eyebrow}</div>
          </Reveal>
          <div>
            <h2 className="sec-head__title sec-head__title--services">
              <RevealLine>{s.title}</RevealLine>{' '}
              <RevealLine delay={120}><span className="amb">{s.titleEm}</span></RevealLine>
            </h2>
            <Reveal delay={250} className="sec-head__sub">
              <p>{s.sub}</p>
            </Reveal>
          </div>
        </div>

        <div className="svc-list">
          {s.items.map((item, i) =>
          <Reveal key={item.id} delay={i * 80} className="svc-row">
              <span className="svc-row__num">{String(i + 1).padStart(2, '0')} /</span>
              <h3 className="svc-row__name">{item.name}</h3>
              <p className="svc-row__desc">{item.desc}</p>
              <a className="svc-row__cta" href="#contacto">
                <span className="lbl">Cotizar</span>
                <span className="arr">→</span>
              </a>
            </Reveal>
          )}
        </div>
      </div>
    </section>);

}

// --- Products ---
function Products({ content, onOpenProduct, initialCategory }) {
  const p = content.products;
  const [activeSlug, setActiveSlug] = React.useState(initialCategory || 'todo');

  React.useEffect(() => {
    if (initialCategory) setActiveSlug(initialCategory);
  }, [initialCategory]);

  React.useEffect(() => {
    function onSet(e) {setActiveSlug(e.detail.slug);}
    window.addEventListener('ruah:setCategory', onSet);
    return () => window.removeEventListener('ruah:setCategory', onSet);
  }, []);

  const activeCat = p.categories.find((c) => c.slug === activeSlug) || p.categories[0];
  const countFor = (cat) => cat.slug === 'todo' ? p.items.length : p.items.filter((it) => it.categoryId === cat.id).length;
  const parsePrice = (s) => parseInt(String(s || '0').replace(/[^0-9]/g, ''), 10) || 0;
  const baseItems = activeCat.slug === 'todo' ?
  p.items :
  p.items.filter((it) => it.categoryId === activeCat.id);
  // Orden automático: de menor a mayor precio
  const items = [...baseItems].sort((a, b) => parsePrice(a.price) - parsePrice(b.price));

  return (
    <section className="products" id="productos">
      <div className="shell">
        <div className="sec-head">
          <Reveal>
            <div className="sec-head__num">{p.eyebrow}</div>
          </Reveal>
          <div>
            <h2 className="sec-head__title sec-head__title--products">
              <RevealLine>{p.title}</RevealLine>{' '}
              <RevealLine delay={120}><span className="amb">{p.titleEm}</span></RevealLine>
            </h2>
            <Reveal delay={250} className="sec-head__sub">
              <p>{p.sub}</p>
            </Reveal>
          </div>
        </div>

        <Reveal>
          <div className="cat-bar" role="tablist" aria-label="Categorías de producto">
            {p.categories.map((c) =>
            <button
              key={c.id}
              className={'cat-chip' + (activeSlug === c.slug ? ' active' : '')}
              onClick={() => setActiveSlug(c.slug)}
              role="tab"
              aria-selected={activeSlug === c.slug}>
              
                {c.name}
                <span className="count">{countFor(c)}</span>
              </button>
            )}
          </div>
        </Reveal>

        {items.length === 0 ?
        <div className="empty-state">— SIN PRODUCTOS EN ESTA CATEGORÍA POR AHORA —</div> :

        <div className="prod-grid">
            {items.map((it, i) =>
          <Reveal key={it.id} delay={i * 60} className="prod" onClick={() => onOpenProduct(it.id)}>
                <div className="prod__media">
                  {it.img ?
              <img src={it.img} alt={it.name} loading="lazy" /> :
              <div className="prod__ph">{it.name.split(' ').slice(-1)[0].slice(0, 2)}</div>
              }
                    <span className="prod__view">Ver detalle →</span>
                </div>
                <div className="prod__body">
                  <div className="prod__verse">{it.verse}</div>
                  <h3 className="prod__title">{it.name}</h3>
                  {it.stockType === 'limitado' && (() => {
                    const s = it.stockActual != null ? it.stockActual : it.stockTotal;
                    return s > 0
                      ? <div className={'prod__stock' + (s <= 5 ? ' prod__stock--low' : '')}>{s <= 5 ? '⚠ Solo quedan ' + s : 'Quedan ' + s + ' unidades'}</div>
                      : <div className="prod__stock prod__stock--out">— Agotado</div>;
                  })()}
                  <div className="prod__row">
                    <div className="prod__price">{(!it.price || it.price === 0 || it.price === '0') ? <span className="clp">A CONSULTAR</span> : <React.Fragment><span className="clp">CLP</span>${it.price}</React.Fragment>}</div>
                    <button
                  className="prod__buy"
                  onClick={(e) => {e.stopPropagation();onOpenProduct(it.id);}}>
                      Comprar y donar <span>→</span>
                    </button>
                  </div>
                  <div className="prod__guarantee">✓ 30 días cambio · ✓ Protocolo 1×1 activo</div>
                </div>
              </Reveal>
          )}
          </div>
        }
      </div>
    </section>);

}

// --- Product Detail Modal ---
function ProductDetail({ productId, content, onClose, onBuyNow, onAddToCart, overrideImg }) {
  const open = !!productId;
  const product = open ? content.products.items.find((p) => p.id === productId) : null;
  const [idx, setIdx] = React.useState(0);
  const [zoomed, setZoomed] = React.useState(false);
  const [selectedSize, setSelectedSize] = React.useState(null);

  const SIZES = {
    adulto: ['S', 'M', 'L', 'XL', 'XXL'],
    nino:   ['4', '6', '8', '10', '12', '14', '16'],
    unica:  ['Talla Única'],
  };

  React.useEffect(() => {
    if (!open) { document.body.style.overflow = ''; return; }
    const found = content.products.items.find((x) => x.id === productId);
    document.body.style.overflow = found ? 'hidden' : '';
    setIdx(0); setZoomed(false); setSelectedSize(null);
  }, [open, productId]);

  // Auto-close if productId doesn't match any product (prevents body-scroll freeze)
  React.useEffect(() => {
    if (open && !product) { document.body.style.overflow = ''; onClose(); }
  }, [open, product]);

  var pdTouchRef = React.useRef(null);
  var galleryLenRef = React.useRef(1);

  React.useEffect(() => {
    function onKey(e) {
      if (!open) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setIdx(i => (i + 1) % galleryLenRef.current);
      if (e.key === 'ArrowLeft')  setIdx(i => (i - 1 + galleryLenRef.current) % galleryLenRef.current);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open || !product) {
    return <div className="pd-overlay" aria-hidden="true"></div>;
  }

  const overrideImgs = Array.isArray(overrideImg) ? overrideImg : (overrideImg ? [overrideImg] : []);
  const gallery = [...overrideImgs, product.img, ...(product.gallery || [])].filter((v, i, a) => v && a.indexOf(v) === i);
  galleryLenRef.current = gallery.length;
  const currentImg = gallery[idx] || product.img;

  function pdPrev(e) { e.stopPropagation(); setIdx(i => (i - 1 + gallery.length) % gallery.length); }
  function pdNext(e) { e.stopPropagation(); setIdx(i => (i + 1) % gallery.length); }

  return (
    <div className={'pd-overlay open'} onClick={onClose} role="dialog" aria-modal="true">
      <div className="pd" onClick={(e) => e.stopPropagation()}>
        <button className="pd__close" onClick={onClose} aria-label="Cerrar">×</button>

        <div className="pd__media">
          <div
            className={'pd__main' + (zoomed ? ' pd__main--zoomed' : '')}
            onClick={() => setZoomed(z => !z)}
            onTouchStart={e => { pdTouchRef.current = e.touches[0].clientX; }}
            onTouchEnd={e => {
              var dx = e.changedTouches[0].clientX - (pdTouchRef.current || 0);
              if (Math.abs(dx) > 40) { if (dx < 0) pdNext(e); else pdPrev(e); }
            }}
          >
            {currentImg ?
            <img src={currentImg} alt={product.name} /> :
            <div className="pd__ph">{product.name.split(' ').slice(-1)[0].slice(0, 2)}</div>}
            {gallery.length > 1 && (
              <React.Fragment>
                <button className="pd__arr pd__arr--prev" onClick={pdPrev} aria-label="Anterior">&#8249;</button>
                <button className="pd__arr pd__arr--next" onClick={pdNext} aria-label="Siguiente">&#8250;</button>
                <div className="pd__arr-count">{idx + 1} / {gallery.length}</div>
              </React.Fragment>
            )}
          </div>
          {gallery.length > 1 &&
          <div className="pd__thumbs">
              {gallery.map((g, i) =>
            <button
              key={i}
              className={'pd__thumb' + (i === idx ? ' active' : '')}
              onClick={() => setIdx(i)}
              aria-label={'Imagen ' + (i + 1)}>

                  <img src={g} alt="" />
                </button>
            )}
            </div>
          }
        </div>

        <div className="pd__body">
          <div className="pd__verse">{product.verse} {product.tag ? '· ' + product.tag : ''}</div>
          <h2 className="pd__title">{product.name}</h2>
          <div className="pd__price"><span className="clp">CLP</span>${product.price}</div>

          {/* Badge de stock */}
          {(() => {
            const st = product.stockType || 'permanente';
            const avail = product.stockActual != null ? product.stockActual : (product.stockTotal || 0);
            if (st === 'limitado') return (
              <div className="pd__stock pd__stock--limited">
                <span className="pd__stock-dot"/>
                <span>STOCK LIMITADO · {avail} / {product.stockTotal || 0} disponibles</span>
              </div>
            );
            if (st === 'unica') return (
              <div className="pd__stock pd__stock--unique">
                <span className="pd__stock-dot"/>
                <span>PIEZA ÚNICA</span>
              </div>
            );
            return null;
          })()}

          {/* Selector de talla */}
          <div className="pd__sizes">
            <div className="pd__sizes-label">TALLA</div>
            <div className="pd__sizes-btns">
              {(SIZES[product.sizeType] || SIZES.adulto).map(s => (
                <button
                  key={s}
                  type="button"
                  className={'pd__size-btn' + (selectedSize === s ? ' active' : '')}
                  onClick={() => setSelectedSize(s === selectedSize ? null : s)}
                >{s}</button>
              ))}
            </div>
          </div>

          <div className="pd__scrollable">
            {product.description &&
            <p className="pd__desc">{product.description}</p>
            }
            {(product.material || product.estampado || product.fit || product.tallas || product.origen) &&
            <div className="pd__details">
              {product.material  && <div className="pd__detail"><span className="lbl">Material</span><span className="val">{product.material}</span></div>}
              {product.estampado && <div className="pd__detail"><span className="lbl">Estampado</span><span className="val">{product.estampado}</span></div>}
              {product.fit       && <div className="pd__detail"><span className="lbl">Fit</span><span className="val">{product.fit}</span></div>}
              {product.tallas    && <div className="pd__detail"><span className="lbl">Tallas</span><span className="val">{product.tallas}</span></div>}
              {product.origen    && <div className="pd__detail"><span className="lbl">Origen</span><span className="val">{product.origen}</span></div>}
            </div>
            }
            {product.details && product.details.length > 0 &&
            <div className="pd__details">
              {product.details.map((d) =>
              <div className="pd__detail" key={d.id}>
                <span className="lbl">{d.label}</span>
                <span className="val">{d.value}</span>
              </div>
              )}
            </div>
            }
          </div>

          <div className="pd__protocol">
            <span className="icon">1×</span>
            <span className="txt">
              <strong>PROTOCOLO 1×1 ACTIVO.</strong>&nbsp;Comprar esta pieza dona una prenda a alguien en situación de calle.
            </span>
          </div>

          <div className="pd__cta">
            <button
              type="button"
              className="btn btn--amber"
              onClick={() => { if (onBuyNow) onBuyNow(product.id, selectedSize); else onClose(); }}
            >
              Ir a pagar <span className="arrow">→</span>
            </button>
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => { if (onAddToCart) onAddToCart(product.id, 1, selectedSize); }}
            >
              Añadir al carrito
            </button>
          </div>
        </div>
      </div>
    </div>);

}

// --- Manifesto ---
function Manifesto({ content }) {
  return (
    <section className="manifesto">
      <div className="shell">
        <h2 className="manifesto__text">
          {content.manifesto.text.map((seg, i) =>
          <React.Fragment key={i}>
              <RevealLine delay={i * 150}>
                {seg.em ?
              <span className="amb">{seg.txt}</span> :
              seg.strike ?
              <span className="strike">{seg.txt}</span> :
              seg.txt}
              </RevealLine>
              {i < content.manifesto.text.length - 1 && ' '}
            </React.Fragment>
          )}
        </h2>
      </div>
    </section>);

}

// --- Testimonials ---
function Testimonials({ content }) {
  const t = content.testimonials;
  return (
    <section id="comunidad" className="testi-section">
      <div className="shell">
        <div className="sec-head">
          <Reveal>
            <div className="sec-head__num">{t.eyebrow}</div>
          </Reveal>
          <div>
            <h2 className="sec-head__title sec-head__title--testi">
              <RevealLine>{t.title}</RevealLine>{' '}
              <RevealLine delay={120}><span className="amb">{t.titleEm}</span></RevealLine>
            </h2>
            <Reveal delay={250} className="sec-head__sub">
              <p>{t.sub}</p>
            </Reveal>
          </div>
        </div>
        <div className="testi-grid">
          {t.items.map((it, i) =>
          <Reveal key={it.id} delay={i * 100} className="testi">
              <p className="testi__quote">
                <span className="amb">“</span>{it.quote}<span className="amb">”</span>
              </p>
              <div className="testi__foot">
                <div className="testi__av">{it.initial}</div>
                <div className="testi__who">
                  <span className="testi__name">{it.name}</span>
                  <span className="testi__role">{it.role}</span>
                </div>
              </div>
            </Reveal>
          )}
        </div>
      </div>
    </section>);

}

// --- CTA ---
function CTABlock({ content }) {
  const c = content.cta;
  return (
    <section className="cta-block" id="contacto">
      <div className="shell">
        <div className="cta-block__grid">
          <h2 className="cta-block__title">
            <RevealLine>{c.title}</RevealLine>{' '}
            <RevealLine delay={120}>{c.titleEm}</RevealLine>{' '}
            <RevealLine delay={240}>{c.titleAfter}</RevealLine>
          </h2>
          <Reveal delay={400}>
            <p className="cta-block__body">{c.body}</p>
            <div className="cta-block__btns">
              <a className="btn" href={c.primaryCta.href}>
                {c.primaryCta.label} <span className="arrow">→</span>
              </a>
              <a className="btn btn--ghost" href={c.secondaryCta.href}>
                {c.secondaryCta.label}
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>);

}

// --- Envíos y Devoluciones ---
function Envios({ content }) {
  const e = content.envios || {};
  return (
    <section className="envios" id="envios">
      <div className="shell">
        <div className="sec-head">
          <Reveal>
            <div className="sec-head__num">{e.headerIndex}</div>
          </Reveal>
          <div>
            <h2 className="sec-head__title">
              <RevealLine>{e.title}</RevealLine>{' '}
              <RevealLine delay={120}><span className="amb">{e.titleEm}</span></RevealLine>
            </h2>
            <Reveal delay={250} className="sec-head__sub">
              <p>{e.intro}</p>
            </Reveal>
          </div>
        </div>
        <div className="envios__grid">
          {(e.blocks || []).map((b, i) =>
            <Reveal key={b.id} delay={i * 60} className="envios__block">
              <h3 className="envios__block-title">{b.title}</h3>
              <p className="envios__block-body">{b.body}</p>
            </Reveal>
          )}
        </div>
      </div>
    </section>);

}

// --- Footer ---
function Footer({ content, onOpenAdmin, onNavigate }) {
  const f = content.footer;
  const clicksRef = React.useRef([]);

  function onYearClick(e) {
    const now = Date.now();
    clicksRef.current = clicksRef.current.filter((t) => now - t < 700);
    clicksRef.current.push(now);
    if (clicksRef.current.length >= 3) {
      clicksRef.current = [];
      onOpenAdmin && onOpenAdmin();
    }
  }

  function renderBottomLeft() {
    const txt = f.bottomLeft || '';
    const m = txt.match(/(\d{4})/);
    if (!m) return txt;
    const idx = txt.indexOf(m[1]);
    return (
      <React.Fragment>
        {txt.slice(0, idx)}
        <span
          className="footer__year"
          onClick={onYearClick}
          role="button"
          tabIndex={0}
          title="·"
          aria-label={m[1]}>
          {m[1]}</span>
        {txt.slice(idx + m[1].length)}
      </React.Fragment>);

  }

  return (
    <footer className="footer">
      <div className="shell">
        <h2 className="footer__wordmark">
          {f.wordmark}{' '}
          <span className="static">{f.wordmarkSecret}</span>
        </h2>
        <p className="footer__about" style={{ maxWidth: 460, marginBottom: 32 }}>{f.about}</p>

        <div className="footer__grid">
          <div className="footer__col">
            <h4>Instagram</h4>
            <a href="https://instagram.com/ruahlabs" target="_blank" rel="noreferrer">@ruahlabs</a>
            <p style={{ color: 'var(--gray-soft)' }}>{content.brand.location}</p>
          </div>
          {f.cols.map((c) =>
          <div className="footer__col" key={c.id}>
              <h4>{c.title}</h4>
              {c.items.map((i) => {
              var PAGE_MAP = { '#nosotros': 'nosotros', '#servicios': 'servicios', '#productos': 'productos', '#protocolo': 'protocolo', '#comunidad': 'comunidad', '#cuadros': 'cuadros', '#iglesias': 'iglesias', '#evento': 'evento', '#design': 'design', '#envios': 'envios' };
              var spaPage = i.href && PAGE_MAP[i.href];
              return (
            <a key={i.id} href={i.href}
               onClick={i.href && i.href.startsWith('#') ? (e) => { e.preventDefault(); if (spaPage) { onNavigate && onNavigate(spaPage); } else { var el = document.querySelector(i.href); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); } } : undefined}
               target={i.href && i.href.startsWith('http') ? '_blank' : undefined}
               rel={i.href && i.href.startsWith('http') ? 'noreferrer' : undefined}>
              {i.label}
            </a>
              );
            })}
            </div>
          )}
        </div>

        <div className="footer__bottom">
          <span>{renderBottomLeft()}</span>
          <span>{f.bottomRight}</span>
        </div>
      </div>
    </footer>);

}

Object.assign(window, {
  useInView, Reveal, RevealLine, SectionHeader,
  Nav, Hero, HomeIntro, FeaturedDuo, HomeCategoryCarousel, DesignGallery, PageView,
  About, Protocol, Services, Products, ProductDetail, Manifesto, Testimonials, CTABlock, Footer
});