import { PaginatedMeta } from '../interfaces/paginated-response.interface';

export function calculatePaginationMeta(
  total: number,
  page: number,
  limit: number,
): PaginatedMeta {
  const totalPages = Math.ceil(total / limit);
  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

export function getPaginationOptions(page: number = 1, limit: number = 10) {
  const offset = (page - 1) * limit;
  return {
    limit,
    offset,
  };
}
