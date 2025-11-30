"use client"

import React, { useState, useEffect, useMemo } from 'react';
import { Search, GitCompare, Sparkles, Info, Copy, RefreshCw, BookOpen, Star, TrendingUp, X, ChevronDown, Play, Loader2 } from 'lucide-react';
import { useFilterPrompts, useSemanticSearch } from '@/hooks/queries/search';
import { useGetMyCollections } from '@/hooks/queries/collection';
import { useRunPromptTest, useGetTestUsage, useGetPrompt } from '@/hooks/queries/prompt';
import { promptsService } from '@/services/resources/prompts';
import { PromptResponse, PromptTestResponse, PromptAiModel } from '@/types/prompt.api';
import { toast, Toaster } from 'sonner';

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

    return (
        <div className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-blue-300 transition-all duration-300 h-full">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white shadow-sm ${slot === 'A' ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gradient-to-br from-purple-500 to-purple-600'
                        }`}>
                        {slot}
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">
                            {prompt ? prompt.title : `Prompt ${slot}`}
                        </h3>
                        {prompt && (
                            <div className="flex items-center space-x-2 mt-0.5">
                                <span className="text-xs text-gray-500">{prompt.collectionName || 'General'}</span>
                                <div className="flex items-center space-x-0.5 text-amber-500">
                                    <Star className="w-3 h-3 fill-current" />
                                    <span className="text-xs font-medium">{prompt.averageRating || 0}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                {prompt && (
                    <button
                        onClick={onClear}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1 hover:bg-red-50 rounded"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            {!prompt ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-all duration-300">
                    <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500 mb-4">Select a prompt to test</p>
                    <button
                        onClick={onSelect}
                        className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 hover:shadow-sm transition-all duration-200 text-sm font-medium"
                    >
                        Choose Prompt
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Prompt Content */}
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 space-y-3 border border-gray-200 max-h-[400px] overflow-y-auto">
                        {prompt.context && (
                            <div>
                                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Context</label>
                                <p className="text-sm text-gray-800 mt-1 leading-relaxed whitespace-pre-wrap">{prompt.context}</p>
                            </div>
                        )}
                        <div>
                            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Instruction</label>
                            <p className="text-sm text-gray-800 mt-1 leading-relaxed whitespace-pre-wrap">{prompt.instruction}</p>
                        </div>
                        {prompt.inputExample && (
                            <div className="pt-2 border-t border-gray-200">
                                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Input Example</label>
                                <p className="text-sm text-gray-800 mt-1 leading-relaxed whitespace-pre-wrap">{prompt.inputExample}</p>
                            </div>
                        )}
                        {prompt.outputFormat && (
                            <div className="pt-2 border-t border-gray-200">
                                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Output Format</label>
                                <p className="text-sm text-gray-800 mt-1 leading-relaxed whitespace-pre-wrap">{prompt.outputFormat}</p>
                            </div>
                        )}
                        {prompt.constraints && (
                            <div className="pt-2 border-t border-gray-200">
                                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Constraints</label>
                                <p className="text-sm text-gray-800 mt-1 leading-relaxed whitespace-pre-wrap">{prompt.constraints}</p>
                            </div>
                        )}
                    </div>

                    {/* Model Selection & Test */}
                    <div className="flex items-center space-x-2">
                        <div className="flex-1">
                            <label className="text-xs font-medium text-gray-700 mb-1.5 block">AI Model</label>
                            <select
                                value={model}
                                onChange={(e) => onModelChange(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all duration-200 hover:border-blue-400"
                            >
                                {MODEL_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="pt-5">
                            <button
                                onClick={onTest}
                                disabled={isTesting}
                                className="inline-flex items-center justify-center gap-1 bg-blue-600 text-white border border-blue-700 rounded-lg text-xs font-medium px-4 py-2 shadow-sm hover:bg-blue-700 hover:shadow-md hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 min-w-[80px]"
                                title="Run test with selected model"
                            >
                                {isTesting ? (
                                    <>
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        <span>Testing...</span>
                                    </>
                                ) : (
                                    <>
                                        <Play className="w-3.5 h-3.5 fill-current" />
                                        <span>Test</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Test Results Area */}
                    <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-lg p-4 min-h-[200px] border border-blue-100 relative">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-semibold text-gray-900">Test Results</h4>
                            <div className="flex items-center space-x-2">
                                {testResult?.output && (
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(testResult.output || '');
                                            toast.success('Copied to clipboard');
                                        }}
                                        className="p-1 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded transition-all duration-200"
                                        title="Copy results"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="text-sm text-gray-600 space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                            {isTesting ? (
                                <div className="flex flex-col items-center justify-center h-32 space-y-3">
                                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                                    <p className="text-xs text-gray-500 animate-pulse">Generating response...</p>
                                </div>
                            ) : testError ? (
                                <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-xs">
                                    <p className="font-semibold mb-1">Error</p>
                                    {testError}
                                </div>
                            ) : testResult ? (
                                <div className="prose prose-sm max-w-none">
                                    <p className="whitespace-pre-wrap text-gray-800 leading-relaxed">{testResult.output}</p>
                                </div>
                            ) : (
                                <p className="italic text-gray-500">Click "Test" to see AI response here...</p>
                            )}

                            {(testResult || isTesting) && (
                                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-blue-200 mt-4">
                                    <div className="bg-white/60 backdrop-blur-sm rounded-lg p-2">
                                        <span className="text-xs text-gray-500 block">Tokens Used</span>
                                        <span className="text-sm text-gray-700 font-semibold">
                                            {testResult?.tokensUsed || '-'}
                                        </span>
                                    </div>
                                    <div className="bg-white/60 backdrop-blur-sm rounded-lg p-2">
                                        <span className="text-xs text-gray-500 block">Response Time</span>
                                        <span className="text-sm text-gray-700 font-semibold">
                                            {testResult?.executionTimeMs ? `${testResult.executionTimeMs}ms` : '-'}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const PromptTestingPage = () => {
    // State
    const [searchQuery, setSearchQuery] = useState('');
    const [executedSearchQuery, setExecutedSearchQuery] = useState('');
    const [searchType, setSearchType] = useState<'keyword' | 'semantic'>('keyword');
    const [showSearchDropdown, setShowSearchDropdown] = useState(false);

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

    const { data: collectionPromptsData, isLoading: isCollectionPromptsLoading } = useFilterPrompts(
        { title: '', page: 0, size: 20 },
        { enabled: !!expandedCollection }
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
        setShowSearchDropdown(true);
        if (searchType === 'semantic') {
            performSemanticSearch({ query: searchQuery, limit: 10 });
        }
    };

    const handleSelectPrompt = (prompt: PromptDisplay) => {
        if (activePromptSlot === 'A') {
            setSelectedPromptIdA(prompt.id);
        } else if (activePromptSlot === 'B') {
            setSelectedPromptIdB(prompt.id);
        } else {
            if (!selectedPromptIdA) setSelectedPromptIdA(prompt.id);
            else if (!selectedPromptIdB) setSelectedPromptIdB(prompt.id);
            else setSelectedPromptIdA(prompt.id);
        }
        setShowSearchDropdown(false);
        setActivePromptSlot(null);
    };

    const handleTest = async (slot: 'A' | 'B') => {
        const prompt = slot === 'A' ? promptA?.data : promptB?.data;
        const model = slot === 'A' ? modelA : modelB;
        const setResponse = slot === 'A' ? setTestResponseA : setTestResponseB;
        const setError = slot === 'A' ? setTestErrorA : setTestErrorB;
        const runTest = slot === 'A' ? runTestA : runTestB;
        const setIsPolling = slot === 'A' ? setIsPollingA : setIsPollingB;

        if (!prompt) return;

        setError(null);
        setResponse(null);

        const inputText = prompt.inputExample || "Default test input";

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
                if (!data.data) {
                    setError('No data received from server');
                    return;
                }

                if (data.data.status === 'PENDING' || data.data.status === 'PROCESSING') {
                    setIsPolling(true);
                    // Start polling
                    const poll = async () => {
                        try {
                            if (!data.data) return;
                            const result = await promptsService.getTestUsage(data.data.id);

                            if (!result.data) {
                                setTimeout(poll, 2000);
                                return;
                            }

                            if (result.data.status === 'COMPLETED') {
                                setResponse(result.data);
                                setIsPolling(false);
                            } else if (result.data.status === 'FAILED') {
                                setError(result.data.errorMessage || 'Test failed during processing');
                                setIsPolling(false);
                            } else {
                                // Continue polling
                                setTimeout(poll, 2000);
                            }
                        } catch (err) {
                            setError('Failed to poll test results');
                            setIsPolling(false);
                        }
                    };
                    poll();
                } else {
                    setResponse(data.data);
                }
            },
            onError: (error: any) => {
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

    return (
        <div className="min-h-screen bg-gray-50 p-8 font-sans text-gray-800">
            <div className="max-w-7xl mx-auto">
                <Toaster position="top-right" />

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                        <Sparkles className="w-8 h-8 text-blue-500 mr-3" />
                        Prompt Testing & Comparison
                    </h1>
                    <p className="text-gray-600 mt-2 ml-11">
                        Test your prompts with different models and settings to find the best results for your students.
                    </p>
                </div>

                {/* Search Section */}
                <div className="relative mb-6">
                    <div className="flex gap-2 relative">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleSearch();
                                    }
                                }}
                                onFocus={() => {
                                    if (executedSearchQuery.length > 0 || activePromptSlot) {
                                        setShowSearchDropdown(true);
                                    }
                                }}
                                placeholder="Search your prompts by title, description, or tags..."
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-400"
                            />

                            {/* Search Dropdown */}
                            {showSearchDropdown && (
                                <>
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => {
                                            setShowSearchDropdown(false);
                                            setActivePromptSlot(null);
                                            setExpandedCollection(null);
                                        }}
                                    />
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 max-h-[32rem] overflow-y-auto z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                        {/* My Prompts Section */}
                                        <div className="p-2">
                                            <div className="text-xs font-semibold text-gray-500 px-3 py-2 uppercase tracking-wide flex items-center">
                                                <BookOpen className="w-4 h-4 mr-2" />
                                                My Prompts
                                            </div>
                                            {isLoading ? (
                                                <div className="p-4 text-center text-gray-500 text-sm">Searching...</div>
                                            ) : displayResults.length > 0 ? (
                                                displayResults.map(prompt => (
                                                    <button
                                                        key={prompt.id}
                                                        onClick={() => handleSelectPrompt(prompt)}
                                                        className="w-full text-left px-3 py-3 hover:bg-blue-50 rounded-lg transition-all duration-200 flex items-center justify-between group"
                                                    >
                                                        <div className="flex-1">
                                                            <div className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{prompt.title}</div>
                                                            <div className="text-xs text-gray-500 mt-1">{prompt.category}</div>
                                                        </div>
                                                        <div className="flex items-center space-x-1 text-amber-500">
                                                            <Star className="w-4 h-4 fill-current" />
                                                            <span className="text-xs font-medium">{prompt.rating}</span>
                                                        </div>
                                                    </button>
                                                ))
                                            ) : (
                                                executedSearchQuery.length > 0 && <div className="p-4 text-center text-gray-500 text-sm">No results found</div>
                                            )}
                                        </div>

                                        {/* Collections Section */}
                                        <div className="border-t border-gray-200 p-2">
                                            <div className="text-xs font-semibold text-gray-500 px-3 py-2 uppercase tracking-wide flex items-center">
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                                </svg>
                                                My Collections
                                            </div>
                                            {collections.length > 0 ? (
                                                collections.map(collection => (
                                                    <div key={collection.id}>
                                                        <button
                                                            onClick={() => setExpandedCollection(expandedCollection === collection.id ? null : collection.id)}
                                                            className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg transition-all duration-200 flex items-center justify-between group"
                                                        >
                                                            <div className="flex items-center space-x-2">
                                                                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${expandedCollection === collection.id ? 'rotate-180' : ''}`} />
                                                                <span className="font-medium text-gray-700 group-hover:text-gray-900">{collection.name}</span>
                                                            </div>
                                                        </button>
                                                        {expandedCollection === collection.id && (
                                                            <div className="ml-6 space-y-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                                                {isCollectionPromptsLoading ? (
                                                                    <div className="px-3 py-2 text-xs text-gray-400">Loading prompts...</div>
                                                                ) : collectionPromptsData?.data?.content && collectionPromptsData.data.content.length > 0 ? (
                                                                    collectionPromptsData.data.content.map(prompt => (
                                                                        <button
                                                                            key={`${collection.id}-${prompt.id}`}
                                                                            onClick={() => handleSelectPrompt({
                                                                                id: prompt.id,
                                                                                title: prompt.title,
                                                                                category: prompt.collectionName || 'General',
                                                                                rating: prompt.averageRating || 0,
                                                                                description: prompt.description
                                                                            })}
                                                                            className="w-full text-left px-3 py-2 hover:bg-blue-50 rounded-lg transition-all duration-200 text-sm text-gray-600 hover:text-blue-600"
                                                                        >
                                                                            {prompt.title}
                                                                        </button>
                                                                    ))
                                                                ) : (
                                                                    <div className="px-3 py-2 text-xs text-gray-400">No prompts in this collection</div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="p-4 text-center text-gray-500 text-sm">No collections found</div>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                        <button
                            onClick={handleSearch}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm hover:shadow-md h-[50px]"
                        >
                            Search
                        </button>
                    </div>

                    <div className="mt-3 flex justify-between items-center">
                        <div className="flex bg-gray-100 rounded-lg p-1">
                            <button
                                onClick={() => setSearchType('keyword')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${searchType === 'keyword'
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                Keyword
                            </button>
                            <button
                                onClick={() => setSearchType('semantic')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center space-x-1 ${searchType === 'semantic'
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                <Sparkles className="w-4 h-4" />
                                <span>Semantic</span>
                            </button>
                        </div>
                    </div>

                    {searchType === 'semantic' && (
                        <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start space-x-2 animate-in fade-in slide-in-from-top-1 duration-200">
                            <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-blue-700">
                                Semantic search finds prompts based on meaning, not just exact words. Try: &#34;help students understand complex science topics&#34;
                            </p>
                        </div>
                    )}
                </div>

                {/* Global Settings Panel */}
                {showSettings && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                            </svg>
                            Test Settings
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <div className="flex items-center mb-2">
                                    <label className="text-sm font-medium text-gray-700">Temperature</label>
                                    <InfoTooltip text="Controls randomness. Lower (0.1-0.3) = more focused and deterministic. Higher (0.7-1.0) = more creative and varied. Good starting point: 0.7" />
                                </div>
                                <div className="space-y-2">
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.1"
                                        value={temperature}
                                        onChange={(e) => setTemperature(parseFloat(e.target.value))}
                                        className="w-full accent-blue-500"
                                    />
                                    <div className="flex justify-between text-xs text-gray-500">
                                        <span>Focused</span>
                                        <span className="font-medium text-gray-900 bg-gray-100 px-2 py-0.5 rounded">{temperature.toFixed(1)}</span>
                                        <span>Creative</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center mb-2">
                                    <label className="text-sm font-medium text-gray-700">Top P</label>
                                    <InfoTooltip text="Controls diversity of word choices. Lower (0.1-0.5) = more predictable. Higher (0.9-1.0) = more diverse vocabulary. Recommended: 0.9" />
                                </div>
                                <div className="space-y-2">
                                    <input
                                        type="range"
                                        min="0.1"
                                        max="1"
                                        step="0.1"
                                        value={topP}
                                        onChange={(e) => setTopP(parseFloat(e.target.value))}
                                        className="w-full accent-blue-500"
                                    />
                                    <div className="flex justify-between text-xs text-gray-500">
                                        <span>Narrow</span>
                                        <span className="font-medium text-gray-900 bg-gray-100 px-2 py-0.5 rounded">{topP.toFixed(1)}</span>
                                        <span>Diverse</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center mb-2">
                                    <label className="text-sm font-medium text-gray-700">Max Tokens</label>
                                    <InfoTooltip text="Maximum length of response. ~4 characters = 1 token. 500 tokens ≈ 375 words. Adjust based on expected response length." />
                                </div>
                                <input
                                    type="number"
                                    value={maxTokens}
                                    onChange={(e) => setMaxTokens(Math.max(100, Math.min(8192, parseInt(e.target.value) || 2048)))}
                                    min="100"
                                    max="8192"
                                    step="100"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all duration-200 hover:border-blue-400"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Side-by-Side Comparison */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <div className="h-full">
                        <PromptCard
                            slot="A"
                            prompt={promptA?.data || null}
                            onClear={() => {
                                setSelectedPromptIdA(null);
                                setTestResponseA(null);
                                setTestErrorA(null);
                            }}
                            onSelect={() => {
                                setActivePromptSlot('A');
                                setShowSearchDropdown(true);
                            }}
                            model={modelA}
                            onModelChange={setModelA}
                            onTest={() => handleTest('A')}
                            isTesting={isTestingA || isPollingA}
                            testResult={testResponseA}
                            testError={testErrorA}
                        />
                    </div>
                    <div className="h-full">
                        <PromptCard
                            slot="B"
                            prompt={promptB?.data || null}
                            onClear={() => {
                                setSelectedPromptIdB(null);
                                setTestResponseB(null);
                                setTestErrorB(null);
                            }}
                            onSelect={() => {
                                setActivePromptSlot('B');
                                setShowSearchDropdown(true);
                            }}
                            model={modelB}
                            onModelChange={setModelB}
                            onTest={() => handleTest('B')}
                            isTesting={isTestingB || isPollingB}
                            testResult={testResponseB}
                            testError={testErrorB}
                        />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => {
                                    handleTest('A');
                                    handleTest('B');
                                }}
                                disabled={isTestingA || isPollingA || isTestingB || isPollingB || (!selectedPromptIdA && !selectedPromptIdB)}
                                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 font-medium flex items-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {isTestingA || isPollingA || isTestingB || isPollingB ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                )}
                                <span>Run Both Tests</span>
                            </button>
                        </div>

                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <GitCompare className="w-4 h-4" />
                            <span>Compare performance metrics</span>
                        </div>
                    </div>

                    {/* Performance Comparison */}
                    <div className="pt-6 border-t border-gray-200">
                        <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
                            <TrendingUp className="w-4 h-4 mr-2 text-blue-500" />
                            Performance Comparison
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 text-center hover:shadow-md transition-all duration-200 border border-blue-200">
                                <div className="text-2xl font-bold text-blue-600">-</div>
                                <div className="text-xs text-gray-600 mt-1 font-medium">Avg Response Time</div>
                            </div>
                            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 text-center hover:shadow-md transition-all duration-200 border border-purple-200">
                                <div className="text-2xl font-bold text-purple-600">-</div>
                                <div className="text-xs text-gray-600 mt-1 font-medium">Avg Token Usage</div>
                            </div>
                            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-4 text-center hover:shadow-md transition-all duration-200 border border-emerald-200">
                                <div className="text-2xl font-bold text-emerald-600">-</div>
                                <div className="text-xs text-gray-600 mt-1 font-medium">Quality Score</div>
                            </div>
                            <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-4 text-center hover:shadow-md transition-all duration-200 border border-amber-200">
                                <div className="text-2xl font-bold text-amber-600">-</div>
                                <div className="text-xs text-gray-600 mt-1 font-medium">Cost Efficiency</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tips Section */}
                <div className="mt-6 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 rounded-xl border border-amber-200 p-6 hover:shadow-md transition-all duration-300">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                        <svg className="w-5 h-5 text-amber-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        Testing Tips for Teachers
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-start space-x-3 bg-white/50 backdrop-blur-sm rounded-lg p-3 hover:bg-white/80 transition-all duration-200">
                            <div className="w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
                            <p className="text-sm text-gray-700">Start with lower temperature (0.3-0.5) for factual subjects like math and science</p>
                        </div>
                        <div className="flex items-start space-x-3 bg-white/50 backdrop-blur-sm rounded-lg p-3 hover:bg-white/80 transition-all duration-200">
                            <div className="w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
                            <p className="text-sm text-gray-700">Use higher temperature (0.7-0.9) for creative writing and open-ended questions</p>
                        </div>
                        <div className="flex items-start space-x-3 bg-white/50 backdrop-blur-sm rounded-lg p-3 hover:bg-white/80 transition-all duration-200">
                            <div className="w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
                            <p className="text-sm text-gray-700">Test with multiple student input examples to ensure consistent quality</p>
                        </div>
                        <div className="flex items-start space-x-3 bg-white/50 backdrop-blur-sm rounded-lg p-3 hover:bg-white/80 transition-all duration-200">
                            <div className="w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">4</div>
                            <p className="text-sm text-gray-700">Compare different models to find the best balance of speed and quality</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PromptTestingPage;