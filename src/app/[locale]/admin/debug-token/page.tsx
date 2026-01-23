'use client';

import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';
import { apiClient } from '@/services/auth';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function DebugTokenPage() {
    const { user, isAuthenticated } = useAuth();
    const [testResult, setTestResult] = useState('');

    const testAdminAPI = async () => {
        setTestResult('Testing...');
        try {
            const response = await apiClient.get('/api/v1/admin/schools');
            setTestResult(`✅ Success!\n${JSON.stringify(response.data, null, 2)}`);
        } catch (err: unknown) {
            const error = err as { message: string, response?: { status: number, data?: { message?: string } } };
            setTestResult(`❌ Error!\nStatus: ${error.response?.status}\nMessage: ${error.response?.data?.message || error.message}\n\nFull Response:\n${JSON.stringify(error.response?.data, null, 2)}`);
        }
    };

    const decodeJWT = (token: string) => {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        } catch (e) {
            return null;
        }
    };

    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    const decodedToken = token ? decodeJWT(token) : null;

    return (
        <div className="p-6">
            <div className="mb-6">
                <Link href="/admin" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
                    <ArrowLeftIcon className="h-4 w-4 mr-2" />
                    Back to Admin
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">Debug Token & Permissions</h1>
            </div>

            <div className="grid gap-6">
                {/* Auth Status */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">Auth Status</h2>
                    <div className="space-y-2 text-sm">
                        <p><strong>Authenticated:</strong> {isAuthenticated ? '✅ Yes' : '❌ No'}</p>
                        <p><strong>User Email:</strong> {user?.email || 'N/A'}</p>
                        <p><strong>User ID:</strong> {user?.id || 'N/A'}</p>
                        <p><strong>Is System Admin:</strong> {user?.isSystemAdmin ? '✅ Yes' : '❌ No'}</p>
                        <p><strong>Role:</strong> {user?.role || 'N/A'}</p>
                    </div>
                </div>

                {/* Token Info */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">Token Info</h2>
                    {token ? (
                        <div className="space-y-2">
                            <p className="text-sm"><strong>Token exists:</strong> ✅ Yes</p>
                            <p className="text-xs break-all bg-gray-100 p-2 rounded">{token.substring(0, 100)}...</p>

                            {decodedToken && (
                                <div className="mt-4">
                                    <p className="text-sm font-semibold mb-2">Decoded Token:</p>
                                    <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto max-h-96">
                                        {JSON.stringify(decodedToken, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-red-600">❌ No token found</p>
                    )}
                </div>

                {/* Test API */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">Test Admin API</h2>
                    <button
                        onClick={testAdminAPI}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 mb-4"
                    >
                        Test GET /api/v1/admin/schools
                    </button>

                    {testResult && (
                        <div className={`p-4 rounded-lg ${testResult.includes('✅') ? 'bg-green-50' : 'bg-red-50'}`}>
                            <pre className="text-xs whitespace-pre-wrap">{testResult}</pre>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
