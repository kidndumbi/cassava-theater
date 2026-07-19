/**
 * A discriminated union type for consistent error handling across the application.
 * Instead of throwing errors or returning null, services should return Result<T>.
 *
 * Usage:
 *   function getVideo(id: string): Result<Video> {
 *     try { return success(video); }
 *     catch (error) { return failure("Failed to get video", error); }
 *   }
 *
 *   const result = getVideo("123");
 *   if (result.success) { console.log(result.data); }
 *   else { log.error(result.error.message, result.error.cause); }
 */
export type Result<T> = Success<T> | Failure;

export interface Success<T> {
  success: true;
  data: T;
}

export interface Failure {
  success: false;
  error: AppError;
}

export function success<T>(data: T): Success<T> {
  return { success: true, data };
}

export function failure(message: string, cause?: unknown): Failure {
  return { success: false, error: new AppError(message, cause) };
}

/**
 * Base application error that preserves the original error as `cause`.
 * This ensures stack traces are never lost when wrapping errors.
 */
export class AppError extends Error {
  public readonly cause: unknown;

  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = "AppError";
    this.cause = cause;

    // Preserve the original error's stack trace if available
    if (cause instanceof Error) {
      this.stack = `${this.stack}\nCaused by: ${cause.stack}`;
    }
  }
}

/** Check if a Result is a Success (type guard) */
export function isSuccess<T>(result: Result<T>): result is Success<T> {
  return result.success;
}

/** Check if a Result is a Failure (type guard) */
export function isFailure<T>(result: Result<T>): result is Failure {
  return !result.success;
}