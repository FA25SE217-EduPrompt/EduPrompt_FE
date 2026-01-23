'use client';

import { useState } from 'react';
import { useAdminCreateSchoolSubscription } from '@/hooks/queries/admin';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function SubscriptionsPage() {
    const [schoolId, setSchoolId] = useState<string>('');
    const [tier, setTier] = useState('BASIC');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(
        new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    );
    const [maxTokens, setMaxTokens] = useState<number>(100000);
    const [result, setResult] = useState<string>('');

    const createSubscriptionMutation = useAdminCreateSchoolSubscription();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setResult('Creating subscription...');

        const response = await createSubscriptionMutation.mutateAsync({
            schoolId,
            payload: {
                planId: tier,
                startDate: new Date(startDate).toISOString(),
                endDate: new Date(endDate).toISOString(),
                maxTokens,
            },
        });

        if (response.error) {
            setResult(`❌ Error: ${response.error.messages.join(', ')}`);
        } else {
            setResult(`✅ Subscription created successfully!\n${JSON.stringify(response.data, null, 2)}`);
        }
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <Link
                    href="/admin/schools"
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
                >
                    <ArrowLeftIcon className="h-4 w-4 mr-2" />
                    Quay lại Quản lý Trường
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">Manage School Subscriptions</h1>
                <p className="mt-2 text-gray-600">Tạo hoặc cập nhật gói subscription cho trường</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Form */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-6">Subscription Details</h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                School ID (UUID) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={schoolId}
                                onChange={(e) => setSchoolId(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="a1b2c3d4-e5f6-7890-abcd-ef1234567890"
                                required
                            />
                            <p className="mt-1 text-sm text-gray-500">UUID của trường (lấy từ database)</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Subscription Tier <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={tier}
                                onChange={(e) => setTier(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            >
                                <option value="BASIC">Basic</option>
                                <option value="PREMIUM">Premium</option>
                                <option value="ENTERPRISE">Enterprise</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Start Date <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    End Date <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Max Tokens (Optional)
                            </label>
                            <input
                                type="number"
                                value={maxTokens}
                                onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                min="0"
                                step="1000"
                            />
                            <p className="mt-1 text-sm text-gray-500">Giới hạn token cho trường (để trống = unlimited)</p>
                        </div>

                        <button
                            type="submit"
                            disabled={createSubscriptionMutation.isPending}
                            className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {createSubscriptionMutation.isPending ? 'Creating...' : 'Create / Update Subscription'}
                        </button>
                    </form>
                </div>

                {/* Result & Info */}
                <div className="space-y-6">
                    {/* Result */}
                    {result && (
                        <div className={`p-4 rounded-lg ${result.includes('✅') ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                            }`}>
                            <h3 className="font-semibold mb-2">Result:</h3>
                            <pre className="text-sm whitespace-pre-wrap overflow-auto">{result}</pre>
                        </div>
                    )}

                    {/* Tier Info */}
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <h3 className="font-semibold text-purple-900 mb-3">📊 Subscription Tiers</h3>
                        <div className="space-y-3 text-sm">
                            <div className="bg-white p-3 rounded">
                                <p className="font-semibold text-blue-700">BASIC</p>
                                <p className="text-gray-600">Gói cơ bản cho trường nhỏ</p>
                            </div>
                            <div className="bg-white p-3 rounded">
                                <p className="font-semibold text-purple-700">PREMIUM</p>
                                <p className="text-gray-600">Gói nâng cao với nhiều tính năng</p>
                            </div>
                            <div className="bg-white p-3 rounded">
                                <p className="font-semibold text-orange-700">ENTERPRISE</p>
                                <p className="text-gray-600">Gói doanh nghiệp không giới hạn</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
