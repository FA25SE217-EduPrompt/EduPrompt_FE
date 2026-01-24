
import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { MonthlyPaymentSummary } from '@/services/admin/analytics';
import { useTranslations, useLocale } from 'next-intl';

interface RevenueChartProps {
    data: MonthlyPaymentSummary[];
}

export const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
    const t = useTranslations('Admin.Analytics');
    const locale = useLocale();

    // Sort data by year and month to ensure chronological order
    const sortedData = [...data].sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.month - b.month;
    });

    const chartData = sortedData.map(item => ({
        name: `${item.month}/${item.year}`,
        amount: item.totalAmount,
    }));

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US', { style: 'currency', currency: locale === 'vi' ? 'VND' : 'USD' }).format(value);
    };

    const formatCompact = (value: number) => {
        return new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US', { notation: "compact", compactDisplay: "short" }).format(value);
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-[400px]">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('revenueChartTitle')}</h3>
            <ResponsiveContainer width="100%" height="90%">
                <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis
                        tickFormatter={formatCompact}
                        tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                        formatter={(value: number | undefined) => [
                            formatCurrency(value || 0),
                            t('revenue')
                        ]}
                        cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                    />
                    <Legend />
                    <Bar dataKey="amount" name={t('revenue')} fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};
