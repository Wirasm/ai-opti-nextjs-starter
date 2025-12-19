import { type NextRequest, NextResponse } from "next/server";

import { handleApiError, unauthorizedResponse } from "@/core/api/errors";
import { getLogger } from "@/core/logging";
import { createClient } from "@/core/supabase/server";
import {
  CreateProjectSchema,
  createProject,
  getProjectCount,
  getProjectsByOwner,
} from "@/features/projects";
import { createPaginatedResponse, PaginationParamsSchema } from "@/shared/schemas/pagination";

const logger = getLogger("api.projects");

/**
 * GET /api/projects
 * List projects for the authenticated user with pagination.
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return unauthorizedResponse();
    }

    // Parse pagination from query params
    const searchParams = request.nextUrl.searchParams;
    const paginationResult = PaginationParamsSchema.safeParse({
      page: searchParams.get("page") ? Number(searchParams.get("page")) : undefined,
      pageSize: searchParams.get("pageSize") ? Number(searchParams.get("pageSize")) : undefined,
    });

    let pagination: { page: number; pageSize: number };
    if (paginationResult.success) {
      pagination = paginationResult.data;
    } else {
      logger.warn(
        {
          errors: paginationResult.error.flatten(),
          rawPage: searchParams.get("page"),
          rawPageSize: searchParams.get("pageSize"),
        },
        "projects.list_invalid_pagination",
      );
      pagination = { page: 1, pageSize: 20 };
    }

    logger.info({ userId: user.id, pagination }, "projects.list_started");

    const [projects, total] = await Promise.all([
      getProjectsByOwner(user.id),
      getProjectCount(user.id),
    ]);

    // Apply pagination in memory (for now - can optimize with DB pagination later)
    const start = (pagination.page - 1) * pagination.pageSize;
    const paginatedProjects = projects.slice(start, start + pagination.pageSize);

    logger.info({ userId: user.id, count: paginatedProjects.length }, "projects.list_completed");

    return NextResponse.json(createPaginatedResponse(paginatedProjects, total, pagination));
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/projects
 * Create a new project for the authenticated user.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const input = CreateProjectSchema.parse(body);

    logger.info({ userId: user.id, name: input.name }, "projects.create_started");

    const project = await createProject(input, user.id);

    logger.info({ userId: user.id, projectId: project.id }, "projects.create_completed");

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
