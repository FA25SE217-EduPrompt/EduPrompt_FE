
"use client";

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { AdminAnalyticsService, MonthlyPaymentSummary, MonthlyTokenUsageSummary, PaymentRecord } from '@/services/admin/analytics';
import { AnalyticsStatsCards } from '@/components/admin/analytics/AnalyticsStatsCards';
import { RevenueChart } from '@/components/admin/analytics/RevenueChart';
import { TokenUsageChart } from '@/components/admin/analytics/TokenUsageChart';
import { RecentTransactionsTable } from '@/components/admin/analytics/RecentTransactionsTable';
import { toast } from 'sonner';

export default function AnalyticsPage() {
    const t = useTranslations('Admin.Analytics');
    const [isLoading, setIsLoading] = useState(true);
    const [revenueData, setRevenueData] = useState<MonthlyPaymentSummary[]>([]);
    const [tokenData, setTokenData] = useState<MonthlyTokenUsageSummary[]>([]);
    const [recentTransactions, setRecentTransactions] = useState<PaymentRecord[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [revenueRes, tokenRes, transactionsRes] = await Promise.all([
                    AdminAnalyticsService.getMonthlyPaymentSummary(),
                    AdminAnalyticsService.getMonthlyTokenUsageSummary(),
                    AdminAnalyticsService.getAllPayments(0, 5) // Top 5 recent
                ]);

                if (revenueRes.error) toast.error(t('errorFetchingRevenue'));
                if (tokenRes.error) toast.error(t('errorFetchingToken'));
                if (transactionsRes.error) toast.error(t('errorFetchingTransactions'));

                setRevenueData(revenueRes.data || []);
                setTokenData(tokenRes.data || []);
                setRecentTransactions(transactionsRes.data?.content || []);
            } catch (error) {
                console.error("Failed to fetch analytics data", error);
                toast.error(t('genericError'));
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [t]);

    const totalRevenue = revenueData.reduce((acc, curr) => acc + curr.totalAmount, 0);
    const totalTransactions = revenueData.reduce((acc, curr) => acc + curr.totalTransactions, 0);
    const totalTokenUsage = tokenData.reduce((acc, curr) => acc + curr.totalTokensUsed, 0);

    if (isLoading) {
        return (
            <div className="p-8 space-y-8 animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="h-32 bg-gray-200 rounded-xl"></div>
                    <div className="h-32 bg-gray-200 rounded-xl"></div>
                    <div className="h-32 bg-gray-200 rounded-xl"></div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="h-96 bg-gray-200 rounded-xl"></div>
                    <div className="h-96 bg-gray-200 rounded-xl"></div>
                </div>
                <div className="h-64 bg-gray-200 rounded-xl"></div>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">{t('pageTitle')}</h1>
                <p className="text-gray-600 mt-2">{t('pageDescription')}</p>
            </div>

            <AnalyticsStatsCards
                totalRevenue={totalRevenue}
                totalTransactions={totalTransactions}
                totalTokenUsage={totalTokenUsage}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RevenueChart data={revenueData} />
                <TokenUsageChart data={tokenData} />
            </div>

            <RecentTransactionsTable transactions={recentTransactions} />
        </div>
    );
}
