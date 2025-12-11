import React from 'react';
import Link from 'next/link';
import { BookOpenIcon, UserGroupIcon, EllipsisHorizontalIcon } from '@heroicons/react/24/outline';

interface CollectionCardProps {
    id: string | number;
    name: string;
    description: string;
    promptCount: number;
    isShared?: boolean;
    updatedAt: string;
    color?: string;
}

export const CollectionCard: React.FC<CollectionCardProps> = ({
    id,
    name,
    description,
    promptCount,
    isShared = false,
    updatedAt,
    color = 'bg-blue-500'
}) => {
    return (
        <Link href={`/dashboard/collections/${id}`} className="block h-full">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 group h-full">
                <div className="p-5 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-4">
                        <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center text-white shadow-sm`}>
                            <BookOpenIcon className="h-6 w-6" />
                        </div>
                        <button className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
                            <EllipsisHorizontalIcon className="h-6 w-6" />
                        </button>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                        {name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-grow">
                        {description}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                        <div className="flex items-center text-xs text-gray-500">
                            <span className="font-medium text-gray-900 mr-1">{promptCount}</span> Prompts
                        </div>
                        {isShared && (
                            <div className="flex items-center text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                                <UserGroupIcon className="h-3 w-3 mr-1" />
                                Shared
                            </div>
                        )}
                        <div className="text-xs text-gray-400">
                            Updated {new Date(updatedAt).toLocaleDateString()}
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
};
