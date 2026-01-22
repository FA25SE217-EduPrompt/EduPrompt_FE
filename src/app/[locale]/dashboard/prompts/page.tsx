"use client";

import React, { useState, useMemo } from "react";
import { useFilterPrompts, useSemanticSearch } from '@/hooks/queries/search';
import { useGetMyPrompts, useGetGroupSharedPrompts } from '@/hooks/queries/prompt';
import { useCountMyCollections } from '@/hooks/queries/collection';
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
import { promptData, suggestedData } from "./data";

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
    const { data: myPromptsData, isLoading: isMyPromptsLoading } = useGetMyPrompts(
        0, 20, undefined,
        { enabled: !isSearching }
    );

    const { data: keywordResults, isLoading: isKeywordLoading } = useFilterPrompts(
        { title: executedSearchQuery, page: 0, size: 20 },
        { enabled: searchType === 'keyword' && isSearching }
    );

    // Shared Prompts
    const { data: sharedPromptsData, isLoading: isSharedLoading } = useGetGroupSharedPrompts(
        0, 20, undefined,
        { enabled: !isSearching }
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

    // Helper to map PromptResponse to DisplayPrompt
    const mapToDisplayPrompt = (p: PromptResponse): DisplayPrompt => {
        const subjectTag = p.tags?.find((t: TagResponse) => t.type === 'Môn' || t.type === 'Subject')?.value || 'General';
        const gradeTag = p.tags?.find((t: TagResponse) => t.type === 'Khối' || t.type === 'Grade')?.value || 'N/A';

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
            isOwner: p.ownerId === user?.id
        };
    };

    // Map API results to DisplayPrompt format
    const displayPrompts = useMemo(() => {
        if (!isSearching) {
            const apiPrompts = (myPromptsData?.data?.content || []).map(mapToDisplayPrompt);
            return [...promptData.map(p => ({ ...p, isOwner: false })), ...apiPrompts];
        } else if (searchType === 'keyword') {
            return (keywordResults?.data?.content || []).map((p: PromptMetadataResponse) => ({
                id: p.id,
                title: p.title,
                description: p.description || '',
                author: p.fullName || 'Unknown',
                subject: 'General',
                grade: 'N/A',
                type: 'Prompt',
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

    const displaySharedPrompts = useMemo(() => {
        return (sharedPromptsData?.data?.content || []).map(mapToDisplayPrompt);
    }, [sharedPromptsData, user]);

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
                <SuggestedPrompts suggestions={suggestedData} />
            )}

            {/* My Prompts */}
            <PromptsGrid
                isSearching={isSearching}
                isLoading={isLoading}
                prompts={displayPrompts}
                executedSearchQuery={executedSearchQuery}
            />

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
