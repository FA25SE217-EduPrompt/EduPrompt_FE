// hooks/queries/prompt.ts
import {keepPreviousData, useMutation, useQuery, useQueryClient, UseQueryOptions,} from '@tanstack/react-query';
import {promptsService} from '@/services/resources/prompts';
import {
    ApiRequestOptions,
    OptimizationQueueEntry,
    PromptCreateRequest,
    PromptCreateWithCollectionRequest,
    PromptOptimizationRequest,
    PromptTestRequest,
    PromptTestResponse,
} from '@/types/prompt.api';
import {BaseResponse} from "@/types/api";

/* ----------------------------
   Query Keys // i should move this to query.ts
   ---------------------------- */

export const promptKeys = {
    all: ['prompts'] as const,
    details: () => [...promptKeys.all, 'detail'] as const,
    detail: (id: string, opts?: ApiRequestOptions) => [...promptKeys.details(), id, opts] as const,

    tests: () => ['promptTests'] as const,
    testDetails: () => [...promptKeys.tests(), 'detail'] as const,
    testDetail: (id: string, opts?: ApiRequestOptions) => [...promptKeys.testDetails(), id, opts] as const,
    testsByPrompt: (id: string, opts?: ApiRequestOptions) => [...promptKeys.tests(), 'byPrompt', id, opts] as const,
    testHistoryUser: (page: number, size: number, opts?: ApiRequestOptions) => [...promptKeys.tests(), 'history', 'user', {
        page,
        size
    }, opts] as const,
    testHistoryPrompt: (id: string, page: number, size: number, opts?: ApiRequestOptions) => [...promptKeys.tests(), 'history', id, {
        page,
        size
    }, opts] as const,

    optimizations: () => ['optimizations'] as const,
    optimizationStatus: (id: string, opts?: ApiRequestOptions) => [...promptKeys.optimizations(), 'status', id, opts] as const,
    optimizationHistoryUser: (page: number, size: number, opts?: ApiRequestOptions) => [...promptKeys.optimizations(), 'history', 'user', {
        page,
        size
    }, opts] as const,
    optimizationHistoryPrompt: (id: string, page: number, size: number, opts?: ApiRequestOptions) => [...promptKeys.optimizations(), 'history', id, {
        page,
        size
    }, opts] as const,
    optimizationsPending: (opts?: ApiRequestOptions) => [...promptKeys.optimizations(), 'pending', opts] as const,
};

/* ----------------------------
   Prompt Queries & Mutations
   ---------------------------- */

/**
 * Mutation to create a new standalone prompt
 */
export const useCreatePrompt = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({payload, opts,}: {
            payload: PromptCreateRequest;
            opts?: ApiRequestOptions;
        }) => promptsService.createPrompt(payload, opts),
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: promptKeys.all});
        },
    });
};

/**
 * Mutation to create a new prompt with a collection ID
 */
export const useCreatePromptWithCollection = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({payload, opts,}: {
            payload: PromptCreateWithCollectionRequest;
            opts?: ApiRequestOptions;
        }) => promptsService.createPromptWithCollection(payload, opts),
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: promptKeys.all});
        },
    });
};

/**
 * Query to get a single prompt by its ID
 */
export const useGetPrompt = (promptId: string, opts?: ApiRequestOptions, queryOptions?: { enabled?: boolean }) => {
    return useQuery({
        queryKey: promptKeys.detail(promptId, opts),
        queryFn: () => promptsService.getPrompt(promptId, opts),
        enabled: !!promptId && queryOptions?.enabled !== false, // Don't run query if promptId is falsy
    });
};

/* ----------------------------
   Test Queries & Mutations
   ---------------------------- */

/**
 * Mutation to run a synchronous prompt test
 */
export const useRunPromptTest = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({request, opts}: { request: PromptTestRequest; opts?: ApiRequestOptions }) =>
            promptsService.runTest(request, opts),
        onSuccess: async (_data, variables) => {
            // Invalidate test histories for the user and this specific prompt
            await queryClient.invalidateQueries({queryKey: promptKeys.testHistoryUser(0, 0).slice(0, 3)}); // Invalidate all user history pages
            if (variables.request.promptId) {
                await queryClient.invalidateQueries({queryKey: promptKeys.testHistoryPrompt(variables.request.promptId, 0, 0).slice(0, 3)}); // Invalidate all prompt history pages
            }
        },
    });
};

type GetTestUsageQueryOptions = Omit<
    UseQueryOptions<
        BaseResponse<PromptTestResponse>,
        Error,
        BaseResponse<PromptTestResponse>,
        ReturnType<typeof promptKeys.testDetail>
    >,
    'queryKey' | 'queryFn'
>;

/**
 * Query to get a specific test usage result by its ID
 */
export const useGetTestUsage = (
    usageId: string,
    opts?: ApiRequestOptions,
    queryOptions?: GetTestUsageQueryOptions
) => {
    return useQuery({
        queryKey: promptKeys.testDetail(usageId, opts),
        queryFn: () => promptsService.getTestUsage(usageId, opts),

        enabled: queryOptions?.enabled !== false && !!usageId,
        ...queryOptions,
    });
};

/**
 * Query to get all test results for a specific prompt (non-paginated)
 */
export const useGetTestsByPrompt = (promptId: string, opts?: ApiRequestOptions, queryOptions?: {
    enabled?: boolean
}) => {
    return useQuery({
        queryKey: promptKeys.testsByPrompt(promptId, opts),
        queryFn: () => promptsService.getTestsByPrompt(promptId, opts),
        enabled: !!promptId && queryOptions?.enabled !== false,
    });
};

/**
 * Query to get the current user's paginated test history
 */
export const useGetUserTestHistory = (page = 0, size = 20, opts?: ApiRequestOptions) => {
    return useQuery({
        queryKey: promptKeys.testHistoryUser(page, size, opts),
        queryFn: () => promptsService.getUserTestHistory(page, size, opts),
        placeholderData: keepPreviousData,
    });
};

/**
 * Query to get a specific prompt's paginated test history
 */
export const useGetPromptTestHistory = (promptId: string, page = 0, size = 20, opts?: ApiRequestOptions, queryOptions?: {
    enabled?: boolean
}) => {
    return useQuery({
        queryKey: promptKeys.testHistoryPrompt(promptId, page, size, opts),
        queryFn: () => promptsService.getPromptTestHistory(promptId, page, size, opts),
        enabled: !!promptId && queryOptions?.enabled !== false,
        placeholderData: keepPreviousData,
    });
};

/**
 * Mutation to delete a specific test result
 */
export const useDeleteTestResult = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({usageId, opts}: { usageId: string; opts?: ApiRequestOptions }) =>
            promptsService.deleteTestResult(usageId, opts),
        onSuccess: async () => {
            // Invalidate all test-related queries
            await queryClient.invalidateQueries({queryKey: promptKeys.tests()});
        },
    });
};

/* ----------------------------
   Optimization Queries & Mutations
   ---------------------------- */
type GetOptimizationStatusQueryOptions = Omit<
    UseQueryOptions<
        BaseResponse<OptimizationQueueEntry>,
        Error,
        BaseResponse<OptimizationQueueEntry>,
        ReturnType<typeof promptKeys.optimizationStatus>
    >,
    'queryKey' | 'queryFn'
>;

/**
 * Mutation to request an asynchronous prompt optimization
 */
export const useRequestOptimization = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({request, opts}: { request: PromptOptimizationRequest; opts?: ApiRequestOptions }) =>
            promptsService.requestOptimization(request, opts),
        onSuccess: async (_data, variables) => {
            // Invalidate pending list and all history lists
            await queryClient.invalidateQueries({queryKey: promptKeys.optimizationsPending()});
            await queryClient.invalidateQueries({queryKey: promptKeys.optimizationHistoryUser(0, 0).slice(0, 3)});
            if (variables.request.promptId) {
                await queryClient.invalidateQueries({queryKey: promptKeys.optimizationHistoryPrompt(variables.request.promptId, 0, 0).slice(0, 3)});
            }
        },
    });
};

/**
 * Query to poll for the status of an optimization
 */
export const useGetOptimizationStatus = (
    queueId: string,
    opts?: ApiRequestOptions,
    queryOptions?: GetOptimizationStatusQueryOptions
) => {
    return useQuery({
        queryKey: promptKeys.optimizationStatus(queueId, opts),
        queryFn: () => promptsService.getOptimizationStatus(queueId, opts),
        enabled: queryOptions?.enabled !== false && !!queueId,
        ...queryOptions,
    });
};

/**
 * Query to get the user's paginated optimization history
 */
export const useGetUserOptimizationHistory = (page = 0, size = 20, opts?: ApiRequestOptions) => {
    return useQuery({
        queryKey: promptKeys.optimizationHistoryUser(page, size, opts),
        queryFn: () => promptsService.getUserOptimizationHistory(page, size, opts),
        placeholderData: keepPreviousData,
    });
};

/**
 * Query to get a specific prompt's paginated optimization history
 */
export const useGetPromptOptimizationHistory = (promptId: string, page = 0, size = 20, opts?: ApiRequestOptions, queryOptions?: {
    enabled?: boolean
}) => {
    return useQuery({
        queryKey: promptKeys.optimizationHistoryPrompt(promptId, page, size, opts),
        queryFn: () => promptsService.getPromptOptimizationHistory(promptId, page, size, opts),
        enabled: !!promptId && queryOptions?.enabled !== false,
        placeholderData: keepPreviousData,
    });
};

/**
 * Query to get all pending optimizations for the user
 */
export const useGetPendingOptimizations = (opts?: ApiRequestOptions) => {
    return useQuery({
        queryKey: promptKeys.optimizationsPending(opts),
        queryFn: () => promptsService.getPendingOptimizations(opts),
    });
};

/**
 * Mutation to retry a failed optimization
 */
export const useRetryOptimization = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({queueId, opts}: { queueId: string; opts?: ApiRequestOptions }) =>
            promptsService.retryOptimization(queueId, opts),
        onSuccess: async (_data, variables) => {
            // Invalidate the specific item's status and all history/pending lists
            await queryClient.invalidateQueries({queryKey: promptKeys.optimizationStatus(variables.queueId)});
            await queryClient.invalidateQueries({queryKey: promptKeys.optimizationsPending()});
            await queryClient.invalidateQueries({queryKey: promptKeys.optimizationHistoryUser(0, 0).slice(0, 3)});
        },
    });
};

/**
 * Mutation to cancel/delete an optimization
 */
export const useCancelOptimization = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({queueId, opts}: { queueId: string; opts?: ApiRequestOptions }) =>
            promptsService.cancelOptimization(queueId, opts),
        onSuccess: async (_data, variables) => {
            queryClient.removeQueries({queryKey: promptKeys.optimizationStatus(variables.queueId)});
            // Invalidate history and pending lists
            await queryClient.invalidateQueries({queryKey: promptKeys.optimizationsPending()});
            await queryClient.invalidateQueries({queryKey: promptKeys.optimizationHistoryUser(0, 0).slice(0, 3)});
            await queryClient.invalidateQueries({queryKey: promptKeys.optimizationHistoryPrompt('', 0, 0).slice(0, 2)});
        },
    });
};