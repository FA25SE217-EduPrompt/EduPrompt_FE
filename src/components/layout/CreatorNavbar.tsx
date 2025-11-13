"use client";

import React from "react";
import Link from "next/link";
import {useAuth} from "@/hooks/useAuth";
import {UserAvatar} from "./UserAvatar";
import Button from "../ui/Button";
import {ChevronRightIcon} from "@heroicons/react/24/solid";

interface CreatorNavbarProps {
    onSave: () => void;
    isSaving: boolean;
    onTest: () => void;
    isTesting: boolean;
}

/**
 * Standardized header for the prompt creation/editing/testing pages.
 */
export const CreatorNavbar: React.FC<CreatorNavbarProps> = ({
                                                                onSave,
                                                                isSaving,
                                                                onTest,
                                                                isTesting,
                                                            }) => {
    const {user} = useAuth();

    return (
        <header className="bg-bg-primary/90 backdrop-blur-sm border-b border-brand-subtle sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Breadcrumbs */}
                    <nav className="flex items-center space-x-1 text-sm">
                        <Link
                            href="/dashboard/teacher"
                            className="text-text-secondary hover:text-text-primary"
                        >
                            Dashboard
                        </Link>
                        <ChevronRightIcon className="h-4 w-4 text-gray-400"/>
                        <Link
                            href="/dashboard/prompts"
                            className="text-text-secondary hover:text-text-primary"
                        >
                            Prompts
                        </Link>
                        <ChevronRightIcon className="h-4 w-4 text-gray-400"/>
                        <span className="text-text-primary font-medium">
              Create New
            </span>
                    </nav>

                    {/* Actions */}
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-3">
                            <UserAvatar/>
                            <span className="text-sm font-medium text-text-secondary hidden sm:block">
                {user?.firstName || "User"}
              </span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                onClick={onSave}
                                disabled={isSaving}
                                variant="secondary"
                                className="!px-4 !py-2 !text-sm"
                            >
                                {isSaving ? "Saving..." : "Save Draft"}
                            </Button>
                            <Button
                                onClick={onTest}
                                disabled={isTesting || isSaving}
                                variant="primary"
                                className="!px-4 !py-2 !text-sm"
                            >
                                {isTesting ? "Testing..." : "Run Test"}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};