// School Admin Service
import { apiClient } from '@/services/auth';
import ApiCall from '@/utils/apiCall';
import {
    GetTeachersUsageResponse,
    GetSubscriptionUsageResponse,
    GetTeacherSubscriptionUsageResponse,
    GetAllTeachersSubscriptionUsageResponse,
    TeacherUsageParams,
    TeacherSubscriptionUsageParams,
    AllTeachersSubscriptionUsageParams,
    SchoolAdminRequestOptions,
} from '@/types/school-admin.api';

const BASE = '/api/school-admin';

export const schoolAdminService = {
    /**
     * GET /api/school-admin/teachers-usage
     * Get paginated teachers usage statistics
     */
    async getTeachersUsage(
        params?: TeacherUsageParams,
        opts?: SchoolAdminRequestOptions
    ): Promise<GetTeachersUsageResponse> {
        const queryParams = new URLSearchParams();
        if (params?.page !== undefined) queryParams.append('page', params.page.toString());
        if (params?.size !== undefined) queryParams.append('size', params.size.toString());
        if (params?.sort) queryParams.append('sort', params.sort);

        const query = queryParams.toString();
        const url = `${BASE}/teachers-usage${query ? `?${query}` : ''}`;

        return ApiCall(() =>
            apiClient.request({
                url,
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
     * Get specific teacher's subscription usage
     */
    async getTeacherSubscriptionUsage(
        params: TeacherSubscriptionUsageParams,
        opts?: SchoolAdminRequestOptions
    ): Promise<GetTeacherSubscriptionUsageResponse> {
        const queryParams = new URLSearchParams();
        queryParams.append('teacherId', params.teacherId);

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
     * Get all teachers' subscription usage (paginated)
     */
    async getAllTeachersSubscriptionUsage(
        params?: AllTeachersSubscriptionUsageParams,
        opts?: SchoolAdminRequestOptions
    ): Promise<GetAllTeachersSubscriptionUsageResponse> {
        const queryParams = new URLSearchParams();
        if (params?.page !== undefined) queryParams.append('page', params.page.toString());
        if (params?.size !== undefined) queryParams.append('size', params.size.toString());
        if (params?.sort) queryParams.append('sort', params.sort);

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
};

export default schoolAdminService;
