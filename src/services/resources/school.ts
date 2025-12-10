import { apiClient } from "../auth";

export const SchoolService = {
    getSchoolByUserId: async (userId: string | number) => {
        const response = await apiClient.get(`/api/school/user/${userId}`);
        return response.data;
    },

    getSchoolById: async (schoolId: number) => {
        const response = await apiClient.get(`/api/school/${schoolId}`);
        return response.data;
    }
};
