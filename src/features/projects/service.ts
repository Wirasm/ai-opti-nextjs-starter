import { getLogger } from "@/core/logging";

import { ProjectAccessDeniedError, ProjectNotFoundError, ProjectSlugExistsError } from "./errors";
import type { Project } from "./models";
import * as repository from "./repository";
import type { CreateProjectInput, UpdateProjectInput } from "./schemas";

const logger = getLogger("projects.service");

/**
 * Generate a URL-friendly slug from a project name.
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Generate a unique slug by appending a random suffix if needed.
 */
async function generateUniqueSlug(name: string): Promise<string> {
  const baseSlug = generateSlug(name);
  let slug = baseSlug;
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    const existing = await repository.findBySlug(slug);
    if (!existing) {
      return slug;
    }
    // Append random suffix
    const suffix = Math.random().toString(36).substring(2, 8);
    slug = `${baseSlug}-${suffix}`;
    attempts++;
  }

  throw new ProjectSlugExistsError(baseSlug);
}

/**
 * Create a new project.
 */
export async function createProject(input: CreateProjectInput, ownerId: string): Promise<Project> {
  logger.info({ ownerId, name: input.name }, "project.create_started");

  const slug = await generateUniqueSlug(input.name);

  const project = await repository.create({
    name: input.name,
    slug,
    description: input.description ?? null,
    isPublic: input.isPublic,
    ownerId,
  });

  logger.info({ projectId: project.id, slug }, "project.create_completed");
  return project;
}

/**
 * Get a project by ID.
 * Checks access: returns public projects or projects owned by the user.
 */
export async function getProject(id: string, userId: string | null): Promise<Project> {
  logger.info({ projectId: id, userId }, "project.get_started");

  const project = await repository.findById(id);

  if (!project) {
    logger.warn({ projectId: id }, "project.get_failed");
    throw new ProjectNotFoundError(id);
  }

  // Allow access if public or if user is owner
  if (!project.isPublic && project.ownerId !== userId) {
    logger.warn({ projectId: id, userId }, "project.access_denied");
    throw new ProjectAccessDeniedError(id);
  }

  logger.info({ projectId: id }, "project.get_completed");
  return project;
}

/**
 * Get a project by slug.
 * Checks access: returns public projects or projects owned by the user.
 */
export async function getProjectBySlug(slug: string, userId: string | null): Promise<Project> {
  logger.info({ slug, userId }, "project.get_by_slug_started");

  const project = await repository.findBySlug(slug);

  if (!project) {
    logger.warn({ slug }, "project.get_by_slug_failed");
    throw new ProjectNotFoundError(slug);
  }

  // Allow access if public or if user is owner
  if (!project.isPublic && project.ownerId !== userId) {
    logger.warn({ slug, userId }, "project.access_denied");
    throw new ProjectAccessDeniedError(project.id);
  }

  logger.info({ projectId: project.id, slug }, "project.get_by_slug_completed");
  return project;
}

/**
 * Get all projects owned by a user.
 */
export async function getProjectsByOwner(ownerId: string): Promise<Project[]> {
  logger.info({ ownerId }, "project.list_started");

  const projects = await repository.findByOwnerId(ownerId);

  logger.info({ ownerId, count: projects.length }, "project.list_completed");
  return projects;
}

/**
 * Update a project.
 * Only the owner can update a project.
 */
export async function updateProject(
  id: string,
  input: UpdateProjectInput,
  userId: string,
): Promise<Project> {
  logger.info({ projectId: id, userId }, "project.update_started");

  // Check ownership
  const existing = await repository.findByIdAndOwner(id, userId);
  if (!existing) {
    const project = await repository.findById(id);
    if (!project) {
      logger.warn({ projectId: id }, "project.update_failed");
      throw new ProjectNotFoundError(id);
    }
    logger.warn({ projectId: id, userId }, "project.access_denied");
    throw new ProjectAccessDeniedError(id);
  }

  // Build update data, only including defined properties (for exactOptionalPropertyTypes)
  const updateData: Partial<Pick<Project, "name" | "description" | "isPublic">> = {};
  if (input.name !== undefined) {
    updateData.name = input.name;
  }
  if (input.description !== undefined) {
    updateData.description = input.description;
  }
  if (input.isPublic !== undefined) {
    updateData.isPublic = input.isPublic;
  }

  const updated = await repository.update(id, updateData);

  if (!updated) {
    logger.error({ projectId: id }, "project.update_failed");
    throw new ProjectNotFoundError(id);
  }

  logger.info({ projectId: id }, "project.update_completed");
  return updated;
}

/**
 * Delete a project.
 * Only the owner can delete a project.
 */
export async function deleteProject(id: string, userId: string): Promise<void> {
  logger.info({ projectId: id, userId }, "project.delete_started");

  // Check ownership
  const existing = await repository.findByIdAndOwner(id, userId);
  if (!existing) {
    const project = await repository.findById(id);
    if (!project) {
      logger.warn({ projectId: id }, "project.delete_failed");
      throw new ProjectNotFoundError(id);
    }
    logger.warn({ projectId: id, userId }, "project.access_denied");
    throw new ProjectAccessDeniedError(id);
  }

  const deleted = await repository.deleteById(id);
  if (!deleted) {
    logger.error({ projectId: id }, "project.delete_failed");
    throw new ProjectNotFoundError(id);
  }

  logger.info({ projectId: id }, "project.delete_completed");
}

/**
 * Get the count of projects owned by a user.
 */
export async function getProjectCount(ownerId: string): Promise<number> {
  return repository.countByOwnerId(ownerId);
}
