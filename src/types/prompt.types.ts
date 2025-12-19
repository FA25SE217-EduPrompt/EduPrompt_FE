// Prompt-related TypeScript types

export interface Prompt {
    id: string;
    userId: string | null;
    collectionId: string | null;
    title: string;
    description: string | null;
    instruction: string;
    context: string;
    inputExample: string;
    outputFormat: string;
    constraints: string;
    visibility: 'PUBLIC' | 'PRIVATE';
    createdBy: string;
    updatedBy: string;
    createdAt: string;
    updatedAt: string;
    isDeleted: boolean;
    deletedAt: string | null;
    currentVersionId: string | null;
    avgRating: number | null;
    geminiFileId: string | null;
    lastIndexedAt: string | null;
    indexingStatus: 'INDEXED' | 'PENDING' | null;
    tags: Tag[];
    shareToken: string | null;
}

export interface Tag {
    id: string;
    type: string;
    value: string;
}

export interface PromptsResponse {
    data: {
        content: Prompt[];
        totalElements: number;
        totalPages: number;
        pageNumber: number;
        pageSize: number;
    };
    error: null | string;
}

export interface CreatePromptRequest {
    title: string;
    description?: string;
    instruction: string;
    context: string;
    inputExample: string;
    outputFormat: string;
    constraints: string;
    visibility: 'PUBLIC' | 'PRIVATE';
}

export interface UpdatePromptRequest {
    title?: string;
    description?: string;
    instruction?: string;
    context?: string;
    inputExample?: string;
    outputFormat?: string;
    constraints?: string;
    visibility?: 'PUBLIC' | 'PRIVATE';
}
