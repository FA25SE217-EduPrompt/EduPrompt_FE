import { apiClient } from './auth';
import { School, JoinSchoolRequest } from '@/types/school.api';
import { BaseResponse, PaginatedResponse } from '@/types/api';

const API_URL = '/api/school';

export const getAllSchools = async (page: number = 0, size: number = 100) => {
    const response = await apiClient.get<BaseResponse<PaginatedResponse<School>>>(`${API_URL}`, {
        params: { page, size },
    });
    return response.data;
};

export const joinSchool = async (payload: JoinSchoolRequest) => {
    const response = await apiClient.post<BaseResponse<any>>(`${API_URL}/join`, payload);
    return response.data;
};

