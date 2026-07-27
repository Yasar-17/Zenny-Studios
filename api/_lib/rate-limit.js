// In-memory sliding-window rate limiter.
//
// NOTE: On Vercel serverless this is per-instance (not shared across
// invocations or cold boots), so it is best-effort — a determined attacker
// with high concurrency can still exceed the limit. For production-grade
// throttling, move the counter to Supabase (a `rate_limits` table keyed by
// bucket) or an edge KV. Keys are namespaced (e.g. "login:<ip>") so a flood
// on one endpoint cannot exhaust another endpoint's budget.

const hits = new Map();
const MAX_BUCKETS = 5000; // bound memory; evict oldest entries beyond this.

export function rateLimit(key, maxRequests = 5, windowMs = 15 * 60 * 1000) {
  const now = Date.now();
  const windowStart = now - windowMs;

  const existing = (hits.get(key) || []).filter(t => t > windowStart);
  existing.push(now);
  hits.set(key, existing);

  if (existing.length > maxRequests) {
    const retryAfter = Math.ceil((existing[0] + windowMs - now) / 1000);
    return { allowed: false, retryAfter };
  }

  // Opportunistic memory housekeeping.
  if (hits.size > MAX_BUCKETS) {
    const cutoff = now - 60 * 60 * 1000;
    for (const [k, ts] of hits.entries()) {
      const filtered = ts.filter(t => t > cutoff);
      if (filtered.length === 0) hits.delete(k);
      else hits.set(k, filtered);
    }
  }

  return { allowed: true };
}