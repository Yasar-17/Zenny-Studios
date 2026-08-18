import { adminClient } from '../_lib/supabase.js';
import { requireAuth } from '../_lib/auth.js';
import { rateLimit } from '../_lib/rate-limit.js';
import { validateEnquiry, sanitizeInput } from '../_lib/validate.js';
import { verifyHcaptcha } from '../_lib/hcaptcha.js';
import { applyCors, handlePreflight } from '../_lib/cors.js';

const MAX_BODY_BYTES = 16 * 1024; // generous cap; defends against oversized payloads.

export default async function handler(req, res) {
  applyCors(req, res);
  if (handlePreflight(req, res)) return;

  // ===== GET: list all (admin only) =====
  if (req.method === 'GET') {
    const auth = await requireAuth(req, res);
    if (!auth) return;

    try {
      // Caller was authorised by requireAuth; use the service-role key for the
      // read (bypasses RLS — the anon key cannot read anything).
      const supabase = adminClient();
      const { data, error } = await supabase
        .from('enquiries')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      return res.status(200).json(data || []);
    } catch {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // ===== POST: public submission (service-role insert) =====
  if (req.method === 'POST') {
    const ip = (req.headers['x-forwarded-for'] || '')
      .split(',')[0].trim() || req.socket?.remoteAddress || 'unknown';
    const limit = await rateLimit(`enquiry:${ip}`, 5, 15 * 60 * 1000);
    if (!limit.allowed) {
      res.setHeader('Retry-After', String(limit.retryAfter));
      return res.status(429).json({
        error: `Too many submissions. Try again in ${limit.retryAfter} seconds.`,
      });
    }

    // Reject non-JSON and oversize bodies early.
    const contentType = req.headers['content-type'] || '';
    if (typeof req.body !== 'object' || !contentType.includes('application/json')) {
      return res.status(400).json({ error: 'Content-Type must be application/json' });
    }
    if (req.headers['content-length'] && Number(req.headers['content-length']) > MAX_BODY_BYTES) {
      return res.status(413).json({ error: 'Payload too large' });
    }

    const validation = validateEnquiry(req.body);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.errors.join('. ') });
    }

    const hcaptchaValid = await verifyHcaptcha(req.body.hcaptcha_token);
    if (!hcaptchaValid) {
      return res.status(400).json({ error: 'Captcha verification failed' });
    }

    const s = sanitizeInput(req.body);

    // Insert with the service-role key (server-side, never exposed to the
    // browser). It bypasses RLS, so no anon insert policy is required.
    try {
      const supabase = adminClient();
      const { error } = await supabase.from('enquiries').insert({
        name: s.name,
        email: s.email,
        phone: s.phone,
        company: s.company || null,
        service: s.service || null,
        message: s.message,
      });
      if (error) throw error;
      return res.status(201).json({ success: true });
    } catch (err) {
      console.error('Supabase insert failed:', err.message);
      return res.status(500).json({ error: 'Could not save your enquiry. Please try again or email us directly.' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}