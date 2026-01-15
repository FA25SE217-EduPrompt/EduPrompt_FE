"use client";

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useTranslations } from 'next-intl';
import { Copy, BookOpen } from 'lucide-react';
import { CurriculumNode } from '@/data/curriculum';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface LessonContentViewerProps {
    lesson: CurriculumNode | null;
    className?: string;
}

// Mock content generator (replace with real API fetch later)
const getLessonContent = (title: string) => `
# ${title}

## 1. Định nghĩa
Trong toán học, **mệnh đề** là một câu khẳng định có tính chất **đúng** hoặc **sai**. 
Một câu khẳng định không thể vừa đúng vừa sai không được gọi là mệnh đề.

> **Ví dụ:**
> - "Hà Nội là thủ đô của Việt Nam" -> Mệnh đề đúng.
> - "3 + 5 = 10" -> Mệnh đề sai.
> - "Hôm nay trời đẹp quá!" -> Không phải mệnh đề (câu cảm thán).

## 2. Mệnh đề phủ định
Cho mệnh đề $P$. Mệnh đề phủ định của $P$, kí hiệu là $\\bar{P}$, là mệnh đề "Không phải $P$".
- Nếu $P$ đúng thì $\\bar{P}$ sai.
- Nếu $P$ sai thì $\\bar{P}$ đúng.

## 3. Mệnh đề kéo theo
Mệnh đề "Nếu $P$ thì $Q$" được gọi là mệnh đề kéo theo.
Kí hiệu: $P \\Rightarrow Q$.

*   **P**: Giả thiết (hoặc điều kiện đủ).
*   **Q**: Kết luận (hoặc điều kiện cần).

## 4. Bài tập ví dụ
Xác định tính đúng sai của các mệnh đề sau:
1.  $\\pi$ là một số hữu tỉ.
2.  Tổng hai cạnh của một tam giác luôn lớn hơn cạnh còn lại.

| Mệnh đề | Tính chất |
| :--- | :--- |
| $\\pi \\in \\mathbb{Q}$ | Sai |
| $a + b > c$ | Đúng |
`;

export const LessonContentViewer: React.FC<LessonContentViewerProps> = ({ lesson, className }) => {
    const t = useTranslations('Explorer');

    const handleCopy = () => {
        if (lesson) {
            navigator.clipboard.writeText(getLessonContent(lesson.title));
            toast.success("Content copied directly to clipboard!");
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
                    Select a lesson from the sidebar to view its theories, examples, and knowledge base.
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
                    className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-md transition-colors"
                >
                    <Copy size={14} />
                    {t('copyContent')}
                </button>
            </div>

            {/* Markdown Content */}
            <div className="flex-1 overflow-y-auto p-12 custom-prose-wrapper">
                <article className="prose prose-slate max-w-none prose-headings:text-primary prose-a:text-blue-600 prose-blockquote:border-l-primary prose-blockquote:bg-blue-50/30 prose-blockquote:py-1 prose-blockquote:px-4 prose-img:rounded-xl">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {getLessonContent(lesson.title)}
                    </ReactMarkdown>
                </article>

                {/* Footer / Padding */}
                <div className="h-20" />
            </div>
        </div>
    );
};
