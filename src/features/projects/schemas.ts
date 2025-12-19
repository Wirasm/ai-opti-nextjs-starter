import { z } from "zod/v4";

/**
 * Schema for creating a new project.
 */
export const CreateProjectSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(100, "Name must be at most 100 characters"),
  description: z.string().max(1000, "Description must be at most 1000 characters").optional(),
  isPublic: z.boolean().default(false),
});

export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;

/**
 * Schema for updating an existing project.
 */
export const UpdateProjectSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(100, "Name must be at most 100 characters")
    .optional(),
  description: z.string().max(1000, "Description must be at most 1000 characters").optional(),
  isPublic: z.boolean().optional(),
});

export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>;

/**
 * Schema for project response (API output).
 */
export const ProjectResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  isPublic: z.boolean(),
  ownerId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ProjectResponse = z.infer<typeof ProjectResponseSchema>;
