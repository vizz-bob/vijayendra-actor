/**
 * Minimal GitHub OAuth proxy for Decap CMS, built for Cloudflare Workers.
 *
 * Why this exists: GitHub's OAuth flow requires a "client secret" that must
 * never be exposed in browser code. This worker holds that secret server-side
 * and does the token exchange on the CMS's behalf. It has no other job.
 *
 * Deploy this on YOUR OWN Cloudflare account (free tier is enough).
 * See ../OAUTH_SETUP.md for the full step-by-step.
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/auth') {
      const authorizeUrl = new URL('https://github.com/login/oauth/authorize');
      authorizeUrl.searchParams.set('client_id', env.GITHUB_CLIENT_ID);
      authorizeUrl.searchParams.set('redirect_uri', `${url.origin}/callback`);
      authorizeUrl.searchParams.set('scope', 'repo,user');
      authorizeUrl.searchParams.set('state', crypto.randomUUID());
      return Response.redirect(authorizeUrl.toString(), 302);
    }

    if (url.pathname === '/callback') {
      const code = url.searchParams.get('code');
      if (!code) return new Response('Missing code', { status: 400 });

      const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: env.GITHUB_CLIENT_ID,
          client_secret: env.GITHUB_CLIENT_SECRET,
          code,
        }),
      });
      const tokenData = await tokenRes.json();

      if (tokenData.error) {
        return new Response(`OAuth error: ${tokenData.error_description || tokenData.error}`, { status: 400 });
      }

      const token = tokenData.access_token;
      const payload = JSON.stringify({ token, provider: 'github' });
      // NOTE: payload is trusted JSON built above (not user input), safe to inline here.
      const html = `<!DOCTYPE html><html><body>
        <script>
          (function() {
            function receiveMessage(e) {
              window.opener.postMessage(
                'authorization:github:success:${payload}',
                e.origin
              );
              window.removeEventListener('message', receiveMessage, false);
            }
            window.addEventListener('message', receiveMessage, false);
            window.opener.postMessage('authorizing:github', '*');
          })();
        </script>
      </body></html>`;
      return new Response(html, { headers: { 'Content-Type': 'text/html' } });
    }

    return new Response('GitHub OAuth proxy for Decap CMS. Endpoints: /auth, /callback', { status: 200 });
  },
};
