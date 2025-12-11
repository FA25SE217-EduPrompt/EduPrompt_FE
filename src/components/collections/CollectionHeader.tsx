import React from 'react';
import Link from 'next/link';
import { AppBreadcrumb } from '@/components/common/AppBreadcrumb';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';

interface CollectionHeaderProps {
    title: string;
    description?: string;
    onEdit: () => void;
    onDelete: () => void;
    isDeleting?: boolean;
}

export const CollectionHeader: React.FC<CollectionHeaderProps> = ({
    title,
    description,
    onEdit,
    onDelete,
    isDeleting = false,
}) => {
    return (
        <div className="bg-white border-b sticky top-0 z-20">
            <div className="px-6 py-4">
                <div className="flex flex-col gap-4">
                    <AppBreadcrumb
                        items={[
                            { label: 'Collections', href: '/dashboard/collections' },
                            { label: title },
                        ]}
                    />

                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                            {description && (
                                <p className="mt-1 text-sm text-gray-500 max-w-2xl">
                                    {description}
                                </p>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={onEdit}
                                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <PencilSquareIcon className="w-4 h-4" />
                                Edit
                            </button>
                            <button
                                onClick={onDelete}
                                disabled={isDeleting}
                                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-white border border-gray-300 rounded-lg hover:bg-red-50 hover:border-red-200 transition-colors disabled:opacity-50"
                            >
                                <TrashIcon className="w-4 h-4" />
                                {isDeleting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
