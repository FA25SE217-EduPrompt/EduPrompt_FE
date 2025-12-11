
"use client";

import React from "react";
import { Link } from "@/i18n/navigation";
import { UserGroupIcon, CalendarIcon } from "@heroicons/react/24/outline";
import { GroupResponse } from "@/types/group.api";
import { useTranslations } from "next-intl";

type GroupCardProps = GroupResponse;

export const GroupCard: React.FC<GroupCardProps> = ({
    id,
    name,
    description,
    memberCount,
    createdAt,
}) => {
    const t = useTranslations('Dashboard.Group');
    return (
        <Link href={`/dashboard/groups/${id}`} className="block h-full">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md hover:border-brand-primary transition-all duration-200 h-full flex flex-col">
                <div className="flex items-start justify-between mb-4">
                    <div className="bg-blue-50 p-2 rounded-lg">
                        <UserGroupIcon className="h-6 w-6 text-brand-primary" />
                    </div>
                    {/* Add options menu here if needed later */}
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                    {name}
                </h3>

                <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-grow">
                    {description || t('noGroupsDesc')}
                </p>

                <div className="border-t border-gray-100 pt-4 mt-auto flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                        <span className="font-medium bg-gray-100 px-2 py-0.5 rounded-full">{memberCount} {t('members')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <CalendarIcon className="h-3.5 w-3.5" />
                        <span>{new Date(createdAt).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>
        </Link>
    );
};
