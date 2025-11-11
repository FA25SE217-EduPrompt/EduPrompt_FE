// src/services/resources/collection.ts
import { apiClient } from '@/services/auth';
import {
    CreateCollectionRequest,
    CreateCollectionResponse,
    GetMyCollectionsResponse,
} from '@/types/collection.api';
import ApiCall from '@/utils/apiCall';
import { buildRequestConfig } from '@/services/resources/prompts';
import { ApiRequestOptions } from '@/types/prompt.api';

const BASE = '/api/collections';

export const collectionService = {
    /**
     * GET /api/collections/my-collection
     * Get paginated collections for the current user.
     */
    async getMyCollections(
        page = 0,
        size = 20,
        opts?: ApiRequestOptions,
    ): Promise<GetMyCollectionsResponse> {
        return ApiCall(() =>
            apiClient.request({
                url: `${BASE}/my-collection?page=${page}&size=${size}`,
                method: 'get',
                ...buildRequestConfig(opts),
            }),
        );
    },

    /**
     * POST /api/collections/create // this api naming is sh*t
     * Create a new collection.
     */
    async createCollection(
        payload: CreateCollectionRequest,
        opts?: ApiRequestOptions,
    ): Promise<CreateCollectionResponse> {
        return ApiCall(() =>
            apiClient.request({
                url: `${BASE}/create`,
                method: 'post',
                data: payload,
                ...buildRequestConfig(opts),
            }),
        );
    },
};

export default collectionService;