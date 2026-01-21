import { useQuery } from '@tanstack/react-query';
import { curriculumService } from '@/services/curriculum';

export const useLessonDetails = (lessonId: string | undefined) => {
    return useQuery({
        queryKey: ['lesson', lessonId],
        queryFn: () => curriculumService.getLessonDetails(lessonId!),
        enabled: !!lessonId,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

export const useCurriculumTree = (subjectName: string, gradeLevel: number) => {
    return useQuery({
        queryKey: ['curriculum', subjectName, gradeLevel],
        queryFn: async () => {
            const result = await curriculumService.getCurriculumFilters(subjectName, gradeLevel);
            // Verify if data is present, otherwise throw or return null
            if (result.error) {
                throw new Error(result.error.message.join(', '));
            }
            return result.data;
        },
        enabled: !!subjectName && !!gradeLevel,
        staleTime: 1000 * 60 * 10, // 10 minutes (structure rarely changes)
    });
};

export const useLessonPrompts = (lessonId: string | undefined) => {
    return useQuery({
        queryKey: ['prompts', 'lesson', lessonId],
        queryFn: async () => {
            const result = await curriculumService.getPromptsByLesson(lessonId!);
            if (result.error) {
                throw new Error(result.error.message.join(', '));
            }
            return result.data || [];
        },
        enabled: !!lessonId,
        staleTime: 1000 * 60 * 5,
    });
};
