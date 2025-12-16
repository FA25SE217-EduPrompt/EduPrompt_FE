// src/types/prompt.api.ts
import { CreateTagRequest, TagResponse } from "./tag.api";

export type UploadedFile = {
    id: string;
    name: string;
    size: number;
    mimeType: string;
    url?: string;
    publicId?: string;
    uploadedAt?: string;
};

export type PromptAiModel = 'GPT_4O_MINI' | 'CLAUDE_3_5_SONNET' | 'GEMINI_2_5_FLASH';

export type AsyncJobStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

export type PromptFormModel = {
    title: string;
    description?: string;
    instruction: string;
    context?: string;
    inputExample?: string;
    outputFormat?: string;
    constraints?: string;
    visibility: "private" | "group" | "public";
    collection?: string;
    tags: CreateTagRequest[];
    attachments: UploadedFile[];
};

export type PromptCreateRequest = {
    title: string;
    description?: string;
    instruction: string;
    context?: string;
    inputExample?: string;
    outputFormat?: string;
    constraints?: string;
    visibility: "private" | "group" | "public";
    tagIds: string[];
};

export type PromptCreateWithCollectionRequest = {
    title: string;
    description?: string;
    instruction: string;
    context?: string;
    inputExample?: string;
    outputFormat?: string;
    constraints?: string;
    visibility: "private" | "group" | "public";
    collectionId: string;
    tagIds: string[];
};

export type PromptResponse = {
    id: string;
    title: string;
    description?: string;
    instruction: string;
    context?: string;
    inputExample?: string;
    outputFormat?: string;
    constraints?: string;
    visibility: "private" | "group" | "public";
    collectionName?: string;
    fullName?: string;
    tags: TagResponse[];
    // attachments: UploadedFile[];
    ownerName?: string;
    createdAt: string;
    updatedAt?: string;
    isDeleted?: boolean;
    averageRating?: number;
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    ownerId?: string;
};

export type PromptTestRequest = {
    promptId: string;
    aiModel: PromptAiModel;
    inputText?: string;
    temperature?: number;
    maxTokens?: number;
    topP?: number;
};

export type PromptTestResponse = {
    id: string;
    promptId: string;
    aiModel: PromptAiModel;
    inputText?: string;
    output: string | null;
    tokensUsed: number;
    executionTimeMs: number;
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    status: AsyncJobStatus;
    errorMessage?: string | null;
    createdAt: string;
};

export type OptimizationQueueEntry = {
    id: string;
    promptId: string;
    status: AsyncJobStatus;
    output?: string | null;
    errorMessage?: string | null;
    retryCount: number;
    maxRetries: number;
    createdAt: string;
    updatedAt?: string;
};

export type PromptOptimizationRequest = {
    promptId: string;
    aiModel: PromptAiModel;
    optimizationInput: string;
    temperature?: number;
    maxTokens?: number;
};

export type PendingOptimizationItem = {
    id: string;
    promptId: string;
    status: 'PENDING' | 'PROCESSING';
    output?: string | null;
    createdAt: string;
    updatedAt?: string;
};

export type ApiRequestOptions = {
    idempotencyKey?: string;
    requestId?: string;
    signal?: AbortSignal;
};

export type PromptMetadataResponse = {
    id: string;
    title: string;
    description?: string;
    outputFormat?: string;
    visibility: "private" | "group" | "public";
    fullName?: string;
    collectionName?: string;
    createdAt: string;
    updatedAt?: string;
    averageRating?: number;
    ownerId?: string;
};

export type PromptViewLogResponse = {
    id: string;
    userId: string;
    promptId: string;
    createdAt: string;
};

export type PromptFilterParams = {
    createdBy?: string;
    collectionName?: string;
    tagTypes?: string[];
    tagValues?: string[];
    schoolName?: string;
    groupName?: string;
    title?: string;
    includeDeleted?: boolean;
    page?: number;
    size?: number;
};

export type SemanticSearchRequest = {
    query: string;
    limit?: number;
    context?: {
        tags?: string[];
        currentPrompt?: string;
        visibility?: string;
        schoolId?: string;
        groupId?: string;
    };
    username?: string;
    userId?: string;
};

export type SemanticSearchResult = {
    promptId: string;
    title: string;
    description: string;
    relevanceScore: number;
    matchedSnippet: string;
    reasoning: string;
    visibility: string;
    createdBy: string;
    createdByName: string;
    averageRating?: number;
    ownerId?: string;
};

export type SemanticSearchResponse = {
    results: SemanticSearchResult[];
    totalFound: number;
    searchId: string;
    executionTimeMs: number;
};

export type CreatePromptVersionRequest = {
    instruction: string;
    context?: string;
    inputExample?: string;
    outputFormat?: string;
    constraints?: string;
    isAiGenerated: boolean;
};

export type PromptVersionResponse = {
    id: string;
    promptId: string;
    instruction: string;
    context?: string;
    inputExample?: string;
    outputFormat?: string;
    constraints?: string;
    editorId: string;
    versionNumber: number;
    isAiGenerated: boolean;
    createdAt: string;
};

export type UpdatePromptMetadataRequest = {
    title: string;
    description?: string;
    instruction?: string;
    context?: string;
    inputExample?: string;
    outputFormat?: string;
    constraints?: string;
    tagIds?: string[];
};

export type UpdatePromptVisibilityRequest = {
    visibility: "private" | "group" | "public" | "school";
    collectionId?: string;
};

export type PromptRatingCreateRequest = {
    promptId: string;
    rating: number;
};

export type PromptRatingResponse = {
    isDone: boolean;
};

export type PromptShareResponse = {
    id: string;
    title: string;
    description: string;
    instruction: string;
    context?: string;
    inputExample?: string;
    outputFormat?: string;
    constraints?: string;
    shareToken: string;
};