import { logger } from "@/lib/logger";
import type { ActionResult, PaginatedResult } from "@/types";

export function isAuthError(error: unknown): boolean {
  return error instanceof Error && error.message.startsWith("Unauthorized");
}

export function emptyPaginated<T>(page = 1, pageSize = 10): PaginatedResult<T> {
  return { data: [], total: 0, page, pageSize, totalPages: 0 };
}

export function logActionError(action: string, error: unknown): void {
  logger.error(`Server action failed: ${action}`, error);
}

export function toMutationError<T = void>(action: string, error: unknown): ActionResult<T> {
  if (isAuthError(error)) {
    return { success: false, error: "You don't have permission to perform this action." };
  }
  logActionError(action, error);
  return { success: false, error: "Something went wrong. Please try again." };
}

export async function runLoggedMutation<T = void>(
  action: string,
  handler: () => Promise<ActionResult<T>>
): Promise<ActionResult<T>> {
  try {
    return await handler();
  } catch (error) {
    return toMutationError<T>(action, error);
  }
}

export async function runLoggedQuery<T>(
  action: string,
  handler: () => Promise<T>,
  fallback: T
): Promise<T> {
  try {
    return await handler();
  } catch (error) {
    if (isAuthError(error)) {
      throw error;
    }
    logActionError(action, error);
    return fallback;
  }
}

export async function runLogged<T>(action: string, handler: () => Promise<T>): Promise<T> {
  try {
    return await handler();
  } catch (error) {
    if (isAuthError(error)) {
      throw error;
    }
    logActionError(action, error);
    throw error;
  }
}
