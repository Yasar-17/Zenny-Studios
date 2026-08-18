import { anonClient } from '../_lib/supabase.js';
import { serializeCookie } from '../_lib/auth.js';
import { rateLimit } from '../_lib/rate-limit.js';
import { applyCors, handlePreflight } from '../_lib/cors.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ACCESS_TTL = 60 * 15;          // 15 minutes
const REFRESH_TTL = 60 * 60 * 24 * 7; // 7 days

export default async function handler(req, res) {
  applyCors(req, res);
  if (handlePreflight(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate limit by IP (namespaced so other endpoints are unaffected).
  const ip = (req.headers['x-forwarded-for'] || '')
    .split(',')[0].trim() || req.socket?.remoteAddress || 'unknown';
  const limit = await rateLimit(`login:${ip}`, 5, 15 * 60 * 1000);
  if (!limit.allowed) {
    res.setHeader('Retry-After', String(limit.retryAfter));
    return res.status(429).json({
      error: `Too many login attempts. Try again in ${limit.retryAfter} seconds.`,
    });
  }

  const { email, password } = req.body || {};

  // Input shape checks BEFORE calling Supabase (cheap DoS guard).
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  if (typeof email !== 'string' || email.length > 254 || !EMAIL_RE.test(email)) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }
  if (typeof password !== 'string' || password.length === 0 || password.length > 1024) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const supabase = anonClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.toLowerCase(),
    password,
  });

  if (error || !data?.session) {
    // Generic message — do not leak whether the email exists.
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  res.setHeader('Set-Cookie', [
    serializeCookie('access_token', data.session.access_token, ACCESS_TTL),
    serializeCookie('refresh_token', data.session.refresh_token, REFRESH_TTL),
  ]);

  return res.status(200).json({ email: data.user.email });
}