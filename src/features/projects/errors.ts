import type { HttpStatusCode } from "@/core/api/errors";

/** Known error codes for project operations. */
export type ProjectErrorCode =
  | "PROJECT_NOT_FOUND"
  | "PROJECT_SLUG_EXISTS"
  | "PROJECT_ACCESS_DENIED";

/**
 * Base error for project-related errors.
 */
export class ProjectError extends Error {
  readonly code: ProjectErrorCode;
  readonly statusCode: HttpStatusCode;

  constructor(message: string, code: ProjectErrorCode, statusCode: HttpStatusCode) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
  }
}

export class ProjectNotFoundError extends ProjectError {
  constructor(identifier: string) {
    super(`Project not found: ${identifier}`, "PROJECT_NOT_FOUND", 404);
  }
}

export class ProjectSlugExistsError extends ProjectError {
  constructor(slug: string) {
    super(`Project slug already exists: ${slug}`, "PROJECT_SLUG_EXISTS", 409);
  }
}

export class ProjectAccessDeniedError extends ProjectError {
  constructor(projectId: string) {
    super(`Access denied to project: ${projectId}`, "PROJECT_ACCESS_DENIED", 403);
  }
}
