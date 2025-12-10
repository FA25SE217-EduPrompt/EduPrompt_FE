"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import { paymentService } from '@/services/resources/payment';
import { VNPayResponseCode } from '@/types/payment.api';

const PaymentResultContent = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const t = useTranslations('Payment');

    // Extract params
    const responseCode = searchParams.get('vnp_ResponseCode');
    const txnRef = searchParams.get('vnp_TxnRef');

    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState<string>('');

    useEffect(() => {
        const verify = async () => {
            if (!responseCode || !txnRef) {
                setStatus('error');
                setMessage(t('invalidParams'));
                return;
            }

            // Client-side check for response code first
            if (responseCode !== VNPayResponseCode.SUCCESS) {
                setStatus('error');
                // Construct error message key
                const errorKey = `errors.${responseCode}`;
                // We will use a fallback logic in component rendering if key doesn't exist,
                // but for now let's set a generic message or specific provided code
                setMessage(responseCode);
                return;
            }

            try {
                // Pass the full query string to the backend to verify and update status
                const queryString = searchParams.toString();
                const response = await paymentService.processVnPayReturn(queryString);

                if (response.error) {
                    setStatus('error');
                    const errorMsg = response.error.messages?.[0] || t('verificationFailed');
                    setMessage(errorMsg);
                } else if (response.data) {
                    // Check rspCode as requested
                    if (response.data.rspCode === '00') {
                        setStatus('success');
                        setMessage(response.data.message || t('successMessage'));
                    } else {
                        setStatus('error');
                        // Use backend message or fallback
                        setMessage(response.data.message || t('paymentFailedBackend'));
                    }
                }
            } catch (err) {
                console.error(err);
                setStatus('error');
                setMessage(t('verificationFailed'));
            }
        };

        verify();
    }, [responseCode, txnRef, t]);

    const handleBackToDashboard = () => {
        router.push('/dashboard/subscription'); // Redirect to subscription page
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center space-y-6">
                {status === 'loading' && (
                    <div className="flex flex-col items-center space-y-4">
                        <Loader2 className="w-16 h-16 text-brand-primary animate-spin" />
                        <h2 className="text-xl font-semibold text-gray-900">{t('processing')}</h2>
                        <p className="text-gray-500">{t('pleaseWait')}</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center space-y-4 animate-in fade-in zoom-in duration-300">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-10 h-10 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">{t('paymentSuccessful')}</h2>
                        <p className="text-gray-600">{message}</p>
                        <Button
                            className="w-full mt-4"
                            onClick={handleBackToDashboard}
                        >
                            {t('backToSubscription')}
                        </Button>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center space-y-4 animate-in fade-in zoom-in duration-300">
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                            <XCircle className="w-10 h-10 text-red-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">{t('paymentFailed')}</h2>
                        <p className="text-gray-600">
                            {/* Try to translate error code, fallback to generic or raw code */}
                            {['07', '09', '10', '11', '12', '13', '24', '51', '65', '75', '79', '99'].includes(message)
                                ? t(`errors.${message}`)
                                : message
                            }
                        </p>
                        <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-500 w-full mb-2">
                            {t('supportContact')}: support@eduprompt.com
                        </div>
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={handleBackToDashboard}
                        >
                            {t('backToSubscription')}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default function VNPayReturnPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <PaymentResultContent />
        </Suspense>
    );
}
