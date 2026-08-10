import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "./config";

let client: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseBrowserClient() {
  if (!isSupabaseConfigured()) return null;
  if (!client) {
    client = createBrowserClient(SUPABASE_URL as string, SUPABASE_ANON_KEY as string);
  }
  return client;
}
