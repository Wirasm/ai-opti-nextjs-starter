import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

import { projects } from "@/core/database/schema";

export { projects };

export type Project = InferSelectModel<typeof projects>;
export type NewProject = InferInsertModel<typeof projects>;
