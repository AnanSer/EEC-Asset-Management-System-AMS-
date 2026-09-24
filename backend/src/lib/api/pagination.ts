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
  // Backward compatibility alias for legacy frontend consumers
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
}

/**
 * Builds standard pagination metadata from page, limit, and total count.
 */
export function buildPagination(
  page: number = 1,
  limit: number = 10,
  total: number = 0
): PaginationMeta {
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
