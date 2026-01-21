"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { FileText, Grid3X3, ArrowUpRight, Plus } from 'lucide-react';
import { CurriculumNode } from '@/data/curriculum';
import { useLessonPrompts } from '@/hooks/useCurriculum';
import { PromptLessonResponse } from '@/types/curriculum';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ActionDeckProps {
    lesson: CurriculumNode | null;
}

export const ActionDeck: React.FC<ActionDeckProps> = ({ lesson }) => {
    const t = useTranslations('Explorer');
    const router = useRouter();

    // Fetch prompts for the selected lesson
    const { data: prompts, isLoading, isError } = useLessonPrompts(lesson?.id);

    const handleCustomize = (prompt: PromptLessonResponse) => {
        // Construct params to pre-fill the workbench
        const params = new URLSearchParams({
            title: prompt.title, // User might want to edit the title
            context: prompt.context,
            instruction: prompt.instruction,
            inputExample: prompt.inputExample,
            outputFormat: prompt.outputFormat,
            constraints: prompt.constraints,
            loadPromptId: prompt.id, // Pass ID to trigger view logging and loading in workbench
            fromExplorer: 'true'
        });

        // Workbench expects 'template' key for local templates, but for dynamic prompts we might need a different approach.
        // If the workbench only supports 'template' key ID, we might need to change workbench.
        // But the user said "Implement api call Get Prompts by Lesson", implying we should use this data.
        // I will pass the data as query params for now, assuming Workbench can read them.
        // If the query string is too long, we might need a store, but let's try params.

        router.push(`/prompt/workbench?${params.toString()}`);
    };

    if (!lesson) {
        return (
            <div className="h-full bg-slate-50 border-l border-gray-200 p-6 flex flex-col items-center justify-center text-center">
                <div className="text-gray-300 mb-2">
                    <Grid3X3 size={32} />
                </div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                    {t('noSelection')}
                </p>
            </div>
        )
    }

    return (
        <div className="h-full bg-slate-50 border-l border-gray-200 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 bg-slate-50 sticky top-0 z-10">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-0.5">
                    {t('promptTasks')}
                </h3>
                <p className="text-sm font-semibold text-slate-900 truncate">
                    {lesson.title}
                </p>
            </div>

            {/* Card Stack */}
            <div className="p-4 space-y-3 overflow-y-auto flex-1 custom-scrollbar">
                {isLoading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white rounded-xl border border-gray-100 p-3 h-20 animate-pulse flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-100 rounded-lg shrink-0"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                                    <div className="h-3 bg-gray-50 rounded w-1/2"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : isError ? (
                    <div className="flex flex-col items-center justify-center h-40 text-center text-xs text-red-500 bg-red-50/50 rounded-xl border border-red-100 border-dashed">
                        <span>{t('failedToLoadPrompts')}</span>
                    </div>
                ) : (!prompts || prompts.length === 0) ? (
                    <div className="flex flex-col items-center justify-center h-48 text-center text-xs text-gray-400 bg-white/50 rounded-xl border-2 border-dashed border-gray-100">
                        <Grid3X3 className="w-6 h-6 mb-2 opacity-20" />
                        <span>{t('noPrompts')}</span>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {prompts.map((prompt, index) => (
                            <motion.div
                                key={prompt.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05, duration: 0.3 }}
                                className={cn(
                                    "group w-full text-left bg-white rounded-xl border border-gray-200 p-3 cursor-pointer relative overflow-hidden",
                                    "transition-all duration-300",
                                    "hover:shadow-[0_8px_20px_-6px_rgba(0,0,0,0.08)] hover:-translate-y-1 hover:border-blue-200"
                                )}
                                onClick={() => handleCustomize(prompt)}
                            >
                                <div className="flex items-center gap-3 pl-1">
                                    {/* Icon Box */}
                                    <div className={cn(
                                        "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300",
                                        "bg-blue-50 text-blue-500 group-hover:scale-105 group-hover:bg-blue-100"
                                    )}>
                                        <FileText size={20} className="text-blue-600" />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-bold text-slate-900 truncate">
                                            {prompt.title}
                                        </h4>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            {/* We could show lock status here if we fetch it via batch. 
                                                For now, checking on click is safer for quota than auto-checking all. 
                                                If we want to show lock icons, we should call the batch hook on load.
                                            */}
                                            <p className="text-[10px] text-gray-500 truncate flex-1">
                                                {prompt.description}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Action Button (Plus) */}
                                    <button className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                                        <Plus size={18} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
            {/* Note: Batch check implementation is deferred to avoid auto-consuming quota just by list view if checking consumes something? 
                Actually "checking" should be free, "logging" consumes quota. 
                Docs say "Check Unlock Status" checks if *already* unlocked. 
                "Unlock / Log" is what consumes quota/logs view. 
                So safe to batch check on load if desired. 
                But for this task, the critical part is handling 503 on action. */}
            {/* Bottom Promotion */}
            <div className="p-4 border-t border-gray-200 bg-white">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-4 text-white shadow-lg">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="text-xs font-medium text-white/80 mb-1">{t('comingSoon')}</div>
                            <div className="font-bold text-sm">{t('examGenerator')}</div>
                        </div>
                        <ArrowUpRight size={16} className="text-white/80" />
                    </div>
                </div>
            </div>
        </div>
    );
};
