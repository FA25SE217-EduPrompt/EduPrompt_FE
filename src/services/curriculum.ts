import { apiClient } from './auth';
import { CurriculumResponse, DetailLessonResponse, PromptLessonResponse, ResponseDto } from '@/types/curriculum';

export const curriculumService = {
    getLessonDetails: async (id: string) => {
        const response = await apiClient.get<ResponseDto<DetailLessonResponse>>(`/api/curriculum/lesson/${id}`);
        return response.data;
    },

    getPromptsByLesson: async (lessonId: string) => {
        const response = await apiClient.get<ResponseDto<PromptLessonResponse[]>>(`/api/curriculum/prompt/lesson/${lessonId}`);
        return response.data;
    },

    getCurriculumFilters: async (subjectName: string, gradeLevel: number, semesterNumber?: number) => {
        const params = new URLSearchParams({
            subjectName,
            gradeLevel: gradeLevel.toString(),
        });
        if (semesterNumber) {
            params.append('semesterNumber', semesterNumber.toString());
        }

        const response = await apiClient.get<ResponseDto<CurriculumResponse>>(`/api/curriculum/filters?${params.toString()}`);
        return response.data;
    }
};
