function getCookie(cookieHeader, name) {
  if (!cookieHeader) return null;
  var re = new RegExp('(?:^|;)\\s*' + name + '=([^;]*)');
  var m = re.exec(cookieHeader);
  return m ? decodeURIComponent(m[1]) : null;
}

const LOGIN_HTML = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Admin · RUAH LABS</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:#0d0d0b;display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:monospace}
.box{background:#111;border:1px solid #2a2a2a;padding:40px;width:320px}
.lbl{color:#eca10c;font-size:11px;letter-spacing:4px;display:block;margin-bottom:24px}
input{width:100%;background:#0d0d0b;border:1px solid #333;color:#fff;padding:10px 14px;margin-bottom:16px;font-size:14px;font-family:monospace;outline:none}
input:focus{border-color:#eca10c}
button{width:100%;background:#eca10c;color:#0d0d0b;border:none;padding:12px;font-size:12px;letter-spacing:3px;cursor:pointer;font-family:monospace;font-weight:700}
.err{color:#e44;font-size:12px;margin-bottom:12px}
</style>
</head>
<body>
<form class="box" method="POST" action="/admin-auth">
  <span class="lbl">RUAH LABS · ADMIN</span>
  <input type="password" name="token" placeholder="token de acceso" autofocus autocomplete="off" />
  {{ERROR}}
  <button type="submit">INGRESAR →</button>
</form>
</body>
</html>`;

// Stub que reemplaza admin.js cuando el usuario no está autenticado.
// Retorna null (panel no visible) sin romper la app principal.
const ADMIN_STUB = '/* admin: visit /admin-auth to authenticate */\nwindow.Admin = function Admin(){ return null; };';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // ── Admin login ───────────────────────────────────────────────────
    if (url.pathname === '/admin-auth') {
      if (request.method === 'POST') {
        const body   = await request.text();
        const params = new URLSearchParams(body);
        const token  = params.get('token') || '';
        const secret = env.ADMIN_TOKEN || '';
        if (secret && token === secret) {
          const cookie = 'rl_adm=' + encodeURIComponent(token)
            + '; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=86400';
          return new Response(null, {
            status: 302,
            headers: { 'Location': '/', 'Set-Cookie': cookie },
          });
        }
        return new Response(
          LOGIN_HTML.replace('{{ERROR}}', '<p class="err">Token incorrecto.</p>'),
          { status: 401, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
        );
      }
      return new Response(
        LOGIN_HTML.replace('{{ERROR}}', ''),
        { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      );
    }

    // ── Protect admin.js (only when ADMIN_TOKEN secret is configured) ─
    if (url.pathname === '/admin.js' && env.ADMIN_TOKEN) {
      const cookie = getCookie(request.headers.get('Cookie'), 'rl_adm');
      if (cookie !== env.ADMIN_TOKEN) {
        return new Response(ADMIN_STUB, {
          headers: { 'Content-Type': 'application/javascript; charset=utf-8' },
        });
      }
    }

    // ── Static assets + SPA fallback ─────────────────────────────────
    let response = await env.ASSETS.fetch(request);
    if (response.status === 404) {
      const indexReq = new Request(new URL('/', request.url), request);
      response = await env.ASSETS.fetch(indexReq);
      const h = new Headers(response.headers);
      h.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      h.set('X-Content-Type-Options', 'nosniff');
      h.set('X-Frame-Options', 'DENY');
      h.set('Referrer-Policy', 'strict-origin-when-cross-origin');
      h.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
      return new Response(response.body, { status: 200, headers: h });
    }
    const headers = new Headers(response.headers);
    if (url.pathname === '/' || url.pathname.endsWith('.html')) {
      headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      headers.set('X-Content-Type-Options', 'nosniff');
      headers.set('X-Frame-Options', 'DENY');
      headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
      headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    } else if (/\.(js|css|woff2?|png|jpg|svg|ico)(\?|$)/.test(url.pathname)) {
      headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    }
    return new Response(response.body, { status: response.status, headers });
  }
};
