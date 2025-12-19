import { describe, expect, it } from "bun:test";

import {
  ProjectAccessDeniedError,
  ProjectError,
  ProjectNotFoundError,
  ProjectSlugExistsError,
} from "../errors";

describe("ProjectError", () => {
  it("creates error with message, code, and status", () => {
    const error = new ProjectError("Test error", "PROJECT_NOT_FOUND", 404);
    expect(error.message).toBe("Test error");
    expect(error.code).toBe("PROJECT_NOT_FOUND");
    expect(error.statusCode).toBe(404);
    expect(error.name).toBe("ProjectError");
  });

  it("is instanceof Error", () => {
    const error = new ProjectError("Test", "PROJECT_NOT_FOUND", 404);
    expect(error).toBeInstanceOf(Error);
  });
});

describe("ProjectNotFoundError", () => {
  it("creates error with identifier in message", () => {
    const error = new ProjectNotFoundError("proj-123");
    expect(error.message).toBe("Project not found: proj-123");
    expect(error.code).toBe("PROJECT_NOT_FOUND");
    expect(error.statusCode).toBe(404);
    expect(error.name).toBe("ProjectNotFoundError");
  });

  it("is instanceof ProjectError", () => {
    const error = new ProjectNotFoundError("id");
    expect(error).toBeInstanceOf(ProjectError);
  });
});

describe("ProjectSlugExistsError", () => {
  it("creates error with slug in message", () => {
    const error = new ProjectSlugExistsError("my-project");
    expect(error.message).toBe("Project slug already exists: my-project");
    expect(error.code).toBe("PROJECT_SLUG_EXISTS");
    expect(error.statusCode).toBe(409);
    expect(error.name).toBe("ProjectSlugExistsError");
  });

  it("is instanceof ProjectError", () => {
    const error = new ProjectSlugExistsError("slug");
    expect(error).toBeInstanceOf(ProjectError);
  });
});

describe("ProjectAccessDeniedError", () => {
  it("creates error with project ID in message", () => {
    const error = new ProjectAccessDeniedError("proj-123");
    expect(error.message).toBe("Access denied to project: proj-123");
    expect(error.code).toBe("PROJECT_ACCESS_DENIED");
    expect(error.statusCode).toBe(403);
    expect(error.name).toBe("ProjectAccessDeniedError");
  });

  it("is instanceof ProjectError", () => {
    const error = new ProjectAccessDeniedError("id");
    expect(error).toBeInstanceOf(ProjectError);
  });
});
