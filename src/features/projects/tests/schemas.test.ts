import { describe, expect, it } from "bun:test";

import { CreateProjectSchema, ProjectResponseSchema, UpdateProjectSchema } from "../schemas";

describe("CreateProjectSchema", () => {
  it("validates valid input", () => {
    const result = CreateProjectSchema.parse({
      name: "My Project",
      description: "A test project",
      isPublic: true,
    });
    expect(result.name).toBe("My Project");
    expect(result.description).toBe("A test project");
    expect(result.isPublic).toBe(true);
  });

  it("uses default values", () => {
    const result = CreateProjectSchema.parse({
      name: "My Project",
    });
    expect(result.isPublic).toBe(false);
    expect(result.description).toBeUndefined();
  });

  it("rejects name shorter than 3 characters", () => {
    expect(() => CreateProjectSchema.parse({ name: "ab" })).toThrow();
  });

  it("rejects name longer than 100 characters", () => {
    const longName = "a".repeat(101);
    expect(() => CreateProjectSchema.parse({ name: longName })).toThrow();
  });

  it("rejects description longer than 1000 characters", () => {
    const longDescription = "a".repeat(1001);
    expect(() =>
      CreateProjectSchema.parse({
        name: "Valid Name",
        description: longDescription,
      }),
    ).toThrow();
  });
});

describe("UpdateProjectSchema", () => {
  it("validates partial updates", () => {
    const result = UpdateProjectSchema.parse({
      name: "Updated Name",
    });
    expect(result.name).toBe("Updated Name");
    expect(result.description).toBeUndefined();
    expect(result.isPublic).toBeUndefined();
  });

  it("validates empty object", () => {
    const result = UpdateProjectSchema.parse({});
    expect(result).toEqual({});
  });

  it("validates all fields", () => {
    const result = UpdateProjectSchema.parse({
      name: "New Name",
      description: "New description",
      isPublic: true,
    });
    expect(result.name).toBe("New Name");
    expect(result.description).toBe("New description");
    expect(result.isPublic).toBe(true);
  });
});

describe("ProjectResponseSchema", () => {
  it("validates valid project response", () => {
    const now = new Date();
    const result = ProjectResponseSchema.parse({
      id: "550e8400-e29b-41d4-a716-446655440000",
      name: "My Project",
      slug: "my-project",
      description: "A test project",
      isPublic: true,
      ownerId: "550e8400-e29b-41d4-a716-446655440001",
      createdAt: now,
      updatedAt: now,
    });
    expect(result.id).toBe("550e8400-e29b-41d4-a716-446655440000");
    expect(result.slug).toBe("my-project");
  });

  it("accepts null description", () => {
    const now = new Date();
    const result = ProjectResponseSchema.parse({
      id: "550e8400-e29b-41d4-a716-446655440000",
      name: "My Project",
      slug: "my-project",
      description: null,
      isPublic: false,
      ownerId: "550e8400-e29b-41d4-a716-446655440001",
      createdAt: now,
      updatedAt: now,
    });
    expect(result.description).toBeNull();
  });

  it("rejects invalid UUID", () => {
    const now = new Date();
    expect(() =>
      ProjectResponseSchema.parse({
        id: "not-a-uuid",
        name: "My Project",
        slug: "my-project",
        description: null,
        isPublic: false,
        ownerId: "550e8400-e29b-41d4-a716-446655440001",
        createdAt: now,
        updatedAt: now,
      }),
    ).toThrow();
  });
});
