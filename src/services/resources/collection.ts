// src/services/resources/collection.ts
import { apiClient } from '@/services/auth';
import { CreateCollectionRequest, CreateCollectionResponse, GetMyCollectionsResponse, CollectionResponse, CountMyCollectionsResponse } from '@/types/collection.api';
import { BaseResponse } from '@/types/api';
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
     * GET /api/collections/my-collections/count
     * Get count of collections for the current user.
     */
    async countMyCollections(
        opts?: ApiRequestOptions,
    ): Promise<CountMyCollectionsResponse> {
        return ApiCall(() =>
            apiClient.request({
                url: `${BASE}/my-collections/count`,
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

    /**
     * GET /api/collections/{id}
     * Get collection by ID
     */
    async getCollection(
        id: string,
        opts?: ApiRequestOptions,
    ): Promise<BaseResponse<CollectionResponse>> {
        return ApiCall<CollectionResponse>(() =>
            apiClient.request({
                url: `${BASE}/${id}`,
                method: 'get',
                ...buildRequestConfig(opts),
            }),
        );
    },

    /**
     * PUT /api/collections/{id}
     * Update collection
     */
    async updateCollection(
        id: string,
        payload: CreateCollectionRequest,
        opts?: ApiRequestOptions,
    ): Promise<CreateCollectionResponse> {
        return ApiCall(() =>
            apiClient.request({
                url: `${BASE}/${id}`,
                method: 'put',
                data: payload,
                ...buildRequestConfig(opts),
            }),
        );
    },

    /**
     * DELETE /api/collections/{id}
     * Delete collection
     */
    async deleteCollection(
        id: string,
        opts?: ApiRequestOptions,
    ): Promise<BaseResponse<void>> {
        return ApiCall(() =>
            apiClient.request({
                url: `${BASE}/${id}`,
                method: 'delete',
                ...buildRequestConfig(opts),
            }),
        );
    },
};

export default collectionService;