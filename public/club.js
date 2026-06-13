/* global React */
// ============================================================
// RUAH LABS CLUB — Secret area
// ============================================================

function Club({
  open,
  content,
  onClose,
  store
}) {
  const [authed, setAuthed] = React.useState(() => sessionStorage.getItem('ruah-club-auth') === '1');
  const memberName = (sessionStorage.getItem('ruah-club-name') || '').split(' ')[0].toUpperCase();
  const [pwd, setPwd] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [err, setErr] = React.useState('');
  const [composer, setComposer] = React.useState('');
  React.useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
  }, [open]);
  React.useEffect(() => {
    if (!open) {
      setErr('');
      return;
    }
    // Re-check auth each time the Club opens — the secret-portal login may
    // have authenticated us already (no second login screen).
    if (sessionStorage.getItem('ruah-club-auth') === '1') setAuthed(true);
  }, [open]);
  async function enter(e) {
    e && e.preventDefault();
    var api = (window.RUAH_API || '') + '/api/club/verify-password';
    var ok = false;
    try {
      var r = await fetch(api, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          password: pwd
        })
      });
      var data = await r.json();
      ok = !!data.ok;
    } catch (_) {
      // API no disponible: fallback a comparación SHA-256 local
      var hash = await hashPwd(pwd);
      ok = hash === content.brand.clubPasswordHash;
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
    var route = routes.find(function (r) {
      return r.id === routeId;
    });
    if (!route) return;
    var joining = !route.joined;
    var email = sessionStorage.getItem('ruah-club-email') || '';

    // Actualizar UI inmediatamente
    store.updateList('club.routes', function (list) {
      return list.map(function (r) {
        return r.id === routeId ? Object.assign({}, r, {
          joined: joining
        }) : r;
      });
    });

    // Persistir en Supabase
    if (email) {
      if (joining) {
        fetch('' + window.RUAH_API + '/api/club/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: email,
            route_id: routeId,
            route_name: route.name
          })
        }).catch(function () {});
      } else {
        fetch('' + window.RUAH_API + '/api/club/signup', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: email,
            route_id: routeId
          })
        }).catch(function () {});
      }
    }
  }
  function postMessage() {
    if (!composer.trim()) return;
    store.updateList('club.feed', list => [{
      id: 'f' + Date.now(),
      when: 'AHORA · TÚ',
      what: composer.trim()
    }, ...list]);
    setComposer('');
  }
  const c = content.club;
  const [activeTab, setActiveTab] = React.useState('routes'); // 'routes', 'meetings', 'feed', 'photos'

  return /*#__PURE__*/React.createElement("div", {
    className: 'club-overlay' + (open ? ' open' : ''),
    "aria-hidden": !open
  }, /*#__PURE__*/React.createElement("div", {
    className: "club"
  }, /*#__PURE__*/React.createElement("div", {
    className: "club__top"
  }, /*#__PURE__*/React.createElement("div", {
    className: "club__brand"
  }, /*#__PURE__*/React.createElement("span", {
    className: "dot"
  }), "RUAH LABS CLUB"), /*#__PURE__*/React.createElement("button", {
    className: "club__close",
    onClick: onClose
  }, /*#__PURE__*/React.createElement("span", null, "Cerrar"), /*#__PURE__*/React.createElement("span", null, "\xD7"))), !authed && /*#__PURE__*/React.createElement("div", {
    className: "club__gate"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--mono)',
      fontSize: 10,
      letterSpacing: '0.2em',
      color: 'var(--amber)',
      textTransform: 'uppercase',
      marginBottom: 24
    }
  }, "\u25C9 ACCESO PRIVADO"), /*#__PURE__*/React.createElement("h2", null, "SOMOS MAS", /*#__PURE__*/React.createElement("br", null), "DE LOS QUE", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("em", null, "CREES.")), /*#__PURE__*/React.createElement("p", {
    className: "lede"
  }, "La contrase\xF1a te lleg\xF3 por correo al momento de tu compra. Si no la encuentras, escr\xEDbenos a hola@ruahlabs.cl"), /*#__PURE__*/React.createElement("form", {
    onSubmit: enter
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: "club-email"
  }, "Correo"), /*#__PURE__*/React.createElement("input", {
    id: "club-email",
    type: "email",
    value: email,
    onChange: e => setEmail(e.target.value),
    placeholder: "tu@correo.com",
    autoComplete: "email"
  }), /*#__PURE__*/React.createElement("label", {
    htmlFor: "club-pwd"
  }, "Contrase\xF1a"), /*#__PURE__*/React.createElement("input", {
    id: "club-pwd",
    type: "password",
    value: pwd,
    onChange: e => setPwd(e.target.value),
    placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022",
    autoComplete: "current-password"
  }), /*#__PURE__*/React.createElement("div", {
    className: "err"
  }, err), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: "enter"
  }, "Entrar al movimiento \u2192"))), authed && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "club__hero"
  }, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow"
  }, c.heroEyebrow), memberName && /*#__PURE__*/React.createElement("p", {
    className: "club__bienvenido"
  }, "BIENVENIDO, ", memberName, "."), /*#__PURE__*/React.createElement("h1", null, c.title, /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("em", null, c.titleEm)), /*#__PURE__*/React.createElement("p", {
    className: "frase"
  }, c.frase)), /*#__PURE__*/React.createElement("div", {
    className: "club__panels"
  }, c.panels.map(p => /*#__PURE__*/React.createElement("div", {
    key: p.id,
    className: "club__panel"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ttl"
  }, p.ttl), /*#__PURE__*/React.createElement("div", {
    className: "big"
  }, p.big), /*#__PURE__*/React.createElement("div", {
    className: "desc"
  }, p.desc)))), /*#__PURE__*/React.createElement("div", {
    className: "club__tabs"
  }, /*#__PURE__*/React.createElement("button", {
    className: 'club__tab-btn' + (activeTab === 'routes' ? ' active' : ''),
    onClick: () => setActiveTab('routes')
  }, "A / RUTAS"), /*#__PURE__*/React.createElement("button", {
    className: 'club__tab-btn' + (activeTab === 'meetings' ? ' active' : ''),
    onClick: () => setActiveTab('meetings')
  }, "B / REUNIONES"), /*#__PURE__*/React.createElement("button", {
    className: 'club__tab-btn' + (activeTab === 'feed' ? ' active' : ''),
    onClick: () => setActiveTab('feed')
  }, "C / CANAL PRIVADO"), /*#__PURE__*/React.createElement("button", {
    className: 'club__tab-btn' + (activeTab === 'photos' ? ' active' : ''),
    onClick: () => setActiveTab('photos')
  }, "D / REGISTRO FOTOGR\xC1FICO")), activeTab === 'routes' && /*#__PURE__*/React.createElement("div", {
    className: "club__section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "num"
  }, "[ A ] PROXIMAS RUTAS"), /*#__PURE__*/React.createElement("h3", null, "SALIMOS A ", /*#__PURE__*/React.createElement("em", null, "la calle.")), /*#__PURE__*/React.createElement("div", {
    className: "routes"
  }, c.routes.map(r => /*#__PURE__*/React.createElement("div", {
    key: r.id,
    className: "route"
  }, /*#__PURE__*/React.createElement("div", {
    className: "route__row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "amb"
  }, r.date), /*#__PURE__*/React.createElement("span", null, r.joined ? '✓ ANOTADO' : '+ ANOTARSE')), /*#__PURE__*/React.createElement("div", {
    className: "route__name"
  }, r.name), /*#__PURE__*/React.createElement("div", {
    className: "route__meta"
  }, r.meta), /*#__PURE__*/React.createElement("div", {
    className: "route__signup"
  }, /*#__PURE__*/React.createElement("span", null, "Cupo abierto"), /*#__PURE__*/React.createElement("button", {
    className: r.joined ? 'joined' : '',
    onClick: () => toggleJoin(r.id)
  }, r.joined ? '✓ Estoy adentro' : 'Anotarme')))))), activeTab === 'meetings' && /*#__PURE__*/React.createElement("div", {
    className: "club__section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "num"
  }, "[ B ] REUNIONES SECRETAS"), /*#__PURE__*/React.createElement("h3", null, "HACEMOS ", /*#__PURE__*/React.createElement("em", null, "iglesia.")), /*#__PURE__*/React.createElement("div", {
    className: "meetings"
  }, c.meetings.map(m => /*#__PURE__*/React.createElement("div", {
    key: m.id,
    className: "meet"
  }, /*#__PURE__*/React.createElement("div", {
    className: "meet__date"
  }, /*#__PURE__*/React.createElement("div", {
    className: "d"
  }, m.day), /*#__PURE__*/React.createElement("div", {
    className: "m"
  }, m.mon)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "meet__name"
  }, m.name), /*#__PURE__*/React.createElement("div", {
    className: "meet__det"
  }, m.det)))))), activeTab === 'feed' && /*#__PURE__*/React.createElement("div", {
    className: "club__section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "num"
  }, "[ C ] CANAL PRIVADO"), /*#__PURE__*/React.createElement("h3", null, "NOS ", /*#__PURE__*/React.createElement("em", null, "cuidamos.")), /*#__PURE__*/React.createElement("div", {
    className: "feed"
  }, c.feed.map(f => /*#__PURE__*/React.createElement("div", {
    key: f.id,
    className: "feed__item"
  }, /*#__PURE__*/React.createElement("div", {
    className: "when"
  }, /*#__PURE__*/React.createElement("span", {
    className: "who"
  }, f.when)), /*#__PURE__*/React.createElement("div", {
    className: "what"
  }, f.what)))), /*#__PURE__*/React.createElement("div", {
    className: "compose"
  }, /*#__PURE__*/React.createElement("textarea", {
    placeholder: "Escribe algo para el grupo. Una petici\xF3n de oraci\xF3n, un aviso, una buena noticia\u2026",
    value: composer,
    onChange: e => setComposer(e.target.value)
  }), /*#__PURE__*/React.createElement("div", {
    className: "compose__row"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: postMessage
  }, "Publicar \u2192")))), activeTab === 'photos' && /*#__PURE__*/React.createElement("div", {
    className: "club__section club__photos-section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "num"
  }, "[ D ] REGISTRO FOTOGR\xC1FICO"), /*#__PURE__*/React.createElement("h3", null, c.photoRegistryTitle), /*#__PURE__*/React.createElement("p", {
    className: "club__photos-subtitle"
  }, c.photoRegistrySubtitle), /*#__PURE__*/React.createElement("div", {
    className: "club__photos-grid"
  }, (c.photos || []).map(p => /*#__PURE__*/React.createElement("div", {
    key: p.id,
    className: "club__photo"
  }, /*#__PURE__*/React.createElement("div", {
    className: "club__photo-img"
  }, p.img ? /*#__PURE__*/React.createElement("img", {
    src: p.img,
    alt: p.caption
  }) : /*#__PURE__*/React.createElement("div", {
    className: "club__photo-placeholder"
  }, "+")), /*#__PURE__*/React.createElement("div", {
    className: "club__photo-caption"
  }, p.caption))))))));
}
Object.assign(window, {
  Club
});