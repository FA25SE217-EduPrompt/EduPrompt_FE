import { useQuery } from '@tanstack/react-query';
import { userService } from '@/services/resources/user';

export const userKeys = {
    all: ['users'] as const,
    school: () => [...userKeys.all, 'school'] as const,
};

export const useGetUsersInMySchool = () => {
    return useQuery({
        queryKey: userKeys.school(),
        queryFn: async () => {
            return await userService.getUsersInMySchool();
        },
    });
};
