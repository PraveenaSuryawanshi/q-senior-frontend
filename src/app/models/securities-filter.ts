export interface PagingFilter {
  skip?: number;
  limit?: number;
}

export interface SecuritiesFilter extends PagingFilter {
  name?: string;
  type?: string[];
  currency?: string[];
  isPrivate?: boolean;
}
