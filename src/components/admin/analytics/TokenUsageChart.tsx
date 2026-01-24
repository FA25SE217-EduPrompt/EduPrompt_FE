
import React from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { MonthlyTokenUsageSummary } from '@/services/admin/analytics';
import { useTranslations, useLocale } from 'next-intl';

interface TokenUsageChartProps {
    data: MonthlyTokenUsageSummary[];
}

export const TokenUsageChart: React.FC<TokenUsageChartProps> = ({ data }) => {
    const t = useTranslations('Admin.Analytics');
    const locale = useLocale();

    const sortedData = [...data].sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.month - b.month;
    });

    const chartData = sortedData.map(item => ({
        name: `${item.month}/${item.year}`,
        tokens: item.totalTokensUsed,
    }));

    const formatNumber = (value: number) => {
        return new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US').format(value);
    };

    const formatCompact = (value: number) => {
        return new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US', { notation: "compact" }).format(value);
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-[400px]">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('tokenUsageChartTitle')}</h3>
            <ResponsiveContainer width="100%" height="90%">
                <AreaChart data={chartData}>
                    <defs>
                        <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis
                        tickFormatter={formatCompact}
                        tick={{ fontSize: 12 }}
                    />
                    <Tooltip formatter={(value: number | undefined) => [
                        formatNumber(value || 0),
                        t('tokensUsed')
                    ]} />
                    <Area
                        type="monotone"
                        dataKey="tokens"
                        name={t('tokensUsed')}
                        stroke="#8b5cf6"
                        fillOpacity={1}
                        fill="url(#colorTokens)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};
