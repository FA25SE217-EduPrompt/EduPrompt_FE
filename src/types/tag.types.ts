// Tag-related TypeScript types

export interface Tag {
    id: string;
    type: string;  // e.g., "subject", "grade", "category", "khối", "môn"
    value: string; // e.g., "math", "10", "coding"
}

export interface TagsResponse {
    data: {
        content: Tag[];
        totalElements: number;
        totalPages: number;
        pageNumber: number;
        pageSize: number;
    };
    error: null | string;
}

export interface CreateTagRequest {
    type: string;
    value: string;
}

export interface UpdateTagRequest {
    type?: string;
    value?: string;
}
