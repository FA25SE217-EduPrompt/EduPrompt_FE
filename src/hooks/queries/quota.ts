import { useQuery } from '@tanstack/react-query';
import { quotaService } from '@/services/resources/quota';

/* ----------------------------
   Query Keys
   ---------------------------- */
export const quotaKeys = {
    all: ['quota'] as const,
};

export const useGetQuota = () => {
    return useQuery({
        queryKey: quotaKeys.all,
        queryFn: () => quotaService.getUserQuota(),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};
