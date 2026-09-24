/**
 * Standard API Response Helpers — EEC EAMS (Phase 10A.3)
 *
 * Provides uniform JSON structure for all API endpoints across the system.
 */

import { PaginationMeta } from './pagination';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
  meta?: any;
  timestamp: string;
}

/**
 * Standard successful response (200 OK)
 */
export function successResponse<T>(
  data: T,
  meta?: any,
  message: string = 'Operation successful'
): ApiResponse<T> {
  return {
    success: true,
    message,
    data,
    meta: meta ?? null,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Standard resource creation response (201 Created)
 */
export function createdResponse<T>(
  data: T,
  meta?: any,
  message: string = 'Resource created successfully'
): ApiResponse<T> {
  return {
    success: true,
    message,
    data,
    meta: meta ?? null,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Standard error response (4xx, 5xx)
 */
export function errorResponse(
  message: string = 'An error occurred',
  code?: string | number,
  details?: any
): ApiResponse<null> {
  const meta =
    code !== undefined || details !== undefined
      ? {
          ...(code !== undefined ? { code } : {}),
          ...(details !== undefined ? { details } : {}),
        }
      : null;

  return {
    success: false,
    message,
    data: null,
    meta,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Standard paginated collection response
 */
export function paginatedResponse<T>(
  data: T[],
  pagination: PaginationMeta,
  message: string = 'Data retrieved successfully'
): ApiResponse<T[]> {
  return {
    success: true,
    message,
    data,
    meta: pagination,
    timestamp: new Date().toISOString(),
  };
}
