import { clearCookies, getCookies } from '../_lib/auth.js';
import { adminClient } from '../_lib/supabase.js';
import { applyCors, handlePreflight } from '../_lib/cors.js';

export default async function handler(req, res) {
  applyCors(req, res);
  if (handlePreflight(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Revoke the session server-side so the access token dies immediately
  // instead of remaining valid for up to its 15-minute lifetime, and so the
  // single-use refresh token can no longer be rotated into a new session.
  // Best-effort: clearing the cookies still logs the browser out even if the
  // revocation call fails.
  const { accessToken } = getCookies(req);
  if (accessToken) {
    try {
      const supabase = adminClient();
      // Passing the user's JWT revokes all of that user's sessions on
      // Supabase (GoTrue admin signOut).
      await supabase.auth.admin.signOut(accessToken);
    } catch {
      // Ignore — cookie removal below still ends the local session.
    }
  }

  clearCookies(res);
  return res.status(200).json({ success: true });
}
