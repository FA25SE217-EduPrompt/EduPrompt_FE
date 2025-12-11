"use client";

import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Loader2, CheckCircle, ArrowLeft } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useTierPlans, TierPlan } from '@/lib/tiers';
import { paymentService } from '@/services/resources/payment';
import { toast } from 'sonner';

const CheckoutContent = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const t = useTranslations('Payment');
    const activeLocale = useLocale();
    const plans = useTierPlans();

    const tierId = searchParams.get('tierId');
    const selectedPlan = plans.find(p => p.id === tierId);

    const [loading, setLoading] = useState(false);

    if (!selectedPlan) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-gray-900">{t('Checkout.planNotFound')}</h2>
                    <Button variant="outline" className="mt-4" onClick={() => router.back()}>
                        {t('Checkout.goBack')}
                    </Button>
                </div>
            </div>
        );
    }

    // Currency conversion logic
    // Hardcoded rate for now as per instructions
    const EXCHANGE_RATE = 25000;

    // Calculated values
    const amountVND = selectedPlan.price * EXCHANGE_RATE;

    const handlePayment = async () => {
        setLoading(true);
        try {
            const result = await paymentService.createPayment({
                amount: amountVND,
                subscriptionTierId: selectedPlan.id,
                orderDescription: `Upgrade to ${selectedPlan.name}`
            });

            if (result.data) {
                // Redirect to VNPay URL
                window.location.href = result.data;
            } else {
                toast.error(result.error?.messages?.[0] || t('paymentFailed'));
            }
        } catch (error) {
            console.error(error);
            toast.error(t('error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <Button
                    variant="ghost"
                    className="mb-6 pl-0 hover:bg-transparent hover:text-brand-primary"
                    onClick={() => router.back()}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {t('Checkout.back')}
                </Button>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="p-8 md:p-12">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('Checkout.title')}</h1>
                        <p className="text-gray-500 mb-8">{t('Checkout.subtitle')}</p>

                        <div className="bg-brand-highlight/10 rounded-xl p-6 border border-brand-highlight/20 mb-8">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">{selectedPlan.name}</h3>
                                    <p className="text-brand-primary font-medium mt-1">{selectedPlan.period}</p>
                                </div>
                                <div className="text-right">
                                    <PriceDisplay selectedPlan={selectedPlan} />
                                </div>
                            </div>

                            <hr className="my-4 border-brand-highlight/20" />

                            <ul className="space-y-3">
                                {selectedPlan.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-start text-sm text-gray-700">
                                        <CheckCircle className="w-5 h-5 text-brand-primary mr-3 flex-shrink-0" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="flex flex-col gap-4">
                            <Button
                                variant="solid-dark"
                                className="w-full py-6 text-lg"
                                onClick={handlePayment}
                                disabled={loading}
                            >
                                {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                                <PaymentButtonText loading={loading} selectedPlan={selectedPlan} />
                            </Button>
                            <p className="text-xs text-center text-gray-400">
                                {t('Checkout.legalDisclaimer')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper components to use hooks
const PriceDisplay = ({ selectedPlan }: { selectedPlan: TierPlan }) => {
    const activeLocale = useLocale();
    const EXCHANGE_RATE = 25000;

    if (activeLocale === 'vi') {
        const amountVND = selectedPlan.price * EXCHANGE_RATE;
        return <span className="text-3xl font-bold text-gray-900">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amountVND)}</span>;
    }
    return <span className="text-3xl font-bold text-gray-900">{selectedPlan.priceString}</span>;
}

const PaymentButtonText = ({ loading, selectedPlan }: { loading: boolean, selectedPlan: TierPlan }) => {
    const activeLocale = useLocale();
    const t = useTranslations('Payment.Checkout');
    const EXCHANGE_RATE = 25000;

    if (loading) return <span>{t('processing')}</span>;

    if (activeLocale === 'vi') {
        const amountVND = selectedPlan.price * EXCHANGE_RATE;
        const formatted = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amountVND);
        return <span>{t('payWithVNPay', { amount: formatted })}</span>;
    }

    return <span>{t('payWithVNPay', { amount: selectedPlan.priceString })}</span>;
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>}>
            <CheckoutContent />
        </Suspense>
    );
}
