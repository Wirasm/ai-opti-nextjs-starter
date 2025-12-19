import { timestamp } from "drizzle-orm/pg-core";

/**
 * Base timestamp columns for all tables.
 * Usage: ...timestamps
 */
export const timestamps = {
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
};

// Feature schemas will be added here
// Example:
// export * from "@/features/users/schema";
// export * from "@/features/posts/schema";
