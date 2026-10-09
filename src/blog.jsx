/* global React, DOMPurify */
// ============================================================
// RUAH LABS — Blog / Medio Editorial (público)
// ============================================================

function BlogPage() {
  var API = (window.RUAH_API || '') + '/api/blog';

  var [view,       setView]       = React.useState('list'); // 'list' | 'post'
  var [posts,      setPosts]      = React.useState([]);
  var [cats,       setCats]       = React.useState([]);
  var [activeCat,  setActiveCat]  = React.useState('todo');
  var [post,       setPost]       = React.useState(null);
  var [loading,    setLoading]    = React.useState(true);
  var [lightbox,   setLightbox]   = React.useState(null);
  var [error,      setError]      = React.useState(null);

  // ── Cargar categorías y posts ──────────────────────────────
  React.useEffect(function() {
    Promise.all([
      fetch(API + '/categories').then(function(r) { return r.json(); }),
      fetch(API + '/posts').then(function(r) { return r.json(); }),
    ]).then(function(results) {
      setCats(results[0] || []);
      setPosts(results[1] || []);
      setLoading(false);
    }).catch(function(e) {
      console.error('[Blog]', e);
      setError('No se pudieron cargar los artículos.');
      setLoading(false);
    });
  }, []);

  // ── Abrir post individual ──────────────────────────────────
  function openPost(slug) {
    setLoading(true);
    fetch(API + '/posts/' + slug)
      .then(function(r) { return r.json(); })
      .then(function(data) {
        setPost(data);
        setView('post');
        setLoading(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      })
      .catch(function(e) {
        console.error('[Blog]', e);
        setError('No se pudo cargar el artículo.');
        setLoading(false);
      });
  }

  function backToList() {
    setView('list');
    setPost(null);
    setError(null);
  }

  // ── Filtro de categoría ────────────────────────────────────
  var filtered = activeCat === 'todo'
    ? posts
    : posts.filter(function(p) { return p.category_id && cats.find(function(c) { return c.id === p.category_id && c.slug === activeCat; }); });

  // ── Helpers ───────────────────────────────────────────────
  function fmtDate(d) {
    if (!d) return '';
    var dt = new Date(d);
    return dt.toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' });
  }
  function catName(id) {
    var c = cats.find(function(x) { return x.id === id; });
    return c ? c.name.toUpperCase() : '';
  }
  function shareUrl() {
    return window.location.origin + '/blog/' + (post && post.slug);
  }
  function shareWA() {
    window.open('https://wa.me/?text=' + encodeURIComponent((post && post.title) + ' — ' + shareUrl()), '_blank');
  }
  function shareIG() {
    navigator.clipboard && navigator.clipboard.writeText(shareUrl());
    alert('Enlace copiado. Pégalo en Instagram Stories.');
  }
  function shareCopy() {
    navigator.clipboard && navigator.clipboard.writeText(shareUrl())
      .then(function() { alert('Enlace copiado al portapapeles.'); })
      .catch(function() { prompt('Copia este enlace:', shareUrl()); });
  }

  // ── Render post individual ─────────────────────────────────
  if (view === 'post') {
    if (loading) return React.createElement('div', { className: 'blog__loading' }, 'CARGANDO...');
    if (error)   return React.createElement('div', { className: 'blog__empty' }, error);
    if (!post)   return null;

    var bodyHtml = (typeof DOMPurify !== 'undefined')
      ? DOMPurify.sanitize(post.content || '')
      : (post.content || '').replace(/</g, '&lt;');

    return React.createElement('div', { className: 'blog__page' },
      React.createElement('div', { className: 'blog__post' },
        React.createElement('button', { className: 'blog__post-back', onClick: backToList }, '← VOLVER AL MEDIO EDITORIAL'),
        post.category_id && React.createElement('div', { className: 'blog__post-cat' }, catName(post.category_id)),
        React.createElement('h1', { className: 'blog__post-h1' }, post.title),
        post.subtitle && React.createElement('p', { className: 'blog__post-sub' }, post.subtitle),
        React.createElement('div', { className: 'blog__post-meta' },
          React.createElement('span', null, post.author || 'RUAH LABS'),
          post.published_at && React.createElement('span', null, fmtDate(post.published_at))
        ),
        post.featured_image && React.createElement('img', {
          src: post.featured_image,
          alt: post.title,
          className: 'blog__post-featured',
        }),
        React.createElement('div', {
          className: 'blog__post-body',
          dangerouslySetInnerHTML: { __html: bodyHtml },
        }),
        // Galería de imágenes adicionales
        post.images && post.images.length > 0 && React.createElement('div', { className: 'blog__post-gallery' },
          post.images.map(function(img) {
            return React.createElement('img', {
              key: img.id,
              src: img.url,
              alt: img.alt || post.title,
              onClick: function() { setLightbox(img.url); },
            });
          })
        ),
        // Compartir
        React.createElement('div', { className: 'blog__share' },
          React.createElement('span', { className: 'blog__share-label' }, 'COMPARTIR:'),
          React.createElement('button', { className: 'blog__share-btn', onClick: shareWA }, 'WhatsApp'),
          React.createElement('button', { className: 'blog__share-btn', onClick: shareIG }, 'Instagram'),
          React.createElement('button', { className: 'blog__share-btn', onClick: shareCopy }, 'Copiar enlace')
        )
      ),
      // Lightbox
      lightbox && React.createElement('div', {
        className: 'blog__lightbox',
        onClick: function(e) { if (e.target === e.currentTarget) setLightbox(null); },
      },
        React.createElement('button', { className: 'blog__lightbox-close', onClick: function() { setLightbox(null); } }, 'CERRAR ✕'),
        React.createElement('img', { src: lightbox, alt: '' })
      )
    );
  }

  // ── Render listado ─────────────────────────────────────────
  return React.createElement('div', { className: 'blog__page' },
    React.createElement('div', { className: 'blog__header' },
      React.createElement('div', { className: 'blog__eyebrow' }, 'RUAH LABS · SANTIAGO · CHILE'),
      React.createElement('h1', { className: 'blog__title' }, 'MEDIO EDITORIAL'),
      React.createElement('p', { className: 'blog__subtitle' }, 'Música, cultura, artistas y fe. Historias que visten una causa.')
    ),
    // Filtros
    React.createElement('div', { className: 'blog__cats' },
      React.createElement('button', {
        className: 'blog__cat-btn' + (activeCat === 'todo' ? ' active' : ''),
        onClick: function() { setActiveCat('todo'); },
      }, 'TODOS'),
      cats.map(function(c) {
        return React.createElement('button', {
          key: c.id,
          className: 'blog__cat-btn' + (activeCat === c.slug ? ' active' : ''),
          onClick: function() { setActiveCat(c.slug); },
        }, c.name.toUpperCase());
      })
    ),
    // Contenido
    loading
      ? React.createElement('div', { className: 'blog__loading' }, 'CARGANDO ARTÍCULOS...')
      : error
        ? React.createElement('div', { className: 'blog__empty' }, error)
        : filtered.length === 0
          ? React.createElement('div', { className: 'blog__empty' }, 'NO HAY ARTÍCULOS AÚN')
          : React.createElement('div', { className: 'blog__grid' },
              filtered.map(function(p) {
                return React.createElement('article', {
                  key: p.id,
                  className: 'blog__card',
                  onClick: function() { openPost(p.slug); },
                },
                  p.featured_image
                    ? React.createElement('img', { src: p.featured_image, alt: p.title, className: 'blog__card-img' })
                    : React.createElement('div', { className: 'blog__card-img-placeholder' }, 'RUAH'),
                  React.createElement('div', { className: 'blog__card-body' },
                    p.category_id && React.createElement('span', { className: 'blog__card-tag' }, catName(p.category_id)),
                    React.createElement('h2', { className: 'blog__card-title' }, p.title),
                    p.subtitle && React.createElement('p', { className: 'blog__card-subtitle' }, p.subtitle),
                    React.createElement('div', { className: 'blog__card-meta' },
                      React.createElement('span', null, p.author || 'RUAH LABS'),
                      p.published_at && React.createElement('span', null, fmtDate(p.published_at)),
                      React.createElement('span', { className: 'blog__card-read' }, 'LEER →')
                    )
                  )
                );
              })
            )
  );
}
