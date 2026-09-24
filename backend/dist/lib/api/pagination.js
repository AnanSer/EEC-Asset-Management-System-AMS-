"use strict";
/**
 * Pagination Helper — EEC EAMS (Phase 10A.3)
 *
 * Centralized pagination structure and builder function.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildPagination = buildPagination;
/**
 * Builds standard pagination metadata from page, limit, and total count.
 */
function buildPagination(page = 1, limit = 10, total = 0) {
    const safePage = Math.max(1, Number(page) || 1);
    const safeLimit = Math.max(1, Number(limit) || 10);
    const totalPages = Math.ceil(total / safeLimit);
    const hasNext = safePage < totalPages;
    const hasPrevious = safePage > 1;
    return {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages,
        hasNext,
        hasPrevious,
        hasNextPage: hasNext,
        hasPrevPage: hasPrevious,
    };
}
//# sourceMappingURL=pagination.js.map