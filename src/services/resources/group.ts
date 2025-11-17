
import {apiClient} from '@/services/auth';
import ApiCall from '@/utils/apiCall';

const BASE = '/api/groups';

export const groupService = {
    // Create group
    async createGroup(payload: { name: string; description?: string }) {
        return ApiCall(() => apiClient.post(`${BASE}/create`, payload));
    },

    // Update group
    async updateGroup(groupId: string, payload: { name?: string; description?: string }) {
        return ApiCall(() => apiClient.put(`${BASE}/${encodeURIComponent(groupId)}`, payload));
    },

    // Get group by id
    async getGroup(groupId: string) {
        return ApiCall(() => apiClient.get(`${BASE}/${encodeURIComponent(groupId)}`));
    },

    // Get members of a group
    async getMembers(groupId: string) {
        return ApiCall(() => apiClient.get(`${BASE}/${encodeURIComponent(groupId)}/members`));
    },

    // Add member to group
    async addMember(groupId: string, payload: { userId: string; role?: string }) {
        return ApiCall(() => apiClient.post(`${BASE}/${encodeURIComponent(groupId)}/members`, payload));
    },

    // Remove member from group (expects body with userId)
    async removeMember(groupId: string, userId: string) {
        return ApiCall(() => apiClient.request({
            url: `${BASE}/${encodeURIComponent(groupId)}/members`,
            method: 'delete',
            data: { userId },
        }));
    },
};

export default groupService;
