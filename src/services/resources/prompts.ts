// src/services/prompts.ts
import {apiClient} from '@/services/auth'; // uses existing apiClient with interceptors
import {BaseResponse, PaginatedResponse} from '@/types/api';
import ApiCall from '@/utils/apiCall';
import {
    ApiRequestOptions,
    OptimizationQueueEntry,
    PendingOptimizationItem,
    PromptCreateRequest,
    PromptFormModel,
    PromptOptimizationRequest,
    PromptResponse,
    PromptTestRequest,
    PromptTestResponse,
} from '@/types/prompt.api';

const BASE = "/api/prompts";

// Helper to attach optional headers (idempotency, request id) to axios config
function buildRequestConfig(opts?: ApiRequestOptions): { headers?: Record<string, string>; signal?: AbortSignal } {
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

/**
 * map from prompt form to prompt request , need to manually handle tags creation
 * @param form
 */
function formToRequest(form: PromptFormModel): Partial<PromptCreateRequest> {
    return {
        title: form.title,
        description: form.description,
        instruction: form.instruction,
        context: form.context,
        inputExample: form.inputExample,
        outputFormat: form.outputFormat,
        constraints: form.constraints,
        visibility: form.visibility,
        collection: form.collection
    };
}

function toPromptTestPayload(request: PromptTestRequest) {
    const payload: Record<string, unknown> = {promptId: request.promptId};
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
};

export default promptsService;
