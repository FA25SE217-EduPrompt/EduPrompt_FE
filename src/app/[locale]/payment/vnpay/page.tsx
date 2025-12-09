"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
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
                setMessage(t(`errors.${responseCode}`) || t('errors.unknown'));
                return;
            }

            try {
                // Extract paymentId from txnRef (format: userId_tierId_timestamp_paymentId)
                const parts = txnRef.split('_');
                const paymentId = parts[parts.length - 1]; // Assume last part is paymentId based on user description

                if (!paymentId) {
                    throw new Error('Invalid transaction reference format');
                }

                // Verify with backend
                const response = await paymentService.verifyPayment(paymentId);

                if (response.error) {
                    setStatus('error');
                    setMessage(response.error.messages[0] || t('verificationFailed'));
                } else {
                    setStatus('success');
                    setMessage(t('successMessage'));
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
        router.push('/dashboard/subscription');
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
                )} // Add more robust error handling later

                {status === 'error' && (
                    <div className="flex flex-col items-center space-y-4 animate-in fade-in zoom-in duration-300">
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                            <XCircle className="w-10 h-10 text-red-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">{t('paymentFailed')}</h2>
                        <p className="text-gray-600">{message}</p>
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
