
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

    /* 
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
    */

    // MOCK DATA FOR UI TESTING
    const MOCK_GROUPS: GroupResponse[] = [
        {
            id: "group-1",
            name: "Math Grade 10 - Class 10A",
            description: "Advanced Algebra and Geometry for 10A students",
            createdAt: "2024-01-15T08:00:00Z",
            updatedAt: "2024-01-20T14:30:00Z",
            memberCount: 25,
            ownerId: "user-1"
        },
        {
            id: "group-2",
            name: "Science Club 2025",
            description: "Extracurricular activities and prompt sharing for Science Club",
            createdAt: "2024-02-01T09:00:00Z",
            updatedAt: "2024-02-05T11:20:00Z",
            memberCount: 12,
            ownerId: "user-1"
        },
        {
            id: "group-3",
            name: "Literature Department",
            description: "Shared prompts for Lit teachers",
            createdAt: "2023-11-10T10:00:00Z",
            updatedAt: "2024-01-05T16:45:00Z",
            memberCount: 8,
            ownerId: "user-2"
        }
    ];

    // const groups = groupsData?.content || [];
    const groups = MOCK_GROUPS;

    // Build bypass for testing
    // if (isLoading) ... 
    // if (error) ...


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
