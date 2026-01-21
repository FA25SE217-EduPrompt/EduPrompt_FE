
"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGetGroup, useDeleteGroup, useGetGroupMembers } from "@/hooks/queries/group";
import { GroupHeader } from "@/components/groups/GroupHeader";
import { MemberManagement } from "@/components/groups/MemberManagement";
import { GroupModal } from "@/components/groups/GroupModal";
import { GroupCollections } from "@/components/groups/GroupCollections";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useAuth } from "@/contexts/AuthContext";

export default function GroupDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const t = useTranslations('Dashboard.Group');
    const { user } = useAuth();

    const { data: group, isLoading, error } = useGetGroup(id);
    const { data: members } = useGetGroupMembers(id);
    const deleteGroup = useDeleteGroup();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const isAdmin = members?.content?.some(
        member => member.userId === user?.id && member.role === 'admin'
    ) ?? false;

    // Fallback: if ownerId exists, use it. Otherwise rely on member role.
    const canManage = isAdmin || (user?.id && group?.ownerId && user.id === group.ownerId);

    if (isLoading) {
        return (
            <div className="flex flex-col h-full bg-gray-50/50">
                {/* Header Skeleton */}
                <div className="bg-white border-b px-6 py-5">
                    <div className="h-4 w-40 mb-4 bg-gray-200 rounded animate-pulse" />
                    <div className="h-7 w-56 bg-gray-200 rounded animate-pulse" />
                </div>
                {/* Content Skeleton */}
                <main className="flex-1 p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <div className="h-64 bg-gray-200 rounded-xl animate-pulse" />
                        </div>
                        <div>
                            <div className="h-48 bg-gray-200 rounded-xl animate-pulse" />
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    if (error || !group) {
        return (
            <div className="text-center py-20 text-red-500">
                {t('groupNotFound')}
            </div>
        );
    }

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
        <div className="flex flex-col h-full bg-gray-50/50">
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

            <main className="flex-1 p-6 overflow-y-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <MemberManagement groupId={id} />
                        <GroupCollections groupId={id} isOwner={!!canManage} />
                    </div>
                    <div className="space-y-6">
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
            </main>

            <GroupModal
                open={isEditModalOpen}
                onOpenChange={setIsEditModalOpen}
                editingGroup={{
                    id: group.id,
                    name: group.name,
                    isActive: group.isActive ?? true,
                }}
            />
        </div>
    );
}
