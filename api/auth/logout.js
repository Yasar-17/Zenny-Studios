import { clearCookies } from '../_lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Logout story:
  //  - We clear both auth cookies, so the browser can no longer present them.
  //  - The refresh token is single-use on Supabase; with the cookie gone it
  //    cannot be rotated into a new access token.
  //  - The current access token (if any) is a short-lived JWT (≤15m) and will
  //    expire on its own. Stealing it after logout requires a separate XSS.
  // For immediate server-side revocation you can later call
  // adminClient().auth.admin.signOut(userId) with the service role key.
  clearCookies(res);
  return res.status(200).json({ success: true });
}