import { and, count, eq } from "drizzle-orm";

import { db } from "@/core/database/client";

import type { NewProject, Project } from "./models";
import { projects } from "./models";

/**
 * Find a project by ID.
 */
export async function findById(id: string): Promise<Project | undefined> {
  const results = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  return results[0];
}

/**
 * Find a project by slug.
 */
export async function findBySlug(slug: string): Promise<Project | undefined> {
  const results = await db.select().from(projects).where(eq(projects.slug, slug)).limit(1);
  return results[0];
}

/**
 * Find all projects owned by a user.
 */
export async function findByOwnerId(ownerId: string): Promise<Project[]> {
  return db.select().from(projects).where(eq(projects.ownerId, ownerId));
}

/**
 * Find a project by ID and owner (for access checks).
 */
export async function findByIdAndOwner(id: string, ownerId: string): Promise<Project | undefined> {
  const results = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, id), eq(projects.ownerId, ownerId)))
    .limit(1);
  return results[0];
}

/**
 * Create a new project.
 */
export async function create(data: NewProject): Promise<Project> {
  const results = await db.insert(projects).values(data).returning();
  const project = results[0];
  if (!project) {
    throw new Error("Failed to create project");
  }
  return project;
}

/**
 * Update a project by ID.
 */
export async function update(
  id: string,
  data: Partial<Pick<Project, "name" | "description" | "isPublic">>,
): Promise<Project | undefined> {
  const results = await db
    .update(projects)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(projects.id, id))
    .returning();
  return results[0];
}

/**
 * Delete a project by ID.
 */
export async function deleteById(id: string): Promise<boolean> {
  const results = await db.delete(projects).where(eq(projects.id, id)).returning();
  return results.length > 0;
}

/**
 * Count projects owned by a user.
 */
export async function countByOwnerId(ownerId: string): Promise<number> {
  const results = await db
    .select({ count: count() })
    .from(projects)
    .where(eq(projects.ownerId, ownerId));
  return results[0]?.count ?? 0;
}
