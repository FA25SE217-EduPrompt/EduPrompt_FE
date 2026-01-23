
"use client";

import React from "react";
import { AppBreadcrumb } from "@/components/common/AppBreadcrumb";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useTranslations } from "next-intl";

interface GroupHeaderProps {
    title: string;
    description?: string;
    onEdit: () => void;
    onDelete: () => void;
    breadcrumbItems: { label: string; href: string }[];
}

export const GroupHeader: React.FC<GroupHeaderProps> = ({
    title,
    description,
    onEdit,
    onDelete,
    breadcrumbItems,
}) => {
    const t = useTranslations('Dashboard.Group');
    return (
        <div className="bg-white border-b sticky top-0 z-20">
            <div className="px-6 py-4">
                <div className="flex flex-col gap-4">
                    <AppBreadcrumb items={breadcrumbItems} />

                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                            {description && (
                                <p className="mt-1 text-sm text-gray-600 max-w-2xl">{description}</p>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={onEdit}
                                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <PencilIcon className="w-4 h-4" />
                                {t('editGroup')}
                            </button>
                            <button
                                onClick={onDelete}
                                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-white border border-gray-300 rounded-lg hover:bg-red-50 hover:border-red-200 transition-colors"
                            >
                                <TrashIcon className="w-4 h-4" />
                                {t('deleteGroup')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
