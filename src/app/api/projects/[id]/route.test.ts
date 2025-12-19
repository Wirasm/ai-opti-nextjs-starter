import { beforeEach, describe, expect, it, mock } from "bun:test";
import { NextRequest } from "next/server";

import type { Project } from "@/features/projects";

// Mock user type
type MockUser = { id: string; email: string } | null;
const mockUser: MockUser = { id: "user-123", email: "test@example.com" };
const mockProject: Project = {
  id: "project-123",
  name: "Test Project",
  slug: "test-project",
  description: "A test project",
  isPublic: false,
  ownerId: "user-123",
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

// Mock Supabase auth
const mockGetUser = mock<() => Promise<{ data: { user: MockUser }; error: null }>>(() =>
  Promise.resolve({ data: { user: mockUser }, error: null }),
);
mock.module("@/core/supabase/server", () => ({
  createClient: () =>
    Promise.resolve({
      auth: {
        getUser: mockGetUser,
      },
    }),
}));

// Mock repository (the database layer)
const mockFindById = mock<(id: string) => Promise<Project | undefined>>(() =>
  Promise.resolve(mockProject),
);
const mockFindByIdAndOwner = mock<(id: string, ownerId: string) => Promise<Project | undefined>>(
  () => Promise.resolve(mockProject),
);
const mockUpdate = mock<(id: string, data: unknown) => Promise<Project | undefined>>(() =>
  Promise.resolve({ ...mockProject, name: "Updated" }),
);
const mockDeleteById = mock<(id: string) => Promise<boolean>>(() => Promise.resolve(true));

mock.module("@/features/projects/repository", () => ({
  findById: mockFindById,
  findByIdAndOwner: mockFindByIdAndOwner,
  update: mockUpdate,
  deleteById: mockDeleteById,
}));

// Import routes after mocking
const { GET, PATCH, DELETE } = await import("./route");

// Helper to create route params
const createParams = (id: string) => ({ params: Promise.resolve({ id }) });

describe("GET /api/projects/[id]", () => {
  beforeEach(() => {
    mockGetUser.mockClear();
    mockFindById.mockClear();
  });

  it("returns project for authenticated owner", async () => {
    const request = new NextRequest("http://localhost:3000/api/projects/project-123");
    const response = await GET(request, createParams("project-123"));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.id).toBe("project-123");
  });

  it("returns public project for unauthenticated user", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null }, error: null });
    mockFindById.mockResolvedValueOnce({ ...mockProject, isPublic: true });

    const request = new NextRequest("http://localhost:3000/api/projects/project-123");
    const response = await GET(request, createParams("project-123"));

    expect(response.status).toBe(200);
  });

  it("returns 404 for non-existent project", async () => {
    mockFindById.mockResolvedValueOnce(undefined);

    const request = new NextRequest("http://localhost:3000/api/projects/not-found");
    const response = await GET(request, createParams("not-found"));
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.code).toBe("PROJECT_NOT_FOUND");
  });

  it("returns 403 for private project accessed by non-owner", async () => {
    // Different user trying to access private project
    mockGetUser.mockResolvedValueOnce({
      data: { user: { id: "other-user", email: "other@example.com" } },
      error: null,
    });

    const request = new NextRequest("http://localhost:3000/api/projects/project-123");
    const response = await GET(request, createParams("project-123"));
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.code).toBe("PROJECT_ACCESS_DENIED");
  });
});

describe("PATCH /api/projects/[id]", () => {
  beforeEach(() => {
    mockGetUser.mockClear();
    mockFindById.mockClear();
    mockFindByIdAndOwner.mockClear();
    mockUpdate.mockClear();
  });

  it("updates project for owner", async () => {
    const request = new NextRequest("http://localhost:3000/api/projects/project-123", {
      method: "PATCH",
      body: JSON.stringify({ name: "Updated" }),
      headers: { "Content-Type": "application/json" },
    });
    const response = await PATCH(request, createParams("project-123"));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.name).toBe("Updated");
  });

  it("returns 401 for unauthenticated user", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null }, error: null });

    const request = new NextRequest("http://localhost:3000/api/projects/project-123", {
      method: "PATCH",
      body: JSON.stringify({ name: "Updated" }),
      headers: { "Content-Type": "application/json" },
    });
    const response = await PATCH(request, createParams("project-123"));
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.code).toBe("UNAUTHORIZED");
  });

  it("returns 403 for non-owner", async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: { id: "other-user", email: "other@example.com" } },
      error: null,
    });
    mockFindByIdAndOwner.mockResolvedValueOnce(undefined); // Not owner
    mockFindById.mockResolvedValueOnce(mockProject); // Project exists

    const request = new NextRequest("http://localhost:3000/api/projects/project-123", {
      method: "PATCH",
      body: JSON.stringify({ name: "Updated" }),
      headers: { "Content-Type": "application/json" },
    });
    const response = await PATCH(request, createParams("project-123"));
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.code).toBe("PROJECT_ACCESS_DENIED");
  });

  it("returns 400 for invalid update input", async () => {
    const request = new NextRequest("http://localhost:3000/api/projects/project-123", {
      method: "PATCH",
      body: JSON.stringify({ name: "ab" }), // Too short (min 3 chars)
      headers: { "Content-Type": "application/json" },
    });
    const response = await PATCH(request, createParams("project-123"));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.code).toBe("VALIDATION_ERROR");
  });
});

describe("DELETE /api/projects/[id]", () => {
  beforeEach(() => {
    mockGetUser.mockClear();
    mockFindById.mockClear();
    mockFindByIdAndOwner.mockClear();
    mockDeleteById.mockClear();
  });

  it("deletes project for owner", async () => {
    const request = new NextRequest("http://localhost:3000/api/projects/project-123", {
      method: "DELETE",
    });
    const response = await DELETE(request, createParams("project-123"));

    expect(response.status).toBe(204);
    expect(mockDeleteById).toHaveBeenCalledWith("project-123");
  });

  it("returns 401 for unauthenticated user", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null }, error: null });

    const request = new NextRequest("http://localhost:3000/api/projects/project-123", {
      method: "DELETE",
    });
    const response = await DELETE(request, createParams("project-123"));
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.code).toBe("UNAUTHORIZED");
  });

  it("returns 404 for non-existent project", async () => {
    mockFindByIdAndOwner.mockResolvedValueOnce(undefined);
    mockFindById.mockResolvedValueOnce(undefined);

    const request = new NextRequest("http://localhost:3000/api/projects/not-found", {
      method: "DELETE",
    });
    const response = await DELETE(request, createParams("not-found"));
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.code).toBe("PROJECT_NOT_FOUND");
  });

  it("returns 403 for non-owner", async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: { id: "other-user", email: "other@example.com" } },
      error: null,
    });
    mockFindByIdAndOwner.mockResolvedValueOnce(undefined); // Not owner
    mockFindById.mockResolvedValueOnce(mockProject); // Project exists

    const request = new NextRequest("http://localhost:3000/api/projects/project-123", {
      method: "DELETE",
    });
    const response = await DELETE(request, createParams("project-123"));
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.code).toBe("PROJECT_ACCESS_DENIED");
  });
});
