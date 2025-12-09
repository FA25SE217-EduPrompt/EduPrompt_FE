
import { ApiClient } from '../auth';
import { BaseResponse } from '@/types/api';
import { VerifyPaymentResponse } from '@/types/payment.api';

const verifyPayment = async (paymentId: string): Promise<BaseResponse<VerifyPaymentResponse>> => {
    try {
        const response = await ApiClient.get<BaseResponse<VerifyPaymentResponse>>(`/payment/${paymentId}/verify`);
        return response.data;
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

export const paymentService = {
    verifyPayment
};
