// hooks/queries/tag.ts
import { keepPreviousData, useMutation, useQuery, useQueryClient, } from '@tanstack/react-query';
import { TagService } from '@/services/resources/tag';
import { CreateTagsBatchRequest } from '@/types/tag.api';

/* ----------------------------
   Query Keys
   ---------------------------- */

export const tagKeys = {
    all: ['tags'] as const,
    lists: () => [...tagKeys.all, 'list'] as const,
    list: (params?: { type?: string[]; page?: number; size?: number; }) => [...tagKeys.lists(), params] as const,
    contentLists: () => [...tagKeys.all, 'content', 'list'] as const,
    contentList: (params?: {
        type?: string[];
        page?: number;
        size?: number;
    }) => [...tagKeys.contentLists(), params] as const,
};

/* ----------------------------
   Tag Queries & Mutations
   ---------------------------- */

/**
 * Query to get a paginated list of tags.
 */
export const useGetTags = (params?: { type?: string[]; page?: number; size?: number; }) => {
    return useQuery({
        queryKey: tagKeys.list(params),
        queryFn: () => TagService.getAll(params),
        placeholderData: keepPreviousData,
        staleTime: 15 * 60 * 1000, // 15 minutes
    });
};

/**
 * Query to get only the content (list) of tags.
 */
export const useGetTagsContent = (params?: { type?: string[]; page?: number; size?: number; }) => {
    return useQuery({
        queryKey: tagKeys.contentList(params),
        queryFn: () => TagService.getAllContent(params),
        staleTime: 15 * 60 * 1000, // 15 minutes
    });
};

/**
 * Mutation to create a batch of new tags.
 */
export const useCreateTagsBatch = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateTagsBatchRequest) => TagService.createBatch(payload),
        onSuccess: async () => {
            // Invalidate all queries related to tag lists
            await queryClient.invalidateQueries({ queryKey: tagKeys.lists() });
            await queryClient.invalidateQueries({ queryKey: tagKeys.contentLists() });
        },
    });
};