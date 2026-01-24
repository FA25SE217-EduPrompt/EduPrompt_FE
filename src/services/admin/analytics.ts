import { apiClient } from '../auth';

export interface MonthlyPaymentSummary {
    year: number;
    month: number;
    monthName: string;
    totalAmount: number;
    totalTransactions: number;
    successfulCount: number;
    pendingCount: number;
    failedCount: number;
    averageAmount: number;
}

export interface PaymentRecord {
    id: string;
    userId: string;
    email: string;
    fullName: string;
    tierId: string;
    tierName: string;
    amount: number;
    orderInfo: string;
    status: string;
    createdAt: string;
    paidAt: string;
}

export interface SchoolSubscriptionTokenStatus {
    id: string;
    schoolId: string;
    schoolName: string;
    schoolTokenPool: number;
    schoolTokenRemaining: number;
    tokensUsed: number;
    quotaResetDate: string;
    isActive: boolean;
    endDate: string;
}

export interface MonthlyTokenUsageSummary {
    year: number;
    month: number;
    monthName: string;
    totalTokensUsed: number;
    usageCount: number;
    uniqueTeachers: number;
}

export interface TeacherTokenUsageLog {
    id: string;
    schoolSubscriptionId: string;
    subscriptionTierId: string;
    userId: string;
    tokensUsed: number;
    usedAt: string;
}

export interface PaginatedResponse<T> {
    data: {
        content: T[];
        totalElements: number;
        totalPages: number;
        pageNumber: number;
        pageSize: number;
    };
    error: unknown;
}

export interface SingleResponse<T> {
    data: T;
    error: unknown;
}

export interface ListResponse<T> {
    data: T[];
    error: unknown;
}

export const AdminAnalyticsService = {
    getMonthlyPaymentSummary: async (): Promise<ListResponse<MonthlyPaymentSummary>> => {
        const response = await apiClient.get('/api/v1/admin/payments-summary-monthly');
        return response.data;
    },

    getAllPayments: async (page = 0, size = 20, status?: string, yearMonth?: string): Promise<PaginatedResponse<PaymentRecord>> => {
        const params: Record<string, string | number> = { page, size };
        if (status) params.status = status;
        if (yearMonth) params.yearMonth = yearMonth;

        const response = await apiClient.get('/api/v1/admin/all-payments', { params });
        return response.data;
    },

    getSchoolSubscriptionTokens: async (activeOnly = true): Promise<ListResponse<SchoolSubscriptionTokenStatus>> => {
        const response = await apiClient.get('/api/v1/admin/school-subscriptions-tokens', {
            params: { activeOnly },
        });
        return response.data;
    },

    getMonthlyTokenUsageSummary: async (): Promise<ListResponse<MonthlyTokenUsageSummary>> => {
        const response = await apiClient.get('/api/v1/admin/teacher-token/usage-monthly');
        return response.data;
    },

    getTeacherTokenUsage: async (page = 0, size = 20): Promise<PaginatedResponse<TeacherTokenUsageLog>> => {
        const response = await apiClient.get('/api/v1/admin/teacher-token-usage', {
            params: { page, size },
        });
        return response.data;
    }
};
