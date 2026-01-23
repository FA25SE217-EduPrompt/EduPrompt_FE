import { apiClient } from "@/services/auth";
import { ListUserSchoolResponse } from "@/types/user.api";
import ApiCall from "@/utils/apiCall";
import { buildRequestConfig } from '@/services/resources/prompts';
import { ApiRequestOptions } from "@/types/prompt.api";

const BASE = '/api/users';

export const userService = {
    async getUsersInMySchool(opts?: ApiRequestOptions): Promise<ListUserSchoolResponse> {
        return ApiCall(() => apiClient.request({
            url: `${BASE}/school/users`,
            method: 'get',
            ...buildRequestConfig(opts)
        }));
    }
}
