"use client";

import { createBrowserClient } from "@supabase/ssr";

import { env } from "@/core/config/env";

/**
 * Create a Supabase client for Client Components.
 * Use this in "use client" components.
 */
export function createClient() {
  return createBrowserClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}
