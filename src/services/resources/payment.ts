
import { apiClient } from '../auth';
import { BaseResponse, PaginatedResponse } from '@/types/api';
import { PaymentRequest, PaymentDetailedResponse, PaymentHistoryResponse } from '@/types/payment.api';

const createPayment = async (data: PaymentRequest): Promise<BaseResponse<string>> => {
    try {
        const response = await apiClient.post<BaseResponse<string>>('/api/payments/vnpay/vnpay', data);
        return response.data;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        return {
            data: null,
            error: error.response?.data?.error || {
                code: 'UNKNOWN_ERROR',
                messages: [error.message],
                status: '500'
            }
        };
    }
};

const getPayment = async (id: string): Promise<BaseResponse<PaymentDetailedResponse>> => {
    try {
        const response = await apiClient.get<BaseResponse<PaymentDetailedResponse>>(`/api/payments/vnpay/${id}`);
        return response.data;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        return {
            data: null,
            error: error.response?.data?.error || {
                code: 'UNKNOWN_ERROR',
                messages: [error.message],
                status: '500'
            }
        };
    }
};

const getMyPayments = async (page: number = 0, size: number = 20): Promise<BaseResponse<PaginatedResponse<PaymentHistoryResponse>>> => {
    try {
        const response = await apiClient.get<BaseResponse<PaginatedResponse<PaymentHistoryResponse>>>(`/api/payments/vnpay/my-payment?page=${page}&size=${size}`);
        return response.data;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        return {
            data: null,
            error: error.response?.data?.error || {
                code: 'UNKNOWN_ERROR',
                messages: [error.message],
                status: '500'
            }
        };
    }
};

const processVnPayReturn = async (queryString: string): Promise<BaseResponse<{ rspCode: string; message: string }>> => {
    try {
        const response = await apiClient.get<{ rspCode: string; message: string }>(`/api/payments/vnpay/vnpay-return?${queryString}`);
        // Backend returns raw object, so we wrap it to match the expected BaseResponse structure
        return {
            data: response.data,
            error: null
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        return {
            data: null,
            error: error.response?.data?.error || {
                code: 'UNKNOWN_ERROR',
                messages: [error.message],
                status: '500'
            }
        };
    }
}

export const paymentService = {
    createPayment,
    getPayment,
    getMyPayments,
    processVnPayReturn
};
