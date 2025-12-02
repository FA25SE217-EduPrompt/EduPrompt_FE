// src/services/prompts.ts
import { apiClient } from '@/services/auth'; // uses existing apiClient with interceptors
import { BaseResponse, PaginatedResponse } from '@/types/api';
import ApiCall from '@/utils/apiCall';
import {
    ApiRequestOptions,
    OptimizationQueueEntry,
    PendingOptimizationItem,
    PromptCreateRequest,
    PromptCreateWithCollectionRequest,
    PromptFilterParams,
    PromptMetadataResponse,
    PromptOptimizationRequest,
    PromptResponse,
    PromptTestRequest,
    PromptTestResponse,
    PromptViewLogResponse,
    PromptVersionResponse,
    CreatePromptVersionRequest,
    UpdatePromptMetadataRequest,
    UpdatePromptVisibilityRequest,
    PromptRatingCreateRequest,
    PromptRatingResponse,
    PromptShareResponse,
} from '@/types/prompt.api';

const BASE = "/api/prompts";

// Helper to attach optional headers (idempotency, request id) to axios config
export function buildRequestConfig(opts?: ApiRequestOptions): {
    headers?: Record<string, string>;
    signal?: AbortSignal
} {
    const headers: Record<string, string> = {};
    if (opts?.idempotencyKey) headers['X-Idempotency-Key'] = opts.idempotencyKey;
    if (opts?.requestId) headers['X-Request-Id'] = opts.requestId;
    return {
        headers: Object.keys(headers).length ? headers : undefined,
        signal: opts?.signal,
    };
}

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

function toPromptTestPayload(request: PromptTestRequest) {
    const payload: Record<string, unknown> = { promptId: request.promptId };
    if (request.aiModel) payload.aiModel = request.aiModel;
    if (request.inputText) payload.inputText = request.inputText;
    if (typeof request.temperature !== 'undefined') payload.temperature = request.temperature;
    if (typeof request.maxTokens !== 'undefined') payload.maxTokens = request.maxTokens;
    if (typeof request.topP !== 'undefined') payload.topP = request.topP;
    return payload;
}

function toPromptOptimizationPayload(request: PromptOptimizationRequest) {
    const payload: Record<string, unknown> = {
        promptId: request.promptId,
        aiModel: request.aiModel,
        optimizationInput: request.optimizationInput,
    };
    if (typeof request.temperature !== 'undefined') payload.temperature = request.temperature;
    if (typeof request.maxTokens !== 'undefined') payload.maxTokens = request.maxTokens;
    return payload;
}

/* ----------------------------
   Service methods
   ---------------------------- */

export const promptsService = {
    async createPrompt(payload: PromptCreateRequest, opts?: ApiRequestOptions): Promise<BaseResponse<PromptResponse>> {
        const url = `${BASE}/standalone`;
        const method = 'post';
        return ApiCall<PromptResponse>(() =>
            apiClient.request({
                url,
                method,
                data: payload,
                ...buildRequestConfig(opts),
            })
        );
    },

    async createPromptWithCollection(
        payload: PromptCreateWithCollectionRequest,
        opts?: ApiRequestOptions,
    ): Promise<BaseResponse<PromptResponse>> {
        const url = `${BASE}/collection`;
        const method = 'post';
        return ApiCall<PromptResponse>(() =>
            apiClient.request({
                url,
                method,
                data: payload,
                ...buildRequestConfig(opts),
            }),
        );
    },

    // Get prompt by id
    async getPrompt(promptId: string, opts?: ApiRequestOptions): Promise<BaseResponse<PromptResponse>> {
        return ApiCall<PromptResponse>(() =>
            apiClient.request({
                url: `${BASE}/${encodeURIComponent(promptId)}`,
                method: 'get',
                ...buildRequestConfig(opts),
            })
        );
    },

    // Run prompt test
    async runTest(request: PromptTestRequest, opts?: ApiRequestOptions): Promise<BaseResponse<PromptTestResponse>> {
        return ApiCall<PromptTestResponse>(() =>
            apiClient.request({
                url: `${BASE}/test`,
                method: 'post',
                data: toPromptTestPayload(request),
                ...buildRequestConfig(opts),
            })
        );
    },

    // Get test usage by ID
    async getTestUsage(usageId: string, opts?: ApiRequestOptions): Promise<BaseResponse<PromptTestResponse>> {
        return ApiCall<PromptTestResponse>(() =>
            apiClient.request({
                url: `${BASE}/test/usage/${encodeURIComponent(usageId)}`,
                method: 'get',
                ...buildRequestConfig(opts),
            })
        );
    },

    // Get test results by prompt
    async getTestsByPrompt(promptId: string, opts?: ApiRequestOptions): Promise<BaseResponse<PromptTestResponse[]>> {
        return ApiCall<PromptTestResponse[]>(() =>
            apiClient.request({
                url: `${BASE}/test/prompt/${encodeURIComponent(promptId)}`,
                method: 'get',
                ...buildRequestConfig(opts),
            })
        );
    },

    // Get user test history (paginated)
    async getUserTestHistory(page = 0, size = 20, opts?: ApiRequestOptions): Promise<BaseResponse<PaginatedResponse<PromptTestResponse>>> {
        return ApiCall<PaginatedResponse<PromptTestResponse>>(() =>
            apiClient.request({
                url: `${BASE}/test/history?page=${page}&size=${size}`,
                method: 'get',
                ...buildRequestConfig(opts),
            })
        );
    },

    // Get prompt test history (paginated)
    async getPromptTestHistory(promptId: string, page = 0, size = 20, opts?: ApiRequestOptions): Promise<BaseResponse<PaginatedResponse<PromptTestResponse>>> {
        return ApiCall<PaginatedResponse<PromptTestResponse>>(() =>
            apiClient.request({
                url: `${BASE}/test/prompt/${encodeURIComponent(promptId)}/history?page=${page}&size=${size}`,
                method: 'get',
                ...buildRequestConfig(opts),
            })
        );
    },

    // Delete test result
    async deleteTestResult(usageId: string, opts?: ApiRequestOptions): Promise<BaseResponse<string>> {
        return ApiCall<string>(() =>
            apiClient.request({
                url: `${BASE}/test/usage/${encodeURIComponent(usageId)}`,
                method: 'delete',
                ...buildRequestConfig(opts),
            })
        );
    },

    // Request optimization (async)
    async requestOptimization(request: PromptOptimizationRequest, opts?: ApiRequestOptions): Promise<BaseResponse<OptimizationQueueEntry>> {
        return ApiCall<OptimizationQueueEntry>(() =>
            apiClient.request({
                url: `${BASE}/optimize`,
                method: 'post',
                data: toPromptOptimizationPayload(request),
                ...buildRequestConfig(opts),
            })
        );
    },

    // Get optimization status (polling)
    async getOptimizationStatus(queueId: string, opts?: ApiRequestOptions): Promise<BaseResponse<OptimizationQueueEntry>> {
        return ApiCall<OptimizationQueueEntry>(() =>
            apiClient.request({
                url: `${BASE}/optimize/queue/${encodeURIComponent(queueId)}`,
                method: 'get',
                ...buildRequestConfig(opts),
            })
        );
    },

    // Get user optimization history (paginated)
    async getUserOptimizationHistory(page = 0, size = 20, opts?: ApiRequestOptions): Promise<BaseResponse<PaginatedResponse<OptimizationQueueEntry>>> {
        return ApiCall<PaginatedResponse<OptimizationQueueEntry>>(() =>
            apiClient.request({
                url: `${BASE}/optimize/history?page=${page}&size=${size}`,
                method: 'get',
                ...buildRequestConfig(opts),
            })
        );
    },

    // Get prompt optimization history (paginated)
    async getPromptOptimizationHistory(promptId: string, page = 0, size = 20, opts?: ApiRequestOptions): Promise<BaseResponse<PaginatedResponse<OptimizationQueueEntry>>> {
        return ApiCall<PaginatedResponse<OptimizationQueueEntry>>(() =>
            apiClient.request({
                url: `${BASE}/optimize/prompt/${encodeURIComponent(promptId)}/history?page=${page}&size=${size}`,
                method: 'get',
                ...buildRequestConfig(opts),
            })
        );
    },

    // Get pending optimizations
    async getPendingOptimizations(opts?: ApiRequestOptions): Promise<BaseResponse<PendingOptimizationItem[]>> {
        return ApiCall<PendingOptimizationItem[]>(() =>
            apiClient.request({
                url: `${BASE}/optimize/pending`,
                method: 'get',
                ...buildRequestConfig(opts),
            })
        );
    },

    // Retry failed optimization
    async retryOptimization(queueId: string, opts?: ApiRequestOptions): Promise<BaseResponse<OptimizationQueueEntry>> {
        return ApiCall<OptimizationQueueEntry>(() =>
            apiClient.request({
                url: `${BASE}/optimize/queue/${encodeURIComponent(queueId)}/retry`,
                method: 'post',
                ...buildRequestConfig(opts),
            })
        );
    },

    // Cancel / delete optimization
    async cancelOptimization(queueId: string, opts?: ApiRequestOptions): Promise<BaseResponse<string>> {
        return ApiCall<string>(() =>
            apiClient.request({
                url: `${BASE}/optimize/queue/${encodeURIComponent(queueId)}`,
                method: 'delete',
                ...buildRequestConfig(opts),
            })
        );
    },

    // Get non-private prompts
    async getNonPrivatePrompts(page = 0, size = 20, opts?: ApiRequestOptions): Promise<BaseResponse<PaginatedResponse<PromptMetadataResponse>>> {
        return ApiCall<PaginatedResponse<PromptMetadataResponse>>(() =>
            apiClient.request({
                url: `${BASE}/get-non-private?page=${page}&size=${size}`,
                method: 'get',
                ...buildRequestConfig(opts),
            })
        );
    },

    // Filter prompts
    async filterPrompts(params: PromptFilterParams, opts?: ApiRequestOptions): Promise<BaseResponse<PaginatedResponse<PromptMetadataResponse>>> {
        const queryParams = new URLSearchParams();
        if (params.createdBy) queryParams.append('createdBy', params.createdBy);
        if (params.collectionName) queryParams.append('collectionName', params.collectionName);
        if (params.schoolName) queryParams.append('schoolName', params.schoolName);
        if (params.groupName) queryParams.append('groupName', params.groupName);
        if (params.title) queryParams.append('title', params.title);
        if (params.includeDeleted !== undefined) queryParams.append('includeDeleted', String(params.includeDeleted));
        if (params.page !== undefined) queryParams.append('page', String(params.page));
        if (params.size !== undefined) queryParams.append('size', String(params.size));

        // Handle arrays
        if (params.tagTypes) params.tagTypes.forEach(t => queryParams.append('tagTypes', t));
        if (params.tagValues) params.tagValues.forEach(v => queryParams.append('tagValues', v));

        return ApiCall<PaginatedResponse<PromptMetadataResponse>>(() =>
            apiClient.request({
                url: `${BASE}/filter?${queryParams.toString()}`,
                method: 'get',
                ...buildRequestConfig(opts),
            })
        );
    },

    // Log prompt view (unlock)
    async logPromptView(promptId: string, opts?: ApiRequestOptions): Promise<BaseResponse<PromptViewLogResponse>> {
        return ApiCall<PromptViewLogResponse>(() =>
            apiClient.request({
                url: `${BASE}/prompt-view-log/new`,
                method: 'post',
                data: { promptId },
                ...buildRequestConfig(opts),
            })
        );
    },

    // Check if prompt is viewed/unlocked
    async checkPromptViewed(promptId: string, opts?: ApiRequestOptions): Promise<BaseResponse<boolean>> {
        return ApiCall<boolean>(() =>
            apiClient.request({
                url: `${BASE}/${encodeURIComponent(promptId)}/viewed`,
                method: 'get',
                ...buildRequestConfig(opts),
            })
        );
    },

    // Get prompt versions
    async getPromptVersions(promptId: string, opts?: ApiRequestOptions): Promise<BaseResponse<PromptVersionResponse[]>> {
        return ApiCall<PromptVersionResponse[]>(() =>
            apiClient.request({
                url: `${BASE}/${encodeURIComponent(promptId)}/versions`,
                method: 'get',
                ...buildRequestConfig(opts),
            })
        );
    },

    // Create prompt version
    async createPromptVersion(promptId: string, payload: CreatePromptVersionRequest, opts?: ApiRequestOptions): Promise<BaseResponse<PromptVersionResponse>> {
        return ApiCall<PromptVersionResponse>(() =>
            apiClient.request({
                url: `${BASE}/${encodeURIComponent(promptId)}/versions`,
                method: 'post',
                data: payload,
                ...buildRequestConfig(opts),
            })
        );
    },

    // Update prompt metadata
    async updatePromptMetadata(promptId: string, payload: UpdatePromptMetadataRequest, opts?: ApiRequestOptions): Promise<BaseResponse<PromptResponse>> {
        return ApiCall<PromptResponse>(() =>
            apiClient.request({
                url: `${BASE}/${encodeURIComponent(promptId)}/metadata`,
                method: 'put',
                data: payload,
                ...buildRequestConfig(opts),
            })
        );
    },

    // Update prompt visibility
    async updatePromptVisibility(promptId: string, payload: UpdatePromptVisibilityRequest, opts?: ApiRequestOptions): Promise<BaseResponse<PromptResponse>> {
        return ApiCall<PromptResponse>(() =>
            apiClient.request({
                url: `${BASE}/${encodeURIComponent(promptId)}/visibility`,
                method: 'put',
                data: payload,
                ...buildRequestConfig(opts),
            })
        );
    },

    // Rollback prompt version
    async rollbackPromptVersion(promptId: string, versionId: string, opts?: ApiRequestOptions): Promise<BaseResponse<PromptResponse>> {
        return ApiCall<PromptResponse>(() =>
            apiClient.request({
                url: `${BASE}/${encodeURIComponent(promptId)}/rollback/${encodeURIComponent(versionId)}`,
                method: 'put',
                ...buildRequestConfig(opts),
            })
        );
    },

    // Rate prompt
    async ratePrompt(payload: PromptRatingCreateRequest, opts?: ApiRequestOptions): Promise<BaseResponse<PromptRatingResponse>> {
        return ApiCall<PromptRatingResponse>(() =>
            apiClient.request({
                url: `${BASE}/ratings`,
                method: 'post',
                data: payload,
                ...buildRequestConfig(opts),
            })
        );
    },

    // Share prompt
    async sharePrompt(promptId: string, opts?: ApiRequestOptions): Promise<BaseResponse<string>> {
        return ApiCall<string>(() =>
            apiClient.request({
                url: `/api/prompts-share/${encodeURIComponent(promptId)}`,
                method: 'post',
                ...buildRequestConfig(opts),
            })
        );
    },

    // Revoke share
    async revokeSharePrompt(promptId: string, opts?: ApiRequestOptions): Promise<BaseResponse<void>> {
        return ApiCall<void>(() =>
            apiClient.request({
                url: `/api/prompts-share/revoke-share/${encodeURIComponent(promptId)}`,
                method: 'post',
                ...buildRequestConfig(opts),
            })
        );
    },

    // Get Shared Prompt (Public Access)
    async getSharedPrompt(promptId: string, token: string, opts?: ApiRequestOptions): Promise<BaseResponse<PromptShareResponse>> {
        return ApiCall<PromptShareResponse>(() =>
            apiClient.request({
                url: `/api/prompts-share/shared/${encodeURIComponent(promptId)}?token=${encodeURIComponent(token)}`,
                method: 'get',
                ...buildRequestConfig(opts),
            })
        );
    },
};

export default promptsService;
