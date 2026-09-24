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
export declare function successResponse<T>(data: T, meta?: any, message?: string): ApiResponse<T>;
/**
 * Standard resource creation response (201 Created)
 */
export declare function createdResponse<T>(data: T, meta?: any, message?: string): ApiResponse<T>;
/**
 * Standard error response (4xx, 5xx)
 */
export declare function errorResponse(message?: string, code?: string | number, details?: any): ApiResponse<null>;
/**
 * Standard paginated collection response
 */
export declare function paginatedResponse<T>(data: T[], pagination: PaginationMeta, message?: string): ApiResponse<T[]>;
//# sourceMappingURL=apiResponse.d.ts.map