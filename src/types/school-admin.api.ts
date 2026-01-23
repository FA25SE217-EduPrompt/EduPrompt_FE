// School Admin API Types - Matching Backend Response
import { BaseResponse, PaginatedResponse } from './api';

// SchoolUsageSummaryResponse - GET /api/school-admin/teachers-usage
export interface UserUsageResponse {
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string | null;
    schoolTokensUsed: number;
    individualTokensUsed: number | null;
}

export interface SchoolUsageSummaryDto {
    schoolName: string;
    totalTeachers: number;
    schoolTokenPool: number;
    schoolTokensUsed: number;
    schoolTokensRemaining: number;
    totalTeachersId: number;
    users: UserUsageResponse[];
}

export type GetTeachersUsageResponse = BaseResponse<SchoolUsageSummaryDto>;

// SchoolSubscriptionUsageResponse - GET /api/school-admin/subscription/usage
export interface SubscriptionUsageDto {
    subscriptionId: string;
    subscriptionType: string;
    totalTokensLimit: number;
    tokensUsed: number;
    tokensRemaining: number;
    testsLimit: number;
    testsUsed: number;
    testsRemaining: number;
    optimizationsLimit: number;
    optimizationsUsed: number;
    optimizationsRemaining: number;
    resetDate: string;
    isActive: boolean;
}

export type GetSubscriptionUsageResponse = BaseResponse<SubscriptionUsageDto>;

// TeacherTokenUsageLogResponse - GET /api/school-admin/subscription/usage/teacher
export interface TeacherTokenUsageLogDto {
    id: string;
    userId: string;
    userName: string;
    actionType: string; // TEST, OPTIMIZATION, etc.
    tokensUsed: number;
    createdAt: string;
}

export interface TeacherSubscriptionUsageParams {
    userId: string;
    page?: number;
    size?: number;
}

export type GetTeacherSubscriptionUsageResponse = BaseResponse<PaginatedResponse<TeacherTokenUsageLogDto>>;

// PaginatedTeacherTokenUsageLogResponse - GET /api/school-admin/subscription/usage/all-teacher
export interface AllTeachersSubscriptionUsageParams {
    page?: number;
    size?: number;
}

export type GetAllTeachersSubscriptionUsageResponse = BaseResponse<PaginatedResponse<TeacherTokenUsageLogDto>>;

// Request Options
export interface SchoolAdminRequestOptions {
    signal?: AbortSignal;
}
