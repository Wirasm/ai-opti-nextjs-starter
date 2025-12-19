import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import { env } from "@/core/config/env";

/**
 * Update Supabase session in middleware/proxy.
 * Call this in your middleware.ts (or proxy.ts in Next.js 16+) to refresh auth tokens.
 *
 * @example
 * // middleware.ts
 * import { type NextRequest } from "next/server";
 * import { updateSession } from "@/core/supabase/proxy";
 *
 * export async function middleware(request: NextRequest) {
 *   return await updateSession(request);
 * }
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
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
    },
  );

  // IMPORTANT: Do not use getSession() here.
  // getUser() validates the JWT against Supabase Auth server.
  // The call refreshes the session even if we don't use the user object.
  await supabase.auth.getUser();

  // Optional: Redirect unauthenticated users to login
  // if (!user && !request.nextUrl.pathname.startsWith("/login")) {
  //   const url = request.nextUrl.clone();
  //   url.pathname = "/login";
  //   return NextResponse.redirect(url);
  // }

  return supabaseResponse;
}

/**
 * Middleware config matcher.
 * Excludes static files and images from middleware processing.
 */
export const middlewareConfig = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
