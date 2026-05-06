import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export type ApiErrorType =
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'API_ERROR'
  | 'TIMEOUT'
  | 'INTERNAL_ERROR';

export interface ApiError {
  type: ApiErrorType;
  message: string;
  details?: Record<string, string[]>;
}

export function logRequest(method: string, path: string, query?: Record<string, unknown>) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${method} ${path}`, query ? JSON.stringify(query) : '');
}

export function logError(error: unknown, context?: string) {
  const timestamp = new Date().toISOString();
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[${timestamp}] ${context || 'Error'}: ${message}`);
}

export function createValidationError(error: ZodError): ApiError {
  const details: Record<string, string[]> = {};

  error.errors.forEach((err) => {
    const key = err.path.join('.');
    if (!details[key]) {
      details[key] = [];
    }
    details[key].push(err.message);
  });

  return {
    type: 'VALIDATION_ERROR',
    message: 'Invalid request parameters',
    details,
  };
}

export function createErrorResponse(error: ApiError, status: number = 400) {
  return NextResponse.json(
    {
      error: error.message,
      type: error.type,
      ...(error.details && { details: error.details }),
    },
    { status }
  );
}

export function createSuccessResponse<T>(data: T, status: number = 200) {
  return NextResponse.json(data, { status });
}

export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = 10000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeoutMs}ms`);
    }
    throw error;
  }
}
