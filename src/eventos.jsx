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
        {/* Hero */}
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

        {/* Problem + What we do — 2 column split panel */}
        <div className="ev-twocol">
          <Reveal className="ev-block">
            <div className="ev-block__eyebrow">{ev.problemEyebrow}</div>
            <h3 className="ev-block__title">{ev.problemTitle}</h3>
            <p className="ev-block__body">{ev.problemBody}</p>
          </Reveal>
          <Reveal delay={120} className="ev-block ev-block--amber">
            <div className="ev-block__eyebrow">{ev.weDoEyebrow}</div>
            <h3 className="ev-block__title">{ev.weDoTitle}</h3>
            <p className="ev-block__body">{ev.weDoBody}</p>
            <p className="ev-block__tagline">{ev.weDoTagline}</p>
          </Reveal>
        </div>

        {/* Why it works — 4 pillars */}
        <div className="ev-pillars">
          {ev.pillars.map((p, i) => (
            <Reveal key={p.id} delay={i * 70} className="ev-pillar">
              <span className="ev-pillar__num">{p.num}</span>
              <h4 className="ev-pillar__title">{p.title}</h4>
              <p className="ev-pillar__desc">{p.desc}</p>
            </Reveal>
          ))}
        </div>

        {/* For what / On what — split */}
        <div className="ev-twocol">
          <Reveal className="ev-block ev-block--dark">
            <h3 className="ev-block__title">{ev.forWhatTitle}</h3>
            <p className="ev-block__body">{ev.forWhatBody}</p>
          </Reveal>
          <Reveal delay={120} className="ev-block ev-block--dark">
            <h3 className="ev-block__title">{ev.onWhatTitle}</h3>
            <p className="ev-block__body">{ev.onWhatBody}</p>
          </Reveal>
        </div>

        {/* The detail that changes everything — featured row */}
        <Reveal className="ev-detail">
          <div className="ev-detail__icon">1×</div>
          <div className="ev-detail__txt">
            <h3 className="ev-detail__title">{ev.detailTitle}</h3>
            <p className="ev-detail__body">{ev.detailBody}</p>
          </div>
        </Reveal>

        {/* Photo gallery — muestra real de eventos */}
        {(ev.gallery && ev.gallery.length > 0) && (
          <div className="ev-gallery">
            <div className="ev-gallery__head">
              <h3 className="ev-gallery__title">{ev.galleryTitle || 'MUESTRA DE EVENTOS'}</h3>
              {ev.gallerySub && <p className="ev-gallery__sub">{ev.gallerySub}</p>}
            </div>
            <div className="ev-gallery__grid">
              {ev.gallery.map((g, i) => {
                const hasPhotos = (g.photos || []).length > 0;
                return (
                  <Reveal key={g.id} delay={i * 80}
                    className={'ev-gallery__card' + (g.img ? ' has-img' : '') + (hasPhotos ? ' clickable' : '')}
                    onClick={() => hasPhotos && setActiveGallery(g)}>
                    {g.img
                      ? <img src={g.img} alt={g.caption || ''} className="ev-gallery__img" />
                      : <div className="ev-gallery__ph">
                          <span>0{i + 1}</span>
                          <span className="ev-gallery__ph-lbl">FOTO {i + 1}</span>
                        </div>}
                    {g.caption && <div className="ev-gallery__cap">{g.caption}</div>}
                    {hasPhotos && (
                      <div className="ev-gallery__badge">{(g.photos || []).length} foto{(g.photos || []).length !== 1 ? 's' : ''} →</div>
                    )}
                  </Reveal>
                );
              })}
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

        {/* What you receive + packages */}
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
          <div className="ev-packs">
            <div className="ev-packs__hd">{ev.packsTitle}</div>
            {ev.packs.map((p, i) => (
              <Reveal key={p.id} delay={i * 80} className="ev-pack">
                <div className="ev-pack__name">{p.name}</div>
                <div className="ev-pack__limit">{p.limit}</div>
                <div className="ev-pack__detail">{p.detail}</div>
              </Reveal>
            ))}
            <p className="ev-packs__foot">{ev.packsFoot}</p>
          </div>
        </div>

        {/* Coverage strip */}
        <div className="ev-coverage">
          <span className="ev-coverage__lbl">{ev.coverageTitle}</span>
          <span className="ev-coverage__val">{ev.coverageBody}</span>
        </div>

        {/* Final CTA */}
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

        {/* Closing one-liner */}
        <p className="ev-closing">{ev.closing}</p>
      </div>
    </section>
  );
}

Object.assign(window, { Eventos });
