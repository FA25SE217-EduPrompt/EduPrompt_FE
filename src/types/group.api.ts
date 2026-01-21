import { BaseResponse, PaginatedResponse } from '@/types/api';

export type GroupMember = {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    role: 'admin' | 'member';
    joinedAt: string;
};

export type GroupResponse = {
    id: string;
    name: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
    memberCount: number;
    ownerId: string;
    isActive: boolean;
    // members?: GroupMember[]; // Might be fetched separately
};

export type CreateGroupRequest = {
    name: string;
};

export type UpdateGroupRequest = {
    name: string;
    isActive: boolean;
};

export type RemoveGroupMemberRequest = {
    userId: string;
};

export type AddMemberRequest = {
    members: { userId: string }[];
};

export type GetMyGroupsResponse = BaseResponse<PaginatedResponse<GroupResponse>>;
export type CreateGroupResponse = BaseResponse<GroupResponse>;
export type GetGroupResponse = BaseResponse<GroupResponse>;
export type GetGroupMembersResponse = BaseResponse<PaginatedResponse<GroupMember>>;
