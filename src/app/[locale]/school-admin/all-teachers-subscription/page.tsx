'use client';

import { useState, useEffect } from 'react';
import SchoolAdminService from '@/services/resources/schoolAdmin';
import { TeacherTokenUsageLogDto, UserUsageResponse } from '@/types/school-admin.api';
import { mapErrorToUserMessage } from '@/utils/errorMapper';
import { useTranslations } from 'next-intl';

export default function AllTeachersSubscriptionPage() {
    const t = useTranslations('SchoolAdmin.AllTeachersSubscription');
    const [logs, setLogs] = useState<TeacherTokenUsageLogDto[]>([]);
    const [teachersMap, setTeachersMap] = useState<Record<string, UserUsageResponse>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const size = 10;

    const fetchTeachers = async (pageNum: number) => {
        setLoading(true);
        setError(null);

        const result = await SchoolAdminService.getAllTeachersSubscriptionUsage({
            page: pageNum,
            size,
        });

        // Parallel fetch for teacher details to map names/emails
        const teachersResult = await SchoolAdminService.getTeachersUsage(); // Assuming this gets all or enough teachers
        if (teachersResult.data && teachersResult.data.users) {
            const map: Record<string, UserUsageResponse> = {};
            teachersResult.data.users.forEach(u => {
                map[u.userId] = u;
            });
            setTeachersMap(map);
        }

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
        fetchTeachers(page);
    }, [page]);

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

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
                <p className="text-gray-600 mt-1">
                    {t('description')}
                </p>
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
                                            {t('teacher')}
                                        </th>
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
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {teachersMap[log.userId]
                                                            ? `${teachersMap[log.userId].firstName} ${teachersMap[log.userId].lastName}`
                                                            : log.userName}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {teachersMap[log.userId]?.email || log.userId}
                                                    </div>
                                                </td>
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
                                            <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                                {t('noData')}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
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
                    </>
                )}
            </div>
        </div>
    );
}
