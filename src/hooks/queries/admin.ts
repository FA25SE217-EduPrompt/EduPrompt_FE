// hooks/queries/admin.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { promptsService } from '@/services/resources/prompts';
import { adminService } from '@/services/resources/admin';
import {
    ApiRequestOptions,
    AdminCreatePromptRequest,
    AdminCreatePromptInCollectionRequest,
    UpdatePromptMetadataRequest,
    UpdatePromptVisibilityRequest,
} from '@/types/prompt.api';
import {
    CreateSchoolAdminAccountRequest,
    CreateSchoolSubscriptionRequest,
} from '@/types/school.api';
import { promptKeys } from './prompt';

/* ----------------------------
   Query Keys
   ---------------------------- */
export const adminKeys = {
    all: ['admin'] as const,
    prompts: () => [...adminKeys.all, 'prompts'] as const,
    schools: () => [...adminKeys.all, 'schools'] as const,
    subscriptions: () => [...adminKeys.all, 'subscriptions'] as const,
    schoolAdmins: () => [...adminKeys.all, 'schoolAdmins'] as const,
};

/* ----------------------------
   Admin Prompt Mutations
   ---------------------------- */

/**
 * Mutation to create a standalone prompt (admin)
 */
export const useAdminCreatePromptStandalone = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            payload,
            opts,
        }: {
            payload: AdminCreatePromptRequest;
            opts?: ApiRequestOptions;
        }) => promptsService.createPromptStandaloneAdmin(payload, opts),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: adminKeys.prompts(),
            });
            await queryClient.invalidateQueries({
                queryKey: promptKeys.all,
            });
        },
    });
};

/**
 * Mutation to create a prompt in a collection (admin)
 */
export const useAdminCreatePromptInCollection = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            payload,
            opts,
        }: {
            payload: AdminCreatePromptInCollectionRequest;
            opts?: ApiRequestOptions;
        }) => promptsService.createPromptInCollectionAdmin(payload, opts),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: adminKeys.prompts(),
            });
            await queryClient.invalidateQueries({
                queryKey: promptKeys.all,
            });
        },
    });
};

/**
 * Mutation to update prompt visibility (admin)
 */
export const useAdminUpdatePromptVisibility = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            promptId,
            payload,
            opts,
        }: {
            promptId: string;
            payload: UpdatePromptVisibilityRequest;
            opts?: ApiRequestOptions;
        }) => promptsService.updatePromptVisibilityAdmin(promptId, payload, opts),
        onSuccess: async (data, variables) => {
            await queryClient.invalidateQueries({
                queryKey: adminKeys.prompts(),
            });
            await queryClient.invalidateQueries({
                queryKey: promptKeys.detail(variables.promptId),
            });
        },
    });
};

/**
 * Mutation to update prompt metadata (admin)
 */
export const useAdminUpdatePromptMetadata = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            promptId,
            payload,
            opts,
        }: {
            promptId: string;
            payload: UpdatePromptMetadataRequest;
            opts?: ApiRequestOptions;
        }) => promptsService.updatePromptMetadataAdmin(promptId, payload, opts),
        onSuccess: async (data, variables) => {
            await queryClient.invalidateQueries({
                queryKey: adminKeys.prompts(),
            });
            await queryClient.invalidateQueries({
                queryKey: promptKeys.detail(variables.promptId),
            });
        },
    });
};

/* ----------------------------
   School Admin Mutations
   ---------------------------- */

/**
 * Mutation to create a school admin account
 */
export const useAdminCreateSchoolAdminAccount = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            payload,
            opts,
        }: {
            payload: CreateSchoolAdminAccountRequest;
            opts?: ApiRequestOptions;
        }) => adminService.createSchoolAdminAccount(payload, opts),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: adminKeys.schoolAdmins(),
            });
        },
    });
};

/**
 * Mutation to create or update a school subscription
 */
export const useAdminCreateSchoolSubscription = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            schoolId,
            payload,
            opts,
        }: {
            schoolId: number;
            payload: CreateSchoolSubscriptionRequest;
            opts?: ApiRequestOptions;
        }) => adminService.createSchoolSubscription(schoolId, payload, opts),
        onSuccess: async (data, variables) => {
            await queryClient.invalidateQueries({
                queryKey: adminKeys.subscriptions(),
            });
            await queryClient.invalidateQueries({
                queryKey: [...adminKeys.schools(), variables.schoolId],
            });
        },
    });
};
