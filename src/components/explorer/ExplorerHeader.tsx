"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import { Search, Sparkles, Filter, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExplorerHeaderProps {
    onSearch: (query: string, mode: 'keyword' | 'semantic') => void;
}

export const ExplorerHeader: React.FC<ExplorerHeaderProps> = ({ onSearch }) => {
    const t = useTranslations('Explorer');
    const [searchMode, setSearchMode] = React.useState<'keyword' | 'semantic'>('semantic');
    const [query, setQuery] = React.useState('');
    const [activeFilter, setActiveFilter] = React.useState<string | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(query, searchMode);
    };

    const filters = [
        'LessonPlan', 'Slide', 'Test', 'Matrix', 'Activity'
    ] as const;

    return (
        <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
            <div className="px-8 py-4 max-w-7xl mx-auto space-y-4">

                <form onSubmit={handleSearch} className="flex gap-4">
                    {/* Unified Search Input */}
                    <div className="relative flex-1 group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-[180px] py-2.5 border border-gray-200 rounded-lg bg-white text-text-main placeholder-gray-400 focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all text-sm font-medium"
                            placeholder={t('searchPlaceholder')}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />

                        {/* Internal Toggle Switch */}
                        <div className="absolute inset-y-1 right-1 flex bg-gray-50 rounded-md p-0.5 border border-gray-100">
                            <button
                                type="button"
                                onClick={() => setSearchMode('keyword')}
                                className={cn(
                                    "px-3 py-1 rounded text-[10px] font-semibold transition-all uppercase tracking-wide",
                                    searchMode === 'keyword' ? "bg-white text-slate-900 shadow-sm border border-gray-100" : "text-gray-400 hover:text-gray-600"
                                )}
                            >
                                {t('keywordSearch')}
                            </button>
                            <button
                                type="button"
                                onClick={() => setSearchMode('semantic')}
                                className={cn(
                                    "px-3 py-1 rounded text-[10px] font-semibold transition-all flex items-center gap-1 uppercase tracking-wide",
                                    searchMode === 'semantic' ? "bg-blue-50 text-primary border border-blue-100" : "text-gray-400 hover:text-gray-600"
                                )}
                            >
                                <Sparkles size={10} />
                                {t('semanticSearch')}
                            </button>
                        </div>
                    </div>
                </form>

                {/* Filter Row - Aligned Left */}
                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mr-2">Filter By:</span>
                    {filters.map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(activeFilter === filter ? null : filter)}
                            className={cn(
                                "px-3 py-1.5 rounded-md text-xs font-semibold border transition-all flex items-center gap-1.5",
                                activeFilter === filter
                                    ? "bg-primary border-primary text-white shadow-sm"
                                    : "bg-white border-gray-200 text-slate-600 hover:border-gray-300 hover:bg-gray-50"
                            )}
                        >
                            {t(`filters.${filter}`)}
                            {activeFilter === filter && <X size={12} className="opacity-75" />}
                        </button>
                    ))}
                </div>

            </div>
        </div>
    );
};
