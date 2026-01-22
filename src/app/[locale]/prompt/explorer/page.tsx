"use client";

import React, { useState } from 'react';
import { CurriculumSidebar } from '@/components/explorer/CurriculumSidebar';
import { ExplorerHeader } from '@/components/explorer/ExplorerHeader';
import { LessonContentViewer } from '@/components/explorer/LessonContentViewer';
import { ActionDeck } from '@/components/explorer/ActionDeck';
import { CurriculumNode } from '@/data/curriculum';
import { useTranslations } from 'next-intl';

export default function ExplorerPage() {
    const t = useTranslations('Explorer');
    const [selectedLesson, setSelectedLesson] = useState<CurriculumNode | null>(null);

    // 3-Column Layout: [Sidebar 300px] [Content 1fr] [Actions 350px]
    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">

            {/* Column 1: Navigation (Fixed Width) */}
            <div className="w-[300px] flex-shrink-0 z-20 shadow-[1px_0_0_0_rgba(0,0,0,0.05)]">
                <CurriculumSidebar
                    onSelectLesson={setSelectedLesson}
                    selectedLessonId={selectedLesson?.id}
                />
            </div>

            {/* Main Area: Flex Column to hold Header + Split Content */}
            <div className="flex-1 flex flex-col min-w-0">

                {/* Global Header (Spans Col 2 & 3 effectively) */}
                <ExplorerHeader />

                {/* Content Grid: [Reader 1fr] [Deck 350px] */}
                <div className="flex-1 grid grid-cols-[1fr_350px] overflow-hidden">

                    {/* Column 2: Content Reader */}
                    <div className="h-full overflow-hidden relative">
                        <LessonContentViewer lesson={selectedLesson} className="h-full" />
                    </div>

                    {/* Column 3: Action Deck */}
                    <div className="h-full overflow-hidden border-l border-gray-200 z-10 bg-slate-50">
                        <ActionDeck lesson={selectedLesson} />
                    </div>
                </div>
            </div>

        </div>
    );
}
