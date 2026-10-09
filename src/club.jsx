/* global React */
// ============================================================
// RUAH LABS CLUB — Secret area
// ============================================================

function ClubImageBanner({ images }) {
  var valid = (images || []).filter(function(b) { return b.img; });
  var [idx, setIdx] = React.useState(0);
  React.useEffect(function() {
    if (valid.length < 2) return;
    var t = setInterval(function() { setIdx(function(i) { return (i + 1) % valid.length; }); }, 4000);
    return function() { clearInterval(t); };
  }, [valid.length]);
  if (!valid.length) return null;
  return (
    <div className="club__img-banner">
      {valid.map(function(b, i) {
        return (
          <div key={b.id || i} className={'club__img-slide' + (i === idx ? ' active' : '')}>
            <img src={b.img} alt={b.caption || ''} />
            {b.caption && <div className="club__img-caption">{b.caption}</div>}
          </div>
        );
      })}
      {valid.length > 1 && (
        <div className="club__img-dots">
          {valid.map(function(_, i) {
            return <span key={i} className={i === idx ? 'active' : ''} onClick={function() { setIdx(i); }} />;
          })}
        </div>
      )}
    </div>
  );
}

function ClubPanelsBanner({ panels }) {
  var [idx, setIdx] = React.useState(0);
  React.useEffect(function() {
    if (!panels || panels.length < 2) return;
    var t = setInterval(function() { setIdx(function(i) { return (i + 1) % panels.length; }); }, 3500);
    return function() { clearInterval(t); };
  }, [panels && panels.length]);
  if (!panels || !panels.length) return null;
  var p = panels[idx];
  return (
    <div className="club__panels-banner">
      <div className="club__panels-banner-inner">
        {panels.map(function(panel, i) {
          return (
            <div key={panel.id} className={'club__pbslide' + (i === idx ? ' active' : '')}>
              <div className="ttl">{panel.ttl}</div>
              <div className="big">{panel.big}</div>
              <div className="desc">{panel.desc}</div>
            </div>
          );
        })}
      </div>
      {panels.length > 1 && (
        <div className="club__pb-dots">
          {panels.map(function(_, i) {
            return <span key={i} className={i === idx ? 'active' : ''} onClick={function() { setIdx(i); }} />;
          })}
        </div>
      )}
    </div>
  );
}

function ShirtMeaningsSection({ collections }) {
  var [view, setView]       = React.useState('list'); // 'list' | 'collection' | 'item'
  var [selectedCol, setSCol] = React.useState(null);
  var [selectedItem, setSItem] = React.useState(null);
  var [filter, setFilter]   = React.useState('all');
  var [openSections, setOpenSections] = React.useState({});

  var TYPE_LABELS = { coleccion: 'Colección', personalizada: 'Personalizada', singulares: 'Singulares' };
  var all = collections || [];
  var filtered = filter === 'all' ? all : all.filter(function(c) { return c.type === filter; });

  var viewRef = React.useRef('list');
  function setViewTracked(v) { setView(v); viewRef.current = v; }

  React.useEffect(function() {
    function handlePop() {
      var v = viewRef.current;
      if (v === 'item') { setSItem(null); setViewTracked('collection'); setOpenSections({}); }
      else if (v === 'collection') { setSCol(null); setSItem(null); setViewTracked('list'); }
    }
    window.addEventListener('popstate', handlePop);
    return function() { window.removeEventListener('popstate', handlePop); };
  }, []);

  function openCollection(col) { history.pushState({ sm: 'collection' }, ''); setSCol(col); setSItem(null); setViewTracked('collection'); setOpenSections({}); }
  function openItem(item) { history.pushState({ sm: 'item' }, ''); setSItem(item); setViewTracked('item'); setOpenSections({}); }
  function backToList() { history.back(); }
  function backToCollection() { history.back(); }
  function toggleSection(id) { setOpenSections(function(s) { return Object.assign({}, s, { [id]: !s[id] }); }); }

  if (view === 'item' && selectedItem) {
    return (
      <div className="sm__wrap">
        <button className="sm__back" onClick={backToCollection}>← {selectedCol && selectedCol.name}</button>
        <div className="sm__item-hero">
          {selectedItem.img && <div className="sm__item-img"><img src={selectedItem.img} alt={selectedItem.name} /></div>}
          <div className="sm__item-meta">
            <div className="num">{selectedItem.verse}</div>
            <h3 className="sm__item-name">{selectedItem.name}</h3>
          </div>
        </div>
        <div className="sm__accordion">
          {(selectedItem.sections || []).map(function(sec, i) {
            var isOpen = !!openSections[sec.id];
            return (
              <div key={sec.id} className={'sm__acc-item' + (isOpen ? ' open' : '')}>
                <button className="sm__acc-head" onClick={function() { toggleSection(sec.id); }}>
                  <span className="sm__acc-num">{String(i + 1).padStart(2, '0')}</span>
                  <span className="sm__acc-title">{sec.title}</span>
                  <span className="sm__acc-arrow">{isOpen ? '−' : '+'}</span>
                </button>
                {isOpen && (
                  <div className="sm__acc-body">
                    {sec.pdfUrl ? (
                      <div className="sm__pdf-viewer">
                        <div className="sm__pdf-actions">
                          <a href={sec.pdfUrl} target="_blank" rel="noreferrer" className="sm__pdf-btn">Abrir PDF ↗</a>
                          <a href={sec.pdfUrl} download className="sm__pdf-btn sm__pdf-btn--dl">Descargar ↓</a>
                        </div>
                        <iframe src={sec.pdfUrl} title={sec.title} />
                      </div>
                    ) : (
                      (sec.body || '').split('\n\n').map(function(para, pi) {
                        return para ? <p key={pi}>{para}</p> : null;
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (view === 'collection' && selectedCol) {
    return (
      <div className="sm__wrap">
        <button className="sm__back" onClick={backToList}>← Todas las colecciones</button>
        <div className="sm__col-header">
          <div className="num">{TYPE_LABELS[selectedCol.type] || selectedCol.type}</div>
          <h3>{selectedCol.name}</h3>
        </div>
        {!(selectedCol.items && selectedCol.items.length) && (
          <p className="sm__empty">Esta colección no tiene poleras aún.</p>
        )}
        <div className="sm__item-grid">
          {(selectedCol.items || []).map(function(item) {
            return (
              <div key={item.id} className="sm__item-card" onClick={function() { openItem(item); }}>
                <div className="sm__item-thumb">
                  {item.img ? <img src={item.img} alt={item.name} /> : <div className="sm__item-ph">◉</div>}
                </div>
                <div className="sm__item-info">
                  <div className="sm__item-verse">{item.verse}</div>
                  <div className="sm__item-label">{item.name}</div>
                  <div className="sm__item-cta">Leer reflexión →</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="sm__wrap">
      <div className="sm__filters">
        {['all', 'coleccion', 'personalizada', 'singulares'].map(function(t) {
          return (
            <button
              key={t}
              className={'sm__filter' + (filter === t ? ' active' : '')}
              onClick={function() { setFilter(t); }}
            >
              {t === 'all' ? 'Todo' : TYPE_LABELS[t]}
            </button>
          );
        })}
      </div>
      {!filtered.length && (
        <p className="sm__empty">Aún no hay colecciones cargadas.</p>
      )}
      <div className="sm__col-grid">
        {filtered.map(function(col) {
          return (
            <div key={col.id} className="sm__col-card" onClick={function() { openCollection(col); }}>
              <div className="sm__col-cover">
                {col.coverImg
                  ? <img src={col.coverImg} alt={col.name} />
                  : <div className="sm__col-ph">◉</div>}
              </div>
              <div className="sm__col-type">{TYPE_LABELS[col.type] || col.type}</div>
              <div className="sm__col-name">{col.name}</div>
              <div className="sm__col-count">{(col.items || []).length} polera{(col.items || []).length !== 1 ? 's' : ''}</div>
              <div className="sm__col-cta">Ver significado →</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Club({ open, content, onClose, store }) {
  var [authed, setAuthed] = React.useState(function() { return sessionStorage.getItem('ruah-club-auth') === '1'; });
  var memberName  = (sessionStorage.getItem('ruah-club-name')  || '').split(' ')[0].toUpperCase();
  var memberEmail = (sessionStorage.getItem('ruah-club-email') || '').trim().toLowerCase();
  var [pwd, setPwd]     = React.useState('');
  var [email, setEmail] = React.useState('');
  var [err, setErr]     = React.useState('');
  var [composer, setComposer] = React.useState('');
  var [posting, setPosting]   = React.useState(false);
  var [liveMessages, setLiveMessages] = React.useState(null);
  var [activeTab, setActiveTab] = React.useState('photos');
  var [photoModal, setPhotoModal] = React.useState({ itemId: null, albumId: null });

  React.useEffect(function() {
    document.body.style.overflow = open ? 'hidden' : '';
  }, [open]);

  React.useEffect(function() {
    if (!open) { setErr(''); return; }
    if (sessionStorage.getItem('ruah-club-auth') === '1') setAuthed(true);
  }, [open]);

  // Fetch and poll live messages from DB
  React.useEffect(function() {
    if (!authed) return;
    var cancelled = false;
    function loadMessages() {
      fetch((window.RUAH_API || '') + '/api/club/messages?limit=50')
        .then(function(r) { return r.json(); })
        .then(function(data) {
          if (!cancelled && Array.isArray(data)) setLiveMessages(data);
        })
        .catch(function() {});
    }
    loadMessages();
    var interval = setInterval(loadMessages, 15000);
    return function() { cancelled = true; clearInterval(interval); };
  }, [authed]);

  async function enter(e) {
    e && e.preventDefault();
    var trimEmail = email.trim().toLowerCase();
    try {
      var r, data;
      if (trimEmail) {
        // Per-user login with email + password
        r    = await fetch((window.RUAH_API || '') + '/api/club/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: trimEmail, password: pwd }) });
        data = await r.json();
        if (data.ok) {
          sessionStorage.setItem('ruah-club-email', data.email || trimEmail);
          sessionStorage.setItem('ruah-club-name',  data.name  || '');
        }
      } else {
        // Legacy global password
        r    = await fetch((window.RUAH_API || '') + '/api/club/verify-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: pwd }) });
        data = await r.json();
      }
      if (data.ok) {
        setAuthed(true);
        sessionStorage.setItem('ruah-club-auth', '1');
        setErr('');
      } else {
        setErr('CREDENCIALES INCORRECTAS — REVISA EL CORREO QUE LLEGÓ CON TU COMPRA.');
      }
    } catch (_) {
      setErr('NO SE PUDO CONECTAR CON EL SERVIDOR. INTENTA DE NUEVO.');
    }
  }

  function toggleJoin(routeId) {
    var routes  = content.club.routes;
    var route   = routes.find(function(r) { return r.id === routeId; });
    if (!route) return;
    var joining = !route.joined;
    var em      = sessionStorage.getItem('ruah-club-email') || '';
    store.updateList('club.routes', function(list) {
      return list.map(function(r) { return r.id === routeId ? Object.assign({}, r, { joined: joining }) : r; });
    });
    if (em) {
      if (joining) {
        fetch('' + window.RUAH_API + '/api/club/signup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: em, route_id: routeId, route_name: route.name }) }).catch(function(){});
      } else {
        fetch('' + window.RUAH_API + '/api/club/signup', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: em, route_id: routeId }) }).catch(function(){});
      }
    }
  }

  async function postMessage() {
    var text = composer.trim();
    if (!text || posting) return;
    setPosting(true);
    try {
      var r = await fetch((window.RUAH_API || '') + '/api/club/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: memberEmail, name: sessionStorage.getItem('ruah-club-name') || '', body: text }),
      });
      var data = await r.json();
      if (data.ok && data.message) {
        setLiveMessages(function(prev) { return [data.message].concat(prev || []); });
      }
      setComposer('');
    } catch(e) {
      // Keep message in composer if it failed
    } finally {
      setPosting(false);
    }
  }

  var c = content.club;

  // Photo modal content
  var photoModalEl = null;
  if (photoModal.itemId) {
    var pItem = (c.photoItems || []).find(function(x) { return x.id === photoModal.itemId; });
    if (pItem) {
      if (!photoModal.albumId) {
        // Album list view
        photoModalEl = (
          <div className="club__photo-modal">
            <div className="club__pm-head">
              <button className="club__pm-back" onClick={function() { setPhotoModal({ itemId: null, albumId: null }); }}>← Volver</button>
              <h3>{pItem.name}</h3>
            </div>
            <div className="club__albums">
              {(pItem.albums || []).length === 0 && (
                <p className="club__pm-empty">No hay álbumes todavía.</p>
              )}
              {(pItem.albums || []).map(function(alb) {
                return (
                  <div key={alb.id} className="club__album" onClick={function() { setPhotoModal({ itemId: pItem.id, albumId: alb.id }); }}>
                    <div className="club__album-thumb">
                      {alb.photos && alb.photos[0]
                        ? <img src={alb.photos[0]} alt="" />
                        : <div className="club__album-ph">+</div>}
                    </div>
                    <div className="club__album-info">
                      <div className="name">{alb.name}</div>
                      <div className="date">{alb.date}</div>
                      <div className="count">{(alb.photos || []).length} foto{(alb.photos || []).length !== 1 ? 's' : ''}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      } else {
        var pAlb = (pItem.albums || []).find(function(a) { return a.id === photoModal.albumId; });
        if (pAlb) {
          photoModalEl = (
            <div className="club__photo-modal">
              <div className="club__pm-head">
                <button className="club__pm-back" onClick={function() { setPhotoModal({ itemId: pItem.id, albumId: null }); }}>← {pItem.name}</button>
                <div>
                  <h3>{pAlb.name}</h3>
                  {pAlb.date && <div className="club__pm-date">{pAlb.date}</div>}
                </div>
              </div>
              <div className="club__pm-grid">
                {(pAlb.photos || []).length === 0 && (
                  <p className="club__pm-empty">No hay fotos en este álbum todavía.</p>
                )}
                {(pAlb.photos || []).map(function(ph, i) {
                  return (
                    <div key={i} className="club__pm-photo">
                      <img src={ph} alt="" />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        }
      }
    }
  }

  return (
    <div className={'club-overlay' + (open ? ' open' : '')} aria-hidden={!open}>
      <div className="club">
        <div className="club__top">
          <div className="club__brand">
            <span className="dot"></span>
            RUAH LABS CLUB
          </div>
          <button className="club__close" onClick={onClose}>
            <span>Cerrar</span>
            <span>×</span>
          </button>
        </div>

        {!authed && (
          <div className="club__gate">
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.2em', color: 'var(--amber)', textTransform: 'uppercase', marginBottom: 24 }}>
              ◉ ACCESO PRIVADO
            </div>
            <h2>
              SOMOS MAS<br/>
              DE LOS QUE<br/>
              <em>CREES.</em>
            </h2>
            <p className="lede">
              La contraseña te llegó por correo al momento de tu compra. Si no la encuentras, escríbenos a contacto@ruahlabs.cl
            </p>
            <form onSubmit={enter}>
              <label htmlFor="club-email">Correo</label>
              <input id="club-email" type="email" value={email} onChange={function(e) { setEmail(e.target.value); }} placeholder="tu@correo.com" autoComplete="email" />
              <label htmlFor="club-pwd">Contraseña</label>
              <input id="club-pwd" type="password" value={pwd} onChange={function(e) { setPwd(e.target.value); }} placeholder="••••••••" autoComplete="current-password" />
              <div className="err">{err}</div>
              <button type="submit" className="enter">Entrar al movimiento →</button>
            </form>
          </div>
        )}

        {authed && (
          <React.Fragment>
            {/* Hero */}
            <div className="club__hero">
              <div className="eyebrow">{c.heroEyebrow}</div>
              {memberName && <p className="club__bienvenido">BIENVENIDO, {memberName}.</p>}
              <h1>
                {c.title}<br/>
                <em>{c.titleEm}</em>
              </h1>
              <p className="frase">{c.frase}</p>
            </div>

            {/* Banner de imágenes del reparto */}
            <ClubImageBanner images={c.bannerImages} />

            {/* Quick-access buttons */}
            <div className="club__quick-access">
              {[
                { id: 'photos',   label: 'Registro Fotográfico', num: '01' },
                { id: 'meetings', label: 'Reuniones',             num: '02' },
                { id: 'routes',   label: 'Rutas',                 num: '03' },
                { id: 'feed',     label: 'NOS CUIDAMOS',          num: '04' },
                { id: 'meanings', label: 'Significado de Prendas', num: '05' },
              ].map(function(btn) {
                return (
                  <button
                    key={btn.id}
                    className={'club__qa-btn' + (activeTab === btn.id ? ' active' : '')}
                    onClick={function() { setActiveTab(btn.id); document.querySelector('.club__section-wrap') && document.querySelector('.club__section-wrap').scrollIntoView({ behavior: 'smooth' }); }}
                  >
                    <span className="club__qa-num">{btn.num}</span>
                    <span className="club__qa-label">{btn.label}</span>
                    <span className="club__qa-arrow">→</span>
                  </button>
                );
              })}
            </div>

            {/* Panels banner */}
            <ClubPanelsBanner panels={c.panels} />

            {/* Section content */}
            <div className="club__section-wrap">
              {/* Registro Fotográfico */}
              {activeTab === 'photos' && (
                <div className="club__section">
                  <div className="num">[ 01 ] REGISTRO FOTOGRÁFICO</div>
                  <h3>NUESTRA <em>historia.</em></h3>
                  <div className="club__photo-items">
                    {(c.photoItems || []).map(function(item) {
                      return (
                        <div key={item.id} className="club__photo-item" onClick={function() { setPhotoModal({ itemId: item.id, albumId: null }); }}>
                          <div className="club__photo-item-cover">
                            {item.coverImg
                              ? <img src={item.coverImg} alt={item.name} />
                              : <div className="club__photo-item-ph">◉</div>}
                          </div>
                          <div className="club__photo-item-name">{item.name}</div>
                          <div className="club__photo-item-count">{(item.albums || []).length} álbum{(item.albums || []).length !== 1 ? 'es' : ''}</div>
                          <div className="club__photo-item-cta">Ver fotos →</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Reuniones */}
              {activeTab === 'meetings' && (
                <div className="club__section">
                  <div className="num">[ 02 ] REUNIONES SECRETAS</div>
                  <h3>HACEMOS <em>iglesia.</em></h3>
                  <div className="meetings">
                    {c.meetings.map(function(m) {
                      return (
                        <div key={m.id} className="meet">
                          <div className="meet__date">
                            <div className="d">{m.day}</div>
                            <div className="m">{m.mon}</div>
                          </div>
                          <div>
                            <div className="meet__name">{m.name}</div>
                            <div className="meet__det">{m.det}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Rutas */}
              {activeTab === 'routes' && (
                <div className="club__section">
                  <div className="num">[ 03 ] PRÓXIMAS RUTAS</div>
                  <h3>SALIMOS A <em>la calle.</em></h3>
                  <div className="routes">
                    {c.routes.map(function(r) {
                      return (
                        <div key={r.id} className="route">
                          <div className="route__row">
                            <span className="amb">{r.date}</span>
                            <span>{r.joined ? '✓ ANOTADO' : '+ ANOTARSE'}</span>
                          </div>
                          <div className="route__name">{r.name}</div>
                          <div className="route__meta">{r.meta}</div>
                          {(r.mapEmbed || r.mapName) && (
                            <div className="route__map">
                              {r.mapName && <div className="route__map-name">📍 {r.mapName}</div>}
                              {r.mapEmbed && (
                                <iframe
                                  src={r.mapEmbed}
                                  width="100%"
                                  height="220"
                                  style={{ border: 0, display: 'block', marginTop: 10, borderRadius: 4 }}
                                  loading="lazy"
                                  allowFullScreen
                                  title={'Mapa ' + r.name}
                                />
                              )}
                              {r.mapEmbed && (
                                <a
                                  href={'https://www.google.com/maps/search/' + encodeURIComponent(r.mapName || r.name)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="route__map-link"
                                >
                                  Ver cómo llegar →
                                </a>
                              )}
                            </div>
                          )}
                          <div className="route__signup">
                            <span>Cupo abierto</span>
                            <button className={r.joined ? 'joined' : ''} onClick={function() { toggleJoin(r.id); }}>
                              {r.joined ? '✓ Estoy adentro' : 'Anotarme'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* NOS CUIDAMOS */}
              {activeTab === 'feed' && (
                <div className="club__section">
                  <div className="num">[ 04 ] NOS CUIDAMOS</div>
                  <h3>CANAL <em>privado.</em></h3>
                  <div className="feed">
                    {liveMessages === null && (
                      <div className="feed__loading">Cargando mensajes…</div>
                    )}
                    {liveMessages !== null && liveMessages.length === 0 && (
                      <div className="feed__empty">Sé el primero en escribir algo.</div>
                    )}
                    {(liveMessages || []).map(function(f) {
                      var ts = f.created_at ? new Date(f.created_at) : null;
                      var when = ts ? (ts.toLocaleDateString('es-CL', { day: 'numeric', month: 'short' }) + ' · ' + ts.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })) : '';
                      return (
                        <div key={f.id} className="feed__item">
                          <div className="when">
                            <span className="who">{(f.name || 'Anónimo').split(' ')[0].toUpperCase()}</span>
                            {when && <span className="feed__ts"> · {when}</span>}
                          </div>
                          <div className="what">{f.body}</div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="compose">
                    <textarea
                      placeholder="Escribe algo para el grupo. Una petición de oración, un aviso, una buena noticia…"
                      value={composer}
                      onChange={function(e) { setComposer(e.target.value); }}
                      maxLength={500}
                    />
                    <div className="compose__row">
                      <button onClick={postMessage} disabled={posting || !composer.trim()}>
                        {posting ? 'Publicando…' : 'Publicar →'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* SIGNIFICADO DE LAS POLERAS */}
              {activeTab === 'meanings' && (
                <div className="club__section">
                  <div className="sm__section-label">SIGNIFICADO DE PRENDAS</div>
                  <h3>LO QUE <em>llevas puesto.</em></h3>
                  <ShirtMeaningsSection collections={(c.shirtMeanings && c.shirtMeanings.collections) || []} />
                </div>
              )}
            </div>

            {/* Photo modal overlay */}
            {photoModalEl && (
              <div className="club__pm-overlay" onClick={function(e) { if (e.target === e.currentTarget) setPhotoModal({ itemId: null, albumId: null }); }}>
                {photoModalEl}
              </div>
            )}
          </React.Fragment>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { Club });
