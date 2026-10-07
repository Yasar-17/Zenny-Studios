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
 hCaptcha — needs your site + secret keys from hcaptcha.com (add widget to contact.html, set HCAPTCHA_SECRET_KEY).
- FormSubmit decision — keep the browser-direct email relay (contact.html:872, exposes the inbox, _captcha:'false') or drop it.
- ADMIN_EMAIL — set it in Vercel env (Production + Preview) so only your account can reach admin endpoints.
- WhatsApp placeholder — thank-you.html still uses 919000000000.
- Orphaned pages — digital-strategy, eid-campaign, ramadan-campaign in sitemap but linked nowhere.
- 2FA on admin login — enable TOTP for the admin user in Supabase (needs dashboard config).