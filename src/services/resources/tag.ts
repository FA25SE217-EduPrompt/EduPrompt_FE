// services/resources/tag.ts
import {apiClient} from "@/services/auth";
import {CreateTagsBatchRequest, CreateTagsBatchResponse, GetTagsResponse, TagResponse,} from "@/types/tag.api";
import ApiCall from "@/utils/apiCall";

const BASE = "/api/tags";

export const TagService = {
    /**
     * POST /api/tags/batch
     */
    async createBatch(payload: CreateTagsBatchRequest): Promise<CreateTagsBatchResponse> {
        return ApiCall(() => apiClient.post<CreateTagsBatchResponse>(`${BASE}/batch`, payload));
    },

    /**
     * GET /api/tags
     * params:
     *   - type?: string[]   (can repeat: ?type=a&type=b)
     *   - page?: number
     *   - size?: number
     *
     * Returns BaseResponse<SimplePage<TagDto>>
     */
    async getAll(params?: { type?: string[]; page?: number; size?: number; }): Promise<GetTagsResponse> {
        const query = {
            ...(params?.type ? {type: params.type} : {}),
            ...(typeof params?.page === "number" ? {page: params.page} : {}),
            ...(typeof params?.size === "number" ? {size: params.size} : {}),
        };

        return ApiCall(() => apiClient.get<GetTagsResponse>(BASE, {params: query}));
    },

    /**
     * Convenience: only the list of tags (content)
     */
    async getAllContent(params?: { type?: string[]; page?: number; size?: number; }): Promise<TagResponse[] | null> {
        const r = await TagService.getAll(params);
        return r.data ? r.data.content : null;
    },
};

export default TagService;
