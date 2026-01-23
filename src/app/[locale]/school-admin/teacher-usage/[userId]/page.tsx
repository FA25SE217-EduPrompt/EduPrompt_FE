'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import SchoolAdminService from '@/services/resources/schoolAdmin';
import { TeacherTokenUsageLogDto } from '@/types/school-admin.api';
import { mapErrorToUserMessage } from '@/utils/errorMapper';
import { useTranslations } from 'next-intl';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function TeacherUsagePage() {
    const t = useTranslations('SchoolAdmin.TeacherUsage');
    const params = useParams();
    const router = useRouter();
    const userId = params.userId as string;

    const [logs, setLogs] = useState<TeacherTokenUsageLogDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [useMockData, setUseMockData] = useState(false);
    const size = 20;

    const generateMockLogs = () => {
        const mockLogs: TeacherTokenUsageLogDto[] = [
            {
                id: '1',
                userId: userId,
                userName: 'Nguyễn Văn An',
                actionType: 'TEST',
                tokensUsed: 500,
                createdAt: '2024-12-20T10:30:00Z',
            },
            {
                id: '2',
                userId: userId,
                userName: 'Nguyễn Văn An',
                actionType: 'OPTIMIZATION',
                tokensUsed: 1200,
                createdAt: '2024-12-19T14:15:00Z',
            },
            {
                id: '3',
                userId: userId,
                userName: 'Nguyễn Văn An',
                actionType: 'TEST',
                tokensUsed: 800,
                createdAt: '2024-12-18T09:45:00Z',
            },
            {
                id: '4',
                userId: userId,
                userName: 'Nguyễn Văn An',
                actionType: 'TEST',
                tokensUsed: 600,
                createdAt: '2024-12-17T16:20:00Z',
            },
            {
                id: '5',
                userId: userId,
                userName: 'Nguyễn Văn An',
                actionType: 'OPTIMIZATION',
                tokensUsed: 1500,
                createdAt: '2024-12-16T11:00:00Z',
            },
        ];

        setLogs(mockLogs);
        setTotalPages(1);
        setTotalElements(mockLogs.length);
        setLoading(false);
    };

    const fetchUsageLogs = async (pageNum: number) => {
        setLoading(true);
        setError(null);

        const result = await SchoolAdminService.getTeacherSubscriptionUsage({
            userId,
            page: pageNum,
            size,
        });

        if (result.error) {
            setError(mapErrorToUserMessage({ error: result.error }));
            setLoading(false);
            return;
        }

        if (result.data) {
            setLogs(result.data.content || []);
            setTotalPages(result.data.totalPages || 0);
            setTotalElements(result.data.totalElements || 0);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (userId) {
            if (useMockData) {
                generateMockLogs();
            } else {
                fetchUsageLogs(page);
            }
        }
    }, [page, userId, useMockData]);

    const handlePrevPage = () => {
        if (page > 0) setPage(page - 1);
    };

    const handleNextPage = () => {
        if (page < totalPages - 1) setPage(page + 1);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const teacherName = logs.length > 0 ? logs[0].userName : userId;

    return (
        <div className="p-6">
            <div className="mb-6">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4"
                >
                    <ArrowLeftIcon className="h-5 w-5" />
                    {t('back')}
                </button>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
                        <p className="text-gray-600 mt-1">
                            {t('description', { teacherName })}
                        </p>
                    </div>
                    <button
                        onClick={() => setUseMockData(!useMockData)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${useMockData
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                    >
                        {useMockData ? '📊 Mock Data' : '🔌 Real API'}
                    </button>
                </div>
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    {error}
                </div>
            )}

            <div className="bg-white rounded-lg shadow overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <p className="mt-2 text-gray-600">{t('loading')}</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t('action')}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t('tokensUsed')}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t('time')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {logs && logs.length > 0 ? (
                                        logs.map((log) => (
                                            <tr key={log.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${log.actionType === 'TEST' ? 'bg-blue-100 text-blue-800' :
                                                        log.actionType === 'OPTIMIZATION' ? 'bg-purple-100 text-purple-800' :
                                                            'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {log.actionType}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {(log.tokensUsed || 0).toLocaleString()}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-500">
                                                        {formatDate(log.createdAt)}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                                                {t('noData')}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                                <div className="flex-1 flex justify-between sm:hidden">
                                    <button
                                        onClick={handlePrevPage}
                                        disabled={page === 0}
                                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {t('previous')}
                                    </button>
                                    <button
                                        onClick={handleNextPage}
                                        disabled={page >= totalPages - 1}
                                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {t('next')}
                                    </button>
                                </div>
                                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm text-gray-700">
                                            {t('showing')} <span className="font-medium">{totalElements > 0 ? page * size + 1 : 0}</span> {t('to')}{' '}
                                            <span className="font-medium">
                                                {totalElements > 0 ? Math.min((page + 1) * size, totalElements) : 0}
                                            </span>{' '}
                                            {t('of')} <span className="font-medium">{totalElements || 0}</span> {t('results')}
                                        </p>
                                    </div>
                                    <div>
                                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                            <button
                                                onClick={handlePrevPage}
                                                disabled={page === 0}
                                                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {t('previous')}
                                            </button>
                                            <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                                                {t('page')} {page + 1} / {totalPages}
                                            </span>
                                            <button
                                                onClick={handleNextPage}
                                                disabled={page >= totalPages - 1}
                                                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {t('next')}
                                            </button>
                                        </nav>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
