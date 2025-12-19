import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { env } from "@/core/config/env";

import * as schema from "./schema";

/**
 * PostgreSQL connection for Drizzle ORM.
 * Uses connection pooling URL (port 6543) for serverless environments.
 */
const client = postgres(env.DATABASE_URL, {
  prepare: false, // Required for Supabase Transaction pooler
});

/**
 * Drizzle database client with typed schema.
 */
export const db = drizzle(client, { schema });

export type Database = typeof db;
