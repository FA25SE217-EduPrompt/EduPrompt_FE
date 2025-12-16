
"use client";

import React, { useState } from "react";
import { useGetMyGroups } from "@/hooks/queries/group";
import { GroupCard } from "@/components/dashboard/GroupCard";
import Button from "@/components/ui/Button";
import { PlusIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import { GroupModal } from "@/components/groups/GroupModal";
import { Loader2 } from "lucide-react";
import { GroupResponse } from "@/types/group.api";
import { useTranslations } from "next-intl";

export default function GroupsPage() {
    const t = useTranslations('Dashboard.Group');
    const { data: groupsData, isLoading, error } = useGetMyGroups();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center py-20 text-red-500">
                Error loading groups. Please try again.
            </div>
        );
    }

    const groups = groupsData?.content || [];

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{t('myGroups')}</h1>
                    <p className="mt-2 text-gray-600">{t('subtitle')}</p>
                </div>
                <Button onClick={() => setIsCreateModalOpen(true)}>
                    <PlusIcon className="h-5 w-5 mr-2" />
                    {t('createGroup')}
                </Button>
            </div>

            {groups.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
                    <div className="bg-gray-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <UserGroupIcon className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{t('noGroups')}</h3>
                    <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                        {t('noGroupsDesc')}
                    </p>
                    <Button onClick={() => setIsCreateModalOpen(true)}>
                        {t('createFirst')}
                    </Button>
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
        </div>
    );
}
