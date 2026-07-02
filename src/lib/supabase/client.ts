import { createBrowserClient } from "@supabase/ssr";

import { requireSupabaseEnv } from "./env";

export function createClient() {
  const { publishableKey, url } = requireSupabaseEnv();

  return createBrowserClient(url, publishableKey);
}
