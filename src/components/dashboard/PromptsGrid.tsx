import React from "react";
import { Link } from '@/i18n/navigation';
import { PlusCircleIcon } from "@heroicons/react/24/outline";
import { PromptCard } from "./PromptCard";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";
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
                        <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 h-[280px] flex flex-col justify-between">
                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <SkeletonLoader lines={0} hasHeading={false} className="w-16 h-5" />
                                    <SkeletonLoader lines={0} hasHeading={false} className="w-16 h-5" />
                                </div>
                                <SkeletonLoader lines={1} hasHeading={true} className="w-3/4" />
                                <SkeletonLoader lines={2} hasHeading={false} />
                            </div>
                            <div className="flex gap-2 mt-4">
                                <SkeletonLoader lines={0} hasHeading={false} className="w-12 h-5" />
                                <SkeletonLoader lines={0} hasHeading={false} className="w-12 h-5" />
                            </div>
                        </div>
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
                <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                    initial="hidden"
                    animate="show"
                    variants={{
                        hidden: { opacity: 0 },
                        show: {
                            opacity: 1,
                            transition: {
                                staggerChildren: 0.05
                            }
                        }
                    }}
                >
                    <AnimatePresence mode="popLayout">
                        {prompts.map((prompt) => (
                            <motion.div
                                key={prompt.id}
                                layout
                                variants={{
                                    hidden: { opacity: 0, y: 20 },
                                    show: { opacity: 1, y: 0 }
                                }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.3 }}
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
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            )}
        </section>
    );
};
