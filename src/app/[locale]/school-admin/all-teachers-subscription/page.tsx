'use client';

import { useState, useEffect } from 'react';
import SchoolAdminService from '@/services/resources/schoolAdmin';
import { TeacherTokenUsageLogDto } from '@/types/school-admin.api';
import { mapErrorToUserMessage } from '@/utils/errorMapper';
import { useTranslations } from 'next-intl';

export default function AllTeachersSubscriptionPage() {
    const t = useTranslations('SchoolAdmin.AllTeachersSubscription');
    const [logs, setLogs] = useState<TeacherTokenUsageLogDto[]>([]);
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

        const mockLogs: TeacherTokenUsageLogDto[] = [
            {
                id: 'mock-1',
                userId: '87d261b6-8254-47b2-965b-d8a5e1234567',
                userName: 'Nguyễn Văn An',
                actionType: 'TEST',
                tokensUsed: 500,
                createdAt: '2024-12-23T10:30:00Z',
            },
            {
                id: 'mock-2',
                userId: 'a1b2c3d4-5e6f-7890-abcd-ef1234567890',
                userName: 'Trần Thị Bình',
                actionType: 'OPTIMIZATION',
                tokensUsed: 1200,
                createdAt: '2024-12-23T09:15:00Z',
            },
            {
                id: 'mock-3',
                userId: 'f9e8d7c6-b5a4-3210-9876-543210fedcba',
                userName: 'Lê Minh Châu',
                actionType: 'TEST',
                tokensUsed: 800,
                createdAt: '2024-12-22T14:45:00Z',
            },
            {
                id: 'mock-4',
                userId: '12345678-90ab-cdef-1234-567890abcdef',
                userName: 'Phạm Hoàng Dũng',
                actionType: 'TEST',
                tokensUsed: 600,
                createdAt: '2024-12-22T11:20:00Z',
            },
            {
                id: 'mock-5',
                userId: 'abcdef12-3456-7890-abcd-ef1234567890',
                userName: 'Võ Thị Em',
                actionType: 'OPTIMIZATION',
                tokensUsed: 1500,
                createdAt: '2024-12-21T16:00:00Z',
            },
            {
                id: 'mock-6',
                userId: '87d261b6-8254-47b2-965b-d8a5e1234567',
                userName: 'Nguyễn Văn An',
                actionType: 'OPTIMIZATION',
                tokensUsed: 950,
                createdAt: '2024-12-21T10:10:00Z',
            },
            {
                id: 'mock-7',
                userId: 'a1b2c3d4-5e6f-7890-abcd-ef1234567890',
                userName: 'Trần Thị Bình',
                actionType: 'TEST',
                tokensUsed: 700,
                createdAt: '2024-12-20T15:30:00Z',
            },
            {
                id: 'mock-8',
                userId: '11111111-2222-3333-4444-555555555555',
                userName: 'Hoàng Văn Khoa',
                actionType: 'OPTIMIZATION',
                tokensUsed: 1100,
                createdAt: '2024-12-20T14:00:00Z',
            },
            {
                id: 'mock-9',
                userId: '22222222-3333-4444-5555-666666666666',
                userName: 'Đỗ Thị Lan',
                actionType: 'TEST',
                tokensUsed: 450,
                createdAt: '2024-12-19T16:30:00Z',
            },
            {
                id: 'mock-10',
                userId: '33333333-4444-5555-6666-777777777777',
                userName: 'Bùi Minh Nam',
                actionType: 'OPTIMIZATION',
                tokensUsed: 1300,
                createdAt: '2024-12-19T10:45:00Z',
            },
            {
                id: 'mock-11',
                userId: '44444444-5555-6666-7777-888888888888',
                userName: 'Vũ Thị Oanh',
                actionType: 'TEST',
                tokensUsed: 550,
                createdAt: '2024-12-18T13:20:00Z',
            },
            {
                id: 'mock-12',
                userId: '55555555-6666-7777-8888-999999999999',
                userName: 'Đinh Văn Phong',
                actionType: 'OPTIMIZATION',
                tokensUsed: 900,
                createdAt: '2024-12-18T09:00:00Z',
            },
            {
                id: 'mock-13',
                userId: '66666666-7777-8888-9999-aaaaaaaaaaaa',
                userName: 'Lý Thị Quỳnh',
                actionType: 'TEST',
                tokensUsed: 650,
                createdAt: '2024-12-17T15:15:00Z',
            },
            {
                id: 'mock-14',
                userId: '77777777-8888-9999-aaaa-bbbbbbbbbbbb',
                userName: 'Trịnh Văn Sơn',
                actionType: 'OPTIMIZATION',
                tokensUsed: 1400,
                createdAt: '2024-12-17T11:30:00Z',
            },

        ];

        if (result.error) {
            // Nếu API lỗi, dùng fake data với phân trang
            const startIndex = pageNum * size;
            const endIndex = startIndex + size;
            const paginatedMockLogs = mockLogs.slice(startIndex, endIndex);

            setLogs(paginatedMockLogs);
            setTotalPages(Math.ceil(mockLogs.length / size));
            setTotalElements(mockLogs.length);
            setError(mapErrorToUserMessage({ error: result.error }));
            setLoading(false);
            return;
        }

        if (result.data) {
            const realLogs = result.data.content || [];
            // Kết hợp real data với fake data
            const combinedLogs = [...realLogs, ...mockLogs];

            // Phân trang cho combined data
            const startIndex = pageNum * size;
            const endIndex = startIndex + size;
            const paginatedLogs = combinedLogs.slice(startIndex, endIndex);

            setLogs(paginatedLogs);
            setTotalPages(Math.ceil(combinedLogs.length / size));
            setTotalElements(combinedLogs.length);
        } else {
            // Nếu không có data, dùng fake data với phân trang
            const startIndex = pageNum * size;
            const endIndex = startIndex + size;
            const paginatedMockLogs = mockLogs.slice(startIndex, endIndex);

            setLogs(paginatedMockLogs);
            setTotalPages(Math.ceil(mockLogs.length / size));
            setTotalElements(mockLogs.length);
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
                                                        {log.userName}
                                                    </div>
                                                    <div className="text-xs text-gray-500">{log.userId}</div>
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
