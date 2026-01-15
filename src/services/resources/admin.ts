// src/services/resources/admin.ts
import { apiClient } from '@/services/auth';
import { BaseResponse } from '@/types/api';
import ApiCall from '@/utils/apiCall';
import { buildRequestConfig } from '@/services/resources/prompts';
import { ApiRequestOptions } from '@/types/prompt.api';
import { 
    CreateSchoolAdminAccountRequest, 
    SchoolAdminAccountResponse, 
    CreateSchoolSubscriptionRequest,
    SchoolSubscriptionResponse 
} from '@/types/school.api';

const ADMIN_BASE = '/api/v1/admin';

/**
 * Admin service for system-wide admin operations
 */
export const adminService = {
    /**
     * POST /api/v1/admin/school-admin-acc
     * Create a new school admin account
     */
    async createSchoolAdminAccount(
        payload: CreateSchoolAdminAccountRequest,
        opts?: ApiRequestOptions,
    ): Promise<BaseResponse<SchoolAdminAccountResponse>> {
        return ApiCall<SchoolAdminAccountResponse>(() =>
            apiClient.request({
                url: `${ADMIN_BASE}/school-admin-acc`,
                method: 'post',
                data: payload,
                ...buildRequestConfig(opts),
            }),
        );
    },

    /**
     * POST /api/v1/admin/schools/{schoolId}/subscription
     * Create or update a school subscription
     */
    async createSchoolSubscription(
        schoolId: string, // UUID
        payload: CreateSchoolSubscriptionRequest,
        opts?: ApiRequestOptions,
    ): Promise<BaseResponse<SchoolSubscriptionResponse>> {
        return ApiCall<SchoolSubscriptionResponse>(() =>
            apiClient.request({
                url: `${ADMIN_BASE}/schools/${schoolId}/subscription`,
                method: 'post',
                data: payload,
                ...buildRequestConfig(opts),
            }),
        );
    },
};

export default adminService;
