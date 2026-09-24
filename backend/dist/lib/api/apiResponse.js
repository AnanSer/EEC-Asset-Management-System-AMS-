"use strict";
/**
 * Standard API Response Helpers — EEC EAMS (Phase 10A.3)
 *
 * Provides uniform JSON structure for all API endpoints across the system.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.successResponse = successResponse;
exports.createdResponse = createdResponse;
exports.errorResponse = errorResponse;
exports.paginatedResponse = paginatedResponse;
/**
 * Standard successful response (200 OK)
 */
function successResponse(data, meta, message = 'Operation successful') {
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
function createdResponse(data, meta, message = 'Resource created successfully') {
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
function errorResponse(message = 'An error occurred', code, details) {
    const meta = code !== undefined || details !== undefined
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
function paginatedResponse(data, pagination, message = 'Data retrieved successfully') {
    return {
        success: true,
        message,
        data,
        meta: pagination,
        timestamp: new Date().toISOString(),
    };
}
//# sourceMappingURL=apiResponse.js.map