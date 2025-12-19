import { beforeEach, describe, expect, it, mock } from "bun:test";

import type { Project } from "../models";

// Mock the repository module with properly typed functions
const mockRepository = {
  findById: mock<(id: string) => Promise<Project | undefined>>(() => Promise.resolve(undefined)),
  findBySlug: mock<(slug: string) => Promise<Project | undefined>>(() =>
    Promise.resolve(undefined),
  ),
  findByOwnerId: mock<(ownerId: string) => Promise<Project[]>>(() => Promise.resolve([])),
  findByIdAndOwner: mock<(id: string, ownerId: string) => Promise<Project | undefined>>(() =>
    Promise.resolve(undefined),
  ),
  create: mock<(data: unknown) => Promise<Project>>(() => Promise.resolve({} as Project)),
  update: mock<(id: string, data: unknown) => Promise<Project | undefined>>(() =>
    Promise.resolve(undefined),
  ),
  deleteById: mock<(id: string) => Promise<boolean>>(() => Promise.resolve(false)),
  countByOwnerId: mock<(ownerId: string) => Promise<number>>(() => Promise.resolve(0)),
};

// Mock the repository before importing service
mock.module("../repository", () => mockRepository);

// Import service after mocking
const {
  createProject,
  deleteProject,
  getProject,
  getProjectBySlug,
  getProjectCount,
  getProjectsByOwner,
  updateProject,
} = await import("../service");

const mockProject: Project = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  name: "Test Project",
  slug: "test-project",
  description: "A test project",
  isPublic: false,
  ownerId: "550e8400-e29b-41d4-a716-446655440001",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const ownerId = "550e8400-e29b-41d4-a716-446655440001";
const otherUserId = "550e8400-e29b-41d4-a716-446655440002";

describe("createProject", () => {
  beforeEach(() => {
    mockRepository.findBySlug.mockReset();
    mockRepository.create.mockReset();
  });

  it("creates a project with generated slug", async () => {
    mockRepository.findBySlug.mockResolvedValue(undefined);
    mockRepository.create.mockResolvedValue(mockProject);

    const result = await createProject({ name: "Test Project", isPublic: false }, ownerId);

    expect(result).toEqual(mockProject);
    expect(mockRepository.create).toHaveBeenCalledTimes(1);
  });

  it("generates unique slug when collision occurs", async () => {
    // First call returns existing project, second returns undefined
    mockRepository.findBySlug.mockResolvedValueOnce(mockProject).mockResolvedValueOnce(undefined);
    mockRepository.create.mockResolvedValue(mockProject);

    const result = await createProject({ name: "Test Project", isPublic: false }, ownerId);

    expect(result).toEqual(mockProject);
    expect(mockRepository.findBySlug).toHaveBeenCalledTimes(2);
  });
});

describe("getProject", () => {
  beforeEach(() => {
    mockRepository.findById.mockReset();
  });

  it("returns project when user is owner", async () => {
    mockRepository.findById.mockResolvedValue(mockProject);

    const result = await getProject(mockProject.id, ownerId);

    expect(result).toEqual(mockProject);
  });

  it("returns public project for any user", async () => {
    const publicProject = { ...mockProject, isPublic: true };
    mockRepository.findById.mockResolvedValue(publicProject);

    const result = await getProject(mockProject.id, otherUserId);

    expect(result).toEqual(publicProject);
  });

  it("returns public project for unauthenticated user", async () => {
    const publicProject = { ...mockProject, isPublic: true };
    mockRepository.findById.mockResolvedValue(publicProject);

    const result = await getProject(mockProject.id, null);

    expect(result).toEqual(publicProject);
  });

  it("throws ProjectNotFoundError when project does not exist", async () => {
    mockRepository.findById.mockResolvedValue(undefined);

    await expect(getProject("non-existent-id", ownerId)).rejects.toThrow("Project not found");
  });

  it("throws ProjectAccessDeniedError for private project with non-owner", async () => {
    mockRepository.findById.mockResolvedValue(mockProject);

    await expect(getProject(mockProject.id, otherUserId)).rejects.toThrow("Access denied");
  });

  it("throws ProjectAccessDeniedError for private project with null user", async () => {
    mockRepository.findById.mockResolvedValue(mockProject);

    await expect(getProject(mockProject.id, null)).rejects.toThrow("Access denied");
  });
});

describe("updateProject", () => {
  beforeEach(() => {
    mockRepository.findById.mockReset();
    mockRepository.findByIdAndOwner.mockReset();
    mockRepository.update.mockReset();
  });

  it("updates project when user is owner", async () => {
    const updatedProject = { ...mockProject, name: "Updated Name" };
    mockRepository.findByIdAndOwner.mockResolvedValue(mockProject);
    mockRepository.update.mockResolvedValue(updatedProject);

    const result = await updateProject(mockProject.id, { name: "Updated Name" }, ownerId);

    expect(result.name).toBe("Updated Name");
  });

  it("throws ProjectNotFoundError when project does not exist", async () => {
    mockRepository.findByIdAndOwner.mockResolvedValue(undefined);
    mockRepository.findById.mockResolvedValue(undefined);

    await expect(updateProject("non-existent-id", { name: "New Name" }, ownerId)).rejects.toThrow(
      "Project not found",
    );
  });

  it("throws ProjectAccessDeniedError when user is not owner", async () => {
    mockRepository.findByIdAndOwner.mockResolvedValue(undefined);
    mockRepository.findById.mockResolvedValue(mockProject);

    await expect(updateProject(mockProject.id, { name: "New Name" }, otherUserId)).rejects.toThrow(
      "Access denied",
    );
  });
});

describe("deleteProject", () => {
  beforeEach(() => {
    mockRepository.findById.mockReset();
    mockRepository.findByIdAndOwner.mockReset();
    mockRepository.deleteById.mockReset();
  });

  it("deletes project when user is owner", async () => {
    mockRepository.findByIdAndOwner.mockResolvedValue(mockProject);
    mockRepository.deleteById.mockResolvedValue(true);

    await expect(deleteProject(mockProject.id, ownerId)).resolves.toBeUndefined();
  });

  it("throws ProjectNotFoundError when project does not exist", async () => {
    mockRepository.findByIdAndOwner.mockResolvedValue(undefined);
    mockRepository.findById.mockResolvedValue(undefined);

    await expect(deleteProject("non-existent-id", ownerId)).rejects.toThrow("Project not found");
  });

  it("throws ProjectAccessDeniedError when user is not owner", async () => {
    mockRepository.findByIdAndOwner.mockResolvedValue(undefined);
    mockRepository.findById.mockResolvedValue(mockProject);

    await expect(deleteProject(mockProject.id, otherUserId)).rejects.toThrow("Access denied");
  });

  it("throws ProjectNotFoundError when delete fails after ownership check (race condition)", async () => {
    mockRepository.findByIdAndOwner.mockResolvedValue(mockProject);
    mockRepository.deleteById.mockResolvedValue(false);

    await expect(deleteProject(mockProject.id, ownerId)).rejects.toThrow("Project not found");
  });
});

describe("getProjectBySlug", () => {
  beforeEach(() => {
    mockRepository.findBySlug.mockReset();
  });

  it("returns project when user is owner", async () => {
    mockRepository.findBySlug.mockResolvedValue(mockProject);

    const result = await getProjectBySlug("test-project", ownerId);

    expect(result).toEqual(mockProject);
  });

  it("returns public project for any user", async () => {
    const publicProject = { ...mockProject, isPublic: true };
    mockRepository.findBySlug.mockResolvedValue(publicProject);

    const result = await getProjectBySlug("test-project", otherUserId);

    expect(result).toEqual(publicProject);
  });

  it("returns public project for unauthenticated user", async () => {
    const publicProject = { ...mockProject, isPublic: true };
    mockRepository.findBySlug.mockResolvedValue(publicProject);

    const result = await getProjectBySlug("test-project", null);

    expect(result).toEqual(publicProject);
  });

  it("throws ProjectNotFoundError when slug does not exist", async () => {
    mockRepository.findBySlug.mockResolvedValue(undefined);

    await expect(getProjectBySlug("non-existent", ownerId)).rejects.toThrow("Project not found");
  });

  it("throws ProjectAccessDeniedError for private project with non-owner", async () => {
    mockRepository.findBySlug.mockResolvedValue(mockProject);

    await expect(getProjectBySlug("test-project", otherUserId)).rejects.toThrow("Access denied");
  });

  it("throws ProjectAccessDeniedError for private project with null user", async () => {
    mockRepository.findBySlug.mockResolvedValue(mockProject);

    await expect(getProjectBySlug("test-project", null)).rejects.toThrow("Access denied");
  });
});

describe("createProject - slug exhaustion", () => {
  beforeEach(() => {
    mockRepository.findBySlug.mockReset();
    mockRepository.create.mockReset();
  });

  it("throws ProjectSlugExistsError after max retry attempts", async () => {
    mockRepository.findBySlug.mockResolvedValue(mockProject);

    await expect(createProject({ name: "Test", isPublic: false }, ownerId)).rejects.toThrow(
      "Project slug already exists",
    );
    expect(mockRepository.findBySlug).toHaveBeenCalledTimes(10);
  });
});

describe("updateProject - race condition", () => {
  beforeEach(() => {
    mockRepository.findById.mockReset();
    mockRepository.findByIdAndOwner.mockReset();
    mockRepository.update.mockReset();
  });

  it("throws ProjectNotFoundError when update fails after ownership check", async () => {
    mockRepository.findByIdAndOwner.mockResolvedValue(mockProject);
    mockRepository.update.mockResolvedValue(undefined);

    await expect(updateProject(mockProject.id, { name: "New Name" }, ownerId)).rejects.toThrow(
      "Project not found",
    );
  });
});

describe("getProjectsByOwner", () => {
  beforeEach(() => {
    mockRepository.findByOwnerId.mockReset();
  });

  it("returns projects for owner", async () => {
    mockRepository.findByOwnerId.mockResolvedValue([mockProject]);

    const result = await getProjectsByOwner(ownerId);

    expect(result).toEqual([mockProject]);
    expect(mockRepository.findByOwnerId).toHaveBeenCalledWith(ownerId);
  });

  it("returns empty array when no projects", async () => {
    mockRepository.findByOwnerId.mockResolvedValue([]);

    const result = await getProjectsByOwner(ownerId);

    expect(result).toEqual([]);
  });
});

describe("getProjectCount", () => {
  beforeEach(() => {
    mockRepository.countByOwnerId.mockReset();
  });

  it("returns count from repository", async () => {
    mockRepository.countByOwnerId.mockResolvedValue(5);

    const result = await getProjectCount(ownerId);

    expect(result).toBe(5);
    expect(mockRepository.countByOwnerId).toHaveBeenCalledWith(ownerId);
  });

  it("returns zero when no projects", async () => {
    mockRepository.countByOwnerId.mockResolvedValue(0);

    const result = await getProjectCount(ownerId);

    expect(result).toBe(0);
  });
});
