/* global React, Reveal, RevealLine */
// ============================================================
// RUAH LABS — Sección "Evento" (RUAH EVENTO)
// ============================================================

function Eventos({
  content
}) {
  const ev = content.eventos;
  const [activeGallery, setActiveGallery] = React.useState(null);
  return /*#__PURE__*/React.createElement("section", {
    className: "evento",
    id: "evento"
  }, /*#__PURE__*/React.createElement("div", {
    className: "shell"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ev-head"
  }, /*#__PURE__*/React.createElement(Reveal, null, /*#__PURE__*/React.createElement("div", {
    className: "sec-head__num ev-eyebrow"
  }, ev.eyebrow)), /*#__PURE__*/React.createElement("div", {
    className: "ev-head__right"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "ev-title"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(RevealLine, null, ev.title)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(RevealLine, {
    delay: 120
  }, /*#__PURE__*/React.createElement("span", {
    className: "amb"
  }, ev.titleEm))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(RevealLine, {
    delay: 240
  }, ev.titleAfter))), /*#__PURE__*/React.createElement(Reveal, {
    delay: 380,
    className: "ev-sub"
  }, /*#__PURE__*/React.createElement("p", null, ev.sub)))), ev.gallery && ev.gallery.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "ev-banner__wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ev-banner__track"
  }, [...ev.gallery, ...ev.gallery, ...ev.gallery].map((g, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "ev-banner__slide"
  }, g.img ? /*#__PURE__*/React.createElement("img", {
    src: g.img,
    alt: "",
    className: "ev-banner__img"
  }) : /*#__PURE__*/React.createElement("div", {
    className: "ev-banner__ph"
  }, /*#__PURE__*/React.createElement("span", null, "0", i % ev.gallery.length + 1)))))), activeGallery && /*#__PURE__*/React.createElement(GalleryModal, {
    title: activeGallery.caption || 'Galería',
    subtitle: null,
    photos: activeGallery.photos || [],
    onClose: () => setActiveGallery(null)
  }), /*#__PURE__*/React.createElement(Reveal, {
    className: "ev-packs ev-packs--standalone"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ev-packs__hd"
  }, ev.packsTitle), /*#__PURE__*/React.createElement("div", {
    className: "ev-packs__grid"
  }, ev.packs.map((p, i) => /*#__PURE__*/React.createElement(Reveal, {
    key: p.id,
    delay: i * 80,
    className: "ev-pack"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ev-pack__name"
  }, p.name), /*#__PURE__*/React.createElement("div", {
    className: "ev-pack__limit"
  }, p.limit), /*#__PURE__*/React.createElement("div", {
    className: "ev-pack__detail"
  }, p.detail)))), /*#__PURE__*/React.createElement("p", {
    className: "ev-packs__foot"
  }, ev.packsFoot)), /*#__PURE__*/React.createElement(Reveal, {
    className: "ev-wedo"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ev-block__eyebrow"
  }, ev.weDoEyebrow), /*#__PURE__*/React.createElement("h3", {
    className: "ev-wedo__title"
  }, ev.weDoTitle), /*#__PURE__*/React.createElement("p", {
    className: "ev-wedo__body"
  }, ev.weDoBody), /*#__PURE__*/React.createElement("p", {
    className: "ev-wedo__tagline"
  }, ev.weDoTagline)), /*#__PURE__*/React.createElement(Reveal, {
    className: "ev-block ev-block--solo"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ev-block__eyebrow"
  }, ev.problemEyebrow), /*#__PURE__*/React.createElement("h3", {
    className: "ev-block__title"
  }, ev.problemTitle), /*#__PURE__*/React.createElement("p", {
    className: "ev-block__body"
  }, ev.problemBody)), /*#__PURE__*/React.createElement("div", {
    className: "ev-pillars"
  }, ev.pillars.map((p, i) => /*#__PURE__*/React.createElement(Reveal, {
    key: p.id,
    delay: i * 70,
    className: "ev-pillar"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ev-pillar__num"
  }, p.num), /*#__PURE__*/React.createElement("h4", {
    className: "ev-pillar__title"
  }, p.title), /*#__PURE__*/React.createElement("p", {
    className: "ev-pillar__desc"
  }, p.desc)))), /*#__PURE__*/React.createElement(Reveal, {
    className: "ev-onwhat"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "ev-onwhat__title"
  }, ev.onWhatTitle), /*#__PURE__*/React.createElement("p", {
    className: "ev-onwhat__body"
  }, ev.onWhatBody)), /*#__PURE__*/React.createElement(Reveal, {
    className: "ev-detail"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ev-detail__icon"
  }, "1\xD7"), /*#__PURE__*/React.createElement("div", {
    className: "ev-detail__txt"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "ev-detail__title"
  }, ev.detailTitle), /*#__PURE__*/React.createElement("p", {
    className: "ev-detail__body"
  }, ev.detailBody))), /*#__PURE__*/React.createElement("div", {
    className: "ev-receive"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ev-receive__left"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "ev-block__title"
  }, ev.receiveTitle), /*#__PURE__*/React.createElement("ul", {
    className: "ev-list"
  }, ev.receiveItems.map(it => /*#__PURE__*/React.createElement("li", {
    key: it.id
  }, /*#__PURE__*/React.createElement("span", {
    className: "ev-list__dot"
  }, "\u25AA"), /*#__PURE__*/React.createElement("span", null, it.txt)))))), /*#__PURE__*/React.createElement("div", {
    className: "ev-coverage"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ev-coverage__lbl"
  }, ev.coverageTitle), /*#__PURE__*/React.createElement("span", {
    className: "ev-coverage__val"
  }, ev.coverageBody)), /*#__PURE__*/React.createElement("div", {
    className: "ev-cta"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mono-label"
  }, ev.ctaEyebrow), /*#__PURE__*/React.createElement("h3", {
    className: "ev-cta__title"
  }, /*#__PURE__*/React.createElement(RevealLine, null, ev.ctaTitle)), /*#__PURE__*/React.createElement("p", {
    className: "ev-cta__body"
  }, ev.ctaBody), /*#__PURE__*/React.createElement("div", {
    className: "ev-cta__btns"
  }, /*#__PURE__*/React.createElement("a", {
    className: "btn btn--amber",
    href: ev.ctaBtn.href,
    target: "_blank",
    rel: "noreferrer"
  }, ev.ctaBtn.label, " ", /*#__PURE__*/React.createElement("span", {
    className: "arrow"
  }, "\u2192")), /*#__PURE__*/React.createElement("a", {
    className: "btn btn--ghost",
    href: ev.ctaBtn2.href
  }, ev.ctaBtn2.label)), /*#__PURE__*/React.createElement("p", {
    className: "ev-cta__ig"
  }, "Instagram: ", /*#__PURE__*/React.createElement("strong", null, ev.instagram))), /*#__PURE__*/React.createElement("p", {
    className: "ev-closing"
  }, ev.closing)));
}
Object.assign(window, {
  Eventos
});