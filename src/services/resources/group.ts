import { apiClient } from '@/services/auth';
import { BaseResponse } from '@/types/api';
import {
    CreateGroupRequest,
    CreateGroupResponse,
    GetMyGroupsResponse,
    GetGroupResponse,
    AddMemberRequest,
    GetGroupMembersResponse
} from '@/types/group.api';
import ApiCall from '@/utils/apiCall';
import { buildRequestConfig } from '@/services/resources/prompts';
import { ApiRequestOptions } from '@/types/prompt.api';

const BASE = '/api/groups';

export const groupService = {
    /**
     * GET /api/groups/my-group
     * Get paginated groups for the current user.
     */
    async getMyGroups(
        page = 0,
        size = 20,
        opts?: ApiRequestOptions,
    ): Promise<GetMyGroupsResponse> {
        return ApiCall(() =>
            apiClient.request({
                url: `${BASE}/my-group?page=${page}&size=${size}`,
                method: 'get',
                ...buildRequestConfig(opts),
            }),
        );
    },

    /**
     * POST /api/groups/create
     * Create a new group.
     */
    async createGroup(
        payload: CreateGroupRequest,
        opts?: ApiRequestOptions,
    ): Promise<CreateGroupResponse> {
        return ApiCall(() =>
            apiClient.request({
                url: `${BASE}/create`,
                method: 'post',
                data: payload,
                ...buildRequestConfig(opts),
            }),
        );
    },

    /**
     * GET /api/groups/{id}
     * Get group details.
     */
    async getGroup(
        id: string,
        opts?: ApiRequestOptions,
    ): Promise<GetGroupResponse> {
        return ApiCall(() =>
            apiClient.request({
                url: `${BASE}/${id}`,
                method: 'get',
                ...buildRequestConfig(opts),
            }),
        );
    },

    /**
     * PUT /api/groups/{id}
     * Update group details.
     */
    async updateGroup(
        id: string,
        payload: CreateGroupRequest,
        opts?: ApiRequestOptions,
    ): Promise<CreateGroupResponse> {
        return ApiCall(() =>
            apiClient.request({
                url: `${BASE}/${id}`,
                method: 'put',
                data: payload,
                ...buildRequestConfig(opts),
            }),
        );
    },

    /**
     * DELETE /api/groups/{id}
     * Delete group.
     */
    async deleteGroup(
        id: string,
        opts?: ApiRequestOptions,
    ): Promise<BaseResponse<void>> {
        return ApiCall(() =>
            apiClient.request({
                url: `${BASE}/${id}`,
                method: 'delete',
                ...buildRequestConfig(opts),
            }),
        );
    },

    /**
     * GET /api/groups/{id}/members
     * Get group members.
     */
    async getGroupMembers(
        id: string,
        opts?: ApiRequestOptions,
    ): Promise<GetGroupMembersResponse> {
        return ApiCall(() =>
            apiClient.request({
                url: `${BASE}/${id}/members`,
                method: 'get',
                ...buildRequestConfig(opts),
            }),
        );
    },

    /**
     * POST /api/groups/{id}/members
     * Add member to group.
     */
    async addMember(
        id: string,
        payload: AddMemberRequest,
        opts?: ApiRequestOptions,
    ): Promise<BaseResponse<void>> {
        return ApiCall(() =>
            apiClient.request({
                url: `${BASE}/${id}/members`,
                method: 'post',
                data: payload,
                ...buildRequestConfig(opts),
            }),
        );
    },

    /**
     * DELETE /api/groups/{id}/members
     * Remove member from group.
     * Assumed query param: userId
     */
    async removeMember(
        groupId: string,
        userId: string,
        opts?: ApiRequestOptions,
    ): Promise<BaseResponse<void>> {
        return ApiCall(() =>
            apiClient.request({
                url: `${BASE}/${groupId}/members?userId=${userId}`,
                method: 'delete',
                ...buildRequestConfig(opts),
            }),
        );
    },
};

export default groupService;
