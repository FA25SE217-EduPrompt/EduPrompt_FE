import { apiClient } from '@/services/auth';
import { BaseResponse } from '@/types/api';
import { QuotaResponse } from '@/types/quota.api';
import ApiCall from '@/utils/apiCall';

const BASE = '/api/quota';

export const quotaService = {
    async getUserQuota(): Promise<BaseResponse<QuotaResponse>> {
        return ApiCall<QuotaResponse>(() =>
            apiClient.get(`${BASE}/my-quota`)
        );
    },
};
