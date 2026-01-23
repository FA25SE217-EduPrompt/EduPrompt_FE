// School Admin Service - Matching Backend API
import { apiClient } from '../auth';
import ApiCall from '@/utils/apiCall';
import {
    GetTeachersUsageResponse,
    GetSubscriptionUsageResponse,
    GetTeacherSubscriptionUsageResponse,
    GetAllTeachersSubscriptionUsageResponse,
    TeacherSubscriptionUsageParams,
    AllTeachersSubscriptionUsageParams,
    SchoolAdminRequestOptions,
} from '@/types/school-admin.api';

const BASE = '/api/school-admin';

export const SchoolAdminService = {
    /**
     * GET /api/school-admin/teachers-usage
     * Get school teachers usage summary (NO PAGINATION)
     */
    async getTeachersUsage(
        opts?: SchoolAdminRequestOptions
    ): Promise<GetTeachersUsageResponse> {
        return ApiCall(() =>
            apiClient.request({
                url: `${BASE}/teachers-usage`,
                method: 'get',
                signal: opts?.signal,
            })
        );
    },

    /**
     * GET /api/school-admin/subscription/usage
     * Get school subscription usage overview
     */
    async getSubscriptionUsage(
        opts?: SchoolAdminRequestOptions
    ): Promise<GetSubscriptionUsageResponse> {
        return ApiCall(() =>
            apiClient.request({
                url: `${BASE}/subscription/usage`,
                method: 'get',
                signal: opts?.signal,
            })
        );
    },

    /**
     * GET /api/school-admin/subscription/usage/teacher
     * Get specific teacher's token usage logs (PAGINATED)
     * @param params.userId - Required user ID
     */
    async getTeacherSubscriptionUsage(
        params: TeacherSubscriptionUsageParams,
        opts?: SchoolAdminRequestOptions
    ): Promise<GetTeacherSubscriptionUsageResponse> {
        const queryParams = new URLSearchParams();
        queryParams.append('userId', params.userId);
        if (params.page !== undefined) queryParams.append('page', params.page.toString());
        if (params.size !== undefined) queryParams.append('size', params.size.toString());

        return ApiCall(() =>
            apiClient.request({
                url: `${BASE}/subscription/usage/teacher?${queryParams.toString()}`,
                method: 'get',
                signal: opts?.signal,
            })
        );
    },

    /**
     * GET /api/school-admin/subscription/usage/all-teacher
     * Get all teachers' token usage logs (PAGINATED)
     */
    async getAllTeachersSubscriptionUsage(
        params?: AllTeachersSubscriptionUsageParams,
        opts?: SchoolAdminRequestOptions
    ): Promise<GetAllTeachersSubscriptionUsageResponse> {
        const queryParams = new URLSearchParams();
        if (params?.page !== undefined) queryParams.append('page', params.page.toString());
        if (params?.size !== undefined) queryParams.append('size', params.size.toString());

        const query = queryParams.toString();
        const url = `${BASE}/subscription/usage/all-teacher${query ? `?${query}` : ''}`;

        return ApiCall(() =>
            apiClient.request({
                url,
                method: 'get',
                signal: opts?.signal,
            })
        );
    },

    // Legacy methods
    getTeachers: async () => {
        const response = await apiClient.get('/api/school-admin/teachers/all');
        return response.data;
    },

    removeTeacher: async (teacherId: string) => {
        const response = await apiClient.delete(`/api/school-admin/teachers/remove`, {
            data: { teacherId }
        });
        return response.data;
    },

    addEmails: async (schoolId: number | string, emails: string[]) => {
        const response = await apiClient.post(`/api/school-admin/${schoolId}/new-email`, { emails });
        return response.data;
    }
};

export default SchoolAdminService;
