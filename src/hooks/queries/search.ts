// src/hooks/queries/search.ts
import { useQuery, useMutation, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { BaseResponse, PaginatedResponse } from '@/types/api';
import {
    PromptFilterParams,
    PromptMetadataResponse,
    SemanticSearchRequest,
    SemanticSearchResponse
} from '@/types/prompt.api';
import { promptsService } from '@/services/resources/prompts';
import { searchService } from '@/services/resources/search';

export const searchKeys = {
    all: ['search'] as const,
    filter: (params: PromptFilterParams) => [...searchKeys.all, 'filter', params] as const,
};

export const useFilterPrompts = (
    params: PromptFilterParams,
    options?: Omit<UseQueryOptions<BaseResponse<PaginatedResponse<PromptMetadataResponse>>, Error>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<BaseResponse<PaginatedResponse<PromptMetadataResponse>>, Error>({
        queryKey: searchKeys.filter(params),
        queryFn: () => promptsService.filterPrompts(params),
        ...options,
    });
};

export const useSemanticSearch = (
    options?: UseMutationOptions<BaseResponse<SemanticSearchResponse>, Error, SemanticSearchRequest>
) => {
    return useMutation<BaseResponse<SemanticSearchResponse>, Error, SemanticSearchRequest>({
        mutationFn: (payload) => searchService.performSemanticSearch(payload),
        ...options,
    });
};
