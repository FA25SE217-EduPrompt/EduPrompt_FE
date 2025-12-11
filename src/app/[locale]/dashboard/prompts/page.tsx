"use client";

import React, { useState, useMemo } from "react";
import {
    // AcademicCapIcon,
    BoltIcon,
    BookOpenIcon,
    CircleStackIcon,
    PlusCircleIcon,
    SparklesIcon,
    WalletIcon,
} from "@heroicons/react/24/outline";
import { StatCard } from "@/components/dashboard/StatCard";
import { PromptCard } from "@/components/dashboard/PromptCard";
import { Link } from '@/i18n/navigation';
import { useTranslations } from "next-intl";
import { useFilterPrompts, useSemanticSearch } from '@/hooks/queries/search';
import { useGetMyPrompts } from '@/hooks/queries/prompt'; // Added
import { useCountMyCollections } from '@/hooks/queries/collection';
import { Loader2, Search, Sparkles } from "lucide-react";
import { PromptMetadataResponse, SemanticSearchResult, PromptResponse } from "@/types/prompt.api";
import { TagResponse } from "@/types/tag.api";
import { useAuth } from "@/hooks/useAuth";
import { useGetQuota } from "@/hooks/queries/quota";

// Mock Data
const promptData = [
    {
        id: "1",
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
        tags: []
    },
    {
        id: "2",
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
        tags: []
    },
    {
        id: "3",
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
        tags: []
    },
    {
        id: "4",
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
        tags: []
    },
];



const suggestedData = [
    {
        id: 's1',
        title: 'Creative Writing Assistant',
        description: 'Helps students generate creative story ideas and plot twists.',
        author: 'EduPrompt AI',
        subject: 'English',
        grade: 'All',
        type: 'AI',
        rating: 4.8,
        isTrending: true,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        tags: []
    },
    {
        id: 's2',
        title: 'Math Problem Solver',
        description: 'Step-by-step explanations for complex algebra problems.',
        author: 'EduPrompt AI',
        subject: 'Math',
        grade: 'High School',
        type: 'AI',
        rating: 4.9,
        isTrending: true,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        tags: []
    },
    {
        id: 's3',
        title: 'Science Experiment Guide',
        description: 'Safe and educational science experiments for the classroom.',
        author: 'EduPrompt AI',
        subject: 'Science',
        grade: 'Middle School',
        type: 'AI',
        rating: 4.7,
        isTrending: false,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        tags: []
    },
    {
        id: 's4',
        title: 'History Timeline Generator',
        description: 'Create interactive timelines for historical events.',
        author: 'EduPrompt AI',
        subject: 'History',
        grade: 'High School',
        type: 'AI',
        rating: 4.6,
        isTrending: false,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        tags: []
    }
];

const PromptsPage: React.FC = () => {
    const { user } = useAuth();
    const t = useTranslations('Dashboard.Manage');

    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [executedSearchQuery, setExecutedSearchQuery] = useState('');
    const [searchType, setSearchType] = useState<'keyword' | 'semantic'>('keyword');
    const [isSearching, setIsSearching] = useState(false);

    // Queries
    // Fetch "My Prompts" (all prompts created by user) initially
    // Fetch "My Prompts" (all prompts created by user) initially
    // Updated to use the dedicated endpoint
    const { data: myPromptsData, isLoading: isMyPromptsLoading } = useGetMyPrompts(
        0, 20, undefined,
        { enabled: !isSearching }
    );

    const { data: keywordResults, isLoading: isKeywordLoading } = useFilterPrompts(
        { title: executedSearchQuery, page: 0, size: 20 },
        { enabled: searchType === 'keyword' && isSearching }
    );

    const { mutate: performSemanticSearch, data: semanticResults, isPending: isSemanticLoading } = useSemanticSearch();
    const { data: quotaData } = useGetQuota();

    const { data: collectionCountData } = useCountMyCollections();

    const handleSearch = () => {
        if (!searchQuery.trim()) {
            setExecutedSearchQuery('');
            setIsSearching(false);
            return;
        }
        setExecutedSearchQuery(searchQuery);
        setIsSearching(true);
        if (searchType === 'semantic') {
            performSemanticSearch({ query: searchQuery, limit: 20 });
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    // Map API results to PromptCardProps
    const displayPrompts = useMemo(() => {
        if (!isSearching) {
            const apiPrompts = (myPromptsData?.data?.content || []).map((p: PromptResponse) => {
                const subjectTag = p.tags?.find((t: TagResponse) => t.type === 'Môn' || t.type === 'Subject')?.value || 'General';
                const gradeTag = p.tags?.find((t: TagResponse) => t.type === 'Khối' || t.type === 'Grade')?.value || 'N/A';

                // Filter out subject and grade tags to show others separately if needed
                const otherTags = p.tags?.filter((t: TagResponse) =>
                    t.type !== 'Môn' && t.type !== 'Subject' && t.type !== 'Khối' && t.type !== 'Grade'
                ).map((t: TagResponse) => `${t.type}: ${t.value}`) || [];

                return {
                    id: p.id,
                    title: p.title,
                    description: p.description || '',
                    author: p.fullName || 'Unknown',
                    subject: subjectTag,
                    grade: gradeTag,
                    type: 'Prompt',
                    rating: p.averageRating || 0,
                    isTrending: false,
                    createdAt: p.createdAt,
                    lastUpdated: p.updatedAt || p.createdAt,
                    tags: otherTags,
                    isOwner: true
                };
            });
            return [...promptData.map(p => ({ ...p, isOwner: false })), ...apiPrompts];
        } else if (searchType === 'keyword') {
            return (keywordResults?.data?.content || []).map((p: PromptMetadataResponse) => ({
                id: p.id,
                title: p.title,
                description: p.description || '',
                author: p.fullName || 'Unknown',
                subject: 'General', // TODO: Extract from tags
                grade: 'N/A', // TODO: Extract from tags
                type: 'Prompt', // TODO: Extract from tags
                rating: p.averageRating || 0,
                isTrending: false,
                createdAt: p.createdAt,
                lastUpdated: p.updatedAt || p.createdAt,
                tags: [],
                isOwner: p.ownerId === user?.id
            }));
        } else {
            return (semanticResults?.data?.results || []).map((p: SemanticSearchResult) => ({
                id: p.promptId,
                title: p.title,
                description: p.description || p.matchedSnippet,
                author: p.createdByName || 'Unknown',
                subject: 'Semantic Match',
                grade: 'N/A',
                type: 'Prompt',
                rating: p.averageRating || 0,
                isTrending: false,
                createdAt: new Date().toISOString(),
                lastUpdated: new Date().toISOString(),
                tags: [],
                isOwner: p.ownerId === user?.id
            }));
        }
    }, [isSearching, searchType, myPromptsData, keywordResults, semanticResults, user]);

    const isLoading = isSearching
        ? (searchType === 'keyword' ? isKeywordLoading : isSemanticLoading)
        : isMyPromptsLoading;

    return (
        <main className="flex-1 overflow-y-auto p-6 space-y-8">
            {/* ---STATCARD SECTION --- */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title={t('promptsCreated')}
                    value={myPromptsData?.data?.totalElements?.toString() || "0"}
                    icon={<SparklesIcon />}
                    gradientClass="from-brand-secondary to-brand-secondary/70" // Sky Blue
                />

                <StatCard
                    title={t('collectionsOwned')}
                    value={collectionCountData?.data?.toString() || "0"}
                    icon={<BookOpenIcon />}
                    gradientClass="from-brand-primary to-brand-primary/70" // Dark Slate
                />
                {!user?.hasSchoolSubscription && (
                    <>
                        <StatCard
                            title={t('tokensRemaining')}
                            value={quotaData?.data?.individualTokenRemaining !== undefined
                                ? `${quotaData.data.individualTokenRemaining.toLocaleString()} / ${quotaData.data.individualTokenLimit.toLocaleString()}`
                                : "Loading..."}
                            icon={<CircleStackIcon />}
                            gradientClass="from-brand-primary to-brand-primary/70" // Dark Slate
                        />
                        <StatCard
                            title={t('optimizationQuota')}
                            value={quotaData?.data?.optimizationQuotaRemaining !== undefined
                                ? `${quotaData.data.optimizationQuotaRemaining} / ${quotaData.data.optimizationQuotaLimit}`
                                : "Loading..."}
                            icon={<BoltIcon />}
                            gradientClass="from-brand-secondary to-brand-secondary/70" // Sky Blue
                        />
                        <StatCard
                            title="Testing Quota"
                            value={quotaData?.data?.testingQuotaRemaining !== undefined
                                ? `${quotaData.data.testingQuotaRemaining} / ${quotaData.data.testingQuotaLimit}`
                                : "Loading..."}
                            icon={<WalletIcon />}
                            gradientClass="from-brand-primary to-brand-primary/70" // Dark Slate
                        />
                    </>
                )}
            </section>

            {/* --- SEARCH BAR --- */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={t('searchPlaceholder')}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <div className="flex bg-gray-100 rounded-lg p-1">
                            <button
                                onClick={() => setSearchType('keyword')}
                                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${searchType === 'keyword' ? 'bg-white text-brand-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                {t('keyword')}
                            </button>
                            <button
                                onClick={() => setSearchType('semantic')}
                                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-1 ${searchType === 'semantic' ? 'bg-white text-brand-secondary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <Sparkles className="w-3 h-3" />
                                {t('semantic')}
                            </button>
                        </div>
                        <button
                            onClick={handleSearch}
                            className="px-6 py-2.5 bg-brand-primary text-white font-medium rounded-lg hover:bg-brand-primary/90 transition-colors shadow-sm whitespace-nowrap"
                        >
                            {t('search')}
                        </button>
                    </div>
                </div>
            </section>

            {/* AI Suggestions */}
            {!isSearching && (
                <section>
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                            <SparklesIcon className="w-5 h-5 text-brand-secondary" />
                            {t('aiSuggestions')}
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {suggestedData.map((prompt) => (
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
            )}

            {/* Prompts area */}
            <section>
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                        {isSearching ? t('searchResults') : t('myPrompts')}
                    </h2>

                    {!isSearching && (
                        <Link
                            href="/prompt/create"
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm shadow-sm btn-primary"
                        >
                            <PlusCircleIcon className="h-5 w-5" />
                            <span>{t('create')}</span>
                        </Link>
                    )}
                </div>

                {/* Prompt grid */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
                    </div>
                ) : displayPrompts.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        {isSearching
                            ? `${t('noResults')} "${executedSearchQuery}"`
                            : t('noPrompts')}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {displayPrompts.map((prompt) => (
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
                                tags={prompt.tags}
                                isOwner={prompt.isOwner}
                            />
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
};

export default PromptsPage;
