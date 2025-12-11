import { apiClient } from "../auth";

export const SchoolAdminService = {
    getSubscriptionUsage: async () => {
        const response = await apiClient.get('/api/school-admin/subscription/usage');
        return response.data;
    },

    getTeachers: async () => {
        const response = await apiClient.get('/api/school-admin/teachers');
        return response.data;
    },

    removeTeacher: async (teacherId: string) => {
        // Based on typical REST patterns and the Swagger endpoint path, assuming usage.
        // If it fails, I'll adjust.
        const response = await apiClient.delete(`/api/school-admin/teachers/remove`, {
            data: { teacherId } // Common pattern for DELETE with body, or query params needed?
            // If query param: params: { teacherId }
            // Given typical simpler APIs, it might just need the ID in the body or query.
            // I'll try body first as it's safer for "actions".
        });
        return response.data;
    },

    addEmails: async (schoolId: number, emails: string[]) => {
        const response = await apiClient.post(`/api/school-admin/${schoolId}/new-email`, { emails });
        return response.data;
    }
};
