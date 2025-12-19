import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";

import { env } from "@/core/config/env";
import { db } from "@/core/database/client";
import { getLogger } from "@/core/logging";

const logger = getLogger("health.ready");

interface CheckResult {
  database: "connected" | "disconnected";
  auth: "configured" | "missing";
}

/**
 * Readiness check endpoint.
 * Verifies all dependencies are available before accepting traffic.
 */
export async function GET() {
  logger.info("health.ready_check_started");

  const checks: CheckResult = {
    database: "disconnected",
    auth: "missing",
  };
  let allHealthy = true;

  // Check database connectivity
  try {
    await db.execute(sql`SELECT 1`);
    checks.database = "connected";
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown database error";
    logger.error({ error: message }, "health.ready_db_check_failed");
    allHealthy = false;
  }

  // Check auth configuration
  if (env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    checks.auth = "configured";
  } else {
    logger.warn("health.ready_auth_config_missing");
    allHealthy = false;
  }

  const status = allHealthy ? "ready" : "not_ready";

  if (allHealthy) {
    logger.info({ checks }, "health.ready_check_completed");
  } else {
    logger.warn({ checks }, "health.ready_check_failed");
  }

  return NextResponse.json(
    {
      status,
      environment: env.NODE_ENV,
      checks,
    },
    { status: allHealthy ? 200 : 503 },
  );
}
