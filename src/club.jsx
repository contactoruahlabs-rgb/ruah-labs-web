/* global React */
// ============================================================
// RUAH LABS CLUB — Secret area
// ============================================================

function Club({ open, content, onClose, store }) {
  const [authed, setAuthed] = React.useState(() => sessionStorage.getItem('ruah-club-auth') === '1');
  const memberName = (sessionStorage.getItem('ruah-club-name') || '').split(' ')[0].toUpperCase();
  const [pwd, setPwd]       = React.useState('');
  const [email, setEmail]   = React.useState('');
  const [err, setErr]       = React.useState('');
  const [composer, setComposer] = React.useState('');

  React.useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
  }, [open]);

  React.useEffect(() => {
    if (!open) { setErr(''); return; }
    // Re-check auth each time the Club opens — the secret-portal login may
    // have authenticated us already (no second login screen).
    if (sessionStorage.getItem('ruah-club-auth') === '1') setAuthed(true);
  }, [open]);

  async function enter(e) {
    e && e.preventDefault();
    var api = (window.RUAH_API || '') + '/api/club/verify-password';
    var ok  = false;
    try {
      var r    = await fetch(api, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: pwd }) });
      var data = await r.json();
      ok = !!data.ok;
    } catch (_) {
      // Sin fallback local: la verificación es solo server-side (bcrypt).
      // Comparar contra un hash público sería falsificable/craqueable offline.
      setErr('NO SE PUDO CONECTAR CON EL SERVIDOR. INTENTA DE NUEVO.');
      return;
    }
    if (ok) {
      setAuthed(true);
      sessionStorage.setItem('ruah-club-auth', '1');
      setErr('');
    } else {
      setErr('CONTRASEÑA INCORRECTA — REVISA EL CORREO QUE LLEGÓ CON TU COMPRA.');
    }
  }

  function toggleJoin(routeId) {
    var routes = content.club.routes;
    var route  = routes.find(function(r) { return r.id === routeId; });
    if (!route) return;
    var joining = !route.joined;
    var email   = sessionStorage.getItem('ruah-club-email') || '';

    // Actualizar UI inmediatamente
    store.updateList('club.routes', function(list) {
      return list.map(function(r) { return r.id === routeId ? Object.assign({}, r, { joined: joining }) : r; });
    });

    // Persistir en Supabase
    if (email) {
      if (joining) {
        fetch('' + window.RUAH_API + '/api/club/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email, route_id: routeId, route_name: route.name }),
        }).catch(function(){});
      } else {
        fetch('' + window.RUAH_API + '/api/club/signup', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email, route_id: routeId }),
        }).catch(function(){});
      }
    }
  }

  function postMessage() {
    if (!composer.trim()) return;
    store.updateList('club.feed', list => [
      { id: 'f' + Date.now(), when: 'AHORA · TÚ', what: composer.trim() },
      ...list,
    ]);
    setComposer('');
  }

  const c = content.club;
  const [activeTab, setActiveTab] = React.useState('routes'); // 'routes', 'meetings', 'feed', 'photos'

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
              <input id="club-email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@correo.com" autoComplete="email" />
              <label htmlFor="club-pwd">Contraseña</label>
              <input id="club-pwd" type="password" value={pwd} onChange={e => setPwd(e.target.value)} placeholder="••••••••" autoComplete="current-password" />
              <div className="err">{err}</div>
              <button type="submit" className="enter">
                Entrar al movimiento →
              </button>
            </form>
          </div>
        )}

        {authed && (
          <React.Fragment>
            <div className="club__hero">
              <div className="eyebrow">{c.heroEyebrow}</div>
              {memberName && (
                <p className="club__bienvenido">BIENVENIDO, {memberName}.</p>
              )}
              <h1>
                {c.title}<br/>
                <em>{c.titleEm}</em>
              </h1>
              <p className="frase">{c.frase}</p>
            </div>

            <div className="club__panels">
              {c.panels.map(p => (
                <div key={p.id} className="club__panel">
                  <div className="ttl">{p.ttl}</div>
                  <div className="big">{p.big}</div>
                  <div className="desc">{p.desc}</div>
                </div>
              ))}
            </div>

            {/* Tabs navigation */}
            <div className="club__tabs">
              <button 
                className={'club__tab-btn' + (activeTab === 'routes' ? ' active' : '')}
                onClick={() => setActiveTab('routes')}
              >
                A / RUTAS
              </button>
              <button 
                className={'club__tab-btn' + (activeTab === 'meetings' ? ' active' : '')}
                onClick={() => setActiveTab('meetings')}
              >
                B / REUNIONES
              </button>
              <button 
                className={'club__tab-btn' + (activeTab === 'feed' ? ' active' : '')}
                onClick={() => setActiveTab('feed')}
              >
                C / CANAL PRIVADO
              </button>
              <button 
                className={'club__tab-btn' + (activeTab === 'photos' ? ' active' : '')}
                onClick={() => setActiveTab('photos')}
              >
                D / REGISTRO FOTOGRÁFICO
              </button>
            </div>

            {/* Routes */}
            {activeTab === 'routes' && (
            <div className="club__section">
              <div className="num">[ A ] PROXIMAS RUTAS</div>
              <h3>SALIMOS A <em>la calle.</em></h3>
              <div className="routes">
                {c.routes.map(r => (
                  <div key={r.id} className="route">
                    <div className="route__row">
                      <span className="amb">{r.date}</span>
                      <span>{r.joined ? '✓ ANOTADO' : '+ ANOTARSE'}</span>
                    </div>
                    <div className="route__name">{r.name}</div>
                    <div className="route__meta">{r.meta}</div>
                    <div className="route__signup">
                      <span>Cupo abierto</span>
                      <button className={r.joined ? 'joined' : ''} onClick={() => toggleJoin(r.id)}>
                        {r.joined ? '✓ Estoy adentro' : 'Anotarme'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            )}

            {/* Meetings */}
            {activeTab === 'meetings' && (
            <div className="club__section">
              <div className="num">[ B ] REUNIONES SECRETAS</div>
              <h3>HACEMOS <em>iglesia.</em></h3>
              <div className="meetings">
                {c.meetings.map(m => (
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
                ))}
              </div>
            </div>
            )}

            {/* Feed */}
            {activeTab === 'feed' && (
            <div className="club__section">
              <div className="num">[ C ] CANAL PRIVADO</div>
              <h3>NOS <em>cuidamos.</em></h3>
              <div className="feed">
                {c.feed.map(f => (
                  <div key={f.id} className="feed__item">
                    <div className="when"><span className="who">{f.when}</span></div>
                    <div className="what">{f.what}</div>
                  </div>
                ))}
              </div>
              <div className="compose">
                <textarea
                  placeholder="Escribe algo para el grupo. Una petición de oración, un aviso, una buena noticia…"
                  value={composer}
                  onChange={e => setComposer(e.target.value)}
                />
                <div className="compose__row">
                  <button onClick={postMessage}>Publicar →</button>
                </div>
              </div>
            </div>
            )}

            {/* Photo Registry */}
            {activeTab === 'photos' && (
            <div className="club__section club__photos-section">
              <div className="num">[ D ] REGISTRO FOTOGRÁFICO</div>
              <h3>{c.photoRegistryTitle}</h3>
              <p className="club__photos-subtitle">{c.photoRegistrySubtitle}</p>
              <div className="club__photos-grid">
                {(c.photos || []).map(p => (
                  <div key={p.id} className="club__photo">
                    <div className="club__photo-img">
                      {p.img ? (
                        <img src={p.img} alt={p.caption} />
                      ) : (
                        <div className="club__photo-placeholder">+</div>
                      )}
                    </div>
                    <div className="club__photo-caption">{p.caption}</div>
                  </div>
                ))}
              </div>
            </div>
            )}
          </React.Fragment>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { Club });
