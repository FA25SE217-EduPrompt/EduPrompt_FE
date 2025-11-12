import {BaseResponse, SimplePage} from "@/types/api";


export interface Tag {
    id: string;   // UUID
    type: string;
    value: string;
}

export type TagResponse = {
    id: string;
    type: string;
    value: string;
};

export type TagIdsRequest = { id: string }[];

/**
 * Single tag input for creation
 */
export type CreateTagRequest = {
    type: string;
    value: string;
};

/**
 * Request body for batch create
 * { tags: [ { type, value }, ... ] }
 */
export type CreateTagsBatchRequest = {
    tags: CreateTagRequest[];
};

export type TagListParams = {
    type?: string[] | undefined;
    page?: number | undefined;
    size?: number | undefined;
};

/**
 * Backend response for creating tags in batch
 * data will be the created tags (array)
 */
export type CreateTagsBatchResponse = BaseResponse<TagResponse[]>;

export type GetTagsResponse = BaseResponse<SimplePage<TagResponse>>;
