import { apiClient } from '@/services/auth';
import { Group, GroupsResponse, CreateGroupRequest, UpdateGroupRequest } from '@/types/group.types';

// Get all groups (admin)
export async function getAllGroups(page: number = 0, size: number = 20): Promise<{ data: GroupsResponse }> {
    const response = await apiClient.get(`/api/v1/admin/groups?page=${page}&size=${size}`);
    return response.data;
}

// Get group by ID (admin)
export async function getGroupById(groupId: string): Promise<Group> {
    const response = await apiClient.get(`/api/v1/admin/groups/${groupId}`);
    return response.data;
}

// Create group (admin)
export async function createGroup(data: CreateGroupRequest): Promise<Group> {
    const response = await apiClient.post('/api/v1/admin/group', data);
    return response.data;
}

// Update group (admin)
export async function updateGroup(groupId: string, data: UpdateGroupRequest): Promise<Group> {
    const response = await apiClient.put(`/api/v1/admin/group/${groupId}`, data);
    return response.data;
}

// Delete group (admin)
export async function deleteGroup(groupId: string): Promise<void> {
    await apiClient.delete(`/api/v1/admin/group/${groupId}`);
}
