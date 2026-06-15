// RUAH LABS — Carga Google Analytics 4 + Meta Pixel.
// Solo se activan si pusiste los IDs en config.js (window.RUAH_GA_ID / RUAH_META_PIXEL).
// Si están vacíos, este archivo no hace nada.
(function () {
  var GA = window.RUAH_GA_ID;
  var PX = window.RUAH_META_PIXEL;

  // ---- Google Analytics 4 ----
  if (GA) {
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA);
  }

  // ---- Meta (Facebook) Pixel ----
  if (PX) {
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0';
      n.queue = []; t = b.createElement(e); t.async = !0; t.src = v;
      s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', PX);
    window.fbq('track', 'PageView');
  }
})();
