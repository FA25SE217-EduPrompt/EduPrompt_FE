export type School = {
    id: number | string;
    name: string;
    address?: string;
    phoneNumber?: string;
    email?: string;
    website?: string;
    description?: string;
    establishedYear?: number;
};

export interface JoinSchoolRequest {
    schoolId: number | string;
}

export interface CreateSchoolAdminAccountRequest {
    schoolId: string;
    email: string;
    fullName: string;
    password?: string;
}

export interface SchoolAdminAccountResponse {
    id: string;
    email: string;
    role: string;
    schoolId: string;
}

export interface CreateSchoolSubscriptionRequest {
    planId: string;
    startDate?: string;
    endDate?: string;
    isAutoRenew?: boolean;
    maxTokens?: number;
}

export interface SchoolSubscriptionResponse {
    id: string;
    schoolId: string;
    planId: string;
    status: string;
    startDate: string;
    endDate: string;
}

