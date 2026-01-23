"use client"

import React, { useState, useEffect, useMemo } from 'react';
import { Search, GitCompare, Sparkles, Info, Copy, BookOpen, Star, TrendingUp, X, ChevronDown, Play, Loader2, Filter, CheckCircle2, FlaskConical } from 'lucide-react';
import { useFilterPrompts, useSemanticSearch } from '@/hooks/queries/search';
import { useGetMyCollections } from '@/hooks/queries/collection';
import { useRunPromptTest, useGetTestUsage, useGetPrompt } from '@/hooks/queries/prompt';
import { promptsService } from '@/services/resources/prompts';
import { PromptResponse, PromptTestResponse, PromptAiModel, PromptMetadataResponse } from '@/types/prompt.api';
import { CollectionResponse } from '@/types/collection.api';
import { BaseResponse, PaginatedResponse } from '@/types/api';
import { toast, Toaster } from 'sonner';
import { DashboardNavbar } from '@/components/layout/DashboardNavbar';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { MarkdownRenderer } from '@/components/ui/MarkdownRenderer';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';

interface PromptDisplay {
    id: string;
    title: string;
    category: string;
    rating: number;
    description?: string;
}

const MODEL_OPTIONS = [
    { label: 'GPT-4o mini', value: 'GPT_4O_MINI', description: 'Fast and cost-effective' },
    { label: 'Claude 3.5 Sonnet', value: 'CLAUDE_3_5_SONNET', description: 'Balanced performance' },
    { label: 'Gemini 2.5 Flash', value: 'GEMINI_2_5_FLASH', description: 'Quick responses' },
];

const InfoTooltip = ({ text, placement = 'right' }: { text: string, placement?: 'left' | 'right' }) => (
    <div className="group relative inline-block ml-1">
        <Info className="w-4 h-4 text-gray-400 hover:text-blue-500 cursor-help" />
        <div className={cn(
            "invisible group-hover:visible absolute z-50 w-64 p-3 text-xs bg-gray-900 text-white rounded-lg shadow-lg -top-2 transform transition-all",
            placement === 'right' ? 'left-6' : 'right-6'
        )}>
            {text}
            <div className={cn(
                "absolute top-3 w-2 h-2 bg-gray-900 transform rotate-45",
                placement === 'right' ? '-left-1' : '-right-1'
            )}></div>
        </div>
    </div>
);

// --- Components ---

const PromptSelectionModal = ({
    isOpen,
    onClose,
    onSelect,
    searchQuery,
    setSearchQuery,
    searchType,
    setSearchType,
    handleSearch,
    results,
    isLoading,
    collections,
    expandedCollection,
    setExpandedCollection,
    collectionPromptsData,
    isCollectionPromptsLoading
}: {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (prompt: PromptDisplay) => void;
    searchQuery: string;
    setSearchQuery: (q: string) => void;
    searchType: 'keyword' | 'semantic';
    setSearchType: (t: 'keyword' | 'semantic') => void;
    handleSearch: () => void;
    results: PromptDisplay[];
    isLoading: boolean;
    collections: CollectionResponse[];
    expandedCollection: string | null;
    setExpandedCollection: (id: string | null) => void;
    collectionPromptsData: BaseResponse<PaginatedResponse<PromptMetadataResponse>> | undefined;
    isCollectionPromptsLoading: boolean;
}) => {
    const t = useTranslations('Prompt.Search');

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
                    />
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{ type: "spring", duration: 0.35, bounce: 0.2 }}
                            className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden pointer-events-auto border border-gray-200"
                        >
                            {/* Header */}
                            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white">
                                <h2 className="text-lg font-semibold text-gray-900">{t('pageTitle')}</h2>
                                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Search Bar */}
                            <div className="p-4 border-b border-gray-100 space-y-3 bg-gray-50/30">
                                <div className="flex gap-2">
                                    <div className="relative flex-1 group">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-blue-500 transition-colors" />
                                        <input
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                            placeholder={t('searchPlaceholder')}
                                            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm"
                                            autoFocus
                                        />
                                    </div>
                                    <button
                                        onClick={handleSearch}
                                        className="px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 active:scale-95 transition-all shadow-sm"
                                    >
                                        {t('search')}
                                    </button>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <button
                                        onClick={() => setSearchType('keyword')}
                                        className={cn(
                                            "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                                            searchType === 'keyword'
                                                ? "bg-gray-100 text-gray-900 shadow-sm"
                                                : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                                        )}
                                    >
                                        {t('keyword')}
                                    </button>
                                    <button
                                        onClick={() => setSearchType('semantic')}
                                        className={cn(
                                            "px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center space-x-1",
                                            searchType === 'semantic'
                                                ? "bg-purple-50 text-purple-700 shadow-sm ring-1 ring-purple-100"
                                                : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                                        )}
                                    >
                                        <Sparkles className="w-3 h-3" />
                                        <span>{t('semantic')}</span>
                                    </button>
                                </div>
                            </div>

                            {/* Results List */}
                            <div className="flex-1 overflow-y-auto p-2 bg-gray-50/50">
                                {/* Search Results */}
                                {searchQuery && (
                                    <div className="mb-4">
                                        <div className="text-[10px] font-bold text-gray-400 px-3 py-2 uppercase tracking-wider">{t('results')}</div>
                                        {isLoading ? (
                                            <div className="px-3 space-y-2">
                                                <SkeletonLoader lines={3} hasHeading={false} />
                                            </div>
                                        ) : results.length > 0 ? (
                                            <div className="space-y-1">
                                                {results.map(prompt => (
                                                    <motion.button
                                                        layoutId={`prompt-${prompt.id}`}
                                                        key={prompt.id}
                                                        onClick={() => onSelect(prompt)}
                                                        className="w-full text-left px-4 py-3 bg-white hover:bg-blue-50/50 border border-gray-100 hover:border-blue-200 rounded-xl transition-all duration-200 flex items-center justify-between group shadow-sm hover:shadow-md"
                                                    >
                                                        <div className="flex-1 min-w-0 pr-4">
                                                            <div className="font-semibold text-gray-900 group-hover:text-blue-700 truncate text-sm">{prompt.title}</div>
                                                            <div className="text-xs text-gray-500 mt-0.5 truncate">{prompt.description || t('noDescription')}</div>
                                                        </div>
                                                        <div className="flex items-center space-x-3">
                                                            <span className="text-[10px] uppercase font-medium px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full border border-gray-200">{prompt.category}</span>
                                                            <div className="flex items-center text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-100">
                                                                <Star className="w-3 h-3 fill-current" />
                                                                <span className="text-xs font-bold ml-1">{prompt.rating}</span>
                                                            </div>
                                                        </div>
                                                    </motion.button>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="px-4 py-12 flex flex-col items-center justify-center text-center">
                                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                                    <Search className="w-5 h-5 text-gray-400" />
                                                </div>
                                                <p className="text-sm text-gray-900 font-medium">{t('noResults')} &quot;{searchQuery}&quot;</p>
                                                <p className="text-xs text-gray-500 mt-1">Try text search or different keywords</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Collections (only show if not searching or if search is empty) */}
                                {!searchQuery && (
                                    <div>
                                        <div className="text-[10px] font-bold text-gray-400 px-3 py-2 uppercase tracking-wider flex items-center">
                                            <BookOpen className="w-3.5 h-3.5 mr-1.5" />
                                            {t('myCollections')}
                                        </div>
                                        <div className="space-y-1">
                                            {collections.map(collection => (
                                                <div key={collection.id} className="rounded-xl border border-transparent bg-white shadow-sm overflow-hidden mb-2">
                                                    <button
                                                        onClick={() => setExpandedCollection(expandedCollection === collection.id ? null : collection.id)}
                                                        className="w-full text-left px-4 py-3 flex items-center justify-between group transition-colors hover:bg-gray-50"
                                                    >
                                                        <span className="font-semibold text-gray-700 group-hover:text-gray-900 text-sm">{collection.name}</span>
                                                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${expandedCollection === collection.id ? 'rotate-180' : ''}`} />
                                                    </button>
                                                    <AnimatePresence>
                                                        {expandedCollection === collection.id && (
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: "auto", opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                className="overflow-hidden"
                                                            >
                                                                <div className="bg-gray-50/50 px-2 py-2 space-y-1 border-t border-gray-100">
                                                                    {isCollectionPromptsLoading ? (
                                                                        <div className="px-3 space-y-2">
                                                                            <SkeletonLoader lines={2} hasHeading={false} />
                                                                        </div>
                                                                    ) : collectionPromptsData?.data?.content && collectionPromptsData.data.content.length > 0 ? (
                                                                        collectionPromptsData.data.content.map((prompt: PromptMetadataResponse) => (
                                                                            <button
                                                                                key={prompt.id}
                                                                                onClick={() => onSelect({
                                                                                    id: prompt.id,
                                                                                    title: prompt.title,
                                                                                    category: prompt.collectionName || 'General',
                                                                                    rating: prompt.averageRating || 0,
                                                                                    description: prompt.description
                                                                                })}
                                                                                className="w-full text-left px-3 py-2 hover:bg-white hover:shadow-sm rounded-lg border border-transparent hover:border-gray-100 transition-all duration-200 text-sm text-gray-600 hover:text-blue-600 flex justify-between items-center group"
                                                                            >
                                                                                <span className="truncate group-hover:font-medium">{prompt.title}</span>
                                                                            </button>
                                                                        ))
                                                                    ) : (
                                                                        <div className="px-3 py-4 text-center">
                                                                            <p className="text-xs text-gray-400 italic">{t('emptyCollection')}</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

const PromptCard = ({ slot, prompt, onClear, onSelect, model, onModelChange, onTest, isTesting, testResult, testError }: {
    slot: 'A' | 'B',
    prompt: PromptResponse | null,
    onClear: () => void,
    onSelect: () => void,
    model: string,
    onModelChange: (value: string) => void,
    onTest: () => void,
    isTesting: boolean,
    testResult: PromptTestResponse | null,
    testError: string | null
}) => {
    const t = useTranslations('Prompt.Search');

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col group h-full"
        >
            {/* Card Header */}
            <div className={`p-4 border-b border-gray-100 flex items-center justify-between transition-colors duration-300 ${slot === 'A' ? 'bg-blue-50/30' : 'bg-purple-50/30'}`}>
                <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-sm shadow-sm transition-transform duration-300 group-hover:scale-105 ${slot === 'A' ? 'bg-blue-600' : 'bg-purple-600'}`}>
                        {slot}
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 text-sm truncate max-w-[150px] transition-colors group-hover:text-blue-700">
                            {prompt ? prompt.title : t('emptySlot')}
                        </h3>
                    </div>
                </div>
                <div className="flex items-center space-x-1">
                    {prompt ? (
                        <button
                            onClick={onClear}
                            className="text-gray-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-md transition-all duration-200 hover:rotate-90"
                            title="Remove prompt"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    ) : (
                        <button
                            onClick={onSelect}
                            className="text-blue-600 hover:text-blue-700 text-xs font-medium px-3 py-1.5 hover:bg-blue-50 rounded-md transition-all active:scale-95"
                        >
                            {t('select')}
                        </button>
                    )}
                </div>
            </div>

            {/* Card Body */}
            <div className="flex-1 p-4 flex flex-col min-h-[400px]">
                <AnimatePresence mode="wait">
                    {!prompt ? (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="flex-1 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-gray-100 rounded-xl hover:border-blue-300 hover:bg-blue-50/10 transition-all cursor-pointer group-hover:border-blue-200"
                            onClick={onSelect}
                        >
                            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                                <Search className="w-7 h-7" />
                            </div>
                            <h4 className="text-sm font-semibold text-gray-900 mb-1">{t('noPromptSelected')}</h4>
                            <p className="text-xs text-gray-500 mb-6 max-w-[200px] leading-relaxed">{t('choosePromptHint')}</p>
                            <button className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 text-xs font-medium rounded-lg shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all hover:-translate-y-0.5 active:translate-y-0">
                                {t('browsePrompts')}
                            </button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="content"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex-1 flex flex-col space-y-4"
                        >
                            {/* Prompt Preview */}
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 text-xs space-y-3 max-h-[250px] overflow-y-auto custom-scrollbar shadow-inner">
                                {prompt.description && (
                                    <div>
                                        <span className="font-bold text-gray-400 uppercase tracking-wider text-[10px] mb-1 block">{t('description')}</span>
                                        <p className="text-gray-700 leading-relaxed">{prompt.description}</p>
                                    </div>
                                )}
                                <div>
                                    <span className="font-bold text-gray-400 uppercase tracking-wider text-[10px] mb-1 block">{t('instruction')}</span>
                                    <p className="text-gray-800 leading-relaxed font-medium">{prompt.instruction}</p>
                                </div>
                                {prompt.context && (
                                    <div className="pt-2 border-t border-gray-200/50">
                                        <span className="font-bold text-gray-400 uppercase tracking-wider text-[10px] mb-1 block">{t('context')}</span>
                                        <p className="text-gray-700 leading-relaxed">{prompt.context}</p>
                                    </div>
                                )}
                                {prompt.inputExample && (
                                    <div className="pt-2 border-t border-gray-200/50">
                                        <span className="font-bold text-gray-400 uppercase tracking-wider text-[10px] mb-1 block">{t('inputExample')}</span>
                                        <p className="text-gray-600 italic bg-white p-2 rounded border border-gray-100">{prompt.inputExample}</p>
                                    </div>
                                )}
                            </div>

                            {/* Controls */}
                            <div className="flex items-center gap-3 pt-2">
                                <div className="flex-1">
                                    <select
                                        value={model}
                                        onChange={(e) => onModelChange(e.target.value)}
                                        className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm hover:border-blue-300 cursor-pointer appearance-none"
                                        style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em`, paddingRight: `2.5rem` }}
                                    >
                                        {MODEL_OPTIONS.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <button
                                    onClick={onTest}
                                    disabled={isTesting}
                                    className={`flex items-center justify-center px-5 py-2.5 rounded-lg text-xs font-bold text-white shadow-sm transition-all active:scale-95 disabled:active:scale-100 disabled:opacity-70 disabled:cursor-wait ${isTesting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-md hover:-translate-y-0.5'}`}
                                >
                                    {isTesting ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <Play className="w-3.5 h-3.5 fill-current mr-1.5" />}
                                    {isTesting ? t('testing') : t('run')}
                                </button>
                            </div>

                            {/* Output */}
                            <div className="flex-1 bg-white border border-gray-200 rounded-xl p-4 relative min-h-[300px] flex flex-col shadow-sm transition-shadow hover:shadow-md">
                                <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-50">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center">
                                        <FlaskConical className="w-3 h-3 mr-1.5" />
                                        Output
                                    </span>
                                    {testResult?.output && (
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(testResult.output || '');
                                                toast.success(t('copied'));
                                            }}
                                            className="text-gray-400 hover:text-blue-600 transition-colors p-1 rounded-md hover:bg-blue-50"
                                            title="Copy result"
                                        >
                                            <Copy className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>

                                <div className="flex-1 overflow-y-auto custom-scrollbar">
                                    {isTesting ? (
                                        <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-3">
                                            <div className="relative">
                                                <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin"></div>
                                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                                    <Sparkles className="w-4 h-4 text-blue-500" />
                                                </div>
                                            </div>
                                            <span className="text-xs font-medium animate-pulse">{t('generatingResponse')}</span>
                                        </div>
                                    ) : testError ? (
                                        <div className="flex flex-col items-center justify-center h-full text-red-500 p-4 text-center">
                                            <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center mb-2">
                                                <X className="w-5 h-5" />
                                            </div>
                                            <p className="text-xs font-medium">{testError}</p>
                                        </div>
                                    ) : testResult ? (
                                        <div className="prose prose-sm max-w-none prose-p:text-gray-700 prose-headings:text-gray-900 prose-code:text-blue-600 prose-pre:bg-gray-50 prose-pre:border prose-pre:border-gray-100">
                                            <MarkdownRenderer content={testResult.output || ''} />
                                        </div>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-gray-300 space-y-2 select-none">
                                            <FlaskConical className="w-8 h-8 opacity-20" />
                                            <span className="text-xs italic opacity-60">{t('resultPlaceholder')}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Metrics */}
                                {(testResult) && (
                                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-[10px] font-medium text-gray-500">
                                        <div className="flex items-center bg-gray-50 px-2 py-1 rounded border border-gray-100">
                                            <span className="mr-1">🪙</span>
                                            {testResult.tokensUsed || 0} {t('tokens')}
                                        </div>
                                        <div className="flex items-center bg-gray-50 px-2 py-1 rounded border border-gray-100">
                                            <span className="mr-1">⚡</span>
                                            {testResult.executionTimeMs || 0} {t('ms')}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

const PromptTestingPage = () => {
    const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
    const router = useRouter();
    const t = useTranslations('Prompt.Search');

    useEffect(() => {
        if (!isAuthLoading && !isAuthenticated) {
            router.replace('/login');
        }
    }, [isAuthenticated, isAuthLoading, router]);

    // State
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [executedSearchQuery, setExecutedSearchQuery] = useState('');
    const [searchType, setSearchType] = useState<'keyword' | 'semantic'>('keyword');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [selectedPromptIdA, setSelectedPromptIdA] = useState<string | null>(null);
    const [selectedPromptIdB, setSelectedPromptIdB] = useState<string | null>(null);
    const [activePromptSlot, setActivePromptSlot] = useState<'A' | 'B' | null>(null);
    const [expandedCollection, setExpandedCollection] = useState<string | null>(null);

    const [modelA, setModelA] = useState(MODEL_OPTIONS[0].value);
    const [modelB, setModelB] = useState(MODEL_OPTIONS[1].value);

    const [temperature, setTemperature] = useState(0.7);
    const [topP, setTopP] = useState(0.9);
    const [maxTokens, setMaxTokens] = useState(2048);
    const [showSettings, setShowSettings] = useState(true);

    const [testResponseA, setTestResponseA] = useState<PromptTestResponse | null>(null);
    const [testErrorA, setTestErrorA] = useState<string | null>(null);
    const [testResponseB, setTestResponseB] = useState<PromptTestResponse | null>(null);
    const [testErrorB, setTestErrorB] = useState<string | null>(null);

    const [isPollingA, setIsPollingA] = useState(false);
    const [isPollingB, setIsPollingB] = useState(false);

    // Queries
    const { data: keywordResults, isLoading: isKeywordLoading } = useFilterPrompts(
        { title: executedSearchQuery, page: 0, size: 10 },
        { enabled: searchType === 'keyword' && executedSearchQuery.length > 0 }
    );

    const { mutate: performSemanticSearch, data: semanticResults, isPending: isSemanticLoading } = useSemanticSearch();

    const { data: collectionsData } = useGetMyCollections(0, 100);
    const collections = collectionsData?.data?.content || [];

    const selectedCollectionName = useMemo(() => {
        return collections.find(c => c.id === expandedCollection)?.name;
    }, [collections, expandedCollection]);

    const { data: collectionPromptsData, isLoading: isCollectionPromptsLoading } = useFilterPrompts(
        { title: '', collectionName: selectedCollectionName, page: 0, size: 20 },
        { enabled: !!expandedCollection && !!selectedCollectionName }
    );

    // Fetch selected prompts details
    const { data: promptA } = useGetPrompt(selectedPromptIdA!, {}, { enabled: !!selectedPromptIdA });
    const { data: promptB } = useGetPrompt(selectedPromptIdB!, {}, { enabled: !!selectedPromptIdB });

    // Enhance: Log prompt views when they are loaded/selected
    useEffect(() => {
        if (selectedPromptIdA) {
            promptsService.logPromptView(selectedPromptIdA).catch(err => {
                if (err.response && err.response.status === 503) {
                    toast.error("Unlock Quota Exceeded", {
                        description: "You have reached your daily limit for viewing prompts."
                    });
                } else {
                    console.error(err);
                }
            });
        }
    }, [selectedPromptIdA]);

    useEffect(() => {
        if (selectedPromptIdB) {
            promptsService.logPromptView(selectedPromptIdB).catch(err => {
                if (err.response && err.response.status === 503) {
                    toast.error("Unlock Quota Exceeded", {
                        description: "You have reached your daily limit for viewing prompts."
                    });
                } else {
                    console.error(err);
                }
            });
        }
    }, [selectedPromptIdB]);

    // Test Mutations
    const { mutate: runTestA, isPending: isTestingA } = useRunPromptTest();
    const { mutate: runTestB, isPending: isTestingB } = useRunPromptTest();

    // Handlers
    const handleSearch = () => {
        if (!searchQuery.trim()) return;
        setExecutedSearchQuery(searchQuery);
        if (searchType === 'semantic') {
            performSemanticSearch({ query: searchQuery, limit: 10 });
        }
    };

    const openSelectionModal = (slot: 'A' | 'B') => {
        setActivePromptSlot(slot);
        setIsModalOpen(true);
        // Reset search when opening
        setSearchQuery('');
        setExecutedSearchQuery('');
    };

    const handleSelectPrompt = (prompt: PromptDisplay) => {
        if (activePromptSlot === 'A') {
            setSelectedPromptIdA(prompt.id);
        } else if (activePromptSlot === 'B') {
            setSelectedPromptIdB(prompt.id);
        }
        setIsModalOpen(false);
        setActivePromptSlot(null);
    };

    const handleTest = async (slot: 'A' | 'B', onComplete?: () => void) => {
        console.log(`[handleTest] Starting test for slot ${slot}`);
        const prompt = slot === 'A' ? promptA?.data : promptB?.data;
        const model = slot === 'A' ? modelA : modelB;
        const setResponse = slot === 'A' ? setTestResponseA : setTestResponseB;
        const setError = slot === 'A' ? setTestErrorA : setTestErrorB;
        const runTest = slot === 'A' ? runTestA : runTestB;
        const setIsPolling = slot === 'A' ? setIsPollingA : setIsPollingB;

        if (!prompt) {
            console.error('[handleTest] No prompt selected');
            return;
        }

        setError(null);
        setResponse(null);

        const inputText = prompt.inputExample || "Default test input";
        console.log('[handleTest] Sending request:', { promptId: prompt.id, model, inputText });

        runTest({
            request: {
                promptId: prompt.id,
                aiModel: model as PromptAiModel,
                temperature,
                topP,
                maxTokens,
                inputText
            }
        }, {
            onSuccess: async (data) => {
                console.log('[handleTest] runTest success:', data);
                if (!data.data) {
                    console.error('[handleTest] No data in response');
                    setError('No data received from server');
                    onComplete?.();
                    return;
                }

                if (data.data.status === 'PENDING' || data.data.status === 'PROCESSING') {
                    console.log('[handleTest] Status is PENDING/PROCESSING, starting poll');
                    setIsPolling(true);
                    // Start polling
                    const poll = async () => {
                        try {
                            if (!data.data) return;
                            console.log('[handleTest] Polling usage:', data.data.id);
                            const result = await promptsService.getTestUsage(data.data!.id);
                            console.log('[handleTest] Poll result:', result);

                            if (!result.data) {
                                console.warn('[handleTest] No data in poll result, retrying...');
                                setTimeout(poll, 2000);
                                return;
                            }

                            if (result.data.status === 'COMPLETED') {
                                console.log('[handleTest] Test completed');
                                setResponse(result.data);
                                setIsPolling(false);
                                onComplete?.();
                            } else if (result.data.status === 'FAILED') {
                                console.error('[handleTest] Test failed:', result.data.errorMessage);
                                setError(result.data.errorMessage || 'Test failed during processing');
                                setIsPolling(false);
                                onComplete?.();
                            } else {
                                // Continue polling
                                console.log('[handleTest] Status still ' + result.data.status + ', retrying...');
                                setTimeout(poll, 2000);
                            }
                        } catch (err) {
                            console.error('[handleTest] Poll error:', err);
                            setError('Failed to poll test results');
                            setIsPolling(false);
                            onComplete?.();
                        }
                    };
                    poll();
                } else if (data.data.status === 'FAILED') {
                    console.error('[handleTest] Test failed immediately:', data.data.errorMessage);
                    setError(data.data.errorMessage || 'Test failed immediately');
                    onComplete?.();
                } else {
                    console.log('[handleTest] Test completed immediately');
                    setResponse(data.data);
                    onComplete?.();
                }
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onError: (error: any) => {
                console.error('[handleTest] runTest error:', error);
                const errPayload = error?.response?.data?.error;
                if (errPayload?.code === 'QUOTA_EXCEEDED') {
                    toast.error('Quota Exceeded', { description: errPayload.message?.[0] || 'You have reached your testing limit.' });
                } else if (errPayload?.code === 'DUPLICATE_REQUEST') {
                    toast.warning('Duplicate Request', { description: 'A test is already in progress.' });
                } else if (errPayload?.code === 'AI_PROVIDER_UNAVAILABLE') {
                    toast.error('Service Unavailable', { description: 'AI provider is temporarily down. Please try again later.' });
                } else {
                    toast.error('Test Failed', { description: error.message || 'An unexpected error occurred.' });
                }
                setError(error.message || 'Test failed');
                onComplete?.();
            }
        });
    };

    // Derived results for display
    const displayResults: PromptDisplay[] = useMemo(() => {
        if (searchType === 'keyword') {
            return keywordResults?.data?.content?.map(p => ({
                id: p.id,
                title: p.title,
                category: p.collectionName || 'General',
                rating: p.averageRating || 0,
                description: p.description
            })) || [];
        } else {
            return semanticResults?.data?.results?.map((p) => ({
                id: p.promptId,
                title: p.title,
                category: 'Semantic Match',
                rating: p.averageRating || 0,
                description: p.description || p.matchedSnippet
            })) || [];
        }
    }, [searchType, keywordResults, semanticResults]);

    const isLoading = searchType === 'keyword' ? isKeywordLoading : isSemanticLoading;

    if (isAuthLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return null; // Don't render anything while redirecting
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 font-sans text-gray-800">
            <DashboardNavbar
                isSidebarOpen={isSidebarOpen}
                setIsSidebarOpen={setIsSidebarOpen}
                hideSidebarTrigger={true}
                hideCreateButton={true}
            />

            <div className="max-w-7xl mx-auto p-6 pt-20">
                <Toaster position="top-right" />

                {/* Header Actions */}
                <div className="flex justify-end mb-4">
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all shadow-sm border ${showSettings ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                    >
                        <Filter className="w-4 h-4" />
                        <span className="text-sm font-medium">{showSettings ? t('hideSettings') : t('showSettings')}</span>
                    </button>
                </div>

                {/* Global Settings Panel */}
                {showSettings && (

                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <TrendingUp className="w-4 h-4 text-blue-500" />
                                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">{t('temperature')}</label>
                                    </div>
                                    <InfoTooltip text={t('temperatureTooltip')} />
                                </div>
                                <div className="pt-2">
                                    <div className="relative mb-6">
                                        <input
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.1"
                                            value={temperature}
                                            onChange={(e) => setTemperature(parseFloat(e.target.value))}
                                            className="w-full accent-blue-600 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                        />
                                        <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                                            <span>Focused</span>
                                            <span className="text-gray-900 font-bold bg-white px-1.5 py-0.5 rounded border border-gray-100 shadow-sm">{temperature.toFixed(1)}</span>
                                            <span>Creative</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Filter className="w-4 h-4 text-purple-500" />
                                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">{t('topP')}</label>
                                    </div>
                                    <InfoTooltip text={t('topPTooltip')} />
                                </div>
                                <div className="pt-2">
                                    <div className="relative mb-6">
                                        <input
                                            type="range"
                                            min="0.1"
                                            max="1"
                                            step="0.1"
                                            value={topP}
                                            onChange={(e) => setTopP(parseFloat(e.target.value))}
                                            className="w-full accent-purple-600 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                        />
                                        <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                                            <span>Narrow</span>
                                            <span className="text-gray-900 font-bold bg-white px-1.5 py-0.5 rounded border border-gray-100 shadow-sm">{topP.toFixed(1)}</span>
                                            <span>Diverse</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">{t('maxTokens')}</label>
                                    </div>
                                    <InfoTooltip text={t('maxTokensTooltip')} placement="left" />
                                </div>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={maxTokens}
                                        onChange={(e) => setMaxTokens(Math.max(100, Math.min(16384, parseInt(e.target.value) || 2048)))}
                                        min="100"
                                        max="16384"
                                        step="100"
                                        className="w-full pl-3 pr-16 py-2 text-sm font-mono border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                    />
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
                                        tokens
                                    </div>
                                </div>
                                <div className="text-[10px] text-gray-400 text-right">Max: 16384</div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Side-by-Side Comparison */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 min-h-[600px]">
                    <PromptCard
                        slot="A"
                        prompt={promptA?.data || null}
                        onClear={() => {
                            setSelectedPromptIdA(null);
                            setTestResponseA(null);
                            setTestErrorA(null);
                        }}
                        onSelect={() => openSelectionModal('A')}
                        model={modelA}
                        onModelChange={setModelA}
                        onTest={() => handleTest('A')}
                        isTesting={isTestingA || isPollingA}
                        testResult={testResponseA}
                        testError={testErrorA}
                    />
                    <PromptCard
                        slot="B"
                        prompt={promptB?.data || null}
                        onClear={() => {
                            setSelectedPromptIdB(null);
                            setTestResponseB(null);
                            setTestErrorB(null);
                        }}
                        onSelect={() => openSelectionModal('B')}
                        model={modelB}
                        onModelChange={setModelB}
                        onTest={() => handleTest('B')}
                        isTesting={isTestingB || isPollingB}
                        testResult={testResponseB}
                        testError={testErrorB}
                    />
                </div>

                {/* Bottom Actions */}
                {/* Bottom Actions */}
                <AnimatePresence>
                    {(selectedPromptIdA || selectedPromptIdB) && (
                        <motion.div
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 100, opacity: 0 }}
                            className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-30"
                        >
                            <motion.button
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                    if (selectedPromptIdA === selectedPromptIdB) {
                                        handleTest('A', () => {
                                            setTimeout(() => handleTest('B'), 500);
                                        });
                                    } else {
                                        handleTest('A');
                                        handleTest('B');
                                    }
                                }}
                                disabled={isTestingA || isPollingA || isTestingB || isPollingB || (!selectedPromptIdA && !selectedPromptIdB)}
                                className="px-8 py-3.5 bg-gray-900 text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 font-bold text-sm tracking-wide flex items-center space-x-3 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none border border-gray-800"
                            >
                                {isTestingA || isPollingA || isTestingB || isPollingB ? (
                                    <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                                ) : (
                                    <div className="flex -space-x-1">
                                        <Play className="w-5 h-5 fill-current text-blue-400" />
                                        <Play className="w-5 h-5 fill-current text-purple-400 opacity-60" />
                                    </div>
                                )}
                                <span>{isTestingA || isPollingA || isTestingB || isPollingB ? t('runningTests') : t('runComparison')}</span>
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <PromptSelectionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSelect={handleSelectPrompt}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                searchType={searchType}
                setSearchType={setSearchType}
                handleSearch={handleSearch}
                results={displayResults}
                isLoading={isLoading}
                collections={collections}
                expandedCollection={expandedCollection}
                setExpandedCollection={setExpandedCollection}
                collectionPromptsData={collectionPromptsData}
                isCollectionPromptsLoading={isCollectionPromptsLoading}
            />
        </div >
    );
};

export default PromptTestingPage;