
"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGetGroup, useDeleteGroup } from "@/hooks/queries/group";
import { GroupHeader } from "@/components/groups/GroupHeader";
import { MemberManagement } from "@/components/groups/MemberManagement";
import { GroupModal } from "@/components/groups/GroupModal";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export default function GroupDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const t = useTranslations('Dashboard.Group');

    const { data: groupData, isLoading, error } = useGetGroup(id);
    const deleteGroup = useDeleteGroup();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
            </div>
        );
    }

    if (error || !groupData) {
        return (
            <div className="text-center py-20 text-red-500">
                {t('groupInfo')}: {t('noGroups')}
            </div>
        );
    }

    const group = groupData;

    const handleDelete = async () => {
        if (confirm(t('confirmDelete'))) {
            try {
                await deleteGroup.mutateAsync(id);
                toast.success(t('deleteSuccess'));
                router.push("/dashboard/groups");
            } catch (error) {
                console.error("Failed to delete group", error);
                toast.error(t('deleteFailed'));
            }
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <GroupHeader
                title={group.name}
                description={group.description}
                onEdit={() => setIsEditModalOpen(true)}
                onDelete={handleDelete}
                breadcrumbItems={[
                    { label: t('dashboard'), href: "/dashboard" },
                    { label: t('myGroups'), href: "/dashboard/groups" },
                    { label: group.name, href: `/dashboard/groups/${id}` },
                ]}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <MemberManagement groupId={id} />
                </div>
                <div className="space-y-6">
                    {/* Placeholder for future widgets like "Group Prompts" or "Stats" */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <h3 className="font-semibold text-gray-900 mb-4">{t('groupInfo')}</h3>
                        <dl className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <dt className="text-gray-500">{t('created')}</dt>
                                <dd className="text-gray-900">{new Date(group.createdAt).toLocaleDateString()}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-gray-500">{t('updated')}</dt>
                                <dd className="text-gray-900">{new Date(group.updatedAt).toLocaleDateString()}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-gray-500">{t('members')}</dt>
                                <dd className="text-gray-900">{group.memberCount}</dd>
                            </div>
                        </dl>
                    </div>
                </div>
            </div>

            <GroupModal
                open={isEditModalOpen}
                onOpenChange={setIsEditModalOpen}
                editingGroup={{
                    id: group.id,
                    name: group.name,
                    description: group.description,
                }}
            />
        </div>
    );
}
