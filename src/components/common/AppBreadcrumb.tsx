import React from 'react';
import { Link } from '@/i18n/navigation';
import { ChevronRightIcon } from '@heroicons/react/24/solid';

export interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface AppBreadcrumbProps {
    items: BreadcrumbItem[];
}

export const AppBreadcrumb: React.FC<AppBreadcrumbProps> = ({ items }) => {
    return (
        <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
                <li>
                    <div>
                        <Link href="/dashboard" className="text-gray-400 hover:text-gray-500">
                            Dashboard
                        </Link>
                    </div>
                </li>
                {items.map((item) => (
                    <li key={item.label}>
                        <div className="flex items-center">
                            <ChevronRightIcon className="flex-shrink-0 h-4 w-4 text-gray-400" aria-hidden="true" />
                            {item.href ? (
                                <Link
                                    href={item.href}
                                    className="ml-2 text-sm font-medium text-gray-500 hover:text-gray-700"
                                >
                                    {item.label}
                                </Link>
                            ) : (
                                <span className="ml-2 text-sm font-medium text-gray-900">
                                    {item.label}
                                </span>
                            )}
                        </div>
                    </li>
                ))}
            </ol>
        </nav>
    );
};
