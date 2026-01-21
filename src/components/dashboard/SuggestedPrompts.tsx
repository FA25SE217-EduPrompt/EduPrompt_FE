import React from "react";
import { SparklesIcon } from "@heroicons/react/24/outline";
import { PromptCard } from "./PromptCard";
import { useTranslations } from "next-intl";

interface SuggestedPrompt {
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
    tags?: string[];
}

interface SuggestedPromptsProps {
    suggestions: SuggestedPrompt[];
}

export const SuggestedPrompts: React.FC<SuggestedPromptsProps> = ({ suggestions }) => {
    const t = useTranslations('Dashboard.Manage');

    return (
        <section>
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                    <SparklesIcon className="w-5 h-5 text-brand-secondary" />
                    {t('aiSuggestions')}
                </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {suggestions.map((prompt) => (
                    <PromptCard
                        key={prompt.id}
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
                    />
                ))}
            </div>
        </section>
    );
};
