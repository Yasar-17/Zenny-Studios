import { adminClient } from './supabase.js';

// Global rate limiter backed by the `rate_limits` table (see
// supabase/migrations/0003_rate_limits.sql). Unlike an in-memory counter it
// survives cold boots and is shared across all Vercel serverless instances,
// so a distributed flood cannot reset the budget.
//
// It degrades gracefully: if the table is unreachable (missing migration,
// service-role key not set, Supabase hiccup) it falls back to per-instance
// in-memory counting so the site never hard-fails on an infra problem.
//
// Keys are namespaced (e.g. "login:<ip>") so a flood on one endpoint cannot
// exhaust another endpoint's budget.

const hits = new Map();
const MAX_BUCKETS = 5000;                    // bound fallback memory
const CLEANUP_HORIZON_MS = 60 * 60 * 1000;   // global sweep window
const GLOBAL_CLEANUP_PROBABILITY = 0.02;     // amortised global cleanup

function memoryRateLimit(key, maxRequests, windowMs) {
  const now = Date.now();
  const windowStart = now - windowMs;

  const existing = (hits.get(key) || []).filter(t => t > windowStart);
  existing.push(now);
  hits.set(key, existing);

  if (existing.length > maxRequests) {
    const retryAfter = Math.ceil((existing[0] + windowMs - now) / 1000);
    return { allowed: false, retryAfter };
  }

  if (hits.size > MAX_BUCKETS) {
    const cutoff = now - CLEANUP_HORIZON_MS;
    for (const [k, ts] of hits.entries()) {
      const filtered = ts.filter(t => t > cutoff);
      if (filtered.length === 0) hits.delete(k);
      else hits.set(k, filtered);
    }
  }

  return { allowed: true };
}

export async function rateLimit(key, maxRequests = 5, windowMs = 15 * 60 * 1000) {
  const now = Date.now();
  const cutoff = new Date(now - windowMs).toISOString();

  try {
    const supabase = adminClient();

    // Record this hit.
    await supabase.from('rate_limits').insert({ bucket: key });

    // Count hits inside the sliding window.
    const { count, error: countError } = await supabase
      .from('rate_limits')
      .select('id', { count: 'exact', head: true })
      .eq('bucket', key)
      .gte('ts', cutoff);
    if (countError) throw countError;

    const allowed = (count || 0) <= maxRequests;

    if (allowed) {
      // Opportunistically prune this bucket's expired rows.
      await supabase.from('rate_limits').delete().eq('bucket', key).lt('ts', cutoff).catch(() => {});
    } else {
      // Report how long until the oldest hit leaves the window.
      const { data: oldest } = await supabase
        .from('rate_limits')
        .select('ts')
        .eq('bucket', key)
        .gte('ts', cutoff)
        .order('ts', { ascending: true })
        .limit(1);
      const firstTs = oldest && oldest[0] ? new Date(oldest[0].ts).getTime() : now;
      const retryAfter = Math.ceil((firstTs + windowMs - now) / 1000);
      return { allowed: false, retryAfter: Math.max(retryAfter, 1) };
    }

    // Amortised global sweep so old rows don't accumulate across buckets.
    if (Math.random() < GLOBAL_CLEANUP_PROBABILITY) {
      await supabase
        .from('rate_limits')
        .delete()
        .lt('ts', new Date(now - CLEANUP_HORIZON_MS).toISOString())
        .catch(() => {});
    }

    return { allowed: true };
  } catch {
    return memoryRateLimit(key, maxRequests, windowMs);
  }
}
