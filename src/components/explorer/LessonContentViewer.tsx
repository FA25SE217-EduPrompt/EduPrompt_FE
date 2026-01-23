"use client";

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { useTranslations } from 'next-intl';
import { Copy, BookOpen } from 'lucide-react';
import { useLessonDetails } from '@/hooks/useCurriculum';
import { CurriculumNode } from '@/data/curriculum';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface LessonContentViewerProps {
    lesson: CurriculumNode | null;
    className?: string;
}

export const LessonContentViewer: React.FC<LessonContentViewerProps> = ({ lesson, className }) => {
    const t = useTranslations('Explorer');

    // Fetch lesson details when a lesson is selected
    const { data: lessonDetail, isLoading, isError } = useLessonDetails(lesson?.id);

    const handleCopy = () => {
        if (lessonDetail?.data?.content) {
            navigator.clipboard.writeText(lessonDetail.data.content);
            toast.success(t('copySuccess'));
        }
    };

    if (!lesson) {
        return (
            <div className={cn("h-full flex flex-col items-center justify-center p-8 text-center bg-white", className)}>
                <div className="bg-gray-50 p-6 rounded-full mb-6">
                    <BookOpen size={48} className="text-gray-300" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    {t('contentViewerPlaceholder')}
                </h3>
                <p className="text-sm text-text-muted max-w-xs mx-auto">
                    {t('contentViewerHint')}
                </p>
            </div>
        );
    }

    return (
        <div className={cn("flex flex-col h-full bg-white", className)}>
            {/* Sticky Header */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-8 py-4 z-20 flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-900 truncate pr-4">
                    {lesson.title}
                </h2>
                <button
                    onClick={handleCopy}
                    disabled={!lessonDetail?.data?.content}
                    className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-md transition-colors disabled:opacity-50"
                >
                    <Copy size={14} />
                    {t('copyContent')}
                </button>
            </div>

            {/* Markdown Content */}
            <div className="flex-1 overflow-y-auto p-12 custom-prose-wrapper scroll-smooth">
                {isLoading ? (
                    <div className="space-y-6 max-w-3xl animate-pulse">
                        {/* Header Skeleton */}
                        <div className="space-y-4 pb-8 border-b border-gray-100">
                            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                            <div className="h-8 bg-gray-100 rounded w-3/4"></div>
                        </div>
                        {/* Content Blocks */}
                        <div className="space-y-3">
                            <div className="h-4 bg-gray-50 rounded w-full"></div>
                            <div className="h-4 bg-gray-50 rounded w-full"></div>
                            <div className="h-4 bg-gray-50 rounded w-5/6"></div>
                        </div>
                        <div className="space-y-3 pt-4">
                            <div className="h-6 bg-gray-100 rounded w-1/3 mb-2"></div>
                            <div className="h-4 bg-gray-50 rounded w-full"></div>
                            <div className="h-4 bg-gray-50 rounded w-full"></div>
                            <div className="h-4 bg-gray-50 rounded w-4/6"></div>
                        </div>
                    </div>
                ) : isError ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center p-8 bg-red-50/50 rounded-2xl border border-red-100">
                        <div className="p-3 bg-red-100 text-red-500 rounded-full mb-3">
                            <BookOpen size={24} />
                        </div>
                        <h3 className="text-sm font-bold text-red-700 mb-1">{t('failedToLoad')}</h3>
                        <p className="text-xs text-red-500">{t('failedToLoadDesc')}</p>
                    </div>
                ) : (
                    <article className="prose prose-slate max-w-none 
                        prose-headings:text-slate-900 prose-headings:font-bold prose-headings:tracking-tight
                        prose-p:text-slate-600 prose-p:leading-relaxed
                        prose-a:text-blue-600 prose-a:font-medium prose-a:no-underline hover:prose-a:underline
                        prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50/50 prose-blockquote:py-2 prose-blockquote:px-5 prose-blockquote:rounded-r-lg prose-blockquote:text-slate-700 prose-blockquote:font-medium
                        prose-img:rounded-xl prose-img:shadow-md
                        prose-code:text-pink-600 prose-code:bg-pink-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:font-mono prose-code:text-sm
                        prose-li:text-slate-600 prose-li:marker:text-slate-400">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm, remarkMath]}
                            rehypePlugins={[rehypeKatex]}
                        >
                            {lessonDetail?.data?.content || t('noContent')}
                        </ReactMarkdown>
                    </article>
                )}

                {/* Footer space */}
                <div className="h-32" />
            </div>
        </div>
    );
};
