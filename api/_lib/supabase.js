import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase env vars: SUPABASE_URL and SUPABASE_ANON_KEY are required');
}

const COMMON_OPTS = {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
};

// Public anon client — used for sign-in and anon-rate limited inserts.
// RLS applies: anon role only sees what public policy allows.
export function anonClient() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, COMMON_OPTS);
}

// Service role client — bypasses RLS. Use ONLY for trusted server-side ops
// where you have already authorised the caller through some other path.
// Never expose this key to the browser.
export function adminClient() {
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, COMMON_OPTS);
}