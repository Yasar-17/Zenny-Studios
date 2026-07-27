import { userClient } from '../_lib/supabase.js';
import { requireAuth } from '../_lib/auth.js';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const auth = await requireAuth(req, res);
  if (!auth) return;

  const { id } = req.query;
  if (!id || !UUID_RE.test(String(id))) {
    return res.status(400).json({ error: 'Invalid enquiry ID format' });
  }

  try {
    // User-scoped client → RLS `admin_delete` policy enforces auth per row.
    const supabase = userClient(auth.accessToken);
    const { data, error } = await supabase
      .from('enquiries')
      .delete()
      .eq('id', id)
      .select('id');

    if (error) throw error;
    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Enquiry not found' });
    }
    return res.status(200).json({ success: true });
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
}