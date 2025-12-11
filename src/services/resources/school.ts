import { apiClient } from "../auth";
import { BaseResponse } from "@/types/api";
import { School } from "@/types/school.api";

export const SchoolService = {
    getSchoolByUserId: async (userId: string | number): Promise<BaseResponse<School>> => {
        const response = await apiClient.get<BaseResponse<School>>(`/api/school/user/${userId}`);
        return response.data;
    },

    getSchoolById: async (schoolId: number) => {
        const response = await apiClient.get(`/api/school/${schoolId}`);
        return response.data;
    }
};
