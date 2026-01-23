'use client';

import { useState } from 'react';
import { apiClient } from '@/services/auth';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function CheckSchoolsPage() {
    const [result, setResult] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const checkEndpoint = async (endpoint: string, method: string = 'GET') => {
        setLoading(true);
        try {
            const response = await apiClient({
                method,
                url: endpoint,
            });
            setResult(`✅ Success!\n\nEndpoint: ${method} ${endpoint}\n\nResponse:\n${JSON.stringify(response.data, null, 2)}`);
        } catch (err: unknown) {
            const error = err as { message: string; response?: { status: number; data?: { message?: string } } };
            setResult(`❌ Error\n\nEndpoint: ${method} ${endpoint}\n\nStatus: ${error.response?.status}\n\nMessage: ${error.response?.data?.message || error.message}\n\nResponse:\n${JSON.stringify(error.response?.data, null, 2)}`);
        } finally {
            setLoading(false);
        }
    };

    const endpoints = [
        { label: 'GET /api/v1/schools', endpoint: '/api/v1/schools', method: 'GET' },
        { label: 'GET /api/v1/admin/schools', endpoint: '/api/v1/admin/schools', method: 'GET' },
        { label: 'GET /api/v1/school', endpoint: '/api/v1/school', method: 'GET' },
    ];

    return (
        <div className="p-6">
            <div className="mb-6">
                <Link
                    href="/admin/schools"
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
                >
                    <ArrowLeftIcon className="h-4 w-4 mr-2" />
                    Quay lại Quản lý Trường
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">Check Schools in Backend</h1>
                <p className="mt-2 text-gray-600">Kiểm tra xem backend đã có school nào chưa</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">Test Endpoints</h2>
                    <div className="space-y-3">
                        {endpoints.map((item) => (
                            <button
                                key={item.endpoint}
                                onClick={() => checkEndpoint(item.endpoint, item.method)}
                                disabled={loading}
                                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-left"
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">Result</h2>
                    {loading ? (
                        <div className="text-center py-8">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <p className="mt-2 text-gray-600">Checking...</p>
                        </div>
                    ) : result ? (
                        <div className={`p-4 rounded-lg ${result.includes('✅') ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                            }`}>
                            <pre className="text-xs whitespace-pre-wrap overflow-auto max-h-96">{result}</pre>
                        </div>
                    ) : (
                        <p className="text-gray-500">Click vào một endpoint bên trái để kiểm tra</p>
                    )}
                </div>
            </div>
        </div>
    );
}
