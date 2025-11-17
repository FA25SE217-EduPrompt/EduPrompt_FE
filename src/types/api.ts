//default response type for the api
export type ErrorPayload = {
    code: string;
    messages: string[];
    status: string;
};

export type BaseResponse<T = unknown> = {
    data: T | null;
    error: ErrorPayload | null;
};

/**
 * Generic paginated response (matches doc)
 */
export type PaginationMeta = {
    pageNumber: number;
    pageSize: number;
    sort?: {
        sorted: boolean;
        unsorted: boolean;
    };
};

export type PaginatedResponse<T> = {
    content: T[];
    pageable?: PaginationMeta;
    totalElements: number;
    totalPages: number;
    last: boolean;
    first: boolean;
    numberOfElements?: number;
};

export type SimplePage<T> = {
    content: T[];
    total: number;
    page: number;
    size: number;
};
  