import React, { useState, useEffect } from "react";
import { promptsService } from "@/services/resources/prompts";
import { toast } from "sonner";
import { Link } from '@/i18n/navigation';
import { PlusCircleIcon } from "@heroicons/react/24/outline";
import { PromptCard } from "./PromptCard";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";
import { PromptCardSkeleton } from "./PromptCardSkeleton";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";

export interface DisplayPrompt {
    id: string;
    title: string;
    description: string;
    author: string;
    subject: string;
    grade: string;
    type: string;
    rating: number;
    isTrending: boolean;
    createdAt: string;
    lastUpdated: string;
    tags: string[];
    isOwner: boolean;
}

interface PromptsGridProps {
    isSearching: boolean;
    isLoading: boolean;
    prompts: DisplayPrompt[];
    executedSearchQuery: string;
    title?: string;
    hideCreateButton?: boolean;
    emptyStateMessage?: string;
}

export const PromptsGrid: React.FC<PromptsGridProps> = ({
    isSearching,
    isLoading,
    prompts,
    executedSearchQuery,
    title,
    hideCreateButton = false,
    emptyStateMessage,
}) => {
    const t = useTranslations('Dashboard.Manage');
    const [viewedStatus, setViewedStatus] = useState<Record<string, boolean>>({});
    const [unlockingId, setUnlockingId] = useState<string | null>(null);

    // Check viewed status for displayed prompts
    // Optimization: Create a stable dependency key from non-owned prompt IDs needed to check
    // This prevents re-runs when the 'prompts' array reference changes but the IDs are the same
    const stableIdsToCheck = React.useMemo(() => {
        return prompts
            .filter(p => !p.isOwner)
            .map(p => p.id)
            .sort()
            .join(',');
    }, [prompts]);

    // Check viewed status for displayed prompts
    useEffect(() => {
        const checkViewedStatus = async () => {
            // Parse the IDs from our stable key
            const allNonOwnedIds = stableIdsToCheck ? stableIdsToCheck.split(',') : [];

            const idsNeeded = allNonOwnedIds.filter(id => viewedStatus[id] === undefined);

            // Deduplicate just in case
            const uniqueIds = Array.from(new Set(idsNeeded));

            if (uniqueIds.length === 0) return;

            try {
                const response = await promptsService.checkPromptsViewedBatch(uniqueIds);
                if (response && response.data) {
                    const statusMap: Record<string, boolean> = {};
                    response.data.forEach((item: { id: string; value: boolean }) => {
                        statusMap[item.id] = item.value;
                    });
                    setViewedStatus(prev => ({ ...prev, ...statusMap }));
                }
            } catch (error: unknown) {
                const axiosError = error as { response?: { status: number } };
                if (axiosError?.response?.status === 403) {
                    console.warn("Viewed status check forbidden (403).");
                } else {
                    console.error("Failed to check viewed status", error);
                }
            }
        };

        const timer = setTimeout(checkViewedStatus, 300);
        return () => clearTimeout(timer);
    }, [stableIdsToCheck, viewedStatus]);

    const handleUnlock = async (promptId: string) => {
        setUnlockingId(promptId);
        try {
            const response = await promptsService.logPromptView(promptId);

            if (response.error) {
                if (response.error.code === 'QUOTA_EXCEEDED' && response.error.status === '503') {
                    toast.error(t('quotaExceeded') || "Quota exceeded for unlocking prompts.");
                } else {
                    toast.error(t('unlockFailed') || "Failed to unlock prompt");
                }
                return;
            }

            setViewedStatus(prev => ({ ...prev, [promptId]: true }));
            toast.success(t('promptUnlocked') || "Prompt unlocked successfully");
        } catch (error) {
            console.error("Unlock failed", error);
            toast.error(t('unlockFailed') || "Failed to unlock prompt");
        } finally {
            setUnlockingId(null);
        }
    };

    return (
        <section>
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                    {title || (isSearching ? t('searchResults') : t('myPrompts'))}
                </h2>

                {!isSearching && !hideCreateButton && (
                    <Link
                        href="/prompt/workbench"
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm shadow-sm btn-primary"
                    >
                        <PlusCircleIcon className="h-5 w-5" />
                        <span>{t('create')}</span>
                    </Link>
                )}
            </div>

            {/* Prompt grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <PromptCardSkeleton key={i} />
                    ))}
                </div>
            ) : prompts.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-12 text-gray-500"
                >
                    {isSearching
                        ? `${t('noResults')} "${executedSearchQuery}"`
                        : (emptyStateMessage || t('noPrompts'))}
                </motion.div>
            ) : (
                <div
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                    style={{ contentVisibility: 'auto', containIntrinsicSize: '1px 300px' }}
                >
                    {prompts.map((prompt, index) => (
                        <motion.div
                            key={prompt.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                            <PromptCard
                                id={prompt.id}
                                title={prompt.title}
                                description={prompt.description}
                                author={prompt.author}
                                subject={prompt.subject}
                                grade={prompt.grade}
                                type={prompt.type}
                                rating={prompt.rating}
                                isTrending={prompt.isTrending}
                                createdAt={prompt.createdAt}
                                lastUpdated={prompt.lastUpdated}
                                tags={prompt.tags}
                                isOwner={prompt.isOwner}
                                isLocked={!prompt.isOwner && viewedStatus[prompt.id] !== true}
                                onUnlock={() => handleUnlock(prompt.id)}
                                isUnlocking={unlockingId === prompt.id}
                            />
                        </motion.div>
                    ))}
                </div>
            )}
        </section>
    );
};
