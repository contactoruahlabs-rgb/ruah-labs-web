/* global React, Reveal, RevealLine */
// ============================================================
// RUAH LABS — Sección "Evento" (RUAH EVENTO)
// ============================================================

function Eventos({ content }) {
  const ev = content.eventos;
  const [activeGallery, setActiveGallery] = React.useState(null);
  return (
    <section className="evento" id="evento">
      <div className="shell">
        {/* Cabecera */}
        <div className="ev-head">
          <Reveal>
            <div className="sec-head__num ev-eyebrow">{ev.eyebrow}</div>
          </Reveal>
          <div className="ev-head__right">
            <h2 className="ev-title">
              <div><RevealLine>{ev.title}</RevealLine></div>
              <div><RevealLine delay={120}><span className="amb">{ev.titleEm}</span></RevealLine></div>
              <div><RevealLine delay={240}>{ev.titleAfter}</RevealLine></div>
            </h2>
            <Reveal delay={380} className="ev-sub">
              <p>{ev.sub}</p>
            </Reveal>
          </div>
        </div>

        {/* Banner de portafolio — carrusel infinito lateral */}
        {(ev.gallery && ev.gallery.length > 0) && (
          <div className="ev-banner__wrap">
            <div className="ev-banner__track">
              {[...ev.gallery, ...ev.gallery, ...ev.gallery].map((g, i) => (
                <div key={i} className="ev-banner__slide">
                  {g.img
                    ? <img src={g.img} alt="" className="ev-banner__img" />
                    : <div className="ev-banner__ph"><span>0{(i % ev.gallery.length) + 1}</span></div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeGallery && (
          <GalleryModal
            title={activeGallery.caption || 'Galería'}
            subtitle={null}
            photos={activeGallery.photos || []}
            onClose={() => setActiveGallery(null)}
          />
        )}

        {/* Paquetes — justo debajo del banner */}
        <Reveal className="ev-packs ev-packs--standalone">
          <div className="ev-packs__hd">{ev.packsTitle}</div>
          <div className="ev-packs__grid">
            {ev.packs.map((p, i) => (
              <Reveal key={p.id} delay={i * 80} className="ev-pack">
                <div className="ev-pack__name">{p.name}</div>
                <div className="ev-pack__limit">{p.limit}</div>
                <div className="ev-pack__detail">{p.detail}</div>
              </Reveal>
            ))}
          </div>
          <p className="ev-packs__foot">{ev.packsFoot}</p>
        </Reveal>

        {/* Lo que hacemos */}
        <Reveal className="ev-wedo">
          <div className="ev-block__eyebrow">{ev.weDoEyebrow}</div>
          <h3 className="ev-wedo__title">{ev.weDoTitle}</h3>
          <p className="ev-wedo__body">{ev.weDoBody}</p>
          <p className="ev-wedo__tagline">{ev.weDoTagline}</p>
        </Reveal>

        {/* El problema */}
        <Reveal className="ev-block ev-block--solo">
          <div className="ev-block__eyebrow">{ev.problemEyebrow}</div>
          <h3 className="ev-block__title">{ev.problemTitle}</h3>
          <p className="ev-block__body">{ev.problemBody}</p>
        </Reveal>

        {/* Por qué funciona — 4 pilares */}
        <div className="ev-pillars">
          {ev.pillars.map((p, i) => (
            <Reveal key={p.id} delay={i * 70} className="ev-pillar">
              <span className="ev-pillar__num">{p.num}</span>
              <h4 className="ev-pillar__title">{p.title}</h4>
              <p className="ev-pillar__desc">{p.desc}</p>
            </Reveal>
          ))}
        </div>

        {/* Sobre qué estampamos — destacado, solo */}
        <Reveal className="ev-onwhat">
          <h3 className="ev-onwhat__title">{ev.onWhatTitle}</h3>
          <p className="ev-onwhat__body">{ev.onWhatBody}</p>
        </Reveal>

        {/* El detalle que cambia todo */}
        <Reveal className="ev-detail">
          <div className="ev-detail__icon">1×</div>
          <div className="ev-detail__txt">
            <h3 className="ev-detail__title">{ev.detailTitle}</h3>
            <p className="ev-detail__body">{ev.detailBody}</p>
          </div>
        </Reveal>

        {/* Lo que recibes */}
        <div className="ev-receive">
          <div className="ev-receive__left">
            <h3 className="ev-block__title">{ev.receiveTitle}</h3>
            <ul className="ev-list">
              {ev.receiveItems.map((it) => (
                <li key={it.id}>
                  <span className="ev-list__dot">▪</span>
                  <span>{it.txt}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Cobertura */}
        <div className="ev-coverage">
          <span className="ev-coverage__lbl">{ev.coverageTitle}</span>
          <span className="ev-coverage__val">{ev.coverageBody}</span>
        </div>

        {/* CTA final */}
        <div className="ev-cta">
          <div className="mono-label">{ev.ctaEyebrow}</div>
          <h3 className="ev-cta__title">
            <RevealLine>{ev.ctaTitle}</RevealLine>
          </h3>
          <p className="ev-cta__body">{ev.ctaBody}</p>
          <div className="ev-cta__btns">
            <a className="btn btn--amber" href={ev.ctaBtn.href} target="_blank" rel="noreferrer">
              {ev.ctaBtn.label} <span className="arrow">→</span>
            </a>
            <a className="btn btn--ghost" href={ev.ctaBtn2.href}>
              {ev.ctaBtn2.label}
            </a>
          </div>
          <p className="ev-cta__ig">Instagram: <strong>{ev.instagram}</strong></p>
        </div>

        {/* Cierre */}
        <p className="ev-closing">{ev.closing}</p>
      </div>
    </section>
  );
}

Object.assign(window, { Eventos });
