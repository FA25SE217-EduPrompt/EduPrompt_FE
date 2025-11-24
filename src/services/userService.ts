import { apiClient } from '@/services/auth';
import ApiCall from '@/utils/apiCall';

const BASE = '/api/users';

export const userService = {
  // Get all users (may be paginated on backend)
  async getUsers() {
    return ApiCall(() => apiClient.get(`${BASE}`));
  },

  async getUser(userId: string) {
    return ApiCall(() => apiClient.get(`${BASE}/${encodeURIComponent(userId)}`));
  },

  async createUser(payload: { email: string; firstName?: string; lastName?: string }) {
    return ApiCall(() => apiClient.post(`${BASE}`, payload));
  },

  async updateUser(userId: string, payload: { email?: string; firstName?: string; lastName?: string }) {
    return ApiCall(() => apiClient.put(`${BASE}/${encodeURIComponent(userId)}`, payload));
  },

  async deleteUser(userId: string) {
    return ApiCall(() => apiClient.delete(`${BASE}/${encodeURIComponent(userId)}`));
  },
};

export default userService;
