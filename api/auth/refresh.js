import { anonClient } from '../_lib/supabase.js';
import { serializeCookie, clearCookies, getCookies } from '../_lib/auth.js';
import { rateLimit } from '../_lib/rate-limit.js';
import { applyCors, handlePreflight } from '../_lib/cors.js';

const ACCESS_TTL = 60 * 15;
const REFRESH_TTL = 60 * 60 * 24 * 7;

export default async function handler(req, res) {
  applyCors(req, res);
  if (handlePreflight(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Mild rate limit to prevent refresh-token hammering.
  const ip = (req.headers['x-forwarded-for'] || '')
    .split(',')[0].trim() || req.socket?.remoteAddress || 'unknown';
  const limit = await rateLimit(`refresh:${ip}`, 30, 15 * 60 * 1000);
  if (!limit.allowed) {
    res.setHeader('Retry-After', String(limit.retryAfter));
    return res.status(429).json({ error: 'Too many refresh attempts. Slow down.' });
  }

  const { refreshToken } = getCookies(req);
  if (!refreshToken) {
    return res.status(401).json({ error: 'No refresh token' });
  }

  // Refresh token rotation: Supabase issues a new session (new access +
  // refresh tokens) on every refreshSession() call, and marks the previous
  // refresh token as used. A reused (stolen) refresh token is rejected.
  const supabase = anonClient();
  const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });

  if (error || !data?.session) {
    clearCookies(res);
    return res.status(401).json({ error: 'Invalid or expired refresh token' });
  }

  res.setHeader('Set-Cookie', [
    serializeCookie('access_token', data.session.access_token, ACCESS_TTL),
    serializeCookie('refresh_token', data.session.refresh_token, REFRESH_TTL),
  ]);

  return res.status(200).json({ email: data.user.email });
}