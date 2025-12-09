// hooks/queries/collection.ts
import { keepPreviousData, useMutation, useQuery, useQueryClient, } from '@tanstack/react-query';
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
        staleTime: 5 * 60 * 1000, // 5 minutes
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

/**
 * Query to get a single collection by ID
 */
export const useGetCollection = (id: string, enabled = true) => {
    return useQuery({
        queryKey: [...collectionKeys.all, id],
        queryFn: () => collectionService.getCollection(id),
        enabled,
    });
};

/**
 * Mutation to update a collection
 */
export const useUpdateCollection = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            id,
            payload,
            opts,
        }: {
            id: string;
            payload: CreateCollectionRequest;
            opts?: ApiRequestOptions;
        }) => collectionService.updateCollection(id, payload, opts),
        onSuccess: async (data, variables) => {
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: collectionKeys.myCollections(0, 0).slice(0, 3),
                }),
                queryClient.invalidateQueries({
                    queryKey: [...collectionKeys.all, variables.id],
                }),
            ]);
        },
    });
};

/**
 * Mutation to delete a collection
 */
export const useDeleteCollection = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            id,
            opts,
        }: {
            id: string;
            opts?: ApiRequestOptions;
        }) => collectionService.deleteCollection(id, opts),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: collectionKeys.myCollections(0, 0).slice(0, 3),
            });
        },
    });
};