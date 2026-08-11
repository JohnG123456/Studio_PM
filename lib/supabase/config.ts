export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

// Supabase renamed the client-side "anon key" to "publishable key" in their
// dashboard (same purpose — safe to expose client-side, RLS still applies —
// just a new name and key format, e.g. "sb_publishable_..."). Accept either
// env var name so it doesn't matter which one ended up in Vercel.
export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}
