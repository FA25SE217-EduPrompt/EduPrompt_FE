// src/services/resources/search.ts
import { apiClient } from '@/services/auth';
import { BaseResponse } from '@/types/api';
import ApiCall from '@/utils/apiCall';
import {
    ApiRequestOptions,
    SemanticSearchRequest,
    SemanticSearchResponse
} from '@/types/prompt.api';
import { buildRequestConfig } from './prompts';

const BASE = "/api/v1/search";

export const searchService = {
    async performSemanticSearch(
        payload: SemanticSearchRequest,
        opts?: ApiRequestOptions
    ): Promise<BaseResponse<SemanticSearchResponse>> {
        return ApiCall<SemanticSearchResponse>(() =>
            apiClient.request({
                url: `${BASE}`,
                method: 'post',
                data: payload,
                ...buildRequestConfig(opts),
            })
        );
    },
};

export default searchService;
