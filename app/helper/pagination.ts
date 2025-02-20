interface PaginatedResponse<T> {
  records: T;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
}

export function paginateResponse<T>({
  records,
  total,
  page,
  limit,
}: {
  records: T;
  total: number;
  page: number;
  limit: number;
}): PaginatedResponse<T> {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;

  return {
    records,
    total,
    page,
    limit,
    totalPages,
    hasNextPage,
  };
}
