"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { FileText, Presentation, GraduationCap, Grid3X3, Users, ArrowRight, ArrowUpRight, Plus } from 'lucide-react';
import { CurriculumNode } from '@/data/curriculum';
import { PROMPT_TEMPLATES } from '@/data/prompt_templates';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ActionDeckProps {
    lesson: CurriculumNode | null;
}

export const ActionDeck: React.FC<ActionDeckProps> = ({ lesson }) => {
    const t = useTranslations('Explorer');
    const router = useRouter();

    const handleCustomize = (templateKey: string) => {
        if (!lesson) return;

        const template = PROMPT_TEMPLATES[templateKey];

        const params = new URLSearchParams({
            title: template ? `${template.title}: ${lesson.title}` : `${lesson.title}`,
            badges: `${t('grade')} 10,${t('tagTypes.subject')}`,
            template: templateKey
        });
        router.push(`/prompt/workbench?${params.toString()}`);
    };

    // Map Template Keys to UI Visuals
    const tasks = [
        { key: 'LessonPlan', label: 'Giáo án', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-l-blue-500', format: 'DOCX' },
        { key: 'Slide', label: 'Slide', icon: Presentation, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-l-orange-500', format: 'PPTX' },
        { key: 'Test', label: 'Đề thi', icon: GraduationCap, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-l-purple-500', format: 'PDF' },
        { key: 'Matrix', label: 'Ma trận', icon: Grid3X3, color: 'text-green-600', bg: 'bg-green-50', border: 'border-l-green-500', format: 'XLSX' },
        { key: 'Activity', label: 'Hoạt động', icon: Users, color: 'text-pink-600', bg: 'bg-pink-50', border: 'border-l-pink-500', format: 'PDF' },
    ] as const;

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
                    {t('availableResources')}
                </h3>
                <p className="text-sm font-semibold text-slate-900 truncate">
                    {lesson.title}
                </p>
            </div>

            {/* Card Stack */}
            <div className="p-4 space-y-3 overflow-y-auto flex-1">
                {tasks.map((task, index) => (
                    <motion.div
                        key={task.key}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={cn(
                            "group bg-white rounded-xl border border-gray-200 p-3 cursor-pointer hover:shadow-lg transition-all relative overflow-hidden",
                            "hover:border-primary/30"
                        )}
                        onClick={() => handleCustomize(task.key)}
                    >
                        <div className="flex items-center gap-3 pl-1">
                            {/* Icon Box */}
                            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors", task.bg)}>
                                <task.icon size={20} className={task.color} />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-bold text-slate-900 truncate">
                                    {task.label}
                                </h4>
                                <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded tracking-wide uppercase">
                                    {task.format}
                                </span>
                            </div>

                            {/* Action Button (Plus) */}
                            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                                <Plus size={18} />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Bottom Promotion */}
            <div className="p-4 border-t border-gray-200 bg-white">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-4 text-white shadow-lg">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="text-xs font-medium text-white/80 mb-1">Coming Soon</div>
                            <div className="font-bold text-sm">Exam Generator</div>
                        </div>
                        <ArrowUpRight size={16} className="text-white/80" />
                    </div>
                </div>
            </div>
        </div>
    );
};
