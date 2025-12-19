// Types

// Errors
export {
  ProjectAccessDeniedError,
  ProjectError,
  ProjectNotFoundError,
  ProjectSlugExistsError,
} from "./errors";
export type { NewProject, Project } from "./models";
export type { CreateProjectInput, ProjectResponse, UpdateProjectInput } from "./schemas";
// Schemas (for validation)
export { CreateProjectSchema, ProjectResponseSchema, UpdateProjectSchema } from "./schemas";

// Service functions (public API)
export {
  createProject,
  deleteProject,
  getProject,
  getProjectBySlug,
  getProjectCount,
  getProjectsByOwner,
  updateProject,
} from "./service";
