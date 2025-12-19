import { defineConfig } from "drizzle-kit";

// biome-ignore lint/complexity/useLiteralKeys: TypeScript noPropertyAccessFromIndexSignature requires bracket notation
if (!process.env["DATABASE_URL"]) {
  throw new Error("DATABASE_URL environment variable is required");
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/core/database/schema.ts",
  out: "./drizzle/migrations",
  dbCredentials: {
    // biome-ignore lint/complexity/useLiteralKeys: TypeScript noPropertyAccessFromIndexSignature requires bracket notation
    url: process.env["DATABASE_URL"],
  },
});
