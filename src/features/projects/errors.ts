/**
 * Base error for project-related errors.
 */
export class ProjectError extends Error {
  readonly code: string;
  readonly statusCode: number;

  constructor(message: string, code: string, statusCode: number) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
  }
}

/**
 * Thrown when a project is not found.
 */
export class ProjectNotFoundError extends ProjectError {
  constructor(identifier: string) {
    super(`Project not found: ${identifier}`, "PROJECT_NOT_FOUND", 404);
  }
}

/**
 * Thrown when a project slug already exists.
 */
export class ProjectSlugExistsError extends ProjectError {
  constructor(slug: string) {
    super(`Project slug already exists: ${slug}`, "PROJECT_SLUG_EXISTS", 409);
  }
}

/**
 * Thrown when user doesn't have access to a project.
 */
export class ProjectAccessDeniedError extends ProjectError {
  constructor(projectId: string) {
    super(`Access denied to project: ${projectId}`, "PROJECT_ACCESS_DENIED", 403);
  }
}
