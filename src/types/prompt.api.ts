// src/types/prompt.api.ts
import {BaseResponse} from "@/types/api";
import {CreateTagRequest, TagResponse} from "./tag.api";


export type UploadedFile = {
    id: string;
    name: string;
    size: number;
    mimeType: string;
    url?: string;
    publicId?: string;
    uploadedAt?: string;
};

/**
 * AI model identifiers supported by the Prompt Testing API
 */
export type PromptAiModel = 'GPT_4O_MINI' | 'CLAUDE_3_5_SONNET' | 'GEMINI_2_5_FLASH';

export type AsyncJobStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

// {
//     "title": "string",
//     "description": "string",
//     "instruction": "string",
//     "context": "string",
//     "inputExample": "string",
//     "outputFormat": "string",
//     "constraints": "string",
//     "visibility": "string",
//     "tagIds": [
//     "3fa85f64-5717-4562-b3fc-2c963f66afa6"
// ]
// }

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
    collection?: string;
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
    tags: TagResponse[];
    // attachments: UploadedFile[];
    ownerName?: string;
    createdAt: string;
    updatedAt?: string;
    isDeleted?: boolean;
};

/**
 * Prompt test request payload (sent to `/prompts/test`)
 */
export type PromptTestRequest = {
    promptId: string;
    aiModel?: PromptAiModel;
    inputText?: string;
    temperature?: number;
    maxTokens?: number;
    topP?: number;
};

/**
 * Prompt test synchronous response
 */
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

/**
 * Optimization queue entry (async)
 */
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

/**
 * Optimization request payload (sent to `/prompts/optimize`)
 */
export type PromptOptimizationRequest = {
    promptId: string;
    optimizationInput: string;
    temperature?: number;
    maxTokens?: number;
};


// Pending optimization summary (matches "Get Pending Optimizations" response items)
export type PendingOptimizationItem = {
    id: string;
    promptId: string;
    status: 'PENDING' | 'PROCESSING';
    output?: string | null;
    createdAt: string;
    updatedAt?: string;
};

// Api request options for headers (idempotency & tracing)
export type ApiRequestOptions = {
    idempotencyKey?: string;
    requestId?: string;
    signal?: AbortSignal;
};

// Re-export BaseResponse for convenience (not adding fields)
export type ApiBaseResponse<T> = BaseResponse<T>;