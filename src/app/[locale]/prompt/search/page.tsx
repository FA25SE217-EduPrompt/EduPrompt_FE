"use client"

import React, { useState, useEffect, useMemo } from 'react';
import { Search, GitCompare, Sparkles, Info, Copy, BookOpen, Star, TrendingUp, X, ChevronDown, Play, Loader2, Filter } from 'lucide-react';
import { useFilterPrompts, useSemanticSearch } from '@/hooks/queries/search';
import { useGetMyCollections } from '@/hooks/queries/collection';
import { useRunPromptTest, useGetTestUsage, useGetPrompt } from '@/hooks/queries/prompt';
import { promptsService } from '@/services/resources/prompts';
import { PromptResponse, PromptTestResponse, PromptAiModel, PromptMetadataResponse } from '@/types/prompt.api';
import { CollectionResponse } from '@/types/collection.api';
import { BaseResponse, PaginatedResponse } from '@/types/api';
import { toast, Toaster } from 'sonner';
import { CreatorNavbar } from '@/components/layout/CreatorNavbar';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Spinner from '@/components/ui/Spinner';
import { useTranslations } from 'next-intl';
import { MarkdownRenderer } from '@/components/ui/MarkdownRenderer';

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

const InfoTooltip = ({ text }: { text: string }) => (
    <div className="group relative inline-block ml-1">
        <Info className="w-4 h-4 text-gray-400 hover:text-blue-500 cursor-help" />
        <div className="invisible group-hover:visible absolute z-10 w-64 p-3 text-xs bg-gray-900 text-white rounded-lg shadow-lg -top-2 left-6 transform transition-all">
            {text}
            <div className="absolute top-3 -left-1 w-2 h-2 bg-gray-900 transform rotate-45"></div>
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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <h2 className="text-lg font-semibold text-gray-900">{t('pageTitle')}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Search Bar */}
                <div className="p-4 border-b border-gray-100 space-y-3">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                placeholder={t('searchPlaceholder')}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                autoFocus
                            />
                        </div>
                        <button
                            onClick={handleSearch}
                            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                        >
                            {t('search')}
                        </button>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setSearchType('keyword')}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${searchType === 'keyword' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                            {t('keyword')}
                        </button>
                        <button
                            onClick={() => setSearchType('semantic')}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center space-x-1 ${searchType === 'semantic' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                            <Sparkles className="w-3 h-3" />
                            <span>{t('semantic')}</span>
                        </button>
                    </div>
                </div>

                {/* Results List */}
                <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                    {/* Search Results */}
                    {searchQuery && (
                        <div className="mb-4">
                            <div className="text-xs font-semibold text-gray-500 px-3 py-2 uppercase tracking-wide">{t('results')}</div>
                            {isLoading ? (
                                <div className="flex items-center justify-center py-8 text-gray-500">
                                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                    {t('runningTests')}
                                </div>
                            ) : results.length > 0 ? (
                                <div className="space-y-1">
                                    {results.map(prompt => (
                                        <button
                                            key={prompt.id}
                                            onClick={() => onSelect(prompt)}
                                            className="w-full text-left px-3 py-3 hover:bg-blue-50 rounded-lg transition-all duration-200 flex items-center justify-between group border border-transparent hover:border-blue-100"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-gray-900 group-hover:text-blue-700 truncate">{prompt.title}</div>
                                                <div className="text-xs text-gray-500 mt-0.5 truncate">{prompt.description || 'No description'}</div>
                                            </div>
                                            <div className="flex items-center space-x-2 ml-3">
                                                <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">{prompt.category}</span>
                                                <div className="flex items-center text-amber-500">
                                                    <Star className="w-3 h-3 fill-current" />
                                                    <span className="text-xs font-medium ml-0.5">{prompt.rating}</span>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="px-4 py-8 text-center text-gray-500 text-sm">{t('noResults')} &quot;{searchQuery}&quot;</div>
                            )}
                        </div>
                    )}

                    {/* Collections (only show if not searching or if search is empty) */}
                    {!searchQuery && (
                        <div>
                            <div className="text-xs font-semibold text-gray-500 px-3 py-2 uppercase tracking-wide flex items-center">
                                <BookOpen className="w-3.5 h-3.5 mr-1.5" />
                                {t('myCollections')}
                            </div>
                            <div className="space-y-1">
                                {collections.map(collection => (
                                    <div key={collection.id} className="rounded-lg overflow-hidden">
                                        <button
                                            onClick={() => setExpandedCollection(expandedCollection === collection.id ? null : collection.id)}
                                            className="w-full text-left px-3 py-2.5 hover:bg-gray-50 flex items-center justify-between group transition-colors"
                                        >
                                            <span className="font-medium text-gray-700 group-hover:text-gray-900 text-sm">{collection.name}</span>
                                            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${expandedCollection === collection.id ? 'rotate-180' : ''}`} />
                                        </button>
                                        {expandedCollection === collection.id && (
                                            <div className="bg-gray-50/50 px-2 py-2 space-y-1 border-t border-gray-100">
                                                {isCollectionPromptsLoading ? (
                                                    <div className="px-3 py-2 text-xs text-gray-400 flex items-center">
                                                        <Loader2 className="w-3 h-3 animate-spin mr-2" />
                                                        Loading...
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
                                                            className="w-full text-left px-3 py-2 hover:bg-white hover:shadow-sm rounded-md transition-all duration-200 text-sm text-gray-600 hover:text-blue-600 flex justify-between items-center"
                                                        >
                                                            <span className="truncate">{prompt.title}</span>
                                                        </button>
                                                    ))
                                                ) : (
                                                    <div className="px-3 py-2 text-xs text-gray-400 italic">{t('emptyCollection')}</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
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
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col group">
            {/* Card Header */}
            <div className={`p-4 border-b border-gray-100 flex items-center justify-between ${slot === 'A' ? 'bg-blue-50/30' : 'bg-purple-50/30'}`}>
                <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-sm shadow-sm ${slot === 'A' ? 'bg-blue-600' : 'bg-purple-600'}`}>
                        {slot}
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 text-sm truncate max-w-[150px]">
                            {prompt ? prompt.title : t('emptySlot')}
                        </h3>
                    </div>
                </div>
                <div className="flex items-center space-x-1">
                    {prompt ? (
                        <button
                            onClick={onClear}
                            className="text-gray-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-md transition-colors"
                            title="Remove prompt"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    ) : (
                        <button
                            onClick={onSelect}
                            className="text-blue-600 hover:text-blue-700 text-xs font-medium px-2 py-1 hover:bg-blue-50 rounded-md transition-colors"
                        >
                            {t('select')}
                        </button>
                    )}
                </div>
            </div>

            {/* Card Body */}
            <div className="flex-1 p-4 flex flex-col min-h-[400px]">
                {!prompt ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/10 transition-all cursor-pointer group-hover:border-blue-200" onClick={onSelect}>
                        <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <Search className="w-6 h-6" />
                        </div>
                        <h4 className="text-sm font-medium text-gray-900 mb-1">{t('noPromptSelected')}</h4>
                        <p className="text-xs text-gray-500 mb-4 max-w-[200px]">{t('choosePromptHint')}</p>
                        <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-xs font-medium rounded-lg shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all">
                            {t('browsePrompts')}
                        </button>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col space-y-4">
                        {/* Prompt Preview */}
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 text-xs space-y-3 max-h-[250px] overflow-y-auto custom-scrollbar">
                            {prompt.description && (
                                <div>
                                    <span className="font-semibold text-gray-500 uppercase tracking-wider text-[10px]">{t('description')}</span>
                                    <p className="text-gray-700 mt-0.5">{prompt.description}</p>
                                </div>
                            )}
                            <div>
                                <span className="font-semibold text-gray-500 uppercase tracking-wider text-[10px]">{t('instruction')}</span>
                                <p className="text-gray-800 mt-0.5 leading-relaxed">{prompt.instruction}</p>
                            </div>
                            {prompt.context && (
                                <div>
                                    <span className="font-semibold text-gray-500 uppercase tracking-wider text-[10px]">{t('context')}</span>
                                    <p className="text-gray-700 mt-0.5">{prompt.context}</p>
                                </div>
                            )}
                            {prompt.inputExample && (
                                <div className="pt-2 border-t border-gray-200">
                                    <span className="font-semibold text-gray-500 uppercase tracking-wider text-[10px]">{t('inputExample')}</span>
                                    <p className="text-gray-600 mt-0.5 italic">{prompt.inputExample}</p>
                                </div>
                            )}
                            {prompt.outputFormat && (
                                <div className="pt-2 border-t border-gray-200">
                                    <span className="font-semibold text-gray-500 uppercase tracking-wider text-[10px]">{t('outputFormat')}</span>
                                    <p className="text-gray-600 mt-0.5 font-mono text-[10px]">{prompt.outputFormat}</p>
                                </div>
                            )}
                            {prompt.constraints && (
                                <div className="pt-2 border-t border-gray-200">
                                    <span className="font-semibold text-gray-500 uppercase tracking-wider text-[10px]">{t('constraints')}</span>
                                    <p className="text-gray-600 mt-0.5">{prompt.constraints}</p>
                                </div>
                            )}
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                            <div className="flex-1">
                                <select
                                    value={model}
                                    onChange={(e) => onModelChange(e.target.value)}
                                    className="w-full px-2.5 py-2 bg-white border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                >
                                    {MODEL_OPTIONS.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                            <button
                                onClick={onTest}
                                disabled={isTesting}
                                className={`flex items-center justify-center px-4 py-2 rounded-lg text-xs font-medium text-white shadow-sm transition-all ${isTesting ? 'bg-blue-400 cursor-wait' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-md'}`}
                            >
                                {isTesting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current mr-1" />}
                                {isTesting ? t('testing') : t('run')}
                            </button>
                        </div>

                        {/* Output */}
                        <div className="flex-1 bg-white border border-gray-200 rounded-lg p-3 relative min-h-[300px] flex flex-col">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Output</span>
                                {testResult?.output && (
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(testResult.output || '');
                                            toast.success(t('copied'));
                                        }}
                                        className="text-gray-400 hover:text-blue-500 transition-colors"
                                    >
                                        <Copy className="w-3 h-3" />
                                    </button>
                                )}
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar">
                                {isTesting ? (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2">
                                        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                                        <span className="text-xs">{t('generatingResponse')}</span>
                                    </div>
                                ) : testError ? (
                                    <div className="text-red-500 text-xs p-2 bg-red-50 rounded border border-red-100">
                                        {testError}
                                    </div>
                                ) : testResult ? (
                                    <MarkdownRenderer content={testResult.output || ''} />
                                ) : (
                                    <div className="h-full flex items-center justify-center text-gray-300 text-xs italic">
                                        {t('resultPlaceholder')}
                                    </div>
                                )}
                            </div>

                            {/* Metrics */}
                            {(testResult) && (
                                <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-500">
                                    <span>{testResult.tokensUsed || 0} {t('tokens')}</span>
                                    <span>{testResult.executionTimeMs || 0} {t('ms')}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
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
                <Spinner size="page" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return null; // Don't render anything while redirecting
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 font-sans text-gray-800">
            <CreatorNavbar
                title={t('pageTitle')}
                breadcrumbs={[{ label: t('pageTitle') }]}
            />

            <div className="max-w-7xl mx-auto p-6">
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
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
                        <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center uppercase tracking-wider">
                            {t('globalSettings')}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <div className="flex items-center mb-2">
                                    <label className="text-xs font-medium text-gray-700">{t('temperature')}</label>
                                    <InfoTooltip text={t('temperatureTooltip')} />
                                </div>
                                <div className="space-y-2">
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.1"
                                        value={temperature}
                                        onChange={(e) => setTemperature(parseFloat(e.target.value))}
                                        className="w-full accent-blue-500 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                    />
                                    <div className="flex justify-between text-[10px] text-gray-500 uppercase font-medium">
                                        <span>Focused</span>
                                        <span className="text-blue-600">{temperature.toFixed(1)}</span>
                                        <span>Creative</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center mb-2">
                                    <label className="text-xs font-medium text-gray-700">{t('topP')}</label>
                                    <InfoTooltip text={t('topPTooltip')} />
                                </div>
                                <div className="space-y-2">
                                    <input
                                        type="range"
                                        min="0.1"
                                        max="1"
                                        step="0.1"
                                        value={topP}
                                        onChange={(e) => setTopP(parseFloat(e.target.value))}
                                        className="w-full accent-blue-500 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                    />
                                    <div className="flex justify-between text-[10px] text-gray-500 uppercase font-medium">
                                        <span>Narrow</span>
                                        <span className="text-blue-600">{topP.toFixed(1)}</span>
                                        <span>Diverse</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center mb-2">
                                    <label className="text-xs font-medium text-gray-700">{t('maxTokens')}</label>
                                    <InfoTooltip text={t('maxTokensTooltip')} />
                                </div>
                                <input
                                    type="number"
                                    value={maxTokens}
                                    onChange={(e) => setMaxTokens(Math.max(100, Math.min(8192, parseInt(e.target.value) || 2048)))}
                                    min="100"
                                    max="8192"
                                    step="100"
                                    className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>
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
                <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-30">
                    <button
                        onClick={() => {
                            if (selectedPromptIdA === selectedPromptIdB) {
                                // Same prompt: Run sequentially to avoid conflicts
                                handleTest('A', () => {
                                    setTimeout(() => handleTest('B'), 500);
                                });
                            } else {
                                // Different prompts: Run in parallel for speed
                                handleTest('A');
                                handleTest('B');
                            }
                        }}
                        disabled={isTestingA || isPollingA || isTestingB || isPollingB || (!selectedPromptIdA && !selectedPromptIdB)}
                        className="px-8 py-3 bg-gray-900 text-white rounded-full shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 font-medium flex items-center space-x-3 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        {isTestingA || isPollingA || isTestingB || isPollingB ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <GitCompare className="w-5 h-5" />
                        )}
                        <span>{isTestingA || isPollingA || isTestingB || isPollingB ? t('runningTests') : t('runComparison')}</span>
                    </button>
                </div>
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
        </div>
    );
};

export default PromptTestingPage;