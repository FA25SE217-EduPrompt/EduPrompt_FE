'use client';

import { useState, useEffect } from 'react';
import SchoolAdminService from '@/services/resources/schoolAdmin';
import { SubscriptionUsageDto } from '@/types/school-admin.api';
import { mapErrorToUserMessage } from '@/utils/errorMapper';
import { useTranslations } from 'next-intl';

export default function SubscriptionUsagePage() {
    const t = useTranslations('SchoolAdmin.SubscriptionUsage');
    const [usage, setUsage] = useState<SubscriptionUsageDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchUsage();
    }, []);

    const fetchUsage = async () => {
        setLoading(true);
        setError(null);

        const result = await SchoolAdminService.getSubscriptionUsage();

        const mockUsage: SubscriptionUsageDto = {
            subscriptionId: 'mock-sub-id',
            subscriptionType: 'Standard School',
            tokensUsed: 45000,
            totalTokensLimit: 100000,
            tokensRemaining: 55000,
            testsUsed: 120,
            testsLimit: 500,
            testsRemaining: 380,
            optimizationsUsed: 85,
            optimizationsLimit: 200,
            optimizationsRemaining: 115,
            resetDate: new Date().toISOString(),
            isActive: true,
        };

        if (result.error) {
            // Nếu API lỗi, dùng fake data
            setUsage(mockUsage);
            setError(mapErrorToUserMessage({ error: result.error }));
            setLoading(false);
            return;
        }

        if (result.data) {
            // Kết hợp real data với fake data (ưu tiên real data)
            const hasRealData = result.data.totalTokensLimit > 0 || result.data.testsLimit > 0 || result.data.optimizationsLimit > 0;
            setUsage(hasRealData ? result.data : mockUsage);
        } else {
            setUsage(mockUsage);
        }
        setLoading(false);
    };

    const calculatePercentage = (used: number, limit: number) => {
        if (limit === 0) return 0;
        return Math.round((used / limit) * 100);
    };

    const getProgressColor = (percentage: number) => {
        if (percentage >= 90) return 'bg-red-600';
        if (percentage >= 70) return 'bg-yellow-600';
        return 'bg-green-600';
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="ml-3 text-gray-600">{t('loading')}</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                    {error}
                </div>
            </div>
        );
    }

    if (!usage) {
        return (
            <div className="p-6">
                <div className="text-center text-gray-600">{t('noData')}</div>
            </div>
        );
    }

    const tokenPercentage = calculatePercentage(usage?.tokensUsed ?? 0, usage?.totalTokensLimit ?? 0);
    const testsPercentage = calculatePercentage(usage?.testsUsed ?? 0, usage?.testsLimit ?? 0);
    const optimizationsPercentage = calculatePercentage(usage?.optimizationsUsed ?? 0, usage?.optimizationsLimit ?? 0);

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
                <p className="text-gray-600 mt-1">
                    {t('description')}
                </p>
            </div>

            {/* Subscription Info */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">{t('subscription')}</h2>
                        <p className="text-sm text-gray-500">{t('subscriptionId')}: {usage?.subscriptionId ?? 'N/A'}</p>
                    </div>
                    <div className="flex items-center">
                        <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${usage?.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                                }`}
                        >
                            {usage?.isActive ? t('active') : t('inactive')}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-gray-500">{t('packageType')}</p>
                        <p className="text-lg font-semibold text-gray-900">{usage?.subscriptionType ?? 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">{t('resetDate')}</p>
                        <p className="text-lg font-semibold text-gray-900">
                            {usage?.resetDate ? new Date(usage.resetDate).toLocaleDateString('vi-VN') : 'N/A'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Usage Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* Tokens */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">{t('token')}</h3>
                        <span className="text-sm text-gray-500">{tokenPercentage}%</span>
                    </div>
                    <div className="mb-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span>{t('used')}: {(usage?.tokensUsed ?? 0).toLocaleString()}</span>
                            <span>{t('limit')}: {(usage?.totalTokensLimit ?? 0).toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                                className={`h-2.5 rounded-full ${getProgressColor(tokenPercentage)}`}
                                style={{ width: `${Math.min(tokenPercentage, 100)}%` }}
                            ></div>
                        </div>
                    </div>
                    <p className="text-sm text-gray-500">
                        {t('remaining')}: {(usage?.tokensRemaining ?? 0).toLocaleString()}
                    </p>
                </div>

                {/* Tests */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">{t('tests')}</h3>
                        <span className="text-sm text-gray-500">{testsPercentage}%</span>
                    </div>
                    <div className="mb-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span>{t('used')}: {(usage?.testsUsed ?? 0).toLocaleString()}</span>
                            <span>{t('limit')}: {(usage?.testsLimit ?? 0).toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                                className={`h-2.5 rounded-full ${getProgressColor(testsPercentage)}`}
                                style={{ width: `${Math.min(testsPercentage, 100)}%` }}
                            ></div>
                        </div>
                    </div>
                    <p className="text-sm text-gray-500">
                        {t('remaining')}: {(usage?.testsRemaining ?? 0).toLocaleString()}
                    </p>
                </div>

                {/* Optimizations */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">{t('optimizations')}</h3>
                        <span className="text-sm text-gray-500">{optimizationsPercentage}%</span>
                    </div>
                    <div className="mb-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span>{t('used')}: {(usage?.optimizationsUsed ?? 0).toLocaleString()}</span>
                            <span>{t('limit')}: {(usage?.optimizationsLimit ?? 0).toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                                className={`h-2.5 rounded-full ${getProgressColor(optimizationsPercentage)}`}
                                style={{ width: `${Math.min(optimizationsPercentage, 100)}%` }}
                            ></div>
                        </div>
                    </div>
                    <p className="text-sm text-gray-500">
                        {t('remaining')}: {(usage?.optimizationsRemaining ?? 0).toLocaleString()}
                    </p>
                </div>
            </div>

            {/* Warnings */}
            {(tokenPercentage >= 90 || testsPercentage >= 90 || optimizationsPercentage >= 90) && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg
                                className="h-5 w-5 text-yellow-400"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-yellow-800">{t('warning')}</h3>
                            <div className="mt-2 text-sm text-yellow-700">
                                <p>{t('warningMessage')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
