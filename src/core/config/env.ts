function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function getOptionalEnv(key: string, defaultValue: string): string {
  return process.env[key] ?? defaultValue;
}

/**
 * Get Supabase anon/publishable key.
 * Supports both legacy ANON_KEY and new PUBLISHABLE_KEY naming.
 */
function getSupabaseKey(): string {
  // biome-ignore lint/complexity/useLiteralKeys: TypeScript noPropertyAccessFromIndexSignature requires bracket notation
  const publishableKey = process.env["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"];
  // biome-ignore lint/complexity/useLiteralKeys: TypeScript noPropertyAccessFromIndexSignature requires bracket notation
  const anonKey = process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"];

  const key = publishableKey ?? anonKey;
  if (!key) {
    throw new Error(
      "Missing required environment variable: NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY",
    );
  }
  return key;
}

export const env = {
  // App config
  NODE_ENV: getOptionalEnv("NODE_ENV", "development"),
  LOG_LEVEL: getOptionalEnv("LOG_LEVEL", "info"),
  APP_NAME: getOptionalEnv("APP_NAME", "ai-opti-nextjs-starter"),

  // Supabase config (required)
  NEXT_PUBLIC_SUPABASE_URL: getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: getSupabaseKey(),

  // Database config (required)
  DATABASE_URL: getRequiredEnv("DATABASE_URL"),
} as const;

export type Env = typeof env;
