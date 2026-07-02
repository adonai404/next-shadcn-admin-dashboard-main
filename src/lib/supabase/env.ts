type SupabaseEnv = {
  publishableKey: string;
  url: string;
};

const SUPABASE_PUBLISHABLE_KEY_NAME = "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY";
const SUPABASE_ANON_KEY_NAME = "NEXT_PUBLIC_SUPABASE_ANON_KEY";
const SUPABASE_URL_NAME = "NEXT_PUBLIC_SUPABASE_URL";

function readSupabaseEnv(): SupabaseEnv | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !publishableKey) {
    return null;
  }

  return { publishableKey, url };
}

export function getSupabaseEnv(): SupabaseEnv | null {
  return readSupabaseEnv();
}

export function requireSupabaseEnv(): SupabaseEnv {
  const env = readSupabaseEnv();

  if (!env) {
    throw new Error(
      `Missing required Supabase environment variables: ${SUPABASE_URL_NAME} and either ${SUPABASE_PUBLISHABLE_KEY_NAME} or ${SUPABASE_ANON_KEY_NAME}`,
    );
  }

  return env;
}
