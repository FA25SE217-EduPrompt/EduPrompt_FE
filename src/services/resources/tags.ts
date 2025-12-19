import axios from 'axios';
import { Tag, TagsResponse, CreateTagRequest, UpdateTagRequest } from '@/types/tag.types';
import { TokenManager } from '@/utils/tokenManager';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Create axios instance for admin endpoints with authentication
const adminClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token from cookies
adminClient.interceptors.request.use(
    (config) => {
        const token = TokenManager.getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/**
 * Get all tags from the admin endpoint
 * Requires authentication token
 */
export async function getAllTags(): Promise<any> {
    const response = await adminClient.get('/api/v1/admin/tags');
    return response.data;
}

/**
 * Get tag by ID
 */
export async function getTagById(tagId: string): Promise<Tag> {
    const response = await adminClient.get<Tag>(`/api/v1/admin/tags/${tagId}`);
    return response.data;
}

/**
 * Create new tag
 */
export async function createTag(data: CreateTagRequest): Promise<Tag> {
    const response = await adminClient.post<Tag>('/api/v1/admin/tags', data);
    return response.data;
}

/**
 * Update tag by ID
 */
export async function updateTag(tagId: string, data: UpdateTagRequest): Promise<Tag> {
    const response = await adminClient.put<Tag>(`/api/v1/admin/tags/${tagId}`, data);
    return response.data;
}

/**
 * Delete tag by ID
 */
export async function deleteTag(tagId: string): Promise<void> {
    await adminClient.delete(`/api/v1/admin/tags/${tagId}`);
}
