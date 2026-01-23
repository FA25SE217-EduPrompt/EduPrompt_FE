"use client";

import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
    UsersIcon,
    DocumentTextIcon,
    TagIcon,
    UserGroupIcon,
    FolderIcon
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useTranslations } from "next-intl";

const StatCard: React.FC<{
    title: string;
    description: string;
    icon: React.ReactNode;
    href: string;
    color: string;
}> = ({ title, description, icon, href, color }) => {
    return (
        <Link
            href={href}
            className={`block p-6 bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-all hover:scale-105 ${color}`}
        >
            <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    {icon}
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                    <p className="text-sm text-gray-500">{description}</p>
                </div>
            </div>
        </Link>
    );
};

export default function AdminDashboard() {
    const t = useTranslations('Admin.Dashboard');
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && user) {
            if (!user.isSystemAdmin) {
                router.push('/dashboard');
                return;
            }
        }
    }, [user, isLoading, router]);

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-screen">
                <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <main className="flex-1 p-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
                <p className="text-gray-600 mt-2">{t('description')}</p>
            </div>

            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard
                    title="Users"
                    description={t('manageEntity', { entity: 'users' })}
                    icon={<UsersIcon className="h-6 w-6" />}
                    href="/admin/users"
                    color="hover:border-blue-400"
                />
                <StatCard
                    title="Prompts"
                    description={t('manageEntity', { entity: 'prompts' })}
                    icon={<DocumentTextIcon className="h-6 w-6" />}
                    href="/admin/prompts"
                    color="hover:border-purple-400"
                />
                <StatCard
                    title="Tags"
                    description={t('manageEntity', { entity: 'tags' })}
                    icon={<TagIcon className="h-6 w-6" />}
                    href="/admin/tags"
                    color="hover:border-green-400"
                />
                <StatCard
                    title="Groups"
                    description={t('manageEntity', { entity: 'groups' })}
                    icon={<UserGroupIcon className="h-6 w-6" />}
                    href="/admin/groups"
                    color="hover:border-orange-400"
                />
                <StatCard
                    title="Collections"
                    description={t('manageEntity', { entity: 'collections' })}
                    icon={<FolderIcon className="h-6 w-6" />}
                    href="/admin/collections"
                    color="hover:border-pink-400"
                />
            </section>

            <section className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('systemInfo')}</h2>
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">{t('version')}</span>
                        <span className="font-medium text-gray-900">1.0.0</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">{t('role')}</span>
                        <span className="font-medium text-gray-900">System Admin</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">{t('account')}</span>
                        <span className="font-medium text-gray-900">{user?.email || 'N/A'}</span>
                    </div>
                </div>
            </section>
        </main>
    );
}
