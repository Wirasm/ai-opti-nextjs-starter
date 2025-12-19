"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/core/supabase/server";

/**
 * Sign out the current user and redirect to login.
 */
export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
