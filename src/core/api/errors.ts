import { NextResponse } from "next/server";
import { ZodError } from "zod/v4";

import { getLogger } from "@/core/logging";
import { ProjectError } from "@/features/projects";
import { createErrorResponse, type ErrorResponse } from "@/shared/schemas/errors";

const logger = getLogger("api.errors");

/**
 * Valid HTTP status codes for API errors.
 */
export type HttpStatusCode = 400 | 401 | 403 | 404 | 409 | 500;

/**
 * Shape of errors that carry HTTP semantics.
 * Used for type narrowing in error handlers.
 */
interface HttpError {
  message: string;
  code: string;
  statusCode: HttpStatusCode;
}

const VALID_STATUS_CODES = new Set<HttpStatusCode>([400, 401, 403, 404, 409, 500]);

/**
 * Check if an error has HTTP error properties.
 */
function isHttpError(error: unknown): error is HttpError {
  if (!(error instanceof Error)) {
    return false;
  }
  if (!("code" in error) || !("statusCode" in error)) {
    return false;
  }

  const { code, statusCode } = error as { code: unknown; statusCode: unknown };
  return typeof code === "string" && VALID_STATUS_CODES.has(statusCode as HttpStatusCode);
}

/**
 * Format Zod validation errors into a details object.
 */
function formatZodErrors(error: ZodError): Record<string, unknown> {
  const fieldErrors: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const path = issue.path.join(".") || "root";
    if (!fieldErrors[path]) {
      fieldErrors[path] = [];
    }
    fieldErrors[path].push(issue.message);
  }

  return { fields: fieldErrors };
}

/**
 * Handle API errors and return appropriate NextResponse.
 * Maps known error types to HTTP status codes and logs errors.
 */
export function handleApiError(error: unknown): NextResponse<ErrorResponse> {
  // Handle Zod validation errors
  if (error instanceof ZodError) {
    logger.warn({ error: error.message }, "api.validation_failed");
    return NextResponse.json(
      createErrorResponse("Validation failed", "VALIDATION_ERROR", formatZodErrors(error)),
      { status: 400 },
    );
  }

  // Handle feature errors (ProjectError, etc.)
  if (isHttpError(error)) {
    const level = error.statusCode >= 500 ? "error" : "warn";
    logger[level]({ error: error.message, code: error.code }, "api.error");
    return NextResponse.json(createErrorResponse(error.message, error.code), {
      status: error.statusCode,
    });
  }

  // Handle unknown errors
  const message = error instanceof Error ? error.message : "Unknown error";
  logger.error({ error: message }, "api.internal_error");
  return NextResponse.json(createErrorResponse("Internal server error", "INTERNAL_ERROR"), {
    status: 500,
  });
}

/**
 * Create a 401 Unauthorized response.
 */
export function unauthorizedResponse(): NextResponse<ErrorResponse> {
  return NextResponse.json(createErrorResponse("Authentication required", "UNAUTHORIZED"), {
    status: 401,
  });
}

// Re-export ProjectError for type checking in other modules
export { ProjectError };
