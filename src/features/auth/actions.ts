"use server";

import { redirect } from "next/navigation";

import { getLogger } from "@/core/logging";
import { createClient } from "@/core/supabase/server";

const logger = getLogger("auth.actions");

/**
 * Sign out the current user and redirect to login.
 */
export async function signOut(): Promise<void> {
  const supabase = await createClient();

  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      logger.warn({ error: error.message }, "auth.signout_failed");
    } else {
      logger.info("auth.signout_completed");
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    logger.error({ error: message }, "auth.signout_error");
  }

  redirect("/login");
}
