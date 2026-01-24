"use client";

import React, { useState } from "react";
import { BoltIcon, ChevronDownIcon, StarIcon, PencilSquareIcon, LockClosedIcon, LockOpenIcon } from "@heroicons/react/24/outline";
import { Badge } from "./Badge";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

interface PromptCardProps {
    id: string;
    title: string;
    description: string;
    author: string;
    subject: string;
    grade: string;
    type: string;
    rating: number;
    isTrending?: boolean;
    createdAt: string;
    lastUpdated: string; // ISO 8601 date string
    tags?: string[];
    isOwner?: boolean;
}

const isNew = (createdAt: string): boolean => {
    try {
        const createdDate = new Date(createdAt);
        const now = new Date();
        const threeDaysAgo = now.setDate(now.getDate() - 3);
        return createdDate.getTime() > threeDaysAgo;
    } catch (e) {
        console.error("Invalid date format for createdAt:", createdAt, e);
        return false;
    }
};

const formatDate = (dateString: string): string => {
    try {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    } catch {
        return "Invalid date";
    }
};

export const PromptCard: React.FC<PromptCardProps & { isLocked?: boolean; onUnlock?: () => void; isUnlocking?: boolean }> = (props) => {
    const t = useTranslations('Dashboard.PromptCard');
    const router = useRouter();
    const [isExpanded, setIsExpanded] = useState(false);
    const showNewBadge = isNew(props.createdAt);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsExpanded(!isExpanded);
        }
    };

    return (
        <div
            className={`bg-bg-primary rounded-xl shadow-sm transition-all duration-300 border ${isExpanded
                ? "border-brand-secondary shadow-md"
                : "border-gray-100 hover:shadow-lg hover:-translate-y-1 hover:border-gray-200"
                }`}
        >
            {/* --- CLICKABLE HEADER --- */}
            <div
                role="button"
                tabIndex={0}
                onKeyDown={handleKeyDown}
                className="flex justify-between items-start w-full p-4 text-left cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
                aria-expanded={isExpanded}
                aria-controls={`prompt-details-${props.title.replace(/\s/g, "-")}`}
            >
                <div className="flex-1 pr-4">
                    {/* Status Badges */}
                    <div className="flex flex-wrap gap-2 mb-2">
                        {showNewBadge && (
                            <Badge
                                color="bg-accent-new-subtle text-accent-new"
                                text={t('new')}
                                size="sm"
                            />
                        )}
                        {props.isTrending && (
                            <Badge
                                color="bg-accent-trending-subtle text-accent-trending"
                                text={t('trending')}
                                size="sm"
                            />
                        )}
                    </div>

                    {/* Title */}
                    <h3 className="font-semibold text-text-primary text-base">
                        {props.title}
                    </h3>
                </div>

                {/* Actions */}
                <div className="flex-shrink-0 flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2">
                        {props.isOwner && (
                            <Link
                                href={`/dashboard/prompts/${props.id}/manage`}
                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all active:scale-95 z-10"
                                onClick={(e) => e.stopPropagation()}
                                title={t('manageTooltip')}
                            >
                                <PencilSquareIcon className="h-4 w-4" />
                            </Link>
                        )}

                        {!props.isLocked && (
                            <button
                                aria-label={`${t('optimize')} prompt ${props.title}`}
                                className="btn-optimize z-10 active:scale-95 transition-transform"
                                onClick={(e) => {
                                    e.stopPropagation(); // Prevent card from expanding when clicking optimize
                                    router.push(`/prompt/workbench?loadPromptId=${props.id}&tab=optimize`);
                                }}
                            >
                                <BoltIcon className="h-4 w-4" />
                                <span>{t('optimize')}</span>
                            </button>
                        )}
                        {props.isLocked && (
                            <button
                                aria-label={t('unlock')}
                                className="p-1.5 text-gray-400 hover:text-brand-primary rounded-md transition-colors z-10 active:scale-95"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsExpanded(true); // Expand to show unlock prompt
                                }}
                                title={t('unlockTooltip')}
                            >
                                <LockClosedIcon className="h-5 w-5" />
                            </button>
                        )}
                    </div>

                    {/* Chevron Icon for expand/collapse */}
                    <ChevronDownIcon
                        className={`h-5 w-5 text-text-secondary transition-transform duration-300 ${isExpanded ? "rotate-180" : "rotate-0"
                            }`}
                    />
                </div>
            </div>

            {/* --- EXPANDABLE CONTENT --- */}
            <div
                id={`prompt-details-${props.title.replace(/\s/g, "-")}`}
                className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                    }`}
            >
                <div className="px-4 pb-4 border-t border-gray-100">
                    {props.isLocked ? (
                        <div className="flex flex-col items-center justify-center py-6 text-center space-y-3">
                            <LockClosedIcon className="w-8 h-8 text-gray-400 mb-1" />
                            <h4 className="font-medium text-gray-900">{t('unlockQuestion')}</h4>
                            <p className="text-sm text-gray-500 max-w-xs">{t('unlockConfirm')}</p>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    props.onUnlock?.();
                                }}
                                disabled={props.isUnlocking}
                                className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-primary hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:opacity-70 disabled:cursor-not-allowed transition-all active:scale-95"
                            >
                                {props.isUnlocking ? (
                                    <>
                                        <div className="animate-spin -ml-1 mr-2 h-4 w-4 text-white">
                                            <svg className="fill-current" viewBox="0 0 24 24">
                                                <path
                                                    className="opacity-75"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                />
                                            </svg>
                                        </div>
                                        {t('unlocking')}
                                    </>
                                ) : (
                                    <>
                                        <LockOpenIcon className="-ml-1 mr-2 h-4 w-4" />
                                        {t('unlock')}
                                    </>
                                )}
                            </button>
                            <div className="text-xs text-gray-400 italic mt-2">
                                {t('lockedContent')}
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Description */}
                            <p className="text-sm text-text-secondary mt-3">
                                {props.description || t('noDescription')}
                            </p>

                            {/* Metadata */}
                            <div className="mt-4 space-y-2 text-xs text-text-secondary">
                                <div className="flex">
                                    <span className="font-medium w-20">{t('author')}</span>
                                    <span className="truncate">{props.author}</span>
                                </div>
                                <div className="flex">
                                    <span className="font-medium w-20">{t('updated')}</span>
                                    <span>{formatDate(props.lastUpdated)}</span>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* --- STATIC FOOTER (Tags & Rating) --- */}
            <div className="p-4 border-t border-gray-100">
                <div className="flex flex-wrap gap-2">
                    <Badge
                        color="bg-accent-subject-subtle text-accent-subject"
                        text={props.subject}
                    />
                    <Badge
                        color="bg-accent-grade-subtle text-accent-grade"
                        text={props.grade.startsWith('Khối') || props.grade.startsWith('Grade') ? props.grade : `${t('grade')} ${props.grade}`}
                    />
                    <Badge
                        color="bg-accent-type-subtle text-accent-type"
                        text={props.type}
                    />
                    {props.tags && props.tags.map((tag, index) => (
                        <Badge
                            key={index}
                            color="bg-blue-50 text-blue-700"
                            text={tag}
                        />
                    ))}
                </div>

                <div className="flex items-center mt-3 text-accent-star">
                    <StarIcon className="h-4 w-4 fill-current text-accent-star" />
                    <span className="ml-1 text-sm font-semibold text-accent-star">
                        {props.rating.toFixed(1)}
                    </span>
                </div>
            </div>
        </div>
    );
};