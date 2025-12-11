"use client";

import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from '@/i18n/navigation';
import { useTranslations } from "next-intl";
import { UserAvatar } from "./UserAvatar";
import Button from "../ui/Button";
import { ChevronRightIcon } from "@heroicons/react/24/solid";

interface CreatorNavbarProps {
    title?: string;
    breadcrumbs?: { label: string; href?: string }[];
    actions?: React.ReactNode;
    // Legacy props for backward compatibility (optional)
    onSave?: () => void;
    isSaving?: boolean;
    onTest?: () => void;
    isTesting?: boolean;
}

/**
 * Standardized header for the prompt creation/editing/testing pages.
 */
export const CreatorNavbar: React.FC<CreatorNavbarProps> = ({
    title = "Create New",
    breadcrumbs = [],
    actions,
    onSave,
    isSaving = false,
    onTest,
    isTesting = false,
}) => {
    const { user } = useAuth();
    const t = useTranslations('Dashboard.Common');

    return (
        <header className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Breadcrumbs */}
                    <nav className="flex items-center space-x-1 text-sm">
                        <Link
                            href="/dashboard/teacher"
                            className="text-gray-500 hover:text-gray-900 transition-colors"
                        >
                            {t('dashboard')}
                        </Link>
                        <ChevronRightIcon className="h-4 w-4 text-gray-400" />
                        <Link
                            href="/dashboard/prompts"
                            className="text-gray-500 hover:text-gray-900 transition-colors"
                        >
                            {t('prompts')}
                        </Link>
                        <ChevronRightIcon className="h-4 w-4 text-gray-400" />
                        {breadcrumbs.map((crumb, index) => (
                            <React.Fragment key={index}>
                                {crumb.href ? (
                                    <Link
                                        href={crumb.href}
                                        className="text-gray-500 hover:text-gray-900 transition-colors"
                                    >
                                        {crumb.label}
                                    </Link>
                                ) : (
                                    <span className="text-gray-900 font-medium">
                                        {crumb.label}
                                    </span>
                                )}
                                {index < breadcrumbs.length - 1 && (
                                    <ChevronRightIcon className="h-4 w-4 text-gray-400" />
                                )}
                                {index === breadcrumbs.length - 1 && <ChevronRightIcon className="h-4 w-4 text-gray-400" />}
                            </React.Fragment>
                        ))}
                        {breadcrumbs.length === 0 && (
                            <span className="text-gray-900 font-medium">
                                {title}
                            </span>
                        )}
                    </nav>

                    {/* Actions */}
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-3">
                            <UserAvatar />
                            <span className="text-sm font-medium text-gray-600 hidden sm:block">
                                {user?.firstName || "User"}
                            </span>
                        </div>
                        <div className="flex items-center space-x-2">
                            {actions ? actions : (
                                <>
                                    {onSave && (
                                        <Button
                                            onClick={onSave}
                                            disabled={isSaving}
                                            variant="secondary"
                                            className="!px-4 !py-2 !text-sm"
                                        >
                                            {isSaving ? t('saving') : t('saveDraft')}
                                        </Button>
                                    )}
                                    {onTest && (
                                        <Button
                                            onClick={onTest}
                                            disabled={isTesting || isSaving}
                                            variant="primary"
                                            className="!px-4 !py-2 !text-sm"
                                        >
                                            {isTesting ? t('testing') : t('runTest')}
                                        </Button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};