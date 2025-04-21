export interface PaginationResponse<T> {
  data: T[];
  totalPages: number;
  currentPage: number;
}
