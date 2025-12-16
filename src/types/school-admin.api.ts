// School Admin API Types
import { BaseResponse, PaginatedResponse } from './api';

// Teacher Usage Types
export interface TeacherUsageDto {
    teacherId: string;
    teacherName: string;
    teacherEmail: string;
    totalPrompts: number;
    totalTests: number;
    totalOptimizations: number;
    tokensUsed: number;
    lastActivity: string;
}

export interface TeacherUsageParams {
    page?: number;
    size?: number;
    sort?: string;
}

export type GetTeachersUsageResponse = BaseResponse<PaginatedResponse<TeacherUsageDto>>;

// Subscription Usage Types
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

// Teacher Subscription Usage Types
export interface TeacherSubscriptionUsageDto {
    teacherId: string;
    teacherName: string;
    teacherEmail: string;
    tokensUsed: number;
    testsUsed: number;
    optimizationsUsed: number;
    percentage: number;
}

export interface TeacherSubscriptionUsageParams {
    teacherId: string;
}

export type GetTeacherSubscriptionUsageResponse = BaseResponse<TeacherSubscriptionUsageDto>;

// All Teachers Subscription Usage Types
export interface AllTeachersSubscriptionUsageParams {
    page?: number;
    size?: number;
    sort?: string;
}

export type GetAllTeachersSubscriptionUsageResponse = BaseResponse<PaginatedResponse<TeacherSubscriptionUsageDto>>;

// Request Options
export interface SchoolAdminRequestOptions {
    signal?: AbortSignal;
}
