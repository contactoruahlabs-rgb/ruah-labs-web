export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    let response = await env.ASSETS.fetch(request);
    if (response.status === 404) {
      const indexReq = new Request(new URL('/', request.url), request);
      response = await env.ASSETS.fetch(indexReq);
      const h = new Headers(response.headers);
      h.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      return new Response(response.body, { status: 200, headers: h });
    }
    const headers = new Headers(response.headers);

    if (url.pathname === '/' || url.pathname.endsWith('.html')) {
      headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    } else if (/\.(js|css|woff2?|png|jpg|svg|ico)(\?|$)/.test(url.pathname)) {
      headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    }

    return new Response(response.body, { status: response.status, headers });
  }
};
