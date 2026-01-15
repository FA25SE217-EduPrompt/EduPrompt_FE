'use client';

import { useState } from 'react';
import { useAdminCreateSchoolAdminAccount } from '@/hooks/queries/admin';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function SchoolAdminsPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [schoolId, setSchoolId] = useState<string>('');
    const [result, setResult] = useState<string>('');

    const createAdminMutation = useAdminCreateSchoolAdminAccount();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setResult('Creating...');

        const response = await createAdminMutation.mutateAsync({
            payload: {
                email,
                password,
                fullName,
                schoolId,
            },
        });

        if (response.error) {
            setResult(`❌ Error: ${response.error.messages.join(', ')}`);
        } else {
            setResult(`✅ Created successfully! Admin ID: ${response.data?.id}`);
            // Reset form
            setEmail('');
            setPassword('');
            setFullName('');
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
                <h1 className="text-3xl font-bold text-gray-900">Create School Admin Account</h1>
                <p className="mt-2 text-gray-600">Tạo tài khoản quản trị viên cho một trường học</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Form */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-6">Account Information</h2>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                School ID (UUID) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={schoolId}
                                onChange={(e) => setSchoolId(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="a1b2c3d4-e5f6-7890-abcd-ef1234567890"
                                required
                            />
                            <p className="mt-1 text-sm text-gray-500">UUID của trường (lấy từ database)</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Full Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Nguyễn Văn A"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="admin@school.edu"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Password <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="••••••••"
                                required
                                minLength={8}
                            />
                            <p className="mt-1 text-sm text-gray-500">Tối thiểu 8 ký tự</p>
                        </div>

                        <button
                            type="submit"
                            disabled={createAdminMutation.isPending}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {createAdminMutation.isPending ? 'Creating...' : 'Create School Admin'}
                        </button>
                    </form>
                </div>

                {/* Result & Info */}
                <div className="space-y-6">
                    {/* Result */}
                    {result && (
                        <div className={`p-4 rounded-lg ${
                            result.includes('✅') ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                        }`}>
                            <h3 className="font-semibold mb-2">Result:</h3>
                            <pre className="text-sm whitespace-pre-wrap">{result}</pre>
                        </div>
                    )}

                    {/* Documentation */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <h3 className="font-semibold mb-3">📚 Documentation</h3>
                        <ul className="text-sm space-y-2">
                            <li>• <code className="bg-gray-200 px-1 rounded">email</code>: Email đăng nhập</li>
                            <li>• <code className="bg-gray-200 px-1 rounded">password</code>: Mật khẩu (≥8 ký tự)</li>
                            <li>• <code className="bg-gray-200 px-1 rounded">fullName</code>: Họ tên đầy đủ</li>
                            <li>• <code className="bg-gray-200 px-1 rounded">schoolId</code>: ID trường trong DB</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
