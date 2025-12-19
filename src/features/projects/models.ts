import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

import { projects } from "@/core/database/schema";

// Re-export the table for use in this feature
export { projects };

/** Project row from database */
export type Project = InferSelectModel<typeof projects>;

/** New project for insert */
export type NewProject = InferInsertModel<typeof projects>;
