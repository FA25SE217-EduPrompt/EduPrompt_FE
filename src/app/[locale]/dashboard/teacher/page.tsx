"use client";

import React from "react";
import {
    AcademicCapIcon,
    BoltIcon,
    BookOpenIcon,
    PlusCircleIcon,
    SparklesIcon,
    WalletIcon,
} from "@heroicons/react/24/outline";
import { StatCard } from "@/components/dashboard/StatCard";
import { PromptCard } from "@/components/dashboard/PromptCard";
import { useTranslations } from "next-intl";

// Mock Data
const promptData = [
    {
        id: 1,
        title: "Photosynthesis Quiz",
        description: "A 10-question multiple choice quiz covering the key concepts of photosynthesis, including reactants, products, and the light-dependent reactions.",
        author: "Ms. Nguyen",
        subject: "Biology",
        grade: "10",
        type: "Quiz",
        rating: 4.5,
        isTrending: true,
        createdAt: "2025-11-13T10:00:00Z",
        lastUpdated: "2025-11-14T01:30:00Z",
    },
    {
        id: 2,
        title: "Newton’s Laws Practice",
        description: "A worksheet with 5 physics problems requiring students to apply Newton's first and second laws. Includes scenarios with and without friction.",
        author: "Mr. Tran",
        subject: "Physics",
        grade: "11",
        type: "Worksheet",
        rating: 4.8,
        isTrending: false,
        createdAt: "2025-11-01T14:20:00Z",
        lastUpdated: "2025-11-10T09:15:00Z",
    },
    {
        id: 3,
        title: "Vietnamese Poetry Analysis",
        description: "An essay prompt asking students to analyze the use of metaphor in 'Truyện Kiều' by Nguyễn Du, focusing on cultural context.",
        author: "Ms. Nguyen",
        subject: "Literature",
        grade: "12",
        type: "Essay",
        rating: 4.2,
        isTrending: false,
        createdAt: "2025-11-12T11:00:00Z",
        lastUpdated: "2025-11-12T11:00:00Z",
    },
    {
        id: 4,
        title: "Chemical Reactions Lab",
        description: "Lab guide for a hands-on experiment involving single and double displacement reactions. Includes safety brief and data table.",
        author: "Mr. Pham",
        subject: "Chemistry",
        grade: "10",
        type: "Activity",
        rating: 4.7,
        isTrending: true,
        createdAt: "2025-10-28T08:00:00Z",
        lastUpdated: "2025-11-05T16:45:00Z",
    },
];

const suggestedData = [
    {
        id: 5,
        title: "Grammar Challenge: Passive Voice",
        description: "An interactive exercise where students must rewrite active voice sentences into passive voice, focusing on correct verb conjugation.",
        author: "AI Assistant",
        subject: "English",
        grade: "11",
        type: "Exercise",
        rating: 4.6,
        isTrending: false,
        createdAt: "2025-11-13T09:00:00Z",
        lastUpdated: "2025-11-13T09:00:00Z",
    },
    {
        id: 6,
        title: "Vietnamese History Timeline",
        description: "A project outline for students to create an interactive digital timeline of the Nguyễn Dynasty, highlighting key events and figures.",
        author: "AI Assistant",
        subject: "History",
        grade: "12",
        type: "Project",
        rating: 4.9,
        isTrending: true,
        createdAt: "2025-11-10T17:00:00Z",
        lastUpdated: "2025-11-11T13:00:00Z",
    }
]


const TeacherDashboard: React.FC = () => {
    const t = useTranslations('Dashboard.Teacher');
    const tCommon = useTranslations('Dashboard.Common');

    return (
        <main className="flex-1 overflow-y-auto p-6 space-y-8">
            {/* ---STATCARD SECTION --- */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title={t('promptsCreated')}
                    value="42"
                    icon={<SparklesIcon />}
                    gradientClass="from-brand-secondary to-brand-secondary/70" // Sky Blue
                />
                <StatCard
                    title={t('collectionsOwned')}
                    value="8"
                    icon={<BookOpenIcon />}
                    gradientClass="from-brand-primary to-brand-primary/70" // Dark Slate
                />
                <StatCard
                    title={t('optimizationsUsed')}
                    value="120"
                    icon={<BoltIcon />}
                    gradientClass="from-brand-secondary to-brand-secondary/70" // Sky Blue
                />
                <StatCard
                    title={t('tokensRemaining')}
                    value="1,250"
                    icon={<WalletIcon />}
                    gradientClass="from-brand-primary to-brand-primary/70" // Dark Slate
                />
            </section>

            {/* Prompts area */}
            <section>
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                        {tCommon('myPrompts')}
                    </h2>

                    <button
                        aria-label="Create new prompt"
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm shadow-sm btn-primary"
                    >
                        <PlusCircleIcon className="h-5 w-5" />
                        <span>{t('create')}</span>
                    </button>
                </div>

                {/* Prompt grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {promptData.map((prompt) => (
                        <PromptCard
                            key={prompt.id}
                            id={prompt.id.toString()}
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
                        />
                    ))}
                </div>
            </section>

            {/* Recommendations area */}
            <section>
                <h2 className="text-lg font-semibold text-text-primary mb-3 flex items-center gap-2">
                    <AcademicCapIcon className="h-5 w-5 text-accent-ai" /> {t('aiSuggestions')}
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {suggestedData.map((prompt) => (
                        <PromptCard
                            key={prompt.id}
                            id={prompt.id.toString()}
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
                        />
                    ))}
                </div>
            </section>
        </main>
    );
};

export default TeacherDashboard;