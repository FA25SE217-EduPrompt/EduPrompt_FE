import { useQuery } from '@tanstack/react-query';
import { quotaService } from '@/services/resources/quota';

export const useGetQuota = () => {
    return useQuery({
        queryKey: ['quota'],
        queryFn: () => quotaService.getUserQuota(),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};
