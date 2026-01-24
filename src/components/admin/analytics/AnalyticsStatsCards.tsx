
import React from 'react';
import {
    BanknotesIcon,
    CreditCardIcon,
    ServerStackIcon
} from '@heroicons/react/24/outline';
import { useTranslations, useLocale } from 'next-intl';

interface AnalyticsStatsCardsProps {
    totalRevenue: number;
    totalTransactions: number;
    totalTokenUsage: number;
}

export const AnalyticsStatsCards: React.FC<AnalyticsStatsCardsProps> = ({
    totalRevenue,
    totalTransactions,
    totalTokenUsage,
}) => {
    const t = useTranslations('Admin.Analytics');
    const locale = useLocale();

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US', { style: 'currency', currency: locale === 'vi' ? 'VND' : 'USD' }).format(amount);
    };

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US').format(num);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                    <BanknotesIcon className="w-8 h-8" />
                </div>
                <div>
                    <p className="text-sm text-gray-500 font-medium">{t('totalRevenue')}</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                    <CreditCardIcon className="w-8 h-8" />
                </div>
                <div>
                    <p className="text-sm text-gray-500 font-medium">{t('totalTransactions')}</p>
                    <p className="text-2xl font-bold text-gray-900">{formatNumber(totalTransactions)}</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
                    <ServerStackIcon className="w-8 h-8" />
                </div>
                <div>
                    <p className="text-sm text-gray-500 font-medium">{t('totalTokenUsage')}</p>
                    <p className="text-2xl font-bold text-gray-900">{formatNumber(totalTokenUsage)}</p>
                </div>
            </div>
        </div>
    );
};
