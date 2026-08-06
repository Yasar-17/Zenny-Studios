import { requireAuth } from '../_lib/auth.js';
import { applyCors, handlePreflight } from '../_lib/cors.js';

export default async function handler(req, res) {
  applyCors(req, res);
  if (handlePreflight(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const auth = await requireAuth(req, res);
  if (!auth) return;
  return res.status(200).json({ email: auth.user.email });
}