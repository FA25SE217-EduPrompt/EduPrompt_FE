
import React from 'react';
import { PaymentRecord } from '@/services/admin/analytics';
import { useTranslations, useLocale } from 'next-intl';

interface RecentTransactionsTableProps {
    transactions: PaymentRecord[];
    totalPages: number;
    currentPage: number;
    onPageChange: (page: number) => void;
}

export const RecentTransactionsTable: React.FC<RecentTransactionsTableProps> = ({
    transactions,
    totalPages,
    currentPage,
    onPageChange
}) => {
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
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">{t('recentTransactions')}</h3>
            </div>
            <div className="overflow-x-auto flex-grow">
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
                                        {/* Force VND formatting as requested */}
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(transaction.amount)}
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

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="p-4 border-t border-gray-200 flex items-center justify-between">
                    <button
                        onClick={() => onPageChange(Math.max(0, currentPage - 1))}
                        disabled={currentPage === 0}
                        className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {t('previous')}
                    </button>
                    <span className="text-sm text-gray-700">
                        {t('pageOf', { current: currentPage + 1, total: totalPages })}
                    </span>
                    <button
                        onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))}
                        disabled={currentPage >= totalPages - 1}
                        className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {t('next')}
                    </button>
                </div>
            )}
        </div>
    );
};
