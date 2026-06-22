/* global React, ReactDOM */
// ============================================================
// RUAH LABS — App root
// ============================================================

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: false }; }
  static getDerivedStateFromError() { return { error: true }; }
  componentDidCatch(err, info) { console.error('[RUAH] Error en componente:', err, info && info.componentStack); }
  render() {
    if (this.state.error) return this.props.fallback || null;
    return this.props.children;
  }
}

function App() {
  const store = useContentStore();
  const { content } = store;
  const [adminOpen,    setAdminOpen]    = React.useState(false);
  const [clubOpen,     setClubOpen]     = React.useState(false);
  const [productId,       setProductId]       = React.useState(null);
  const productWasOpen = React.useRef(false);
  const [productOverrideImg, setProductOverrideImg] = React.useState(null);
  const [cuadroId,        setCuadroId]        = React.useState(null);
  const [toast,        setToast]        = React.useState(null);
  // Page navigation: null = home, or section key ('nosotros','servicios','productos','cuadros','iglesias','evento','protocolo','comunidad')
  const [activePage,   setActivePage]   = React.useState(() => {
    try { return sessionStorage.getItem('ruah-page') || 'productos'; } catch(_) { return 'productos'; }
  });
  const [pageCategory, setPageCategory] = React.useState('todo');

  // -------- Cart + checkout --------
  const [cart,         setCart]         = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('ruah-cart') || '[]'); } catch(_) { return []; }
  });
  const [checkoutOpen, setCheckoutOpen] = React.useState(false);

  function addToCart(productId, qty = 1, size = null) {
    const product = content.products.items.find(p => p.id === productId)
      || ((content.cuadros && content.cuadros.products) ? content.cuadros.products.find(p => p.id === productId) : null);
    if (!product) return;
    const uid = productId + (size ? ':' + size : '');
    setCart(prev => {
      const existing = prev.find(it => (it.uid || it.id) === uid);
      if (existing) return prev.map(it => (it.uid || it.id) === uid ? { ...it, qty: (it.qty || 1) + qty } : it);
      return [...prev, {
        uid,
        id: product.id,
        name: product.name,
        verse: product.verse,
        price: product.price,
        img: product.img,
        material:   product.material   || '',
        estampado:  product.estampado  || '',
        fit:        product.fit        || '',
        tallas:     product.tallas     || '',
        origen:     product.origen     || '',
        size: size || null,
        qty,
      }];
    });
    // Decrement limited stock
    if (product.stockType === 'limitado' && (product.stockActual == null ? product.stockTotal : product.stockActual) > 0) {
      store.updateList('products.items', list => list.map(p => {
        if (p.id !== productId) return p;
        const cur = p.stockActual != null ? p.stockActual : (p.stockTotal || 0);
        return { ...p, stockActual: Math.max(0, cur - qty) };
      }));
    }
    setToast({ msg: '✓ ' + product.name.toUpperCase() + (size ? ' · TALLA ' + size : '') + ' AÑADIDO AL CARRITO' });
    setTimeout(() => setToast(null), 2400);
  }

  function buyNow(productId, size) {
    addToCart(productId, 1, size);
    setProductId(null);
    setTimeout(() => setCheckoutOpen(true), 80);
  }

  function openCheckout() {
    setCheckoutOpen(true);
  }

  // Konami-like shortcut: Ctrl+Shift+A toggles admin, +C toggles club
  React.useEffect(() => {
    const onKey = (e) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault(); setAdminOpen(o => !o);
      }
      if (e.ctrlKey && e.shiftKey && (e.key === 'C' || e.key === 'c')) {
        e.preventDefault(); setClubOpen(o => !o);
      }
      if (e.key === 'Escape') { setAdminOpen(false); setClubOpen(false); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Open Club after the secret-portal login flow
  React.useEffect(() => {
    const onOpen = () => setClubOpen(true);
    window.addEventListener('ruah:openClub', onOpen);
    return () => window.removeEventListener('ruah:openClub', onOpen);
  }, []);

  // Navigate to a page from any component
  React.useEffect(() => {
    const onNav = (e) => { if (e.detail && e.detail.page) openPage(e.detail.page, e.detail.category || null); };
    window.addEventListener('ruah:navigateTo', onNav);
    return () => window.removeEventListener('ruah:navigateTo', onNav);
  }, []);

  // -------- URL slugs de producto (/producto/<slug>) --------
  // Abre el producto según la URL: carga directa + botones atrás/adelante.
  React.useEffect(() => {
    function syncFromPath() {
      const m = window.location.pathname.match(/^\/producto\/([^/?#]+)/);
      if (m) {
        const slug = decodeURIComponent(m[1]);
        const prod = (content.products.items || []).find((p) => window.slugify(p.name) === slug);
        setProductId(prod ? prod.id : null);
      } else {
        setProductId(null);
      }
    }
    syncFromPath();
    window.addEventListener('popstate', syncFromPath);
    return () => window.removeEventListener('popstate', syncFromPath);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reintenta abrir el deep-link cuando el contenido llega desde Supabase.
  React.useEffect(() => {
    const m = window.location.pathname.match(/^\/producto\/([^/?#]+)/);
    if (!m || productId) return;
    const slug = decodeURIComponent(m[1]);
    const prod = (content.products.items || []).find((p) => window.slugify(p.name) === slug);
    if (prod) setProductId(prod.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content.products.items]);

  // Refleja en la URL el producto abierto (sin entradas duplicadas en el historial).
  React.useEffect(() => {
    if (productId != null) productWasOpen.current = true;
    const onProductPath = /^\/producto\//.test(window.location.pathname);
    if (productId == null) {
      // Solo limpiar la URL si el producto ya estuvo abierto antes.
      // En carga inicial con Supabase aún pendiente, productId es null pero
      // la URL debe preservarse para que el efecto de retry la pueda usar.
      if (onProductPath && productWasOpen.current) window.history.pushState({}, '', '/');
      return;
    }
    const prod = (content.products.items || []).find((p) => p.id === productId);
    if (!prod) return;
    const url = '/producto/' + window.slugify(prod.name);
    if (window.location.pathname !== url) window.history.pushState({ productId }, '', url);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  // Persistir carrito en localStorage
  React.useEffect(() => {
    try { localStorage.setItem('ruah-cart', JSON.stringify(cart)); } catch(_) {}
  }, [cart]);

  // Global checkout events (from buttons elsewhere, e.g. nav cart)
  React.useEffect(() => {
    const onCk     = () => setCheckoutOpen(true);
    const onAdd    = (e) => addToCart(e.detail.productId, e.detail.qty || 1);
    const onBuyNow = (e) => buyNow(e.detail.productId);
    window.addEventListener('ruah:openCheckout', onCk);
    window.addEventListener('ruah:addToCart',    onAdd);
    window.addEventListener('ruah:buyNow',       onBuyNow);
    return () => {
      window.removeEventListener('ruah:openCheckout', onCk);
      window.removeEventListener('ruah:addToCart',    onAdd);
      window.removeEventListener('ruah:buyNow',       onBuyNow);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  // Detectar retorno de Mercado Pago
  React.useEffect(() => {
    var params = new URLSearchParams(window.location.search);
    var payStatus = params.get('payment');
    if (!payStatus) return;

    // Limpiar URL sin recargar
    window.history.replaceState({}, '', window.location.pathname);

    if (payStatus === 'success') {
      var orderRaw = sessionStorage.getItem('ruah-pending-order');
      if (orderRaw) {
        try {
          var order = JSON.parse(orderRaw);
          sessionStorage.removeItem('ruah-pending-order');
          order.payment_id = params.get('payment_id') || params.get('collection_id') || '';
          setCart([]);
          try { localStorage.removeItem('ruah-cart'); } catch(_) {}
          fetch('' + window.RUAH_API + '/api/checkout/welcome', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(order),
          }).catch(function(){});
        } catch(_) {}
      }
      setToast({ msg: '✓ PAGO CONFIRMADO — REVISA TU CORREO, YA ERES PARTE DEL CLUB', dur: 8000 });
      setTimeout(function() { setToast(null); }, 8000);
    } else if (payStatus === 'failure') {
      setToast({ msg: '✗ EL PAGO NO FUE PROCESADO — INTENTA NUEVAMENTE' });
      setTimeout(function() { setToast(null); }, 5000);
    }
  }, []);


  const cartCount = cart.reduce((s, it) => s + (it.qty || 1), 0);

  // Page titles map
  const PAGE_TITLES = {
    nosotros:  'QUIÉNES SOMOS',
    servicios: 'SERVICIOS',
    productos: 'PRODUCTOS',
    cuadros:   'CUADROS',
    iglesias:  'IGLESIAS',
    evento:    'EVENTO',
    protocolo: 'PROTOCOLO',
    comunidad: 'COMUNIDAD',
    envios:    'ENVÍOS Y DEVOLUCIONES',
  };

  React.useEffect(() => {
    try {
      if (activePage) sessionStorage.setItem('ruah-page', activePage);
      else sessionStorage.removeItem('ruah-page');
    } catch(_) {}
  }, [activePage]);

  function openPage(page, cat) {
    setActivePage(page);
    if (cat) setPageCategory(cat);
    window.history.pushState({ ruahPage: page, ruahCat: cat || null }, '', window.location.pathname);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function goHome() {
    setActivePage(null);
    window.history.pushState({ ruahPage: null }, '', '/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Back-button support for section pages
  React.useEffect(() => {
    function onPop(e) {
      if (/^\/producto\//.test(window.location.pathname)) return; // handled by product effect
      const state = e.state;
      if (state && state.ruahPage) {
        setActivePage(state.ruahPage);
        if (state.ruahCat) setPageCategory(state.ruahCat);
      } else {
        setActivePage(null);
      }
    }
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  function renderPage() {
    switch (activePage) {
      case 'nosotros':
        return <PageView title="QUIÉNES SOMOS" onBack={goHome}><About content={content} /></PageView>;
      case 'servicios':
        return <PageView title="SERVICIOS" onBack={goHome}><Services content={content} /></PageView>;
      case 'productos':
        return (
          <PageView title="PRODUCTOS" onBack={goHome}>
            <Products key={pageCategory} content={content} onOpenProduct={(id) => setProductId(id)} initialCategory={pageCategory} />
          </PageView>
        );
      case 'cuadros':
        return <PageView title="CUADROS" onBack={goHome}><Cuadros content={content} onAddToCart={addToCart} onBuyNow={buyNow} onOpenCuadro={(id) => setCuadroId(id)} /></PageView>;
      case 'iglesias':
        return <PageView title="IGLESIAS" onBack={goHome}><Iglesias content={content} /></PageView>;
      case 'evento':
        return <PageView title="EVENTO" onBack={goHome}><Eventos content={content} /></PageView>;
      case 'protocolo':
        return <PageView title="PROTOCOLO 1×1" onBack={goHome}><Protocol content={content} /></PageView>;
      case 'comunidad':
        return <PageView title="COMUNIDAD" onBack={goHome}><Testimonials content={content} /><CTABlock content={content} /></PageView>;
      case 'envios':
        return <PageView title="ENVÍOS Y DEVOLUCIONES" onBack={goHome}><Envios content={content} /></PageView>;
      case 'design':
        return <PageView title="PERSONALIZADO" onBack={goHome}><DesignGallery content={content} /></PageView>;
      default:
        return null;
    }
  }

  return (
    <React.Fragment>
      <Nav
        content={content}
        onOpenAdmin={() => setAdminOpen(true)}
        cartCount={cartCount}
        onOpenCheckout={openCheckout}
        activePage={activePage}
        onNavigate={openPage}
        onGoHome={goHome}
      />
      <ErrorBoundary fallback={<div style={{padding:'60px 24px',color:'#eca10c',fontFamily:'monospace',fontSize:'12px',letterSpacing:'2px',textAlign:'center'}}>ERROR AL CARGAR SECCIÓN — RECARGA LA PÁGINA</div>}>
      <main>
        {activePage ? renderPage() : (
          <React.Fragment>
            <Hero content={content} isHome={true} />
            <div id="home-productos">
              <Products content={content} onOpenProduct={(id) => setProductId(id)} initialCategory="todo" />
            </div>
          </React.Fragment>
        )}
      </main>
      </ErrorBoundary>
      <Footer content={content} onOpenAdmin={() => setAdminOpen(true)} onNavigate={openPage} />

      <Admin open={adminOpen} content={content} store={store} onClose={() => setAdminOpen(false)} />
      <Club  open={clubOpen}  content={content} store={store} onClose={() => setClubOpen(false)} />
      <ProductDetail
        productId={productId}
        content={content}
        onClose={() => { setProductId(null); setProductOverrideImg(null); }}
        onBuyNow={buyNow}
        onAddToCart={addToCart}
        overrideImg={productOverrideImg}
      />
      <CuadroProductModal
        productId={cuadroId}
        cuadros={content.cuadros}
        onClose={() => setCuadroId(null)}
        onAddToCart={addToCart}
        onBuyNow={(id) => { setCuadroId(null); buyNow(id, null); }}
      />
      <Checkout
        open={checkoutOpen}
        cart={cart}
        content={content}
        onClose={() => setCheckoutOpen(false)}
        onUpdateCart={setCart}
      />
      <SecretPortal />

      {toast && (
        <div className="toast show">
          <span className="dot"></span>
          <span>{toast.msg}</span>
        </div>
      )}

      {content.launch && content.launch.active && (
        <LaunchScreen
          imageMobile={content.launch.imageMobile}
          imageDesktop={content.launch.imageDesktop}
        />
      )}
      <WhatsAppFab isDesign={activePage === 'design'} />
      <EmailPopup />
    </React.Fragment>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
