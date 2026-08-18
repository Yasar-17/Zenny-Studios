-- ============================================================================
-- 0003_rate_limits.sql — Global (multi-instance) rate limiting
--
-- The API rate limiter used to live in memory, which on Vercel serverless is
-- per-instance and resets on cold boots, so a distributed flood could bypass
-- it. This table gives the limiter a shared, persistent home. The serverless
-- functions write and read it with the service-role key (which bypasses RLS);
-- anon and authenticated roles have no access at all.
--
-- Run once via the Supabase SQL editor (or `supabase db push`) after 0002.
-- The API degrades gracefully to in-memory limiting if this table is missing.
-- ============================================================================

create table if not exists public.rate_limits (
  id     bigint        generated always as identity primary key,
  bucket text          not null,
  ts     timestamptz   not null default now()
);

-- Sliding-window lookups and opportunistic cleanup both use (bucket, ts).
create index if not exists rate_limits_bucket_ts_idx
  on public.rate_limits (bucket, ts desc);

alter table public.rate_limits enable row level security;

-- No policies: anon and authenticated are denied. Only the service-role key
-- (used server-side) can touch this table.
