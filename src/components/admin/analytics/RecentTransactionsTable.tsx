
import React from 'react';
import { PaymentRecord } from '@/services/admin/analytics';
import { useTranslations, useLocale } from 'next-intl';

interface RecentTransactionsTableProps {
    transactions: PaymentRecord[];
}

export const RecentTransactionsTable: React.FC<RecentTransactionsTableProps> = ({ transactions }) => {
    const t = useTranslations('Admin.Analytics');
    const locale = useLocale();

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'SUCCESS':
                return 'bg-green-100 text-green-800';
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800';
            case 'FAILED':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">{t('recentTransactions')}</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th className="px-6 py-3">{t('user')}</th>
                            <th className="px-6 py-3">{t('plan')}</th>
                            <th className="px-6 py-3">{t('amount')}</th>
                            <th className="px-6 py-3">{t('status')}</th>
                            <th className="px-6 py-3">{t('date')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                                    {t('noTransactions')}
                                </td>
                            </tr>
                        ) : (
                            transactions.map((transaction) => (
                                <tr key={transaction.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                        <div>
                                            <div className="font-semibold">{transaction.fullName}</div>
                                            <div className="text-xs text-gray-500">{transaction.email}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">{transaction.tierName}</td>
                                    <td className="px-6 py-4">
                                        {new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US', { style: 'currency', currency: locale === 'vi' ? 'VND' : 'USD' }).format(transaction.amount)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                                            {transaction.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {new Date(transaction.createdAt).toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US')}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
