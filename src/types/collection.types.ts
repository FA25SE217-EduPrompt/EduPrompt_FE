// Collection types
export interface CollectionTag {
    id: string;
    type: string;
    value: string;
}

export interface Collection {
    id: string;
    name: string;
    description: string | null;
    visibility: 'PUBLIC' | 'PRIVATE' | 'GROUP';
    tags: CollectionTag[];
    createdAt: string;
}

export interface CollectionsResponse {
    content: Collection[];
    totalElements: number;
    totalPages: number;
    pageNumber: number;
    pageSize: number;
}

export interface CreateCollectionRequest {
    name: string;
    description?: string;
    visibility: 'PUBLIC' | 'PRIVATE' | 'GROUP' | 'public' | 'private' | 'group';
    tagIds?: string[];
    groupId?: string;
}

export interface UpdateCollectionRequest {
    name?: string;
    description?: string;
    visibility?: 'PUBLIC' | 'PRIVATE' | 'GROUP';
    tagIds?: string[];
}
