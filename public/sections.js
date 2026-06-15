function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
    if (reduced) {
      setInView(true);
      return;
    }
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      });
    }, {
      threshold
    });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}
function Reveal({
  children,
  delay = 0,
  as: Tag = 'div',
  className = '',
  style = {},
  ...rest
}) {
  const [ref, inView] = useInView();
  return /*#__PURE__*/React.createElement(Tag, _extends({
    ref: ref,
    className: (className + ' reveal' + (inView ? ' in' : '')).trim(),
    style: {
      transitionDelay: delay + 'ms',
      ...style
    }
  }, rest), children);
}
function RevealLine({
  children,
  delay = 0,
  className = ''
}) {
  const [ref, inView] = useInView(0.3);
  return /*#__PURE__*/React.createElement("span", {
    ref: ref,
    className: ('reveal-mask' + (inView ? ' in' : '') + ' ' + className).trim()
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      transitionDelay: delay + 'ms'
    }
  }, children));
}

// --- Section Header bar (reused across Iglesias / Cuadros / Protocolo)
function SectionHeader({
  index,
  title,
  right,
  amberTitle = false
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "sec-bar"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sec-bar__index"
  }, index), /*#__PURE__*/React.createElement("h2", {
    className: 'sec-bar__title' + (amberTitle ? ' amb' : '')
  }, title), /*#__PURE__*/React.createElement("div", {
    className: "sec-bar__right"
  }, right));
}

// --- Nav ---
function MobileDropdown({
  label,
  children,
  amber
}) {
  var [open, setOpen] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", {
    className: 'm-drop' + (open ? ' open' : '')
  }, /*#__PURE__*/React.createElement("button", {
    className: 'm-link m-drop__head' + (amber ? ' m-link--amber' : ''),
    type: "button",
    onClick: () => setOpen(o => !o)
  }, /*#__PURE__*/React.createElement("span", null, label), /*#__PURE__*/React.createElement("span", {
    className: "m-link__arr"
  }, open ? '↑' : '↓')), /*#__PURE__*/React.createElement("div", {
    className: "m-drop__list"
  }, children));
}
function Nav({
  content,
  onOpenProduct,
  cartCount = 0,
  onOpenCheckout,
  activePage,
  onNavigate,
  onGoHome
}) {
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [openDrop, setOpenDrop] = React.useState(null);
  const navRef = React.useRef(null);
  const tripleClicksRef = React.useRef([]);
  const {
    nav,
    products
  } = content;
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll, {
      passive: true
    });
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
    '#nosotros': 'nosotros',
    '#servicios': 'servicios',
    '#productos': 'productos',
    '#cuadros': 'cuadros',
    '#iglesias': 'iglesias',
    '#evento': 'evento',
    '#protocolo': 'protocolo',
    '#comunidad': 'comunidad',
    '#design': 'design'
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
        el.scrollIntoView({
          behavior: reduced ? 'auto' : 'smooth',
          block: 'start'
        });
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
    tripleClicksRef.current = tripleClicksRef.current.filter(t => now - t < 500);
    tripleClicksRef.current.push(now);
    if (tripleClicksRef.current.length >= 3) {
      tripleClicksRef.current = [];
      window.dispatchEvent(new CustomEvent('ruah:triggerSecret'));
      return;
    }
    if (onGoHome) onGoHome();else window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("nav", {
    className: 'nav' + (scrolled ? ' scrolled' : '') + (activePage ? ' has-page' : ''),
    ref: navRef
  }, /*#__PURE__*/React.createElement("a", {
    href: "#top",
    className: "nav__brand",
    onClick: onBrandClick,
    "aria-label": content.brand.name,
    title: "\xB7"
  }, /*#__PURE__*/React.createElement("img", {
    src: window.__resources && window.__resources.logoWordmark || "https://res.cloudinary.com/dh05zwrbp/image/upload/v1781323723/ruahlabs/s0c7jhjeiwvrjclesxmj.png",
    alt: "RUAH LABS",
    className: "nav__brand-img"
  })), /*#__PURE__*/React.createElement("div", {
    className: "nav__links"
  }, activePage && /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "nav__link nav__link--inicio",
    onClick: () => onGoHome && onGoHome()
  }, "\u2190 INICIO"), nav.links.map(l => /*#__PURE__*/React.createElement("div", {
    className: 'nav__link-wrap' + (openDrop === l.id ? ' open' : ''),
    key: l.id
  }, l.dropdown ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
    className: 'nav__link' + (openDrop === l.id ? ' open' : ''),
    onClick: () => setOpenDrop(o => o === l.id ? null : l.id),
    "aria-expanded": openDrop === l.id
  }, l.label, /*#__PURE__*/React.createElement("span", {
    className: "caret"
  }, "\u25BC")), /*#__PURE__*/React.createElement("div", {
    className: "nav__dropdown",
    role: "menu"
  }, products.categories.map(c => /*#__PURE__*/React.createElement("a", {
    key: c.id,
    href: "#productos",
    onClick: e => {
      e.preventDefault();
      navigateCategory(c.slug);
    }
  }, /*#__PURE__*/React.createElement("span", null, c.name), /*#__PURE__*/React.createElement("span", {
    className: "arr"
  }, "\u2192"))))) : /*#__PURE__*/React.createElement("a", {
    className: "nav__link",
    href: l.href,
    onClick: e => {
      e.preventDefault();
      navigate(l.href);
    }
  }, l.label)))), /*#__PURE__*/React.createElement("a", {
    className: "nav__cta",
    href: nav.cta.href,
    onClick: e => {
      e.preventDefault();
      navigate(nav.cta.href);
    }
  }, nav.cta.label, /*#__PURE__*/React.createElement("span", {
    className: "arrow"
  }, "\u2192")), /*#__PURE__*/React.createElement("button", {
    className: "nav__cart",
    type: "button",
    onClick: onOpenCheckout,
    "aria-label": 'Carrito (' + cartCount + ')',
    title: "Ir a pagar"
  }, /*#__PURE__*/React.createElement("img", {
    src: window.__resources && window.__resources.cartIcon || 'https://res.cloudinary.com/dh05zwrbp/image/upload/v1781323690/ruahlabs/lmlhjytfctlr3apdcebc.png',
    alt: "",
    className: "nav__cart__img",
    "aria-hidden": "true"
  }), cartCount > 0 && /*#__PURE__*/React.createElement("span", {
    className: "nav__cart__b"
  }, cartCount)), /*#__PURE__*/React.createElement("button", {
    className: 'hamb' + (mobileOpen ? ' open' : ''),
    "aria-label": "Men\xFA",
    onClick: () => setMobileOpen(o => !o)
  }, /*#__PURE__*/React.createElement("span", {
    className: "hamb__bars"
  }))), /*#__PURE__*/React.createElement("div", {
    className: 'mobile-menu' + (mobileOpen ? ' open' : '')
  }, /*#__PURE__*/React.createElement("div", {
    className: "mobile-menu__inner"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mobile-menu__head",
    style: {
      justifyContent: 'flex-end'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "mobile-menu__x",
    onClick: () => setMobileOpen(false),
    "aria-label": "Cerrar men\xFA"
  }, "\xD7")), /*#__PURE__*/React.createElement("nav", {
    className: "mobile-menu__nav"
  }, function () {
    var linkMap = {};
    (nav.links || []).forEach(function (l) {
      linkMap[l.id] = l;
    });
    var mobileOrder = ['l0', 'l3', 'l2', 'l8', 'l1', 'l5', 'l7', 'l6', 'l4'];
    return mobileOrder.map(function (id) {
      var l = linkMap[id];
      if (!l) return null;
      var isAmber = l.id === 'l2';
      if (l.dropdown) {
        return /*#__PURE__*/React.createElement(MobileDropdown, {
          key: l.id,
          label: l.label,
          amber: isAmber
        }, products.categories.map(c => /*#__PURE__*/React.createElement("a", {
          key: c.id,
          href: "#productos",
          className: "m-sub__link",
          onClick: e => {
            e.preventDefault();
            navigateCategory(c.slug);
            setMobileOpen(false);
          }
        }, c.name)));
      }
      return /*#__PURE__*/React.createElement("a", {
        key: l.id,
        href: l.href,
        className: 'm-link' + (isAmber ? ' m-link--amber' : ''),
        onClick: e => {
          e.preventDefault();
          navigate(l.href);
        }
      }, /*#__PURE__*/React.createElement("span", null, l.label), /*#__PURE__*/React.createElement("span", {
        className: "m-link__arr"
      }, "\u2192"));
    });
  }(), /*#__PURE__*/React.createElement("a", {
    href: nav.cta.href,
    className: "m-link m-link--cta",
    onClick: e => {
      e.preventDefault();
      navigate(nav.cta.href);
    }
  }, /*#__PURE__*/React.createElement("span", null, nav.cta.label), /*#__PURE__*/React.createElement("span", {
    className: "m-link__arr"
  }, "\u2192"))))));
}

// --- Hero ---
function Hero({
  content
}) {
  const {
    hero
  } = content;
  return /*#__PURE__*/React.createElement("section", {
    className: "hero",
    id: "top"
  }, /*#__PURE__*/React.createElement("video", {
    className: "hero__video-bg hero__video-bg--desktop",
    src: "https://res.cloudinary.com/dh05zwrbp/video/upload/v1781323721/ruahlabs/dk5p5bmllg4bzap3kovl.mp4",
    autoPlay: true,
    muted: true,
    loop: true,
    playsInline: true,
    preload: "metadata",
    "aria-hidden": "true"
  }), /*#__PURE__*/React.createElement("video", {
    className: "hero__video-bg hero__video-bg--mobile",
    src: "https://res.cloudinary.com/dh05zwrbp/video/upload/v1781323714/ruahlabs/kv8jqlkslwzfedpjcjia.mp4",
    autoPlay: true,
    muted: true,
    loop: true,
    playsInline: true,
    preload: "metadata",
    "aria-hidden": "true"
  }), /*#__PURE__*/React.createElement("div", {
    className: "hero__texture",
    "aria-hidden": "true"
  }), /*#__PURE__*/React.createElement("div", {
    className: "shell"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hero__eyebrow"
  }, /*#__PURE__*/React.createElement("span", {
    className: "line"
  }), /*#__PURE__*/React.createElement("span", {
    className: "mono-label"
  }, hero.eyebrow)), /*#__PURE__*/React.createElement("h1", {
    className: "hero__title"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(RevealLine, {
    delay: 50
  }, hero.titleLine1)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(RevealLine, {
    delay: 180
  }, hero.titleLine2)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(RevealLine, {
    delay: 310
  }, /*#__PURE__*/React.createElement("span", {
    className: "amb"
  }, hero.titleLine3)))), /*#__PURE__*/React.createElement("div", {
    className: "hero__bottom"
  }, /*#__PURE__*/React.createElement(Reveal, {
    delay: 500,
    className: "hero__lede"
  }, /*#__PURE__*/React.createElement("p", null, hero.lede)), /*#__PURE__*/React.createElement(Reveal, {
    delay: 650,
    className: "hero__ctas"
  }, /*#__PURE__*/React.createElement("a", {
    className: "btn btn--amber",
    href: hero.primaryCta.href
  }, hero.primaryCta.label, /*#__PURE__*/React.createElement("span", {
    className: "arrow"
  }, "\u2192")), /*#__PURE__*/React.createElement("a", {
    className: "btn btn--white",
    href: hero.secondaryCta.href,
    onClick: e => {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent('ruah:navigateTo', {
        detail: {
          page: 'productos'
        }
      }));
      window.dispatchEvent(new CustomEvent('ruah:setCategory', {
        detail: {
          slug: 'todo'
        }
      }));
    }
  }, hero.secondaryCta.label)))), /*#__PURE__*/React.createElement("div", {
    className: "hero__marquee"
  }, /*#__PURE__*/React.createElement("div", {
    className: "marquee__track",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("span", null, Array.from({
    length: 2
  }).map((_, i) => /*#__PURE__*/React.createElement(React.Fragment, {
    key: i
  }, hero.marquee.split('·').map((piece, j) => /*#__PURE__*/React.createElement(React.Fragment, {
    key: j
  }, piece.trim(), /*#__PURE__*/React.createElement("span", {
    className: "star"
  }, "\u2726")))))))));
}

// --- Home Intro (post-hero info strip) ---
function HomeIntro({
  content
}) {
  const h = content.home || {};
  const intro = h.intro || {};
  return /*#__PURE__*/React.createElement("section", {
    className: "home-intro"
  }, /*#__PURE__*/React.createElement("div", {
    className: "shell"
  }, /*#__PURE__*/React.createElement(Reveal, {
    className: "home-intro__inner"
  }, /*#__PURE__*/React.createElement("span", {
    className: "mono-label home-intro__eye"
  }, intro.eyebrow || 'SANTIAGO · CHILE'), /*#__PURE__*/React.createElement("p", {
    className: "home-intro__text"
  }, intro.text || ''))));
}

// --- Featured Duo (2 prendas destacadas) ---
function FeaturedDuo({
  content,
  onOpenProduct
}) {
  const items = (content.products && content.products.items || []).filter(p => p.featuredOnHome).slice(0, 2);
  if (!items.length) return null;
  return /*#__PURE__*/React.createElement("section", {
    className: "feat-duo"
  }, /*#__PURE__*/React.createElement("div", {
    className: "shell"
  }, /*#__PURE__*/React.createElement("div", {
    className: "feat-duo__grid"
  }, items.map((item, i) => /*#__PURE__*/React.createElement(Reveal, {
    key: item.id,
    delay: i * 100,
    className: "feat-card",
    onClick: () => onOpenProduct && onOpenProduct(item.id)
  }, /*#__PURE__*/React.createElement("div", {
    className: "feat-card__media"
  }, item.img ? /*#__PURE__*/React.createElement("img", {
    src: item.img,
    alt: item.name,
    loading: "lazy"
  }) : /*#__PURE__*/React.createElement("div", {
    className: "feat-card__ph"
  }, (item.name || 'RL').slice(0, 2)), /*#__PURE__*/React.createElement("span", {
    className: "feat-card__hover"
  }, "Ver detalle \u2192")), /*#__PURE__*/React.createElement("div", {
    className: "feat-card__body"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "feat-card__name"
  }, item.name), /*#__PURE__*/React.createElement("div", {
    className: "feat-card__row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "feat-card__price"
  }, /*#__PURE__*/React.createElement("span", {
    className: "clp"
  }, "CLP"), "$", item.price), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn--amber feat-card__cta",
    onClick: e => {
      e.stopPropagation();
      onOpenProduct && onOpenProduct(item.id);
    }
  }, "Comprar ", /*#__PURE__*/React.createElement("span", null, "\u2192")))))))));
}

// --- Home 3D Museum Carousel ---
function HomeCategoryCarousel({
  content,
  onOpenProduct
}) {
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
    return pick ? {
      ...pick,
      catName: cat.name,
      catSlug: cat.slug
    } : null;
  }).filter(Boolean);
  const total = carouselItems.length;
  function prev() {
    setIdx(i => (i - 1 + total) % total);
  }
  function next() {
    setIdx(i => (i + 1) % total);
  }
  function getPos(i) {
    if (i === idx) return 'center';
    if (i === (idx - 1 + total) % total) return 'left';
    if (i === (idx + 1) % total) return 'right';
    return 'hidden';
  }
  if (total === 0) return null;
  const current = carouselItems[idx];
  return /*#__PURE__*/React.createElement("section", {
    className: "c3d"
  }, /*#__PURE__*/React.createElement("div", {
    className: "c3d__head"
  }, /*#__PURE__*/React.createElement("p", {
    className: "c3d__title"
  }, content.home && content.home.carousel && content.home.carousel.title || 'EXPLORAR POR CATEGORÍA')), /*#__PURE__*/React.createElement("div", {
    className: "c3d__stage"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "c3d__arr c3d__arr--prev",
    onClick: prev,
    "aria-label": "Anterior"
  }, "\u2190"), /*#__PURE__*/React.createElement("div", {
    className: "c3d__track"
  }, carouselItems.map((item, i) => {
    const pos = getPos(i);
    return /*#__PURE__*/React.createElement("div", {
      key: item.id,
      className: 'c3d__card c3d__card--' + pos,
      onClick: () => {
        if (pos === 'center') {
          window.dispatchEvent(new CustomEvent('ruah:navigateTo', {
            detail: {
              page: 'productos',
              category: item.catSlug
            }
          }));
        } else if (pos === 'left') prev();else if (pos === 'right') next();
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "c3d__card-media"
    }, item.img ? /*#__PURE__*/React.createElement("img", {
      src: item.img,
      alt: item.name,
      loading: "lazy"
    }) : /*#__PURE__*/React.createElement("div", {
      className: "c3d__ph"
    }, (item.catName || '').slice(0, 2).toUpperCase())), /*#__PURE__*/React.createElement("span", {
      className: "c3d__cat-badge"
    }, item.catName));
  })), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "c3d__arr c3d__arr--next",
    onClick: next,
    "aria-label": "Siguiente"
  }, "\u2192")), /*#__PURE__*/React.createElement("div", {
    className: "c3d__info"
  }, /*#__PURE__*/React.createElement("div", {
    className: "c3d__info-cat"
  }, current.catName), /*#__PURE__*/React.createElement("h3", {
    className: "c3d__info-name"
  }, current.name), current.description && /*#__PURE__*/React.createElement("p", {
    className: "c3d__info-desc"
  }, current.description), /*#__PURE__*/React.createElement("div", {
    className: "c3d__info-price"
  }, /*#__PURE__*/React.createElement("span", {
    className: "clp"
  }, "CLP"), " $", current.price), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "c3d__info-btn",
    onClick: () => window.dispatchEvent(new CustomEvent('ruah:navigateTo', {
      detail: {
        page: 'productos',
        category: current.catSlug
      }
    }))
  }, "Ver categor\xEDa \u2192")), /*#__PURE__*/React.createElement("div", {
    className: "c3d__dots"
  }, carouselItems.map((_, i) => /*#__PURE__*/React.createElement("button", {
    key: i,
    type: "button",
    className: 'c3d__dot' + (i === idx ? ' active' : ''),
    onClick: () => setIdx(i),
    "aria-label": 'Ir a ítem ' + (i + 1)
  }))));
}

// --- Design Gallery (Museum) ---
function DesignGallery({
  content
}) {
  const piezas = (content.design && content.design.piezas || []).filter(p => p.estado === 'visible').sort((a, b) => (a.orden || 0) - (b.orden || 0));
  const [idx, setIdx] = React.useState(0);
  const [modal, setModal] = React.useState(null);
  const pausedRef = React.useRef(false);
  const touchRef = React.useRef(null);
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
      if (e.key === 'ArrowLeft') {
        pausedRef.current = true;
        setIdx(i => (i - 1 + total) % total);
      }
      if (e.key === 'ArrowRight') {
        pausedRef.current = true;
        setIdx(i => (i + 1) % total);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [total]);
  function goTo(i) {
    pausedRef.current = true;
    setIdx((i % total + total) % total);
  }
  const pieza = piezas[idx] || null;

  /* ── PLACEHOLDER cards when gallery is empty ── */
  const placeholders = ['MINIMAL', 'TIPOGRAFÍA', 'COLLAGE', 'ABSTRACTO', 'BÍBLICO', 'RETRATO'];
  return /*#__PURE__*/React.createElement("section", {
    id: "design",
    className: "dg",
    onMouseEnter: () => {
      pausedRef.current = true;
    },
    onMouseLeave: () => {
      pausedRef.current = false;
    },
    onTouchStart: e => {
      touchRef.current = e.touches[0].clientX;
    },
    onTouchEnd: e => {
      const dx = e.changedTouches[0].clientX - (touchRef.current || 0);
      if (Math.abs(dx) > 44) {
        if (dx < 0) goTo(idx + 1);else goTo(idx - 1);
      }
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "dg__stage"
  }, (total > 0 ? piezas : placeholders).map((p, i) => {
    const isPlaceholder = total === 0;
    const name = isPlaceholder ? p : p.nombre;
    const numStr = String(i + 1).padStart(2, '0');
    const offset = i - (isPlaceholder ? 2 : idx);
    const isCenter = offset === 0;
    const absOff = Math.abs(offset);
    const cls = ['dg__item', isCenter ? 'dg__item--active' : '', absOff === 1 ? 'dg__item--near' : '', absOff === 2 ? 'dg__item--far' : '', absOff >= 3 ? 'dg__item--out' : ''].filter(Boolean).join(' ');
    return /*#__PURE__*/React.createElement("div", {
      key: isPlaceholder ? i : p.id,
      className: cls,
      onClick: () => {
        if (isPlaceholder) return;
        isCenter ? setModal({
          pieza: p,
          imgIdx: 0
        }) : goTo(i);
      },
      role: isPlaceholder ? undefined : 'button',
      tabIndex: isCenter && !isPlaceholder ? 0 : -1,
      "aria-label": isPlaceholder ? name : isCenter ? 'Ver: ' + name : 'Ir a ' + name
    }, /*#__PURE__*/React.createElement("div", {
      className: "dg__item-label"
    }, /*#__PURE__*/React.createElement("span", {
      className: "dg__item-name"
    }, name), /*#__PURE__*/React.createElement("span", {
      className: "dg__item-num"
    }, numStr)), /*#__PURE__*/React.createElement("div", {
      className: "dg__card"
    }, /*#__PURE__*/React.createElement("span", {
      className: "dg__card-corner dg__card-corner--tl"
    }, "1\xD7", /*#__PURE__*/React.createElement("br", null), "\u25B2"), /*#__PURE__*/React.createElement("div", {
      className: "dg__card-img"
    }, !isPlaceholder && p.imagen_principal ? /*#__PURE__*/React.createElement("img", {
      src: p.imagen_principal,
      alt: name,
      loading: "lazy"
    }) : /*#__PURE__*/React.createElement("div", {
      className: "dg__card-ph"
    }, name.slice(0, 2).toUpperCase())), /*#__PURE__*/React.createElement("span", {
      className: "dg__card-corner dg__card-corner--br"
    }, "1\xD7", /*#__PURE__*/React.createElement("br", null), "\u25B2")));
  })), total > 1 && /*#__PURE__*/React.createElement("div", {
    className: "dg__dots"
  }, piezas.map((_, i) => /*#__PURE__*/React.createElement("button", {
    key: i,
    className: 'dg__dot' + (i === idx ? ' active' : ''),
    onClick: () => goTo(i),
    "aria-label": 'Pieza ' + (i + 1)
  }))), /*#__PURE__*/React.createElement("div", {
    className: "dg__footer"
  }, /*#__PURE__*/React.createElement("div", {
    className: "dg__footer-left"
  }, /*#__PURE__*/React.createElement("p", {
    className: "dg__footer-kicker"
  }, "dise\xF1os que predican"), /*#__PURE__*/React.createElement("h2", {
    className: "dg__footer-word"
  }, "PERSONALIZADOS")), /*#__PURE__*/React.createElement("div", {
    className: "dg__footer-right"
  }, /*#__PURE__*/React.createElement("p", {
    className: "dg__footer-desc"
  }, "Hacemos piezas \xFAnicas centradas en Cristo. T\xFA eliges el vers\xEDculo, el estilo y el formato."), /*#__PURE__*/React.createElement("a", {
    href: "mailto:contacto@ruahlabs.cl?subject=Cotizaci\xF3n%20dise\xF1o%20personalizado",
    className: "dg__footer-cta"
  }, "COTIZAR \u2192"))), modal && /*#__PURE__*/React.createElement("div", {
    className: "museum__modal-overlay",
    onClick: () => setModal(null),
    role: "dialog",
    "aria-modal": "true",
    "aria-label": 'Ver: ' + modal.pieza.nombre
  }, /*#__PURE__*/React.createElement("div", {
    className: "museum__modal",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("button", {
    className: "museum__modal-x",
    onClick: () => setModal(null),
    "aria-label": "Cerrar"
  }, "\u2715"), (() => {
    const imgs = modal.pieza.imagenes_detalle && modal.pieza.imagenes_detalle.length > 0 ? modal.pieza.imagenes_detalle : modal.pieza.imagen_principal ? [modal.pieza.imagen_principal] : [];
    const totalImgs = imgs.length;
    function modalPrev() {
      if (totalImgs > 1) setModal(m => ({
        ...m,
        imgIdx: (m.imgIdx - 1 + totalImgs) % totalImgs
      }));
    }
    function modalNext() {
      if (totalImgs > 1) setModal(m => ({
        ...m,
        imgIdx: (m.imgIdx + 1) % totalImgs
      }));
    }
    return /*#__PURE__*/React.createElement("div", {
      className: "museum__modal-imgwrap",
      onTouchStart: e => {
        modalTouchRef.current = e.touches[0].clientX;
      },
      onTouchEnd: e => {
        var dx = e.changedTouches[0].clientX - (modalTouchRef.current || 0);
        if (Math.abs(dx) > 40) {
          if (dx < 0) modalNext();else modalPrev();
        }
      }
    }, imgs.length > 0 ? /*#__PURE__*/React.createElement("img", {
      src: imgs[modal.imgIdx] || imgs[0],
      alt: 'Detalle ' + (modal.imgIdx + 1),
      loading: "lazy"
    }) : /*#__PURE__*/React.createElement("div", {
      className: "museum__modal-ph"
    }, (modal.pieza.nombre || 'RL').slice(0, 2)), totalImgs > 1 && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
      className: "museum__modal-arr museum__modal-arr--prev",
      onClick: e => {
        e.stopPropagation();
        modalPrev();
      },
      "aria-label": "Anterior"
    }, "\u2039"), /*#__PURE__*/React.createElement("button", {
      className: "museum__modal-arr museum__modal-arr--next",
      onClick: e => {
        e.stopPropagation();
        modalNext();
      },
      "aria-label": "Siguiente"
    }, "\u203A"), /*#__PURE__*/React.createElement("div", {
      className: "museum__modal-count"
    }, (modal.imgIdx || 0) + 1, " / ", totalImgs)));
  })(), /*#__PURE__*/React.createElement("div", {
    className: "museum__modal-info"
  }, /*#__PURE__*/React.createElement("div", {
    className: "museum__modal-meta"
  }, (modal.pieza.cliente || modal.pieza.fecha_creacion) && /*#__PURE__*/React.createElement("p", {
    className: "museum__modal-eyebrow"
  }, [modal.pieza.cliente, modal.pieza.fecha_creacion].filter(Boolean).join(' · ')), /*#__PURE__*/React.createElement("h2", {
    className: "museum__modal-title"
  }, modal.pieza.nombre), (modal.pieza.descripcion_historia || modal.pieza.descripcion_breve) && /*#__PURE__*/React.createElement("p", {
    className: "museum__modal-desc"
  }, modal.pieza.descripcion_historia || modal.pieza.descripcion_breve)), modal.pieza.imagenes_detalle && modal.pieza.imagenes_detalle.length > 1 && /*#__PURE__*/React.createElement("div", {
    className: "museum__modal-thumbs"
  }, modal.pieza.imagenes_detalle.map((url, ti) => /*#__PURE__*/React.createElement("button", {
    key: ti,
    className: 'museum__modal-thumb' + (ti === modal.imgIdx ? ' active' : ''),
    onClick: () => setModal(m => ({
      ...m,
      imgIdx: ti
    })),
    "aria-label": 'Detalle ' + (ti + 1)
  }, /*#__PURE__*/React.createElement("img", {
    src: url,
    alt: 'Detalle ' + (ti + 1),
    loading: "lazy"
  }))))))));
}

// --- Page wrapper for section views ---
function PageView({
  title,
  onBack,
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "page-view"
  }, children);
}

// --- About / Quienes Somos ---
function About({
  content
}) {
  const a = content.about;
  return /*#__PURE__*/React.createElement("section", {
    className: "about",
    id: "nosotros"
  }, /*#__PURE__*/React.createElement("div", {
    className: "shell"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sec-head"
  }, /*#__PURE__*/React.createElement(Reveal, null, /*#__PURE__*/React.createElement("div", {
    className: "sec-head__num"
  }, a.eyebrow)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    className: "sec-head__title sec-head__title--about"
  }, /*#__PURE__*/React.createElement(RevealLine, null, a.title), ' ', /*#__PURE__*/React.createElement(RevealLine, {
    delay: 120
  }, /*#__PURE__*/React.createElement("span", {
    className: "amb"
  }, a.titleEm))), /*#__PURE__*/React.createElement(Reveal, {
    delay: 250,
    className: "sec-head__sub"
  }, /*#__PURE__*/React.createElement("p", null, a.sub)))), /*#__PURE__*/React.createElement("div", {
    className: "about__grid"
  }, /*#__PURE__*/React.createElement(Reveal, {
    delay: 50
  }, /*#__PURE__*/React.createElement("div", {
    className: "mono-label",
    style: {
      marginBottom: 12
    }
  }, "NUESTRA HISTORIA")), /*#__PURE__*/React.createElement(Reveal, {
    delay: 150,
    className: "about__body"
  }, a.body.map((p, i) => /*#__PURE__*/React.createElement("p", {
    key: i
  }, p)))), /*#__PURE__*/React.createElement("div", {
    className: "about__pillars"
  }, a.pillars.map((p, i) => /*#__PURE__*/React.createElement(Reveal, {
    key: p.id,
    delay: i * 80,
    className: "pillar"
  }, /*#__PURE__*/React.createElement("div", {
    className: "pillar__num"
  }, p.num, " / PILAR"), /*#__PURE__*/React.createElement("h3", {
    className: "pillar__title"
  }, p.title), /*#__PURE__*/React.createElement("p", {
    className: "pillar__desc"
  }, p.desc)))), /*#__PURE__*/React.createElement("div", {
    className: "about__metrics"
  }, a.metrics.map((m, i) => /*#__PURE__*/React.createElement(Reveal, {
    key: m.id,
    delay: i * 100,
    className: "about__metric"
  }, /*#__PURE__*/React.createElement("div", {
    className: "num"
  }, m.num), /*#__PURE__*/React.createElement("div", {
    className: "lbl"
  }, m.lbl))))));
}

// --- Protocol (1×1) — NUEVO DISEÑO (matches reference) ---
function Protocol({
  content
}) {
  const p = content.protocol;
  return /*#__PURE__*/React.createElement("section", {
    className: "protocol",
    id: "protocolo"
  }, /*#__PURE__*/React.createElement("div", {
    className: "shell"
  }, /*#__PURE__*/React.createElement(SectionHeader, {
    index: p.headerIndex,
    title: p.headerTitle,
    right: p.headerRight,
    amberTitle: true
  }), /*#__PURE__*/React.createElement("div", {
    className: "pr-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "pr-left"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "pr-bigtitle"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(RevealLine, {
    delay: 20
  }, p.title1)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(RevealLine, {
    delay: 140
  }, /*#__PURE__*/React.createElement("span", {
    className: p.title2Amber ? 'amb' : ''
  }, p.title2))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(RevealLine, {
    delay: 260
  }, p.title3)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(RevealLine, {
    delay: 380
  }, /*#__PURE__*/React.createElement("span", {
    className: p.title4Amber ? 'amb' : ''
  }, p.title4)))), /*#__PURE__*/React.createElement("div", {
    className: "pr-sections"
  }, (p.sections || []).map((s, i) => /*#__PURE__*/React.createElement(Reveal, {
    key: s.id,
    delay: i * 80,
    className: "pr-sec"
  }, /*#__PURE__*/React.createElement("h4", {
    className: "pr-sec__hd"
  }, s.heading), /*#__PURE__*/React.createElement("p", {
    className: "pr-sec__body"
  }, s.body)))), /*#__PURE__*/React.createElement(Reveal, {
    delay: 300,
    className: "pr-quote"
  }, /*#__PURE__*/React.createElement("div", {
    className: "pr-quote__ref"
  }, p.quoteRef), /*#__PURE__*/React.createElement("p", {
    className: "pr-quote__text"
  }, p.quoteText))), /*#__PURE__*/React.createElement("aside", {
    className: "pr-right"
  }, /*#__PURE__*/React.createElement("div", {
    className: "pr-flow"
  }, /*#__PURE__*/React.createElement("div", {
    className: "pr-flow__hd"
  }, p.flowTitle), /*#__PURE__*/React.createElement("ol", {
    className: "pr-flow__list"
  }, (p.flow || []).map(f => /*#__PURE__*/React.createElement("li", {
    key: f.id,
    className: "pr-flow__item"
  }, /*#__PURE__*/React.createElement("span", {
    className: "pr-flow__num"
  }, f.num), /*#__PURE__*/React.createElement("span", {
    className: "pr-flow__name"
  }, f.name), /*#__PURE__*/React.createElement("span", {
    className: "pr-flow__sep"
  }, "\u2192"), /*#__PURE__*/React.createElement("span", {
    className: "pr-flow__det"
  }, f.detail))))), /*#__PURE__*/React.createElement("div", {
    className: "pr-team"
  }, /*#__PURE__*/React.createElement("div", {
    className: "pr-team__top"
  }, /*#__PURE__*/React.createElement("span", {
    className: "pr-team__lbl"
  }, "\u25AA ", p.teamTitle), /*#__PURE__*/React.createElement("span", {
    className: "pr-team__meta"
  }, p.teamMeta)), /*#__PURE__*/React.createElement("div", {
    className: "pr-team__ph"
  }, p.teamImg ? /*#__PURE__*/React.createElement("img", {
    src: p.teamImg,
    alt: p.teamCaption,
    className: "pr-team__img"
  }) : /*#__PURE__*/React.createElement("div", {
    className: "pr-team__grid"
  })), /*#__PURE__*/React.createElement("div", {
    className: "pr-team__cap"
  }, /*#__PURE__*/React.createElement("span", {
    className: "pr-team__dot"
  }, "\u258D"), /*#__PURE__*/React.createElement("span", null, p.teamCaption))), /*#__PURE__*/React.createElement("a", {
    href: p.activateHref || '#productos',
    className: "pr-activate"
  }, /*#__PURE__*/React.createElement("span", null, p.activateCta), /*#__PURE__*/React.createElement("span", {
    className: "pr-activate__arr"
  }, "\u2192"))))));
}

// --- Services ---
function Services({
  content
}) {
  const s = content.services;
  return /*#__PURE__*/React.createElement("section", {
    className: "services",
    id: "servicios"
  }, /*#__PURE__*/React.createElement("div", {
    className: "shell"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sec-head"
  }, /*#__PURE__*/React.createElement(Reveal, null, /*#__PURE__*/React.createElement("div", {
    className: "sec-head__num"
  }, s.eyebrow)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    className: "sec-head__title sec-head__title--services"
  }, /*#__PURE__*/React.createElement(RevealLine, null, s.title), ' ', /*#__PURE__*/React.createElement(RevealLine, {
    delay: 120
  }, /*#__PURE__*/React.createElement("span", {
    className: "amb"
  }, s.titleEm))), /*#__PURE__*/React.createElement(Reveal, {
    delay: 250,
    className: "sec-head__sub"
  }, /*#__PURE__*/React.createElement("p", null, s.sub)))), /*#__PURE__*/React.createElement("div", {
    className: "svc-list"
  }, s.items.map((item, i) => /*#__PURE__*/React.createElement(Reveal, {
    key: item.id,
    delay: i * 80,
    className: "svc-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "svc-row__num"
  }, String(i + 1).padStart(2, '0'), " /"), /*#__PURE__*/React.createElement("h3", {
    className: "svc-row__name"
  }, item.name), /*#__PURE__*/React.createElement("p", {
    className: "svc-row__desc"
  }, item.desc), /*#__PURE__*/React.createElement("a", {
    className: "svc-row__cta",
    href: "#contacto"
  }, /*#__PURE__*/React.createElement("span", {
    className: "lbl"
  }, "Cotizar"), /*#__PURE__*/React.createElement("span", {
    className: "arr"
  }, "\u2192")))))));
}

// --- Products ---
function Products({
  content,
  onOpenProduct,
  initialCategory
}) {
  const p = content.products;
  const [activeSlug, setActiveSlug] = React.useState(initialCategory || 'todo');
  React.useEffect(() => {
    if (initialCategory) setActiveSlug(initialCategory);
  }, [initialCategory]);
  React.useEffect(() => {
    function onSet(e) {
      setActiveSlug(e.detail.slug);
    }
    window.addEventListener('ruah:setCategory', onSet);
    return () => window.removeEventListener('ruah:setCategory', onSet);
  }, []);
  const activeCat = p.categories.find(c => c.slug === activeSlug) || p.categories[0];
  const countFor = cat => cat.slug === 'todo' ? p.items.length : p.items.filter(it => it.categoryId === cat.id).length;
  const parsePrice = s => parseInt(String(s || '0').replace(/[^0-9]/g, ''), 10) || 0;
  const baseItems = activeCat.slug === 'todo' ? p.items : p.items.filter(it => it.categoryId === activeCat.id);
  // Orden automático: de menor a mayor precio
  const items = [...baseItems].sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
  return /*#__PURE__*/React.createElement("section", {
    className: "products",
    id: "productos"
  }, /*#__PURE__*/React.createElement("div", {
    className: "shell"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sec-head"
  }, /*#__PURE__*/React.createElement(Reveal, null, /*#__PURE__*/React.createElement("div", {
    className: "sec-head__num"
  }, p.eyebrow)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    className: "sec-head__title sec-head__title--products"
  }, /*#__PURE__*/React.createElement(RevealLine, null, p.title), ' ', /*#__PURE__*/React.createElement(RevealLine, {
    delay: 120
  }, /*#__PURE__*/React.createElement("span", {
    className: "amb"
  }, p.titleEm))), /*#__PURE__*/React.createElement(Reveal, {
    delay: 250,
    className: "sec-head__sub"
  }, /*#__PURE__*/React.createElement("p", null, p.sub)))), /*#__PURE__*/React.createElement(Reveal, null, /*#__PURE__*/React.createElement("div", {
    className: "cat-bar",
    role: "tablist",
    "aria-label": "Categor\xEDas de producto"
  }, p.categories.map(c => /*#__PURE__*/React.createElement("button", {
    key: c.id,
    className: 'cat-chip' + (activeSlug === c.slug ? ' active' : ''),
    onClick: () => setActiveSlug(c.slug),
    role: "tab",
    "aria-selected": activeSlug === c.slug
  }, c.name, /*#__PURE__*/React.createElement("span", {
    className: "count"
  }, countFor(c)))))), items.length === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "empty-state"
  }, "\u2014 SIN PRODUCTOS EN ESTA CATEGOR\xCDA POR AHORA \u2014") : /*#__PURE__*/React.createElement("div", {
    className: "prod-grid"
  }, items.map((it, i) => /*#__PURE__*/React.createElement(Reveal, {
    key: it.id,
    delay: i * 60,
    className: "prod",
    onClick: () => onOpenProduct(it.id)
  }, /*#__PURE__*/React.createElement("div", {
    className: "prod__media"
  }, it.img ? /*#__PURE__*/React.createElement("img", {
    src: it.img,
    alt: it.name,
    loading: "lazy"
  }) : /*#__PURE__*/React.createElement("div", {
    className: "prod__ph"
  }, it.name.split(' ').slice(-1)[0].slice(0, 2)), /*#__PURE__*/React.createElement("span", {
    className: "prod__view"
  }, "Ver detalle \u2192")), /*#__PURE__*/React.createElement("div", {
    className: "prod__body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "prod__verse"
  }, it.verse), /*#__PURE__*/React.createElement("h3", {
    className: "prod__title"
  }, it.name), /*#__PURE__*/React.createElement("div", {
    className: "prod__row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "prod__price"
  }, /*#__PURE__*/React.createElement("span", {
    className: "clp"
  }, "CLP"), "$", it.price), /*#__PURE__*/React.createElement("button", {
    className: "prod__buy",
    onClick: e => {
      e.stopPropagation();
      onOpenProduct(it.id);
    }
  }, "Comprar ", /*#__PURE__*/React.createElement("span", null, "\u2192")))))))));
}

// --- Product Detail Modal ---
function ProductDetail({
  productId,
  content,
  onClose,
  onBuyNow,
  onAddToCart,
  overrideImg
}) {
  const open = !!productId;
  const product = open ? content.products.items.find(p => p.id === productId) : null;
  const [idx, setIdx] = React.useState(0);
  const [zoomed, setZoomed] = React.useState(false);
  const [selectedSize, setSelectedSize] = React.useState(null);
  const SIZES = {
    adulto: ['S', 'M', 'L', 'XL', 'XXL'],
    nino: ['4', '6', '8', '10', '12', '14', '16'],
    unica: ['Talla Única']
  };
  React.useEffect(() => {
    if (!open) {
      document.body.style.overflow = '';
      return;
    }
    const found = content.products.items.find(x => x.id === productId);
    document.body.style.overflow = found ? 'hidden' : '';
    setIdx(0);
    setZoomed(false);
    setSelectedSize(null);
  }, [open, productId]);

  // Auto-close if productId doesn't match any product (prevents body-scroll freeze)
  React.useEffect(() => {
    if (open && !product) {
      document.body.style.overflow = '';
      onClose();
    }
  }, [open, product]);
  var pdTouchRef = React.useRef(null);
  var galleryLenRef = React.useRef(1);
  React.useEffect(() => {
    function onKey(e) {
      if (!open) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setIdx(i => (i + 1) % galleryLenRef.current);
      if (e.key === 'ArrowLeft') setIdx(i => (i - 1 + galleryLenRef.current) % galleryLenRef.current);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open || !product) {
    return /*#__PURE__*/React.createElement("div", {
      className: "pd-overlay",
      "aria-hidden": "true"
    });
  }
  const overrideImgs = Array.isArray(overrideImg) ? overrideImg : overrideImg ? [overrideImg] : [];
  const gallery = [...overrideImgs, product.img, ...(product.gallery || [])].filter((v, i, a) => v && a.indexOf(v) === i);
  galleryLenRef.current = gallery.length;
  const currentImg = gallery[idx] || product.img;
  function pdPrev(e) {
    e.stopPropagation();
    setIdx(i => (i - 1 + gallery.length) % gallery.length);
  }
  function pdNext(e) {
    e.stopPropagation();
    setIdx(i => (i + 1) % gallery.length);
  }
  return /*#__PURE__*/React.createElement("div", {
    className: 'pd-overlay open',
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
    className: 'pd__main' + (zoomed ? ' pd__main--zoomed' : ''),
    onClick: () => setZoomed(z => !z),
    onTouchStart: e => {
      pdTouchRef.current = e.touches[0].clientX;
    },
    onTouchEnd: e => {
      var dx = e.changedTouches[0].clientX - (pdTouchRef.current || 0);
      if (Math.abs(dx) > 40) {
        if (dx < 0) pdNext(e);else pdPrev(e);
      }
    }
  }, currentImg ? /*#__PURE__*/React.createElement("img", {
    src: currentImg,
    alt: product.name
  }) : /*#__PURE__*/React.createElement("div", {
    className: "pd__ph"
  }, product.name.split(' ').slice(-1)[0].slice(0, 2)), gallery.length > 1 && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
    className: "pd__arr pd__arr--prev",
    onClick: pdPrev,
    "aria-label": "Anterior"
  }, "\u2039"), /*#__PURE__*/React.createElement("button", {
    className: "pd__arr pd__arr--next",
    onClick: pdNext,
    "aria-label": "Siguiente"
  }, "\u203A"), /*#__PURE__*/React.createElement("div", {
    className: "pd__arr-count"
  }, idx + 1, " / ", gallery.length))), gallery.length > 1 && /*#__PURE__*/React.createElement("div", {
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
  }, product.verse, " ", product.tag ? '· ' + product.tag : ''), /*#__PURE__*/React.createElement("h2", {
    className: "pd__title"
  }, product.name), /*#__PURE__*/React.createElement("div", {
    className: "pd__price"
  }, /*#__PURE__*/React.createElement("span", {
    className: "clp"
  }, "CLP"), "$", product.price), (() => {
    const st = product.stockType || 'permanente';
    const avail = product.stockActual != null ? product.stockActual : product.stockTotal || 0;
    if (st === 'limitado') return /*#__PURE__*/React.createElement("div", {
      className: "pd__stock pd__stock--limited"
    }, /*#__PURE__*/React.createElement("span", {
      className: "pd__stock-dot"
    }), /*#__PURE__*/React.createElement("span", null, "STOCK LIMITADO \xB7 ", avail, " / ", product.stockTotal || 0, " disponibles"));
    if (st === 'unica') return /*#__PURE__*/React.createElement("div", {
      className: "pd__stock pd__stock--unique"
    }, /*#__PURE__*/React.createElement("span", {
      className: "pd__stock-dot"
    }), /*#__PURE__*/React.createElement("span", null, "PIEZA \xDANICA"));
    return null;
  })(), /*#__PURE__*/React.createElement("div", {
    className: "pd__sizes"
  }, /*#__PURE__*/React.createElement("div", {
    className: "pd__sizes-label"
  }, "TALLA"), /*#__PURE__*/React.createElement("div", {
    className: "pd__sizes-btns"
  }, (SIZES[product.sizeType] || SIZES.adulto).map(s => /*#__PURE__*/React.createElement("button", {
    key: s,
    type: "button",
    className: 'pd__size-btn' + (selectedSize === s ? ' active' : ''),
    onClick: () => setSelectedSize(s === selectedSize ? null : s)
  }, s)))), /*#__PURE__*/React.createElement("div", {
    className: "pd__scrollable"
  }, product.description && /*#__PURE__*/React.createElement("p", {
    className: "pd__desc"
  }, product.description), (product.material || product.estampado || product.fit || product.tallas || product.origen) && /*#__PURE__*/React.createElement("div", {
    className: "pd__details"
  }, product.material && /*#__PURE__*/React.createElement("div", {
    className: "pd__detail"
  }, /*#__PURE__*/React.createElement("span", {
    className: "lbl"
  }, "Material"), /*#__PURE__*/React.createElement("span", {
    className: "val"
  }, product.material)), product.estampado && /*#__PURE__*/React.createElement("div", {
    className: "pd__detail"
  }, /*#__PURE__*/React.createElement("span", {
    className: "lbl"
  }, "Estampado"), /*#__PURE__*/React.createElement("span", {
    className: "val"
  }, product.estampado)), product.fit && /*#__PURE__*/React.createElement("div", {
    className: "pd__detail"
  }, /*#__PURE__*/React.createElement("span", {
    className: "lbl"
  }, "Fit"), /*#__PURE__*/React.createElement("span", {
    className: "val"
  }, product.fit)), product.tallas && /*#__PURE__*/React.createElement("div", {
    className: "pd__detail"
  }, /*#__PURE__*/React.createElement("span", {
    className: "lbl"
  }, "Tallas"), /*#__PURE__*/React.createElement("span", {
    className: "val"
  }, product.tallas)), product.origen && /*#__PURE__*/React.createElement("div", {
    className: "pd__detail"
  }, /*#__PURE__*/React.createElement("span", {
    className: "lbl"
  }, "Origen"), /*#__PURE__*/React.createElement("span", {
    className: "val"
  }, product.origen))), product.details && product.details.length > 0 && /*#__PURE__*/React.createElement("div", {
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
  }, /*#__PURE__*/React.createElement("strong", null, "PROTOCOLO 1\xD71 ACTIVO."), "\xA0Comprar esta pieza dona una prenda a alguien en situaci\xF3n de calle.")), /*#__PURE__*/React.createElement("div", {
    className: "pd__cta"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn--amber",
    onClick: () => {
      if (onBuyNow) onBuyNow(product.id, selectedSize);else onClose();
    }
  }, "Ir a pagar ", /*#__PURE__*/React.createElement("span", {
    className: "arrow"
  }, "\u2192")), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn--ghost",
    onClick: () => {
      if (onAddToCart) onAddToCart(product.id, 1, selectedSize);
    }
  }, "A\xF1adir al carrito")))));
}

// --- Manifesto ---
function Manifesto({
  content
}) {
  return /*#__PURE__*/React.createElement("section", {
    className: "manifesto"
  }, /*#__PURE__*/React.createElement("div", {
    className: "shell"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "manifesto__text"
  }, content.manifesto.text.map((seg, i) => /*#__PURE__*/React.createElement(React.Fragment, {
    key: i
  }, /*#__PURE__*/React.createElement(RevealLine, {
    delay: i * 150
  }, seg.em ? /*#__PURE__*/React.createElement("span", {
    className: "amb"
  }, seg.txt) : seg.strike ? /*#__PURE__*/React.createElement("span", {
    className: "strike"
  }, seg.txt) : seg.txt), i < content.manifesto.text.length - 1 && ' ')))));
}

// --- Testimonials ---
function Testimonials({
  content
}) {
  const t = content.testimonials;
  return /*#__PURE__*/React.createElement("section", {
    id: "comunidad",
    className: "testi-section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "shell"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sec-head"
  }, /*#__PURE__*/React.createElement(Reveal, null, /*#__PURE__*/React.createElement("div", {
    className: "sec-head__num"
  }, t.eyebrow)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    className: "sec-head__title sec-head__title--testi"
  }, /*#__PURE__*/React.createElement(RevealLine, null, t.title), ' ', /*#__PURE__*/React.createElement(RevealLine, {
    delay: 120
  }, /*#__PURE__*/React.createElement("span", {
    className: "amb"
  }, t.titleEm))), /*#__PURE__*/React.createElement(Reveal, {
    delay: 250,
    className: "sec-head__sub"
  }, /*#__PURE__*/React.createElement("p", null, t.sub)))), /*#__PURE__*/React.createElement("div", {
    className: "testi-grid"
  }, t.items.map((it, i) => /*#__PURE__*/React.createElement(Reveal, {
    key: it.id,
    delay: i * 100,
    className: "testi"
  }, /*#__PURE__*/React.createElement("p", {
    className: "testi__quote"
  }, /*#__PURE__*/React.createElement("span", {
    className: "amb"
  }, "\u201C"), it.quote, /*#__PURE__*/React.createElement("span", {
    className: "amb"
  }, "\u201D")), /*#__PURE__*/React.createElement("div", {
    className: "testi__foot"
  }, /*#__PURE__*/React.createElement("div", {
    className: "testi__av"
  }, it.initial), /*#__PURE__*/React.createElement("div", {
    className: "testi__who"
  }, /*#__PURE__*/React.createElement("span", {
    className: "testi__name"
  }, it.name), /*#__PURE__*/React.createElement("span", {
    className: "testi__role"
  }, it.role))))))));
}

// --- CTA ---
function CTABlock({
  content
}) {
  const c = content.cta;
  return /*#__PURE__*/React.createElement("section", {
    className: "cta-block",
    id: "contacto"
  }, /*#__PURE__*/React.createElement("div", {
    className: "shell"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cta-block__grid"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "cta-block__title"
  }, /*#__PURE__*/React.createElement(RevealLine, null, c.title), ' ', /*#__PURE__*/React.createElement(RevealLine, {
    delay: 120
  }, c.titleEm), ' ', /*#__PURE__*/React.createElement(RevealLine, {
    delay: 240
  }, c.titleAfter)), /*#__PURE__*/React.createElement(Reveal, {
    delay: 400
  }, /*#__PURE__*/React.createElement("p", {
    className: "cta-block__body"
  }, c.body), /*#__PURE__*/React.createElement("div", {
    className: "cta-block__btns"
  }, /*#__PURE__*/React.createElement("a", {
    className: "btn",
    href: c.primaryCta.href
  }, c.primaryCta.label, " ", /*#__PURE__*/React.createElement("span", {
    className: "arrow"
  }, "\u2192")), /*#__PURE__*/React.createElement("a", {
    className: "btn btn--ghost",
    href: c.secondaryCta.href
  }, c.secondaryCta.label))))));
}

// --- Envíos y Devoluciones ---
function Envios({
  content
}) {
  const e = content.envios || {};
  return /*#__PURE__*/React.createElement("section", {
    className: "envios",
    id: "envios"
  }, /*#__PURE__*/React.createElement("div", {
    className: "shell"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sec-head"
  }, /*#__PURE__*/React.createElement(Reveal, null, /*#__PURE__*/React.createElement("div", {
    className: "sec-head__num"
  }, e.headerIndex)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    className: "sec-head__title"
  }, /*#__PURE__*/React.createElement(RevealLine, null, e.title), ' ', /*#__PURE__*/React.createElement(RevealLine, {
    delay: 120
  }, /*#__PURE__*/React.createElement("span", {
    className: "amb"
  }, e.titleEm))), /*#__PURE__*/React.createElement(Reveal, {
    delay: 250,
    className: "sec-head__sub"
  }, /*#__PURE__*/React.createElement("p", null, e.intro)))), /*#__PURE__*/React.createElement("div", {
    className: "envios__grid"
  }, (e.blocks || []).map((b, i) => /*#__PURE__*/React.createElement(Reveal, {
    key: b.id,
    delay: i * 60,
    className: "envios__block"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "envios__block-title"
  }, b.title), /*#__PURE__*/React.createElement("p", {
    className: "envios__block-body"
  }, b.body))))));
}

// --- Footer ---
function Footer({
  content,
  onOpenAdmin,
  onNavigate
}) {
  const f = content.footer;
  const clicksRef = React.useRef([]);
  function onYearClick(e) {
    const now = Date.now();
    clicksRef.current = clicksRef.current.filter(t => now - t < 700);
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
    return /*#__PURE__*/React.createElement(React.Fragment, null, txt.slice(0, idx), /*#__PURE__*/React.createElement("span", {
      className: "footer__year",
      onClick: onYearClick,
      role: "button",
      tabIndex: 0,
      title: "\xB7",
      "aria-label": m[1]
    }, m[1]), txt.slice(idx + m[1].length));
  }
  return /*#__PURE__*/React.createElement("footer", {
    className: "footer"
  }, /*#__PURE__*/React.createElement("div", {
    className: "shell"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "footer__wordmark"
  }, f.wordmark, ' ', /*#__PURE__*/React.createElement("span", {
    className: "static"
  }, f.wordmarkSecret)), /*#__PURE__*/React.createElement("p", {
    className: "footer__about",
    style: {
      maxWidth: 460,
      marginBottom: 32
    }
  }, f.about), /*#__PURE__*/React.createElement("div", {
    className: "footer__grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "footer__col"
  }, /*#__PURE__*/React.createElement("h4", null, "Instagram"), /*#__PURE__*/React.createElement("a", {
    href: "https://instagram.com/ruahlabs",
    target: "_blank",
    rel: "noreferrer"
  }, "@ruahlabs"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--gray-soft)'
    }
  }, content.brand.location)), f.cols.map(c => /*#__PURE__*/React.createElement("div", {
    className: "footer__col",
    key: c.id
  }, /*#__PURE__*/React.createElement("h4", null, c.title), c.items.map(i => {
    var PAGE_MAP = {
      '#nosotros': 'nosotros',
      '#servicios': 'servicios',
      '#productos': 'productos',
      '#protocolo': 'protocolo',
      '#comunidad': 'comunidad',
      '#cuadros': 'cuadros',
      '#iglesias': 'iglesias',
      '#evento': 'evento',
      '#design': 'design',
      '#envios': 'envios'
    };
    var spaPage = i.href && PAGE_MAP[i.href];
    return /*#__PURE__*/React.createElement("a", {
      key: i.id,
      href: i.href,
      onClick: i.href && i.href.startsWith('#') ? e => {
        e.preventDefault();
        if (spaPage) {
          onNavigate && onNavigate(spaPage);
        } else {
          var el = document.querySelector(i.href);
          if (el) el.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      } : undefined,
      target: i.href && i.href.startsWith('http') ? '_blank' : undefined,
      rel: i.href && i.href.startsWith('http') ? 'noreferrer' : undefined
    }, i.label);
  })))), /*#__PURE__*/React.createElement("div", {
    className: "footer__bottom"
  }, /*#__PURE__*/React.createElement("span", null, renderBottomLeft()), /*#__PURE__*/React.createElement("span", null, f.bottomRight))));
}
Object.assign(window, {
  useInView,
  Reveal,
  RevealLine,
  SectionHeader,
  Nav,
  Hero,
  HomeIntro,
  FeaturedDuo,
  HomeCategoryCarousel,
  DesignGallery,
  PageView,
  About,
  Protocol,
  Services,
  Products,
  ProductDetail,
  Manifesto,
  Testimonials,
  CTABlock,
  Footer
});