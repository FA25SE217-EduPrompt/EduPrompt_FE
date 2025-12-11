// {
//     "name": "first collection",
//     "description": "first collection",
//     "visibility": "private",
//     "tags": [
//         "a42f22a6-9b9b-47ef-8c7b-90cd52efd190",
//         "b48e176c-a625-4c38-9682-03f383ac8c83"
//     ],
//     "groupId": "uuid"  this can be null
// }

// src/types/collection.api.ts
import { BaseResponse, PaginatedResponse } from '@/types/api';
import { TagResponse } from '@/types/tag.api';

export type CollectionResponse = {
    id: string; // it should have an ID
    name: string;
    description?: string;
    visibility: 'PRIVATE' | 'GROUP' | 'PUBLIC' | string;
    tags: TagResponse[];
    createdAt: string;
};

export type CreateCollectionRequest = {
    name: string;
    description?: string;
    visibility: 'private' | 'group' | 'public';
    tags: string[]; // Array of Tag IDs
};

export type GetMyCollectionsResponse = BaseResponse<PaginatedResponse<CollectionResponse>>;

export type CreateCollectionResponse = BaseResponse<CollectionResponse>;

export type CountMyCollectionsResponse = BaseResponse<number>;