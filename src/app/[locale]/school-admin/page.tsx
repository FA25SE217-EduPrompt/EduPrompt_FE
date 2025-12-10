"use client";

import React, { useEffect, useState } from "react";
import { StatCard } from "@/components/dashboard/StatCard";
import {
    UserGroupIcon,
    DocumentTextIcon,
    ChartBarIcon,
    PlusIcon,
    TrashIcon
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { SchoolAdminService } from "@/services/resources/schoolAdmin";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface Teacher {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    createdAt: string; // or assignedAt
}

interface SubscriptionUsage {
    activeTeachers: number;
    totalPrompts?: number; // Might not be available yet
    usagePercentage?: number;
    maxTeachers?: number;
}

const SchoolAdminDashboard: React.FC = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<SubscriptionUsage | null>(null);
    const [teachers, setTeachers] = useState<Teacher[]>([]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [usageData, teachersData] = await Promise.all([
                SchoolAdminService.getSubscriptionUsage(),
                SchoolAdminService.getTeachers()
            ]);

            // Adapt response to state
            // Assuming usageData.data contains the metrics
            setStats({
                activeTeachers: usageData.data?.activeMembers || 0,
                maxTeachers: usageData.data?.maxMembers || 0,
                // totalPrompts: usageData.data?.totalPrompts || 0,
                // usagePercentage: usageData.data?.usagePercentage || 0,
            });

            console.log("Teachers API Response:", teachersData);

            // Handle different possible response structures
            if (Array.isArray(teachersData)) {
                setTeachers(teachersData);
            } else if (teachersData?.data && Array.isArray(teachersData.data)) {
                setTeachers(teachersData.data);
            } else {
                console.warn("Unexpected teachers data format:", teachersData);
                setTeachers([]);
            }
        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
            toast.error("Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleRemoveTeacher = async (teacherId: number) => {
        if (!confirm("Are you sure you want to remove this teacher?")) return;

        try {
            await SchoolAdminService.removeTeacher(teacherId);
            toast.success("Teacher removed successfully");
            fetchData(); // Refresh list
        } catch (error) {
            console.error("Failed to remove teacher:", error);
            toast.error("Failed to remove teacher");
        }
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
            </div>
        );
    }

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
                    value={`${stats?.activeTeachers || 0} / ${stats?.maxTeachers || 'Unlimited'}`}
                    icon={<UserGroupIcon />}
                    gradientClass="from-brand-secondary to-brand-secondary/70"
                />
                <StatCard
                    title="Total Prompts"
                    value="--" // Not available in current API
                    icon={<DocumentTextIcon />}
                    gradientClass="from-brand-primary to-brand-primary/70"
                />
                <StatCard
                    title="Subscription Status"
                    value="Active" // Hardcoded for now, or derive from stats
                    icon={<ChartBarIcon />}
                    gradientClass="from-brand-secondary to-brand-secondary/70"
                />
            </section>

            {/* Teacher List */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200 flex items-center gap-2">
                    <UserGroupIcon className="h-5 w-5 text-brand-primary" />
                    <h2 className="text-lg font-semibold text-text-primary">Managed Teachers</h2>
                </div>
                <div className="divide-y divide-gray-200">
                    {teachers.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            No teachers assigned yet.
                        </div>
                    ) : (
                        teachers.map((teacher) => (
                            <div key={teacher.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-brand-primary font-bold">
                                        {teacher.firstName?.[0]}{teacher.lastName?.[0]}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-text-primary">
                                            {teacher.firstName} {teacher.lastName}
                                        </p>
                                        <p className="text-xs text-gray-500">{teacher.email}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleRemoveTeacher(teacher.id)}
                                    className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors text-sm font-medium flex items-center gap-1"
                                >
                                    <TrashIcon className="h-4 w-4" />
                                    Remove
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </section>
        </main>
    );
};

export default SchoolAdminDashboard;
