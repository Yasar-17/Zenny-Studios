import { userClient } from '../_lib/supabase.js';
import { requireAuth } from '../_lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const auth = await requireAuth(req, res);
  if (!auth) return;

  try {
    const supabase = userClient(auth.accessToken);
    const { error } = await supabase
      .from('enquiries')
      .update({ is_read: true })
      .eq('is_read', false);

    if (error) throw error;
    return res.status(200).json({ success: true });
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
}