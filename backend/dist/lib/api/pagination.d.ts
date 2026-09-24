/**
 * Pagination Helper — EEC EAMS (Phase 10A.3)
 *
 * Centralized pagination structure and builder function.
 */
export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
    hasNextPage?: boolean;
    hasPrevPage?: boolean;
}
/**
 * Builds standard pagination metadata from page, limit, and total count.
 */
export declare function buildPagination(page?: number, limit?: number, total?: number): PaginationMeta;
//# sourceMappingURL=pagination.d.ts.map