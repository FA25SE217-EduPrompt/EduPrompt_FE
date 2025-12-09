
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { groupService } from '@/services/resources/group';
import { CreateGroupRequest, AddMemberRequest } from '@/types/group.api';

export const groupKeys = {
    all: ['groups'] as const,
    lists: () => [...groupKeys.all, 'list'] as const,
    list: (filters: string) => [...groupKeys.lists(), { filters }] as const,
    details: () => [...groupKeys.all, 'detail'] as const,
    detail: (id: string) => [...groupKeys.details(), id] as const,
    members: (id: string) => [...groupKeys.detail(id), 'members'] as const,
};

export const useGetMyGroups = (page: number = 0, size: number = 20) => {
    return useQuery({
        queryKey: groupKeys.list(`page=${page}&size=${size}`),
        queryFn: async () => {
            const response = await groupService.getMyGroups(page, size);
            if (response.error) {
                throw new Error(response.error.messages[0] || 'Unknown error');
            }
            return response.data;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

export const useCreateGroup = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: CreateGroupRequest) => {
            const response = await groupService.createGroup(payload);
            if (response.error) {
                throw new Error(response.error.messages[0] || 'Unknown error');
            }
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: groupKeys.lists() });
        },
    });
};

export const useGetGroup = (id: string) => {
    return useQuery({
        queryKey: groupKeys.detail(id),
        queryFn: async () => {
            const response = await groupService.getGroup(id);
            if (response.error) {
                throw new Error(response.error.messages[0] || 'Unknown error');
            }
            return response.data;
        },
    });
};

export const useUpdateGroup = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: CreateGroupRequest }) => {
            const response = await groupService.updateGroup(id, data);
            if (response.error) {
                throw new Error(response.error.messages[0] || 'Unknown error');
            }
            return response.data;
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: groupKeys.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: groupKeys.lists() });
        },
    });
};

export const useDeleteGroup = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const response = await groupService.deleteGroup(id);
            if (response.error) {
                throw new Error(response.error.messages[0] || 'Unknown error');
            }
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: groupKeys.lists() });
        },
    });
};

export const useGetGroupMembers = (id: string) => {
    return useQuery({
        queryKey: groupKeys.members(id),
        queryFn: async () => {
            const response = await groupService.getGroupMembers(id);
            if (response.error) {
                throw new Error(response.error.messages[0] || 'Unknown error');
            }
            return response.data;
        },
        enabled: !!id,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

export const useAddMember = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: AddMemberRequest }) => {
            const response = await groupService.addMember(id, data);
            if (response.error) {
                throw new Error(response.error.messages[0] || 'Unknown error');
            }
            return response.data;
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: groupKeys.members(variables.id) });
        },
    });
};

export const useRemoveMember = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ groupId, userId }: { groupId: string; userId: string }) => {
            const response = await groupService.removeMember(groupId, userId);
            if (response.error) {
                throw new Error(response.error.messages[0] || 'Unknown error');
            }
            return response.data;
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: groupKeys.members(variables.groupId) });
        },
    });
};
