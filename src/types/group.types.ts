// Group types
export interface Group {
    id: string;
    name: string;
    schoolId: string | null;
    isActive: boolean;
    createdAt: string;
}

export interface GroupsResponse {
    content: Group[];
    totalElements: number;
    totalPages: number;
    pageNumber: number;
    pageSize: number;
}

export interface CreateGroupRequest {
    name: string;
    schoolId?: string;
}

export interface UpdateGroupRequest {
    name?: string;
    schoolId?: string;
    isActive?: boolean;
}
