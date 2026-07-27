import { anonClient } from './supabase.js';

// ===== Cookie parsing =====
function parseCookies(req) {
  const cookie = req.headers.cookie;
  if (!cookie) return {};
  return Object.fromEntries(
    cookie.split(';').map(c => {
      const [k, ...v] = c.trim().split('=');
      return [k, v.join('=')];
    })
  );
}

// Both __Host-access_token and access_token are accepted so dev (http, no
// __Host- possible) and prod (https, __Host- prefixed) work transparently.
export function getCookies(req) {
  const c = parseCookies(req);
  return {
    accessToken: c['__Host-access_token'] || c['access_token'] || null,
    refreshToken: c['__Host-refresh_token'] || c['refresh_token'] || null,
  };
}

// ===== Cookie serialisation =====
// - HttpOnly: no JS access (mitigates XSS token theft).
// - SameSite=Strict: cookie never sent on cross-site requests (CSRF hardening).
// - Secure: only sent over HTTPS. Vercel always terminates TLS; in local dev
//   over http we drop Secure (and the __Host- prefix, which requires Secure).
function isProd() {
  return process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
}

export function serializeCookie(name, value, maxAgeSeconds) {
  const prod = isProd();
  const finalName = prod && !name.startsWith('__Host-') ? `__Host-${name}` : name;
  const parts = [`${finalName}=${value}`, 'Path=/', 'HttpOnly'];
  if (prod) parts.push('Secure');
  parts.push('SameSite=Strict', `Max-Age=${maxAgeSeconds}`);
  return parts.join('; ');
}

export function clearCookies(res) {
  res.setHeader('Set-Cookie', [
    serializeCookie('access_token', '', 0),
    serializeCookie('refresh_token', '', 0),
  ]);
}

// ===== Auth guard =====
// Verifies the caller's Supabase access token server-side via getUser().
// Returns { user, accessToken } on success, null after sending 401.
export async function requireAuth(req, res) {
  const { accessToken } = getCookies(req);
  if (!accessToken) {
    res.status(401).json({ error: 'Not authenticated', code: 'TOKEN_EXPIRED' });
    return null;
  }
  try {
    const supabase = anonClient();
    const { data, error } = await supabase.auth.getUser(accessToken);
    if (error || !data?.user) {
      res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' });
      return null;
    }
    return { user: data.user, accessToken };
  } catch {
    res.status(401).json({ error: 'Invalid token', code: 'TOKEN_EXPIRED' });
    return null;
  }
}