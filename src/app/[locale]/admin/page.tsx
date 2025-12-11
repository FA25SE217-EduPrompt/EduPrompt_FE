"use client";

import React from "react";
import { StatCard } from "@/components/dashboard/StatCard";
import {
    BuildingOfficeIcon,
    CurrencyDollarIcon,
    ServerIcon,
    UserGroupIcon,
    ArrowPathIcon
} from "@heroicons/react/24/outline";

const SystemAdminDashboard: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">System Administration</h1>
                    <p className="text-gray-600">Platform overview and management</p>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">Last updated: {new Date().toLocaleTimeString()}</span>
                    <button className="p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow">
                        <ArrowPathIcon className="h-5 w-5 text-gray-600" />
                    </button>
                </div>
            </header>

            {/* System Stats */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Total Schools"
                    value="128"
                    icon={<BuildingOfficeIcon />}
                    gradientClass="from-blue-600 to-blue-700"
                />
                <StatCard
                    title="Active Users"
                    value="12,450"
                    icon={<UserGroupIcon />}
                    gradientClass="from-indigo-600 to-indigo-700"
                />
                <StatCard
                    title="Monthly Revenue"
                    value="$45,200"
                    icon={<CurrencyDollarIcon />}
                    gradientClass="from-green-600 to-green-700"
                />
                <StatCard
                    title="System Load"
                    value="32%"
                    icon={<ServerIcon />}
                    gradientClass="from-gray-700 to-gray-800"
                />
            </section>

            {/* School Management Table */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900">Registered Schools</h2>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Search schools..."
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
                            Add School
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-gray-900 font-semibold">
                            <tr>
                                <th className="px-6 py-4">School Name</th>
                                <th className="px-6 py-4">Admin Contact</th>
                                <th className="px-6 py-4">Subscription</th>
                                <th className="px-6 py-4">Teachers</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {[
                                { name: "Lincoln High School", admin: "admin@lincoln.edu", plan: "Enterprise", teachers: 45, status: "Active" },
                                { name: "Westview Academy", admin: "principal@westview.org", plan: "Standard", teachers: 28, status: "Active" },
                                { name: "Oak Creek Elementary", admin: "contact@oakcreek.edu", plan: "Basic", teachers: 12, status: "Pending" },
                                { name: "Riverside High", admin: "it@riverside.edu", plan: "Enterprise", teachers: 62, status: "Active" },
                                { name: "Tech Valley Charter", admin: "support@techvalley.org", plan: "Standard", teachers: 18, status: "Suspended" },
                            ].map((school, index) => (
                                <tr key={index} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">{school.name}</td>
                                    <td className="px-6 py-4">{school.admin}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-gray-100 rounded-md text-xs font-medium">
                                            {school.plan}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">{school.teachers}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${school.status === 'Active' ? 'bg-green-100 text-green-700' :
                                            school.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-red-100 text-red-700'
                                            }`}>
                                            {school.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button className="text-blue-600 hover:text-blue-800 font-medium">Manage</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
                    <span className="text-sm text-gray-500">Showing 5 of 128 schools</span>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 border border-gray-300 rounded-md bg-white text-sm disabled:opacity-50" disabled>Previous</button>
                        <button className="px-3 py-1 border border-gray-300 rounded-md bg-white text-sm hover:bg-gray-50">Next</button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default SystemAdminDashboard;
