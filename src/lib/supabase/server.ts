import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Server-side Supabase client using Service Role Key.
 * ONLY use in API Routes and Server Components — NEVER expose to the browser.
 * Bypasses RLS for admin operations.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

let serverClient: SupabaseClient | null = null;

export function getSupabaseServerClient(): SupabaseClient {
  if (!serverClient) {
    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL env vars');
    }
    serverClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return serverClient;
}

/**
 * Anon-level server client (respects RLS).
 * Use when you want server-side queries that still honor row-level security.
 */
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export function getSupabaseAnonServerClient(): SupabaseClient {
  return createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
