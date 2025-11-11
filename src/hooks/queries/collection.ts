// hooks/queries/collection.ts
import {
    useQuery,
    useMutation,
    useQueryClient,
    keepPreviousData,
} from '@tanstack/react-query';
import { collectionService } from '@/services/resources/collection';
import { CreateCollectionRequest } from '@/types/collection.api';
import { ApiRequestOptions } from '@/types/prompt.api';

/* ----------------------------
   Query Keys
   ---------------------------- */
export const collectionKeys = {
    all: ['collections'] as const,
    lists: () => [...collectionKeys.all, 'list'] as const,
    myCollections: (page: number, size: number) =>
        [...collectionKeys.lists(), 'my', { page, size }] as const,
};

/* ----------------------------
   Queries & Mutations
   ---------------------------- */

/**
 * Query to get the user's paginated collections
 */
export const useGetMyCollections = (page = 0, size = 20) => {
    return useQuery({
        queryKey: collectionKeys.myCollections(page, size),
        queryFn: () => collectionService.getMyCollections(page, size),
        placeholderData: keepPreviousData,
    });
};

/**
 * Mutation to create a new collection
 */
export const useCreateCollection = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
                         payload,
                         opts,
                     }: {
            payload: CreateCollectionRequest;
            opts?: ApiRequestOptions;
        }) => collectionService.createCollection(payload, opts),
        onSuccess: async () => {
            // Invalidate all 'my collection' lists
            await queryClient.invalidateQueries({
                queryKey: collectionKeys.myCollections(0, 0).slice(0, 3),
            });
        },
    });
};