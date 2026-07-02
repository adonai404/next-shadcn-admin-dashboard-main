import { cookies } from "next/headers";

import { createServerClient } from "@supabase/ssr";

import { getSupabaseEnv, requireSupabaseEnv } from "./env";

export async function createClient() {
  const { publishableKey, url } = requireSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component render — safe to ignore since the
          // middleware below refreshes the session cookie on every request.
        }
      },
    },
  });
}

export async function createClientOrNull() {
  const env = getSupabaseEnv();

  if (!env) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient(env.url, env.publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component render — safe to ignore since the
          // middleware below refreshes the session cookie on every request.
        }
      },
    },
  });
}
