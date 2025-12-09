"use client";

import React from "react";
import { StatCard } from "@/components/dashboard/StatCard";
import {
    UserGroupIcon,
    DocumentTextIcon,
    ChartBarIcon,
    PlusIcon,
    ClockIcon
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

const SchoolAdminDashboard: React.FC = () => {
    const router = useRouter();

    return (
        <main className="flex-1 overflow-y-auto p-6 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">School Dashboard</h1>
                    <p className="text-gray-600">Overview of your school&apos;s usage and performance</p>
                </div>
                <button
                    onClick={() => router.push('/school-admin/add-email')}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm shadow-sm btn-primary transition-colors"
                >
                    <PlusIcon className="h-5 w-5" />
                    <span>Assign Teachers</span>
                </button>
            </div>

            {/* Stats Overview */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Active Teachers"
                    value="24"
                    icon={<UserGroupIcon />}
                    gradientClass="from-brand-secondary to-brand-secondary/70"
                />
                <StatCard
                    title="Total Prompts"
                    value="1,458"
                    icon={<DocumentTextIcon />}
                    gradientClass="from-brand-primary to-brand-primary/70"
                />
                <StatCard
                    title="Monthly Usage"
                    value="85%"
                    icon={<ChartBarIcon />}
                    gradientClass="from-brand-secondary to-brand-secondary/70"
                />
            </section>

            {/* Recent Activity */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200 flex items-center gap-2">
                    <ClockIcon className="h-5 w-5 text-brand-primary" />
                    <h2 className="text-lg font-semibold text-text-primary">Recent Activity</h2>
                </div>
                <div className="divide-y divide-gray-200">
                    {[1, 2, 3, 4, 5].map((item) => (
                        <div key={item} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-brand-primary">
                                    <UserGroupIcon className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-text-primary">New teacher joined: Sarah Johnson</p>
                                    <p className="text-xs text-gray-500">2 hours ago</p>
                                </div>
                            </div>
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                                Active
                            </span>
                        </div>
                    ))}
                </div>
            </section>
        </main>
    );
};

export default SchoolAdminDashboard;
