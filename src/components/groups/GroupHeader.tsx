
"use client";

import React from "react";
import Button from "@/components/ui/Button";
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
        <div className="mb-8">
            <div className="mb-4">
                <AppBreadcrumb items={breadcrumbItems} />
            </div>

            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
                    {description && (
                        <p className="mt-2 text-gray-600 max-w-2xl">{description}</p>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={onEdit}>
                        <PencilIcon className="h-4 w-4 mr-2" />
                        {t('editGroup')}
                    </Button>
                    <Button variant="destructive" onClick={onDelete}>
                        <TrashIcon className="h-4 w-4 mr-2" />
                        {t('deleteGroup')}
                    </Button>
                </div>
            </div>
        </div>
    );
};
