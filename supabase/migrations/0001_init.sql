-- ============================================================================
-- 0001_init.sql — Zenny Studios enquiries table + Row-Level Security
-- Run once via the Supabase SQL editor (or `supabase db push`).
--
-- NOTE: the permissive RLS policies below are superseded by
-- 0002_service_role_auth.sql, which drops them (the API now uses the service
-- role key, so anon/authenticated access is denied). Run 0002 after this.
-- ============================================================================

-- pgcrypto for gen_random_uuid() on older Postgres; built-in on PG13+.
create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- enquiries table
-- ---------------------------------------------------------------------------
create table if not exists public.enquiries (
  id         uuid        primary key default gen_random_uuid(),
  name       text        not null,
  email      text        not null,
  phone      text        not null,
  company    text,
  service    text,
  message    text        not null,
  is_read    boolean     not null default false,
  date       timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- Admin dashboard orders by newest first.
create index if not exists enquiries_date_desc_idx
  on public.enquiries (date desc);

-- ---------------------------------------------------------------------------
-- Row-Level Security
-- ---------------------------------------------------------------------------
alter table public.enquiries enable row level security;

-- Public (anon role) may INSERT new enquiries, but never read/update/delete.
drop policy if exists "public_insert_enquiries" on public.enquiries;
create policy "public_insert_enquiries"
  on public.enquiries for insert
  to anon
  with check (true);

-- Authenticated admin users may read all enquiries.
drop policy if exists "admin_select_enquiries" on public.enquiries;
create policy "admin_select_enquiries"
  on public.enquiries for select
  to authenticated
  using (true);

-- Authenticated admin users may update enquiries (mark read, etc.).
drop policy if exists "admin_update_enquiries" on public.enquiries;
create policy "admin_update_enquiries"
  on public.enquiries for update
  to authenticated
  using (true)
  with check (true);

-- Authenticated admin users may delete enquiries.
drop policy if exists "admin_delete_enquiries" on public.enquiries;
create policy "admin_delete_enquiries"
  on public.enquiries for delete
  to authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- Notes
-- ---------------------------------------------------------------------------
-- 1. Create an admin user via the Supabase dashboard:
--    Authentication → Users → "Add user" → email + password.
--    This user will be used by /api/auth/login to obtain a session.
-- 2. The service_role key bypasses RLS entirely — never expose it to the
--    browser. It is only used server-side in api/_lib/supabase.js.
-- 3. The POST endpoint (/api/enquiries) and all admin endpoints use the
--    service_role key. See 0002_service_role_auth.sql, which drops the
--    permissive policies below so the anon key cannot touch the table.
-- 4. Admin authorisation happens in code: /api/auth/login issues an httpOnly
--    cookie and every admin endpoint runs requireAuth() before touching data.
-- ============================================================================