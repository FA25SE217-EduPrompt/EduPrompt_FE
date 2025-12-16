import { BaseResponse, PaginatedResponse } from '@/types/api';

export type GroupMember = {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    role: 'OWNER' | 'MEMBER'; // Assumed roles
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
    // members?: GroupMember[]; // Might be fetched separately
};

export type CreateGroupRequest = {
    name: string;
    description?: string;
};

export type AddMemberRequest = {
    email: string;
};

export type GetMyGroupsResponse = BaseResponse<PaginatedResponse<GroupResponse>>;
export type CreateGroupResponse = BaseResponse<GroupResponse>;
export type GetGroupResponse = BaseResponse<GroupResponse>;
export type GetGroupMembersResponse = BaseResponse<GroupMember[]>;
