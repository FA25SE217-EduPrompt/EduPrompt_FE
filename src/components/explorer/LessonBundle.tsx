"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { FileText, Presentation, GraduationCap, Grid3X3, Users, ArrowRight, Download, Save, Star } from 'lucide-react';
import { CurriculumNode } from '@/data/curriculum';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface LessonBundleProps {
    lesson: CurriculumNode;
}

export const LessonBundle: React.FC<LessonBundleProps> = ({ lesson }) => {
    const t = useTranslations('Explorer');
    const router = useRouter();

    const handleCustomize = (type: string) => {
        const params = new URLSearchParams({
            title: `${t(`filters.${type}`)}: ${lesson.title}`,
            badges: `${t('grade')} 10,${type}`,
            context: `Lesson: ${lesson.title}`
        });
        router.push(`/prompt/workbench?${params.toString()}`);
    };

    const tasks = [
        { id: 'LessonPlan', icon: FileText, color: 'text-blue-600', border: 'border-t-blue-500', format: 'DOCX / PDF', rating: '4.9' },
        { id: 'Slide', icon: Presentation, color: 'text-orange-600', border: 'border-t-orange-500', format: 'PPTX', rating: '4.8' },
        { id: 'Test', icon: GraduationCap, color: 'text-purple-600', border: 'border-t-purple-500', format: 'DOCX', rating: '4.7' },
        { id: 'Matrix', icon: Grid3X3, color: 'text-green-600', border: 'border-t-green-500', format: 'XLSX', rating: '5.0' },
        { id: 'Activity', icon: Users, color: 'text-pink-600', border: 'border-t-pink-500', format: 'PDF', rating: '4.9' },
    ] as const;

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Container Header */}
            <div className="px-6 py-5 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary uppercase tracking-wider border border-primary/10">
                            {t('lessonBundle')}
                        </span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">{lesson.title}</h3>
                </div>

                <div className="flex items-center gap-2">
                    <button className="p-2 text-gray-500 hover:text-slate-900 hover:bg-white rounded-lg border border-transparent hover:border-gray-200 transition-all text-xs font-medium flex items-center gap-2">
                        <Save size={16} />
                        Save Bundle
                    </button>
                    <button className="px-3 py-2 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800 transition-all flex items-center gap-2 shadow-sm">
                        <Download size={16} />
                        Download All
                    </button>
                </div>
            </div>

            {/* Card Grid */}
            <div className="p-8 bg-gray-50/30">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                    {tasks.map((task, index) => (
                        <motion.div
                            key={task.id}
                            whileHover={{ y: -2 }}
                            className={cn(
                                "bg-white rounded-lg border border-gray-200 overflow-hidden cursor-pointer group hover:shadow-md transition-all flex flex-col min-h-[180px]",
                                "border-t-4", task.border
                            )}
                            onClick={() => handleCustomize(task.id)}
                        >
                            {/* Card Body */}
                            <div className="p-4 flex-1">
                                <div className="flex justify-between items-start mb-3">
                                    <div className={cn("p-2 rounded-md bg-gray-50", task.color)}>
                                        <task.icon size={20} />
                                    </div>
                                    <div className="flex items-center gap-1 text-[10px] font-semibold text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">
                                        <Star size={10} className="fill-yellow-400 text-yellow-400" />
                                        {task.rating}
                                    </div>
                                </div>

                                <h4 className="font-bold text-slate-900 text-sm mb-1">{t(`filters.${task.id}`)}</h4>
                                <p className="text-[11px] text-gray-500 font-mono uppercase tracking-tight">
                                    {task.format} • Verified
                                </p>
                            </div>

                            {/* Card Footer Action */}
                            <div className="bg-gray-50 p-3 border-t border-gray-100 group-hover:bg-primary/5 transition-colors">
                                <div className="flex items-center justify-between text-xs font-medium text-gray-500 group-hover:text-primary">
                                    <span>{t('customize')}</span>
                                    <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0" />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};
