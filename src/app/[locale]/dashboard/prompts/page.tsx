"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useFilterPrompts, useSemanticSearch } from '@/hooks/queries/search';
import { useGetMyPrompts, useGetGroupSharedPrompts, useGetRecommendedPrompts } from '@/hooks/queries/prompt';
import { useCountMyCollections } from '@/hooks/queries/collection';
import { useDebounce } from "@/hooks/useDebounce";
import { PromptMetadataResponse, SemanticSearchResult, PromptResponse } from "@/types/prompt.api";
import { TagResponse } from "@/types/tag.api";
import { useAuth } from "@/hooks/useAuth";
import { useGetQuota } from "@/hooks/queries/quota";
import { useTranslations } from "next-intl";

// Components
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { DashboardSearch } from "@/components/dashboard/DashboardSearch";
import { SuggestedPrompts } from "@/components/dashboard/SuggestedPrompts";
import { PromptsGrid, DisplayPrompt } from "@/components/dashboard/PromptsGrid";

// Data
// Data
// import { promptData, suggestedData } from "./data";

const PromptsPage: React.FC = () => {
    const { user } = useAuth();
    const t = useTranslations('Dashboard.Manage');

    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchType, setSearchType] = useState<'keyword' | 'semantic'>('keyword');
    const debouncedSearchQuery = useDebounce(searchQuery, 500);
    const [isSearching, setIsSearching] = useState(false);

    // Pagination State
    const [page, setPage] = useState(0);
    const [allPrompts, setAllPrompts] = useState<DisplayPrompt[]>([]);
    const [hasMore, setHasMore] = useState(false);

    // Helper to map PromptResponse to DisplayPrompt
    // Helper to map PromptResponse to DisplayPrompt
    const mapToDisplayPrompt = useCallback((p: PromptResponse | SemanticSearchResult | PromptMetadataResponse): DisplayPrompt => {
        // SemanticSearchResult might not have tags, createdAt, updatedAt
        const tags = 'tags' in p ? (p.tags || []) : [];
        const subjectTag = tags.find((t: TagResponse) => t.type === 'Môn' || t.type === 'Subject')?.value || 'General';
        const gradeTag = tags.find((t: TagResponse) => t.type === 'Khối' || t.type === 'Grade')?.value || 'N/A';

        const otherTags = tags.filter((t: TagResponse) =>
            t.type !== 'Môn' && t.type !== 'Subject' && t.type !== 'Khối' && t.type !== 'Grade'
        ).map((t: TagResponse) => `${t.type}: ${t.value}`) || [];

        // Determine description based on available fields
        const description = 'matchedSnippet' in p ? (p.matchedSnippet || '') : (p.description || '');
        const id = 'promptId' in p ? p.promptId : p.id;
        const author = 'createdByName' in p ? p.createdByName : (p.fullName || 'Unknown');

        // Handle timestamps which might be missing on SemanticSearchResult
        const created = 'createdAt' in p ? p.createdAt : new Date().toISOString();
        const updated = 'updatedAt' in p ? (p.updatedAt || created) : created;

        return {
            id,
            title: p.title,
            description,
            author,
            subject: subjectTag,
            grade: gradeTag,
            type: 'Prompt',
            rating: p.averageRating || 0,
            isTrending: false,
            createdAt: created,
            lastUpdated: updated,
            tags: otherTags,
            isOwner: p.ownerId === user?.id
        };
    }, [user]);

    // Reset pagination when search changes
    useEffect(() => {
        setPage(0);
        setAllPrompts([]); // Clear list to show loading state or fresh results
    }, [debouncedSearchQuery, searchType]);

    // Update isSearching based on query existence for keyword mode
    useEffect(() => {
        if (searchType === 'keyword') {
            setIsSearching(!!debouncedSearchQuery);
        }
    }, [debouncedSearchQuery, searchType]);

    // Queries
    // 1. My Prompts (Default view)
    const { data: myPromptsData, isLoading: isMyPromptsLoading } = useGetMyPrompts(
        page, 20, undefined,
        { enabled: !isSearching }
    );

    // 2. Keyword Search
    const { data: keywordResults, isLoading: isKeywordLoading } = useFilterPrompts(
        { title: debouncedSearchQuery, page: page, size: 20 },
        { enabled: searchType === 'keyword' && !!debouncedSearchQuery }
    );

    // 3. Shared Prompts (Static, non-paginated for now in this view context or separate)
    const { data: sharedPromptsData, isLoading: isSharedLoading } = useGetGroupSharedPrompts(
        0, 20, undefined,
        { enabled: !isSearching && user?.role !== 'SCHOOL_ADMIN' }
    );

    // 4. Semantic Search
    const { mutate: performSemanticSearch, data: semanticResults, isPending: isSemanticLoading } = useSemanticSearch();

    // 5. Recommended Prompts
    const { data: recommendedPromptsData, isLoading: isRecommendedLoading } = useGetRecommendedPrompts(undefined, { enabled: !isSearching });

    // Stats
    const { data: quotaData } = useGetQuota();
    const { data: collectionCountData } = useCountMyCollections();

    const handleSearch = () => {
        if (!searchQuery.trim()) return;

        if (searchType === 'semantic') {
            setIsSearching(true);
            setPage(0);
            setAllPrompts([]);
            performSemanticSearch({ query: searchQuery, limit: 20 });
        }
    };

    // Data Accumulation Logic
    useEffect(() => {
        let newData: (PromptResponse | SemanticSearchResult | PromptMetadataResponse)[] = [];
        let total = 0;
        let shouldUpdate = false;

        // Debug logging
        console.log('[PromptsPage] Effect Run:', { isSearching, searchType, page, hasKeywordData: !!keywordResults?.data, hasMyPrompts: !!myPromptsData?.data });

        if (isSearching) {
            // SEARCH MODE
            if (searchType === 'keyword') {
                if (keywordResults?.data?.content) {
                    newData = keywordResults.data.content;
                    total = keywordResults.data.totalElements;
                    shouldUpdate = true;
                }
            } else if (searchType === 'semantic') {
                if (semanticResults?.data?.results) {
                    newData = semanticResults.data.results;
                    total = newData.length;
                    shouldUpdate = true;
                }
            }
        } else {
            // MY PROMPTS MODE
            if (myPromptsData?.data?.content) {
                newData = myPromptsData.data.content;
                total = myPromptsData.data.totalElements;
                shouldUpdate = true;
            }
        }

        // Only update if we have data or if it's the first page
        if (shouldUpdate || (page === 0 && !isSearching)) {
            const mapped = newData.map(mapToDisplayPrompt);

            setAllPrompts(prev => {
                if (page === 0) {
                    if (!isSearching && page === 0) {
                        return mapped;
                    }
                    return mapped;
                }
                // Append
                const prevIds = new Set(prev.map(p => p.id));
                const uniqueNew = mapped.filter(m => !prevIds.has(m.id));
                return [...prev, ...uniqueNew];
            });

            if (searchType === 'semantic') {
                setHasMore(false);
            } else {
                const currentFetchedCount = (page + 1) * 20;
                setHasMore(total > currentFetchedCount);
            }
        } else if (page === 0 && isSearching) {
            // Handle empty search results explicit
            if (searchType === 'keyword' && keywordResults?.data && keywordResults.data.content.length === 0) {
                setAllPrompts([]);
                setHasMore(false);
            }
        }
    }, [myPromptsData, keywordResults, semanticResults, isSearching, searchType, page, mapToDisplayPrompt]);


    // Derived Shared Prompts
    const displaySharedPrompts = useMemo(() => {
        return (sharedPromptsData?.data?.content || []).map(mapToDisplayPrompt);
    }, [sharedPromptsData, mapToDisplayPrompt]);

    const displayRecommendedPrompts = useMemo(() => {
        return (recommendedPromptsData?.data || []).map(mapToDisplayPrompt);
    }, [recommendedPromptsData, mapToDisplayPrompt]);

    const isLoading = isSearching
        ? (searchType === 'keyword' ? isKeywordLoading : isSemanticLoading)
        : isMyPromptsLoading;

    return (
        <main className="flex-1 overflow-y-auto p-6 space-y-8">
            <DashboardStats
                myPromptsCount={myPromptsData?.data?.totalElements?.toString() || "0"}
                collectionCount={collectionCountData?.data?.toString() || "0"}
                quotaData={quotaData?.data || undefined}
                user={user}
            />

            <DashboardSearch
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                searchType={searchType}
                setSearchType={setSearchType}
                onSearch={handleSearch}
            />

            {!isSearching && (
                <SuggestedPrompts
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    suggestions={displayRecommendedPrompts as unknown as any[]} // TODO: Fix type definition for SuggestedPrompts suggestions prop to match displayRecommendedPrompts
                    isLoading={isRecommendedLoading}
                />
            )}

            {/* Main Prompts Grid (My Prompts or Search Results) */}
            <PromptsGrid
                isSearching={isSearching}
                isLoading={isLoading && page === 0} // Full loader only on first page
                prompts={allPrompts}
                executedSearchQuery={searchType === 'keyword' ? debouncedSearchQuery : searchQuery}
            />

            {/* Load More Button */}
            {hasMore && !isLoading && (
                <div className="flex justify-center py-6">
                    <button
                        onClick={() => setPage(p => p + 1)}
                        disabled={isLoading}
                        className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 font-medium rounded-full shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-95 flex items-center gap-2"
                    >
                        {isLoading ? (
                            <>Loading...</>
                        ) : (
                            t('loadMore') || "Load More"
                        )}
                    </button>
                </div>
            )}

            {/* Next Page Loader */}
            {isLoading && page > 0 && (
                <div className="flex justify-center py-6">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-primary"></div>
                </div>
            )}

            {/* Shared Prompts (only when not searching) */}
            {!isSearching && (
                <PromptsGrid
                    isSearching={false}
                    isLoading={isSharedLoading}
                    prompts={displaySharedPrompts}
                    executedSearchQuery=""
                    title={t('sharedPrompts')}
                    hideCreateButton={true}
                    emptyStateMessage={t('noSharedPrompts')}
                />
            )}
        </main>
    );
};

export default PromptsPage;
