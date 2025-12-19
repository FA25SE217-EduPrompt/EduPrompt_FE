// User-related TypeScript types

export enum UserRole {
    ADMIN = 'ADMIN',
    TEACHER = 'TEACHER',
    STUDENT = 'STUDENT',
    SCHOOL_ADMIN = 'SCHOOL_ADMIN',
    SYSTEM_ADMIN = 'SYSTEM_ADMIN'
}

export interface User {
    id: string;
    subscriptionTierId: string;
    schoolId: string | null;
    firstName: string;
    lastName: string;
    phoneNumber: string | null;
    email: string;
    role: UserRole;
    isActive: boolean;
    isVerified: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface UsersResponse {
    data: {
        content: User[];
        totalElements: number;
        totalPages: number;
        pageNumber: number;
        pageSize: number;
    };
    error: null | string;
}
