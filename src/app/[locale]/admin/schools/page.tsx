'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PlusIcon, UserPlusIcon, CreditCardIcon } from '@heroicons/react/24/outline';

export default function SchoolsPage() {
    const [schools] = useState([
        { id: 1, name: 'Trường THPT Lê Hồng Phong', city: 'TP.HCM', totalTeachers: 45, subscription: 'Premium' },
        { id: 2, name: 'Trường THPT Trần Phú', city: 'Hà Nội', totalTeachers: 32, subscription: 'Basic' },
        { id: 3, name: 'Trường THPT Nguyễn Huệ', city: 'Đà Nẵng', totalTeachers: 28, subscription: 'Premium' },
    ]);

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Quản Lý Trường Học</h1>
                <p className="mt-2 text-gray-600">Quản lý trường học, tài khoản admin và gói đăng ký</p>
            </div>

            {/* Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <Link
                    href="/admin/schools/admins"
                    className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
                >
                    <UserPlusIcon className="h-10 w-10 mb-3" />
                    <h3 className="text-xl font-semibold mb-2">Quản Trị Viên Trường</h3>
                    <p className="text-blue-100 text-sm">Tạo và quản lý tài khoản admin cho trường học</p>
                </Link>

                <Link
                    href="/admin/schools/subscriptions"
                    className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
                >
                    <CreditCardIcon className="h-10 w-10 mb-3" />
                    <h3 className="text-xl font-semibold mb-2">Gói Đăng Ký</h3>
                    <p className="text-purple-100 text-sm">Quản lý gói đăng ký dịch vụ của các trường</p>
                </Link>

                <Link
                    href="/admin/prompts/create"
                    className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
                >
                    <PlusIcon className="h-10 w-10 mb-3" />
                    <h3 className="text-xl font-semibold mb-2">Tạo Prompt</h3>
                    <p className="text-green-100 text-sm">Tạo prompt độc lập hoặc trong bộ sưu tập</p>
                </Link>
            </div>

            {/* Schools Table */}
            <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">Danh sách Trường</h2>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tên trường
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Thành phố
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Giáo viên
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Gói
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {schools.map((school) => (
                                <tr key={school.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {school.id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{school.name}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {school.city}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {school.totalTeachers}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            school.subscription === 'Premium' 
                                                ? 'bg-purple-100 text-purple-800' 
                                                : 'bg-blue-100 text-blue-800'
                                        }`}>
                                            {school.subscription}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <Link
                                            href={`/admin/schools/${school.id}`}
                                            className="text-blue-600 hover:text-blue-900 mr-4"
                                        >
                                            Xem
                                        </Link>
                                        <Link
                                            href={`/admin/schools/subscriptions?schoolId=${school.id}`}
                                            className="text-purple-600 hover:text-purple-900"
                                        >
                                            Gói dịch vụ
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
