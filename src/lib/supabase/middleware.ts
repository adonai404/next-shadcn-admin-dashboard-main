import { type NextRequest, NextResponse } from "next/server";

import { createServerClient } from "@supabase/ssr";

import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "./env";

const PROTECTED_PREFIX = "/dashboard";
const AUTH_PREFIX = "/auth/v2";
const LOGIN_URL = "/auth/v2/login";
const HOME_URL = "/dashboard/nfe-analysis";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        supabaseResponse = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          supabaseResponse.cookies.set(name, value, options);
        }
      },
    },
  });

  // getUser() re-validates the token against Supabase Auth instead of just
  // trusting the local cookie, which is required for middleware/server checks.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isProtected = pathname.startsWith(PROTECTED_PREFIX);
  const isAuthPage = pathname.startsWith(AUTH_PREFIX);

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = LOGIN_URL;
    return NextResponse.redirect(url);
  }

  if (user && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = HOME_URL;
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
