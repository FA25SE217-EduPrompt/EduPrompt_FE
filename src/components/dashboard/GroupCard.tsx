import React from 'react';
import { UserGroupIcon, EllipsisHorizontalIcon, UserIcon } from '@heroicons/react/24/outline';

interface GroupCardProps {
    id: string | number;
    name: string;
    description: string;
    memberCount: number;
    promptCount: number;
    role: 'Admin' | 'Member';
    color?: string;
}

export const GroupCard: React.FC<GroupCardProps> = ({
    name,
    description,
    memberCount,
    promptCount,
    role,
    color = 'bg-indigo-500'
}) => {
    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 group">
            <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                    <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center text-white shadow-sm`}>
                        <UserGroupIcon className="h-6 w-6" />
                    </div>
                    <button className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
                        <EllipsisHorizontalIcon className="h-6 w-6" />
                    </button>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">
                    {name}
                </h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2 h-10">
                    {description}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center text-xs text-gray-500">
                            <UserIcon className="h-3 w-3 mr-1" />
                            <span className="font-medium text-gray-900 mr-1">{memberCount}</span> Members
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                            <span className="font-medium text-gray-900 mr-1">{promptCount}</span> Prompts
                        </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${role === 'Admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                        {role}
                    </span>
                </div>
            </div>
        </div>
    );
};
