/**
 * Pagination helper — extracts page/limit from query and returns
 * the mongoose skip/limit plus metadata for the response.
 */
export interface PaginationResult {
  page: number;
  limit: number;
  skip: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export const getPagination = (query: Record<string, unknown>): PaginationResult => {
  const page = Math.max(1, parseInt(String(query.page || '1'), 10));
  const limit = Math.min(50, Math.max(1, parseInt(String(query.limit || '10'), 10)));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

export const buildPaginationMeta = (
  total: number,
  page: number,
  limit: number
): PaginationMeta => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit),
  hasNextPage: page < Math.ceil(total / limit),
  hasPrevPage: page > 1,
});

/**
 * Success response helper
 */
export const successResponse = <T>(
  data: T,
  message = 'Success',
  meta?: PaginationMeta
) => ({
  success: true,
  message,
  data,
  ...(meta && { meta }),
});

/**
 * Generate a URL-friendly slug from a string
 */
export const slugify = (text: string): string =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
