import { apiClient } from '@/services/auth';
import { Collection, CollectionsResponse, CreateCollectionRequest, UpdateCollectionRequest } from '@/types/collection.types';

// Get all collections (admin)
export async function getAllCollections(page: number = 0, size: number = 20): Promise<{ data: CollectionsResponse }> {
    const response = await apiClient.get(`/api/v1/admin/collections?page=${page}&size=${size}`);
    return response.data;
}

// Get collection by ID (admin)
export async function getCollectionById(collectionId: string): Promise<Collection> {
    const response = await apiClient.get(`/api/v1/admin/collections/${collectionId}`);
    return response.data;
}

// Create collection (admin)
export async function createCollection(data: CreateCollectionRequest): Promise<Collection> {
    const response = await apiClient.post('/api/v1/admin/collection', data);
    return response.data;
}

// Update collection (admin)
export async function updateCollection(collectionId: string, data: UpdateCollectionRequest): Promise<Collection> {
    const response = await apiClient.put(`/api/v1/admin/collection/${collectionId}`, data);
    return response.data;
}

// Delete collection (admin)
export async function deleteCollection(collectionId: string): Promise<void> {
    await apiClient.delete(`/api/v1/admin/collection/${collectionId}`);
}
