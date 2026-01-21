
"use client";

import React, { useState } from "react";
import { useGetMyGroups } from "@/hooks/queries/group";
import { GroupCard } from "@/components/dashboard/GroupCard";
import Button from "@/components/ui/Button";
import { PlusIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import { GroupModal } from "@/components/groups/GroupModal";
import { useTranslations } from "next-intl";

export default function GroupsPage() {
    const t = useTranslations('Dashboard.Group');
    const { data: groupsData, isLoading, error } = useGetMyGroups();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const groups = groupsData?.content || [];

    if (isLoading) {
        return (
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <div className="h-8 w-40 bg-gray-200 rounded animate-pulse mb-2" />
                        <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
                    </div>
                    <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-48 bg-gray-200 rounded-xl animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center py-20 text-red-500">
                {t('loadError')}
            </div>
        );
    }

    return (
        <main className="flex-1 overflow-y-auto p-6 space-y-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{t('myGroups')}</h1>
                    <p className="text-gray-600 mt-1">{t('subtitle')}</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg shadow-sm bg-brand-primary text-white hover:bg-brand-primary/90 transition-colors"
                >
                    <PlusIcon className="h-5 w-5" />
                    <span>{t('createGroup')}</span>
                </button>
            </div>

            {groups.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                    <div className="mx-auto h-12 w-12 text-gray-400">
                        <UserGroupIcon />
                    </div>
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">{t('noGroups')}</h3>
                    <p className="mt-1 text-sm text-gray-500 max-w-sm mx-auto">
                        {t('noGroupsDesc')}
                    </p>
                    <div className="mt-6">
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="inline-flex items-center rounded-md bg-brand-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
                        >
                            <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                            {t('createFirst')}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {groups.map((group) => (
                        <GroupCard
                            key={group.id}
                            {...group}
                        />
                    ))}
                </div>
            )}

            <GroupModal
                open={isCreateModalOpen}
                onOpenChange={setIsCreateModalOpen}
            />
        </main>
    );
}
