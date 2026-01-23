"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Search, Filter, X, Loader2, BookOpen, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';
import { useFilterPrompts } from '@/hooks/queries/search';
import { useRouter } from 'next/navigation';
import { PromptMetadataResponse } from '@/types/prompt.api';

// Tag filters constant based on user request
const TAG_FILTERS = {
    Test: { id: '34145975-4c84-4510-a8b2-8b71a5e4d045', value: 'bài kiểm tra', translationKey: 'Test' },
    LessonPlan: { id: 'b87de893-9dd8-427e-823b-b2e2046e21e8', value: 'giáo án', translationKey: 'LessonPlan' },
    Matrix: { id: '2c5c6b29-354b-4cb7-bf35-9a498693a43d', value: 'ma trận đề', translationKey: 'Matrix' },
    Slide: { id: 'df11bdfd-d114-41ee-b848-96c00dee04ba', value: 'tạo slide', translationKey: 'Slide' },
    Activity: { id: '0ff9c0aa-7271-4c45-9587-961126473aa8', value: 'hoạt động', translationKey: 'Activity' }
} as const;

type FilterType = keyof typeof TAG_FILTERS;

export const ExplorerHeader: React.FC = () => {
    const t = useTranslations('Explorer');
    const router = useRouter();
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // State
    const [query, setQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<FilterType | null>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isNavigating, setIsNavigating] = useState(false);

    // Pagination & Results State
    const [page, setPage] = useState(0);
    const [allResults, setAllResults] = useState<PromptMetadataResponse[]>([]);

    // Debounce query
    const debouncedQuery = useDebounce(query, 500);

    // Reset pagination when query/filter changes
    useEffect(() => {
        setPage(0);
        setAllResults([]);
    }, [debouncedQuery, activeFilter]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
                inputRef.current && !inputRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Search Query
    const searchParams = {
        title: debouncedQuery,
        tagValues: activeFilter ? [TAG_FILTERS[activeFilter].value] : undefined,
        page: page,
        size: 5
    };

    const { data: searchResults, isLoading } = useFilterPrompts(
        searchParams,
        { enabled: (debouncedQuery.length > 0 || !!activeFilter) }
    );

    // Accumulate results
    useEffect(() => {
        const content = searchResults?.data?.content;
        if (content) {
            setAllResults(prev => {
                if (page === 0) return content;
                return [...prev, ...content];
            });
        }
    }, [searchResults?.data?.content, page]);

    // Open dropdown when query exists or filter is active
    useEffect(() => {
        if ((debouncedQuery.length > 0 || activeFilter) && !isNavigating) {
            setIsDropdownOpen(true);
        }
    }, [debouncedQuery, activeFilter, isNavigating]);

    const handlePromptSelect = (promptId: string) => {
        setIsNavigating(true);
        router.push(`/prompt/workbench?loadPromptId=${promptId}`);
        setIsDropdownOpen(false);
        setIsNavigating(false);
    };

    const totalElements = searchResults?.data?.totalElements || 0;
    const hasMore = allResults.length < totalElements;

    // --- Loading Skeleton ---
    const ResultSkeleton = () => (
        <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between animate-pulse">
            <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                <div className="h-3 bg-gray-50 rounded w-1/2"></div>
            </div>
            <div className="h-4 w-8 bg-gray-100 rounded ml-4"></div>
        </div>
    );

    return (
        <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
            <div className="px-8 py-4 max-w-7xl mx-auto space-y-4">

                <div className="flex gap-4 items-center">
                    {/* Unified Search Input */}
                    <div className="relative flex-1 group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-500">
                            {isLoading ? (
                                <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                            ) : (
                                <Search className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" />
                            )}
                        </div>
                        <input
                            ref={inputRef}
                            type="text"
                            className={cn(
                                "block w-full pl-10 pr-10 py-2.5 border rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-sm font-medium outline-none shadow-sm hover:border-gray-300 focus:shadow-md",
                                isLoading ? "bg-blue-50/30 border-blue-200" : "bg-white border-gray-200"
                            )}
                            placeholder={t('searchPlaceholder')}
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value);
                                setIsDropdownOpen(true);
                            }}
                            onFocus={() => {
                                if (query || activeFilter) setIsDropdownOpen(true);
                            }}
                        />

                        {/* Right Actions: Clear Only */}
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                            {query && (
                                <button
                                    onClick={() => {
                                        setQuery('');
                                        setAllResults([]);
                                        if (!activeFilter) setIsDropdownOpen(false);
                                    }}
                                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X className="h-4 w-4 text-gray-400" />
                                </button>
                            )}
                        </div>

                        {/* Search Results Dropdown */}
                        {isDropdownOpen && (query || activeFilter) && (
                            <div
                                ref={dropdownRef}
                                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200"
                            >
                                <div className="max-h-[360px] overflow-y-auto custom-scrollbar">
                                    {isLoading && page === 0 ? (
                                        <div className="py-2">
                                            {[1, 2, 3].map(i => <ResultSkeleton key={i} />)}
                                        </div>
                                    ) : allResults.length > 0 ? (
                                        <div className="py-2">
                                            <div className="px-4 py-2 flex items-center justify-between text-[10px] uppercase tracking-wider text-gray-400 bg-gray-50/50 border-b border-gray-50">
                                                <span className="font-bold">{t('searchResults')}</span>
                                                <span className="bg-gray-200 px-1.5 py-0.5 rounded text-gray-600 font-mono">{totalElements}</span>
                                            </div>
                                            {allResults.map((prompt: PromptMetadataResponse) => (
                                                <button
                                                    key={prompt.id}
                                                    onClick={() => handlePromptSelect(prompt.id)}
                                                    disabled={isNavigating}
                                                    className="w-full text-left px-4 py-3 hover:bg-blue-50 active:bg-blue-100 transition-colors duration-150 flex items-center justify-between group border-b border-gray-50 last:border-0"
                                                >
                                                    <div className="flex-1 min-w-0 pr-4">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-semibold text-gray-900 text-sm group-hover:text-blue-700 transition-colors truncate">
                                                                {prompt.title}
                                                            </span>
                                                            {prompt.collectionName && (
                                                                <span className="shrink-0 text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full truncate max-w-[120px] font-medium border border-gray-200 group-hover:bg-white group-hover:border-blue-200 transition-all">
                                                                    {prompt.collectionName}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="text-xs text-gray-500 truncate group-hover:text-gray-600 transition-colors">
                                                            {prompt.description || t('noDescription')}
                                                        </div>
                                                    </div>
                                                    <div className="shrink-0 flex items-center text-amber-500 bg-amber-50 px-2 py-1 rounded-md text-xs font-bold border border-amber-100 group-hover:bg-white group-hover:border-amber-200 transition-all shadow-sm">
                                                        <Star className="w-3 h-3 fill-current mr-1.5" />
                                                        {prompt.averageRating?.toFixed(1) || '0.0'}
                                                    </div>
                                                </button>
                                            ))}

                                            {/* Load More Button */}
                                            {hasMore && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setPage(prev => prev + 1);
                                                    }}
                                                    disabled={isLoading}
                                                    className="w-full text-center py-3 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-semibold border-t border-gray-100 transition-all active:bg-blue-100"
                                                >
                                                    {isLoading ? (
                                                        <span className="flex items-center justify-center gap-2">
                                                            <Loader2 className="w-3 h-3 animate-spin" /> {t('loadMoreResults')}...
                                                        </span>
                                                    ) : (
                                                        `${t('loadMoreResults')} (${totalElements - allResults.length} ${t('loadingRemaining')})`
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="py-12 flex flex-col items-center justify-center text-gray-400 gap-3">
                                            <Search className="w-8 h-8 opacity-20" />
                                            <div className="text-sm font-medium">
                                                {t('searchNoResults')} <span className="text-gray-900">&quot;{query}&quot;</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Filter Row */}
                <div className="flex items-center gap-2 flex-wrap pb-1">
                    <div className="flex items-center gap-1.5 text-gray-400 mr-2">
                        <Filter className="w-3 h-3" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">
                            {t('filters.title')}
                        </span>
                    </div>

                    {(Object.keys(TAG_FILTERS) as FilterType[]).map((filterKey) => (
                        <button
                            key={filterKey}
                            onClick={() => {
                                const newFilter = activeFilter === filterKey ? null : filterKey;
                                setActiveFilter(newFilter);
                                if (!newFilter && !query) {
                                    setIsDropdownOpen(false);
                                }
                            }}
                            className={cn(
                                "px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 flex items-center gap-1.5 active:scale-95",
                                activeFilter === filterKey
                                    ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-200 ring-2 ring-blue-100 ring-offset-1"
                                    : "bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600 hover:shadow-sm"
                            )}
                        >
                            {t(`filters.${TAG_FILTERS[filterKey].translationKey}`)}
                            {activeFilter === filterKey && <X size={12} className="opacity-90" />}
                        </button>
                    ))}
                    {activeFilter && (
                        <button
                            onClick={() => {
                                setActiveFilter(null);
                                setQuery('');
                            }}
                            className="text-[10px] text-gray-400 hover:text-red-500 hover:underline ml-auto font-medium transition-colors"
                        >
                            {t('filters.clearFilters')}
                        </button>
                    )}
                </div>

            </div>
        </div >
    );
};
