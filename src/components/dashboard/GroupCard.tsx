
"use client";

import React from "react";
import { Link } from "@/i18n/navigation";
import { UserGroupIcon } from "@heroicons/react/24/outline";
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
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 group h-full">
                <div className="p-5 flex flex-col h-full">
                    <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center text-white shadow-sm">
                            <UserGroupIcon className="h-6 w-6" />
                        </div>
                        {/* Add options menu here if needed later */}
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors line-clamp-1">
                        {name}
                    </h3>

                    <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-grow">
                        {description || t('noGroupsDesc')}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                        <div className="flex items-center text-xs text-gray-500">
                            <span className="font-medium text-gray-900 mr-1">{memberCount}</span> {t('members')}
                        </div>
                        <div className="text-xs text-gray-400">
                            {new Date(createdAt).toLocaleDateString()}
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
};
