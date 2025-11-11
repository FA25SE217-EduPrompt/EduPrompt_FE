'use client';

import {useEffect, useState} from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import {useCreateTagsBatch} from '@/hooks/queries/tag';
import {
    useCreatePrompt,
    useCreatePromptWithCollection,
    useGetOptimizationStatus,
    useGetTestUsage,
    useRequestOptimization,
    useRunPromptTest
} from '@/hooks/queries/prompt';

import type {
    OptimizationQueueEntry,
    PromptAiModel,
    PromptCreateRequest,
    PromptCreateWithCollectionRequest,
    PromptFormModel,
    PromptTestResponse,
    UploadedFile as PromptUploadedFile,
} from '@/types/prompt.api';
import {useCreateCollection, useGetMyCollections} from "@/hooks/queries/collection";
import {CreateCollectionRequest} from "@/types/collection.api";
import {ApplySuggestion} from "@/components/ui/ApplySuggestion";
import {SkeletonLoader} from "@/components/ui/SkeletonLoader";
import {toast, Toaster} from "sonner";
import {CopyButton} from "@/components/ui/CopyButtonProps";
import {PulsingDotsLoader} from "@/components/ui/PulsingDotsLoaderProps";

interface Template {
    title: string;
    instruction: string;
    context: string;
    inputExample: string;
    outputFormat: string;
    constraints: string;
}

type LocalUploadedFile = PromptUploadedFile & { file?: File };

const TEMPLATES: Record<string, Template> = {
    essay: {
        title: 'Essay Writing Assistant',
        instruction:
            'Help students write well-structured academic essays with clear thesis statements, supporting arguments, and proper conclusions.',
        context: 'Academic writing context with focus on critical thinking and argumentation.',
        inputExample: 'Topic: Climate change effects on agriculture',
        outputFormat: 'Structured essay with introduction, body paragraphs, and conclusion',
        constraints: 'Minimum 500 words, academic tone, cite sources when applicable',
    },
    math: {
        title: 'Math Problem Solver',
        instruction: 'Provide step-by-step solutions to mathematical problems, explaining each step clearly.',
        context: 'Educational mathematics with focus on understanding concepts.',
        inputExample: 'Solve: 2x + 5 = 13',
        outputFormat: 'Step-by-step solution with explanations',
        constraints: 'Show all work, explain reasoning for each step',
    },
    code: {
        title: 'Code Review Assistant',
        instruction: 'Review code for best practices, bugs, and improvements. Provide constructive feedback.',
        context: 'Programming education and code quality improvement.',
        inputExample: 'function calculateSum(a, b) { return a + b; }',
        outputFormat: 'Detailed review with suggestions and improved code',
        constraints: 'Focus on readability, efficiency, and best practices',
    },
    language: {
        title: 'Language Practice Conversation',
        instruction: 'Engage in natural conversation to help students practice language skills.',
        context: 'Language learning environment with supportive feedback.',
        inputExample: 'Student response in target language',
        outputFormat: 'Natural conversation with gentle corrections',
        constraints: 'Appropriate difficulty level, encouraging tone',
    },
    creative: {
        title: 'Creative Writing Assistant',
        instruction: 'Help students develop creative writing skills through engaging prompts and feedback.',
        context: 'Creative writing education with focus on imagination and storytelling.',
        inputExample: 'Write a short story about a time traveler',
        outputFormat: 'Creative narrative with character development',
        constraints: 'Encourage creativity, provide constructive feedback',
    },
    science: {
        title: 'Science Explanation Assistant',
        instruction: 'Explain scientific concepts in clear, accessible language for students.',
        context: 'Science education with focus on understanding complex concepts.',
        inputExample: 'Explain photosynthesis in simple terms',
        outputFormat: 'Clear explanation with examples and analogies',
        constraints: 'Use appropriate terminology, include visual descriptions',
    },
    history: {
        title: 'History Analysis Assistant',
        instruction: 'Help students analyze historical events and their significance.',
        context: 'History education with focus on critical analysis and context.',
        inputExample: 'Analyze the causes of World War I',
        outputFormat: 'Structured analysis with multiple perspectives',
        constraints: 'Cite historical evidence, consider different viewpoints',
    },
    business: {
        title: 'Business Case Study Assistant',
        instruction: 'Guide students through business problem analysis and solution development.',
        context: 'Business education with focus on practical problem-solving.',
        inputExample: "Analyze a company's declining sales",
        outputFormat: 'Comprehensive business analysis with recommendations',
        constraints: 'Use business frameworks, provide actionable insights',
    },
};

const MODEL_OPTIONS: { label: string; value: PromptAiModel }[] = [
    {label: 'GPT-4o mini', value: 'GPT_4O_MINI'},
    {label: 'Claude 3.5 Sonnet', value: 'CLAUDE_3_5_SONNET'},
    {label: 'Gemini 2.5 Flash', value: 'GEMINI_2_5_FLASH'},
];

const COLLECTION_NONE = '_NONE_';
const COLLECTION_AUTO = '_AUTO_';
const COLLECTION_NEW = '_NEW_';

export type OptimizedPromptFields = {
    title?: string;
    description?: string;
    instruction?: string;
    context?: string;
    inputExample?: string;
    outputFormat?: string;
    constraints?: string;
    tags?: string;
};

const fieldMap: Record<string, keyof OptimizedPromptFields> = {
    'Title': 'title',
    'Description': 'description',
    'Instruction': 'instruction',
    'Context': 'context',
    'Input Example': 'inputExample',
    'Output Format': 'outputFormat',
    'Constraints': 'constraints',
    'Tags': 'tags',
};

function parseOptimizationOutput(rawOutput: string): OptimizedPromptFields {
    const suggestions: OptimizedPromptFields = {};
    const regex = /\*\*(.*?):\*\*\s*([\s\S]*?)(?=\n\n\*\*|$)/g;
    let match;
    while ((match = regex.exec(rawOutput)) !== null) {
        const apiLabel = match[1].trim();
        const content = match[2].trim();
        const stateKey = fieldMap[apiLabel];
        if (stateKey && content) {
            suggestions[stateKey] = content;
        }
    }
    return suggestions;
}


export default function CreatePromptPage() {
    const [form, setForm] = useState<PromptFormModel & { id?: string }>({
        id: undefined,
        title: '',
        description: '',
        instruction: '',
        context: '',
        inputExample: '',
        outputFormat: '',
        constraints: '',
        visibility: 'private',
        collection: '',
        tags: [],
        attachments: [],
    });
    const [tagType, setTagType] = useState('category');
    const [tagValue, setTagValue] = useState('');
    const [localFiles, setLocalFiles] = useState<LocalUploadedFile[]>([]);
    const [showTestModal, setShowTestModal] = useState(false);
    const [model, setModel] = useState<PromptAiModel>('GPT_4O_MINI');
    const [temperature, setTemperature] = useState(0.4);
    const [maxTokens, setMaxTokens] = useState(8126);


    const [testResponse, setTestResponse] = useState<PromptTestResponse | null>(null);
    const [testError, setTestError] = useState<string | null>(null);
    const [pollingUsageId, setPollingUsageId] = useState<string | null>(null);

    const [optimizationQueue, setOptimizationQueue] = useState<OptimizationQueueEntry | null>(null);
    const [optimizationError, setOptimizationError] = useState<string | null>(null);
    const [pollingOptimizeId, setPollingOptimizeId] = useState<string | null>(null);
    const [optimizedSuggestions, setOptimizedSuggestions] = useState<OptimizedPromptFields | null>(null);

    const [customCollectionName, setCustomCollectionName] = useState('');

    // Mutation hooks
    const {mutateAsync: createTagsBatch, isPending: isSavingTags} = useCreateTagsBatch();
    const {mutateAsync: createPromptMutation, isPending: isSavingStandalone} = useCreatePrompt();
    const {
        mutateAsync: createPromptWithCollectionMutation,
        isPending: isSavingToCollection
    } = useCreatePromptWithCollection();
    const {mutateAsync: createCollectionMutation, isPending: isCreatingCollection} = useCreateCollection();
    const {mutateAsync: runTestMutation, isPending: isSubmittingTest} = useRunPromptTest();
    const {mutateAsync: requestOptimizationMutation, isPending: isSubmittingOptimize} = useRequestOptimization();

    const {data: myCollections, isLoading: isLoadingCollections} =
        useGetMyCollections(0, 20);

    const isSaving =
        isSavingTags ||
        isSavingStandalone ||
        isSavingToCollection ||
        isCreatingCollection;

    const {data: pollingResult, isLoading: isPollingTest} = useGetTestUsage(
        pollingUsageId!,
        undefined,
        {
            enabled: !!pollingUsageId && showTestModal,
            refetchInterval: (query) => {
                const data = query.state.data;
                if (!data || !data.data) {
                    return 2000;
                }
                const status = data.data.status;
                if (status === 'COMPLETED' || status === 'FAILED') {
                    return false;
                }
                return 2000;
            },
            refetchOnWindowFocus: false,
        }
    );

    const isTesting = isSubmittingTest || isPollingTest;

    const {data: pollingOptimizeResult, isLoading: isPollingOptimize} = useGetOptimizationStatus(
        pollingOptimizeId!,
        undefined,
        {
            enabled: !!pollingOptimizeId,
            refetchInterval: (query) => {
                const data = query.state.data;
                if (!data || !data.data) return 3000;
                const status = data.data.status;
                if (status === 'COMPLETED' || status === 'FAILED') {
                    return false;
                }
                return 3000;
            },
            refetchOnWindowFocus: false,
        }
    );

    const isOptimizing = isSubmittingOptimize || isPollingOptimize;

    useEffect(() => {
        if (!pollingOptimizeResult || !pollingOptimizeResult.data) return;

        const queueEntry = pollingOptimizeResult.data;
        const {status, errorMessage, output} = queueEntry;

        setOptimizationQueue(queueEntry);

        if (status === 'COMPLETED' && output) {
            console.log("Polling: Optimization COMPLETED");
            const parsedSuggestions = parseOptimizationOutput(output);
            setOptimizedSuggestions(parsedSuggestions);
            setOptimizationError(null);
            setPollingOptimizeId(null);
            toast.success('Optimization complete - review suggestions below');
        } else if (status === 'COMPLETED') {
            console.log("Polling: Optimization COMPLETED but no output received.");
            setOptimizedSuggestions(null);
            setOptimizationError(null);
            setPollingOptimizeId(null);
        } else if (status === 'FAILED') {
            console.error("Polling: Optimization FAILED");
            setOptimizationError(errorMessage || "Optimization failed.");
            setOptimizedSuggestions(null);
            setPollingOptimizeId(null);
            toast.error(errorMessage || "Optimization failed.");
        }
    }, [pollingOptimizeResult]);

    useEffect(() => {
        if (!pollingResult || !pollingResult.data) return;

        const {status, errorMessage} = pollingResult.data;

        if (status === 'COMPLETED') {
            console.log("Polling: Test COMPLETED");
            setTestResponse(pollingResult.data);
            setTestError(null);
            setPollingUsageId(null);
            toast.success('Test completed successfully'); // <-- ADDED
        }

        if (status === 'FAILED') {
            console.error("Polling: Test FAILED");
            setTestError(errorMessage || "Test failed during processing.");
            setTestResponse(null);
            setPollingUsageId(null);
            toast.error(errorMessage || "Test failed."); // Added error toast
        }
    }, [pollingResult]);

    const handleFieldChange = <K extends keyof (PromptFormModel & { id?: string })>(
        field: K,
        value: (PromptFormModel & { id?: string })[K]
    ) => {
        setForm(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    const addTag = () => {
        const trimmed = tagValue.trim();
        if (!trimmed) return;
        let didAdd = false;
        setForm(prev => {
            const exists = prev.tags.some(tag => tag.type === tagType && tag.value.toLowerCase() === trimmed.toLowerCase());
            if (exists) {
                return prev;
            }
            didAdd = true;
            return {
                ...prev,
                tags: [...prev.tags, {type: tagType, value: trimmed}],
            };
        });
        if (!didAdd) return;
        setTagValue('');
    };

    const removeTag = (index: number) => {
        setForm(prev => ({
            ...prev,
            tags: prev.tags.filter((_, i) => i !== index),
        }));
    };

    const handleFileUpload = (files: FileList) => {
        const additions: LocalUploadedFile[] = [];
        Array.from(files).forEach(file => {
            if (file.size > 10 * 1024 * 1024) {
                toast.error('File size must be less than 10MB'); // Use toast
                return;
            }
            const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${file.name}`;
            additions.push({
                id,
                name: file.name,
                size: file.size,
                mimeType: file.type || 'application/octet-stream',
                file,
            });
        });
        if (!additions.length) return;
        setLocalFiles(prev => [...prev, ...additions]);
        const normalizedAttachments = additions.map(({file, ...rest}) => rest as PromptUploadedFile);
        setForm(prev => ({
            ...prev,
            attachments: [...prev.attachments, ...normalizedAttachments],
        }));
    };

    const removeFile = (id: string) => {
        setLocalFiles(prev => prev.filter(file => file.id !== id));
        setForm(prev => ({
            ...prev,
            attachments: prev.attachments.filter(file => file.id !== id),
        }));
    };

    const applyTemplate = (templateType: string) => {
        const template = TEMPLATES[templateType];
        if (!template) return;

        setForm(prev => ({
            ...prev,
            title: template.title,
            instruction: template.instruction,
            context: template.context,
            inputExample: template.inputExample,
            outputFormat: template.outputFormat,
            constraints: template.constraints,
        }));

        toast.success(`Template "${template.title}" applied`); // <-- ADDED
    };

    const generatePromptReview = () => {
        const review: string[] = [];
        if (form.title) review.push(`**Title:**\n${form.title}`);
        if (form.description) review.push(`**Description:**\n${form.description}`);
        if (form.instruction) review.push(`**Instruction:**\n${form.instruction}`);
        if (form.context) review.push(`**Context:**\n${form.context}`);
        if (form.inputExample) review.push(`**Input Example:**\n${form.inputExample}`);
        if (form.outputFormat) review.push(`**Output Format:**\n${form.outputFormat}`);
        if (form.constraints) review.push(`**Constraints:**\n${form.constraints}`);
        if (form.tags.length) {
            const tagsSummary = form.tags.map(tag => `${tag.type}: ${tag.value}`).join(', ');
            review.push(`**Tags:**\n${tagsSummary}`);
        }
        return review.join('\n\n');
    };

    const buildOptimizationInput = () => {
        const review = generatePromptReview();
        if (!review) {
            return 'Optimize this prompt for clarity, engagement, and educational effectiveness.';
        }
        return `Optimize the following prompt for clarity, engagement, and educational effectiveness. Preserve intent but suggest improvements where helpful.\n\n${review}`;
    };

    const sanitizeForm = (): PromptFormModel & { id?: string } => {
        const sanitize = (value?: string) => {
            const trimmed = value?.trim();
            return trimmed ? trimmed : undefined;
        };
        return {
            ...form,
            description: sanitize(form.description),
            context: sanitize(form.context),
            inputExample: sanitize(form.inputExample),
            outputFormat: sanitize(form.outputFormat),
            constraints: sanitize(form.constraints),
            collection: sanitize(form.collection),
        };
    };

    const savePrompt = async (): Promise<string | undefined> => {
        if (!form.title.trim()) {
            toast.error('Title is required');
            return;
        }

        if (form.instruction.trim().length < 20) {
            toast.error('Instruction must be at least 20 characters long.');
            return;
        }

        if (form.collection === COLLECTION_NEW && !customCollectionName.trim()) {
            toast.error('Please enter a name for your new collection.');
            return;
        }

        try {
            const sanitizedForm = sanitizeForm();
            const {tags, attachments, id, collection, ...restOfForm} = sanitizedForm;

            //create tags
            let tagIds: string[] = [];
            if (sanitizedForm.tags.length > 0) {
                const tagResult = await createTagsBatch({tags: sanitizedForm.tags});
                if (tagResult.error || !tagResult.data) {
                    toast.error(tagResult.error?.messages.join(', ') || 'Failed to create tags.');
                    return undefined;
                }
                tagIds = tagResult.data.map((tag) => tag.id);
            }

            const collectionChoice = collection;
            let promptResult;
            let finalCollectionId: string | null = '';

            // standalone prompt
            if (!collectionChoice || collectionChoice === COLLECTION_NONE) {
                const payload: PromptCreateRequest = {
                    ...restOfForm,
                    tagIds: tagIds,
                };
                promptResult = await createPromptMutation({payload});
            } else {
                // user choose to create collection, either auto or custom
                if (collectionChoice === COLLECTION_AUTO || collectionChoice === COLLECTION_NEW) {
                    const collectionName =
                        collectionChoice === COLLECTION_AUTO
                            ? 'New Collection' // default name
                            : customCollectionName.trim();

                    const collectionPayload: CreateCollectionRequest = {
                        name: collectionName,
                        visibility: sanitizedForm.visibility,
                        tags: tagIds, // use the same tag as the prompt
                    };

                    const collectionResult = await createCollectionMutation({payload: collectionPayload});

                    if (collectionResult.error || !collectionResult.data) {
                        toast.error(collectionResult.error?.messages.join(', ') || 'Failed to create collection.');
                        return undefined;
                    }
                    finalCollectionId = collectionResult.data.id;

                } else {
                    // user choose to add prompt to their existed collections
                    if (collectionChoice != null) {
                        finalCollectionId = collectionChoice;
                    }
                }

                const payload: PromptCreateWithCollectionRequest = {
                    ...restOfForm,
                    tagIds: tagIds,
                    collectionId: finalCollectionId,
                };
                promptResult = await createPromptWithCollectionMutation({payload});
            }

            if (promptResult.error) {
                toast.error(promptResult.error.messages.join(', '));
                return undefined;
            }

            if (promptResult.data) {
                const saved = promptResult.data;
                setForm(prev => ({
                    ...prev,
                    id: saved.id,
                    title: saved.title,
                    description: saved.description ?? '',
                    instruction: saved.instruction,
                    context: saved.context ?? '',
                    inputExample: saved.inputExample ?? '',
                    outputFormat: saved.outputFormat ?? '',
                    constraints: saved.constraints ?? '',
                    visibility: saved.visibility,
                    collection: saved.collectionName ? saved.collectionName : COLLECTION_NONE,
                    tags: saved.tags ?? [],
                }));

                setForm(prev => ({
                    ...prev,
                    id: saved.id,
                    title: saved.title,
                    description: saved.description ?? '',
                    instruction: saved.instruction,
                    context: saved.context ?? '',
                    inputExample: saved.inputExample ?? '',
                    outputFormat: saved.outputFormat ?? '',
                    constraints: saved.constraints ?? '',
                    visibility: saved.visibility,
                    collection: promptResult?.data?.collectionName ? finalCollectionId : COLLECTION_NONE,
                    tags: saved.tags ?? [],
                }));

                if (collectionChoice === COLLECTION_NEW) {
                    setCustomCollectionName('');
                }

                toast.success('Prompt saved successfully.');
                return saved.id;
            }

            toast.error('Unexpected response from server.');
            return undefined;

        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to save prompt.');
            return undefined;
        }
    };

    const handleSave = async () => {
        await savePrompt();
    };

    const handleTest = async () => {
        console.log("handleTest: Starting test...");
        setTestError(null);
        setTestResponse(null);
        setPollingUsageId(null);

        let promptId = form.id;
        if (!promptId) {
            console.log("handleTest: No prompt ID. Saving...");
            promptId = await savePrompt();
            if (!promptId) {
                console.error("handleTest: Save failed.");
                toast.error('Please save the prompt before running a test.');
                return;
            }
        }

        try {
            const testPayload = {
                request: {
                    promptId,
                    aiModel: model,
                    inputText: form.inputExample,
                    temperature,
                    maxTokens,
                    topP: 0.8
                }
            };
            console.log("handleTest: Calling runTestMutation (POST /prompts/test)", testPayload);
            const result = await runTestMutation(testPayload);
            console.log("handleTest: Initial response:", result);
            if (result.error || !result.data) {
                console.error("handleTest: Initial POST failed", result.error);
                setTestError(result.error?.messages.join(', ') || "Failed to start test.");
                setTestResponse(null);
                return;
            }
            const testData = result.data;
            console.log(testData);
            if (testData.status === 'COMPLETED') {
                console.log("handleTest: Test was synchronous, COMPLETED immediately.");
                setTestResponse(testData);
                setTestError(null);
            } else if (testData.status === 'PENDING' || testData.status === 'PROCESSING') {
                console.log(`handleTest: Test is ${testData.status}. Starting polling with usageId: ${testData.id}`);
                setPollingUsageId(testData.id);
                setTestResponse(testData);
            } else if (testData.status === 'FAILED') {
                console.error("handleTest: Test FAILED immediately.", testData.errorMessage);
                setTestError(testData.errorMessage || "Test failed immediately.");
                setTestResponse(null);
            }
        } catch (error) {
            console.error("handleTest: A critical exception was caught:", error);
            setTestError(error instanceof Error ? error.message : 'Failed to run test.');
            setTestResponse(null);
        }
    };

    const handleOptimize = async () => {
        setOptimizationError(null);
        setOptimizationQueue(null);
        setPollingOptimizeId(null);

        let promptId = form.id;
        if (!promptId) {
            promptId = await savePrompt();
            if (!promptId) {
                toast.error('Please save the prompt before requesting optimization.');
                return;
            }
        }

        try {
            const optimizationPayload = {
                request: {
                    promptId,
                    aiModel: model,
                    optimizationInput: buildOptimizationInput(),
                    temperature,
                    maxTokens,
                }
            };
            console.log("handleOptimize: Calling requestOptimizationMutation", optimizationPayload);
            const result = await requestOptimizationMutation(optimizationPayload);
            console.log("handleOptimize: Initial response:", result);
            if (result.error || !result.data) {
                console.error("handleOptimize: Initial POST failed", result.error);
                setOptimizationError(result.error?.messages.join(', ') || 'Failed to start optimization.');
                setOptimizationQueue(null);
                return;
            }
            const queueEntry = result.data;
            setOptimizationQueue(queueEntry);
            if (queueEntry.status === 'PENDING' || queueEntry.status === 'PROCESSING') {
                console.log(`handleOptimize: Optimization is ${queueEntry.status}. Starting polling with queueId: ${queueEntry.id}`);
                setPollingOptimizeId(queueEntry.id);
            } else if (queueEntry.status === 'COMPLETED') {
                console.log("handleOptimize: Optimization was synchronous, COMPLETED immediately.");
                setOptimizationError(null);
            } else if (queueEntry.status === 'FAILED') {
                console.error("handleOptimize: Optimization FAILED immediately.", queueEntry.errorMessage);
                setOptimizationError(queueEntry.errorMessage || "Optimization failed immediately.");
            }
        } catch (error) {
            console.error("handleOptimize: A critical exception was caught:", error);
            setOptimizationError(error instanceof Error ? error.message : 'Failed to request optimization.');
            setOptimizationQueue(null);
        }
    };

    return (
        <ProtectedRoute>
            <Toaster position="top-right" richColors/>
            <div className="min-h-full bg-gradient-to-br from-blue-50 via-white to-indigo-50">
                {/* ... (Header) ... */}
                <header className="backdrop-blur-sm bg-white/90 border-b border-gray-200 sticky top-0 z-40">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <nav className="flex items-center space-x-2 text-sm">
                                <a href="#" className="text-gray-500 hover:text-gray-700">Dashboard</a>
                                <span className="text-gray-400">/</span>
                                <a href="#" className="text-gray-500 hover:text-gray-700">Prompts</a>
                                <span className="text-gray-400">/</span>
                                <span className="text-gray-900 font-medium">Create New</span>
                            </nav>
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-3">
                                    <img
                                        src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Ccircle cx='16' cy='16' r='16' fill='%233b82f6'/%3E%3Ctext x='16' y='21' text-anchor='middle' fill='white' font-family='Arial' font-size='14' font-weight='bold'%3EJS%3C/text%3E%3C/svg%3E"
                                        alt="Teacher Avatar" className="w-8 h-8 rounded-full"/>
                                    <span className="text-sm font-medium text-gray-700">Lord Tri Nguyen</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        {isSaving ? 'Saving...' : 'Save Draft'}
                                    </button>
                                    <button
                                        onClick={() => setShowTestModal(true)}
                                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        Run Test
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        <main className="lg:col-span-3">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Prompt</h1>
                                <form className="space-y-6" onSubmit={(event) => event.preventDefault()}>
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                                                Title *
                                            </label>
                                            <CopyButton text={form.title} label="Title"/>
                                        </div>
                                        <ApplySuggestion
                                            suggestion={optimizedSuggestions?.title}
                                            onApply={() => {
                                                if (optimizedSuggestions?.title) {
                                                    handleFieldChange('title', optimizedSuggestions.title);
                                                    setOptimizedSuggestions(s => ({...s, title: undefined}));
                                                }
                                            }}
                                        />
                                        <input
                                            type="text"
                                            id="title"
                                            value={form.title}
                                            onChange={(e) => handleFieldChange('title', e.target.value)}
                                            maxLength={255}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-400 hover:shadow-sm transition-all duration-200"
                                            placeholder="Enter prompt title"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Maximum 255 characters</p>
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label htmlFor="description"
                                                   className="block text-sm font-medium text-gray-700">
                                                Description
                                            </label>
                                            <CopyButton text={form.description || ''} label="Description"/>
                                        </div>
                                        <ApplySuggestion
                                            suggestion={optimizedSuggestions?.description}
                                            onApply={() => {
                                                if (optimizedSuggestions?.description) {
                                                    handleFieldChange('description', optimizedSuggestions.description);
                                                    setOptimizedSuggestions(s => ({...s, description: undefined}));
                                                }
                                            }}
                                        />
                                        <textarea
                                            id="description"
                                            value={form.description ?? ''}
                                            onChange={(e) => handleFieldChange('description', e.target.value)}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-400 hover:shadow-sm transition-all duration-200"
                                            placeholder="Brief description of what this prompt does"
                                        />
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label htmlFor="instruction"
                                                   className="block text-sm font-medium text-gray-700">
                                                Instruction *
                                            </label>
                                            <div className='flex items-center space-x-1'>
                                                <CopyButton text={form.instruction} label="Instruction"/>
                                                <button
                                                    type="button"
                                                    onClick={handleOptimize}
                                                    disabled={isOptimizing}
                                                    className="inline-flex items-center px-2 py-1 text-xs font-medium text-purple-600 bg-purple-50 rounded-md hover:bg-purple-100 border border-purple-200 disabled:opacity-50"
                                                >
                                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor"
                                                         viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round"
                                                              strokeWidth="2"
                                                              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                                                    </svg>
                                                    {isOptimizing ? 'Analyzing...' : 'Optimize'}
                                                </button>
                                            </div>
                                        </div>
                                        <ApplySuggestion
                                            suggestion={optimizedSuggestions?.instruction}
                                            onApply={() => {
                                                if (optimizedSuggestions?.instruction) {
                                                    handleFieldChange('instruction', optimizedSuggestions.instruction);
                                                    setOptimizedSuggestions(s => ({...s, instruction: undefined}));
                                                }
                                            }}
                                        />
                                        <textarea
                                            id="instruction"
                                            value={form.instruction}
                                            onChange={(e) => handleFieldChange('instruction', e.target.value)}
                                            rows={4}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-400 hover:shadow-sm transition-all duration-200"
                                            placeholder="Detailed instructions for the AI model"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Minimum 20 characters required</p>
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label htmlFor="context"
                                                   className="block text-sm font-medium text-gray-700">
                                                Context
                                            </label>
                                            <CopyButton text={form.context || ''} label="Context"/>
                                        </div>
                                        <ApplySuggestion
                                            suggestion={optimizedSuggestions?.context}
                                            onApply={() => {
                                                if (optimizedSuggestions?.context) {
                                                    handleFieldChange('context', optimizedSuggestions.context);
                                                    setOptimizedSuggestions(s => ({...s, context: undefined}));
                                                }
                                            }}
                                        />
                                        <textarea
                                            id="context"
                                            value={form.context ?? ''}
                                            onChange={(e) => handleFieldChange('context', e.target.value)}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-400 hover:shadow-sm transition-all duration-200"
                                            placeholder="Additional context or background information"
                                        />
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label htmlFor="inputExample"
                                                   className="block text-sm font-medium text-gray-700">
                                                Input Example
                                            </label>
                                            <CopyButton text={form.inputExample || ''} label="Input Example"/>
                                        </div>
                                        <ApplySuggestion
                                            suggestion={optimizedSuggestions?.inputExample}
                                            onApply={() => {
                                                if (optimizedSuggestions?.inputExample) {
                                                    handleFieldChange('inputExample', optimizedSuggestions.inputExample);
                                                    setOptimizedSuggestions(s => ({...s, inputExample: undefined}));
                                                }
                                            }}
                                        />
                                        <textarea
                                            id="inputExample"
                                            value={form.inputExample ?? ''}
                                            onChange={(e) => handleFieldChange('inputExample', e.target.value)}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-400 hover:shadow-sm transition-all duration-200"
                                            placeholder="Example of expected input"
                                        />
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label htmlFor="outputFormat"
                                                   className="block text-sm font-medium text-gray-700">
                                                Output Format
                                            </label>
                                            <CopyButton text={form.outputFormat || ''} label="Output Format"/>
                                        </div>
                                        <ApplySuggestion
                                            suggestion={optimizedSuggestions?.outputFormat}
                                            onApply={() => {
                                                if (optimizedSuggestions?.outputFormat) {
                                                    handleFieldChange('outputFormat', optimizedSuggestions.outputFormat);
                                                    setOptimizedSuggestions(s => ({...s, outputFormat: undefined}));
                                                }
                                            }}
                                        />
                                        <textarea
                                            id="outputFormat"
                                            value={form.outputFormat ?? ''}
                                            onChange={(e) => handleFieldChange('outputFormat', e.target.value)}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-400 hover:shadow-sm transition-all duration-200"
                                            placeholder="Specify the desired output format"
                                        />
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label htmlFor="constraints"
                                                   className="block text-sm font-medium text-gray-700">
                                                Constraints
                                            </label>
                                            <CopyButton text={form.constraints || ''} label="Constraints"/>
                                        </div>
                                        <ApplySuggestion
                                            suggestion={optimizedSuggestions?.constraints}
                                            onApply={() => {
                                                if (optimizedSuggestions?.constraints) {
                                                    handleFieldChange('constraints', optimizedSuggestions.constraints);
                                                    setOptimizedSuggestions(s => ({...s, constraints: undefined}));
                                                }
                                            }}
                                        />
                                        <textarea
                                            id="constraints"
                                            value={form.constraints ?? ''}
                                            onChange={(e) => handleFieldChange('constraints', e.target.value)}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-400 hover:shadow-sm transition-all duration-200"
                                            placeholder="Any limitations or constraints"
                                        />
                                    </div>

                                    {/* ... (Tags) ... */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                                        <div className="space-y-3">
                                            <div className="flex flex-wrap gap-2 min-h-[2rem]">
                                                {form.tags.map((tag, index) => (
                                                    <span key={`${tag.type}-${tag.value}-${index}`}
                                                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        <span className="text-blue-600 mr-1">{tag.type}:</span>
                                                        {tag.value}
                                                        <button
                                                            type="button"
                                                            onClick={() => removeTag(index)}
                                                            className="ml-2 text-blue-600 hover:text-blue-800"
                                                        >
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor"
                                                                 viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round"
                                                                      strokeWidth="2"
                                                                      d="M6 18L18 6M6 6l12 12"></path>
                                                            </svg>
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                            <div className="flex space-x-2">
                                                <select
                                                    value={tagType}
                                                    onChange={(e) => setTagType(e.target.value)}
                                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-400 hover:shadow-sm transition-all duration-200"
                                                >
                                                    <option value="category">Category</option>
                                                    <option value="subject">Subject</option>
                                                    <option value="difficulty">Difficulty</option>
                                                    <option value="language">Language</option>
                                                    <option value="grade">Grade</option>
                                                    <option value="chapter">Chapter</option>
                                                </select>
                                                <input
                                                    type="text"
                                                    value={tagValue}
                                                    onChange={(e) => setTagValue(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            addTag();
                                                        }
                                                    }}
                                                    placeholder="Tag value"
                                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-400 hover:shadow-sm transition-all duration-200"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={addTag}
                                                    className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
                                                >
                                                    Add Tag
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* ... (Visibility & Collection) ... */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-3">Visibility &
                                            Collection</label>
                                        <div className="space-y-3">
                                            <div className="flex space-x-6">
                                                <label className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        name="visibility"
                                                        value="private"
                                                        checked={form.visibility === 'private'}
                                                        onChange={(e) => handleFieldChange('visibility', e.target.value as PromptFormModel['visibility'])}
                                                        className="text-blue-600 focus:ring-blue-500"
                                                    />
                                                    <span className="ml-2 text-sm text-gray-700">Private</span>
                                                </label>
                                                <label className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        name="visibility"
                                                        value="public"
                                                        checked={form.visibility === 'public'}
                                                        onChange={(e) => handleFieldChange('visibility', e.target.value as PromptFormModel['visibility'])}
                                                        className="text-blue-600 focus:ring-blue-500"
                                                    />
                                                    <span className="ml-2 text-sm text-gray-700">Public</span>
                                                </label>
                                            </div>
                                            <label htmlFor="collection-select" className="sr-only">Collection</label>
                                            <select
                                                id="collection-select"
                                                value={form.collection ?? COLLECTION_NONE}
                                                onChange={(e) => handleFieldChange('collection', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-400 hover:shadow-sm transition-all duration-200"
                                            >
                                                <option value={COLLECTION_NONE}>Do not add to collection</option>
                                                <option value={COLLECTION_AUTO}>Auto-create new collection</option>
                                                <option value={COLLECTION_NEW}>Create new collection...</option>
                                                {isLoadingCollections &&
                                                    <option disabled>Loading collections...</option>}
                                                {myCollections?.data?.content.map(coll => (
                                                    <option key={coll.id} value={coll.id}>
                                                        {coll.name}
                                                    </option>
                                                ))}
                                            </select>
                                            {form.collection === COLLECTION_NEW && (
                                                <div className="pl-2">
                                                    <label htmlFor="custom-collection-name"
                                                           className="block text-sm font-medium text-gray-700 mb-1">
                                                        New Collection Name
                                                    </label>
                                                    <input
                                                        type="text"
                                                        id="custom-collection-name"
                                                        value={customCollectionName}
                                                        onChange={(e) => setCustomCollectionName(e.target.value)}
                                                        placeholder="e.g., 'My Biology Prompts'"
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* ... (Attachments) ... */}
                                    <div>
                                        <label
                                            className="block text-sm font-medium text-gray-700 mb-2">Attachments</label>
                                        <div
                                            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                                            <input
                                                type="file"
                                                multiple
                                                accept=".pdf,.doc,.docx,.txt,.jpg,.png"
                                                onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                                                className="hidden"
                                                id="fileInput"
                                            />
                                            <label htmlFor="fileInput" className="cursor-pointer">
                                                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor"
                                                     fill="none" viewBox="0 0 48 48">
                                                    <path
                                                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                                        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                                <p className="mt-2 text-sm text-gray-600">Click to upload or drag and
                                                    drop</p>
                                                <p className="text-xs text-gray-500">PDF, DOC, TXT, JPG, PNG up to
                                                    10MB</p>
                                            </label>
                                        </div>
                                        <div className="mt-4 space-y-2">
                                            {localFiles.map(file => (
                                                <div key={file.id}
                                                     className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                    <div className="flex items-center space-x-3">
                                                        <svg className="w-5 h-5 text-gray-400" fill="none"
                                                             stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round"
                                                                  strokeWidth="2"
                                                                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                                        </svg>
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900">{file.name}</p>
                                                            <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeFile(file.id)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor"
                                                             viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round"
                                                                  strokeWidth="2"
                                                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                                        </svg>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* PulsingDotsLoader */}
                                    <div
                                        className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <svg className="w-5 h-5 text-purple-600" fill="none"
                                                     stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                                                </svg>
                                                <span
                                                    className="text-sm font-medium text-purple-700">AI Optimization</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={handleOptimize}
                                                disabled={isOptimizing}
                                                className="px-3 py-1 text-xs font-medium text-purple-600 bg-white rounded-md hover:bg-purple-50 border border-purple-200 disabled:opacity-60 disabled:cursor-not-allowed"
                                            >
                                                {isOptimizing ? 'Submitting...' : 'Optimize Prompt'}
                                            </button>
                                        </div>
                                        <p className="text-xs text-purple-600 mt-2">Get AI suggestions to improve your
                                            prompt&#39;s effectiveness</p>
                                        <div className="mt-2">
                                            {isOptimizing && !optimizationQueue ? (
                                                <PulsingDotsLoader text="Optimizing prompt"/>
                                            ) : (
                                                <>
                                                    {optimizationQueue && (
                                                        <p className="text-xs text-purple-600">
                                                            Status: <span
                                                            className="font-medium">{optimizationQueue.status}</span>
                                                        </p>
                                                    )}
                                                    {optimizationError && (
                                                        <p className="text-xs text-red-600 mt-2">{optimizationError}</p>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </main>

                        <aside className="lg:col-span-1">
                            <div
                                className="bg-white rounded-xl shadow-sm border border-gray-200 h-[calc(100vh-200px)] flex flex-col sticky top-24 transition-all duration-500 ease-in-out hover:shadow-lg">
                                <div className="p-6 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900">Templates</h3>
                                    <p className="text-sm text-gray-500 mt-1">Choose a template to get started</p>
                                </div>
                                <div className="flex-1 overflow-y-auto p-4 space-y-3 scroll-smooth">
                                    {Object.entries(TEMPLATES).map(([key, template]) => (
                                        <div
                                            key={key}
                                            onClick={() => applyTemplate(key)}
                                            className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 hover:shadow-md hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 ease-out group"
                                        >
                                            <h4 className="text-sm font-medium text-gray-900 group-hover:text-blue-700 transition-colors duration-200">{template.title}</h4>
                                            <p className="text-xs text-gray-500 mt-1 group-hover:text-gray-600 transition-colors duration-200">
                                                {key === 'essay' && 'Structure for academic essays'}
                                                {key === 'math' && 'Step-by-step solutions'}
                                                {key === 'code' && 'Programming feedback'}
                                                {key === 'language' && 'Conversation scenarios'}
                                                {key === 'creative' && 'Story and narrative prompts'}
                                                {key === 'science' && 'Scientific concept explanations'}
                                                {key === 'history' && 'Historical event analysis'}
                                                {key === 'business' && 'Business problem analysis'}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                <div
                                    className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-6 hover:shadow-md transition-all duration-300 ease-out">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3 hover:text-blue-700 transition-colors duration-200">💡
                                        Quick Tips</h3>
                                    <ul className="text-sm text-gray-700 space-y-2">
                                        <li className="hover:text-blue-600 transition-colors duration-200 cursor-default">•
                                            Be specific in your instructions
                                        </li>
                                        <li className="hover:text-blue-600 transition-colors duration-200 cursor-default">•
                                            Include clear examples
                                        </li>
                                        <li className="hover:text-blue-600 transition-colors duration-200 cursor-default">•
                                            Set appropriate constraints
                                        </li>
                                        <li className="hover:text-blue-600 transition-colors duration-200 cursor-default">•
                                            Test with different inputs
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>

                {/* Test Modal */}
                {showTestModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
                        <div className="flex items-center justify-center min-h-screen p-4">
                            <div
                                className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[95vh] overflow-hidden">
                                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                    <h2 className="text-xl font-semibold text-gray-900">Test Prompt</h2>
                                    <button
                                        onClick={() => setShowTestModal(false)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                  d="M6 18L18 6M6 6l12 12"></path>
                                        </svg>
                                    </button>
                                </div>
                                <div className="p-6 overflow-y-auto max-h-[calc(95vh-120px)]">
                                    <div className="space-y-6">

                                        {/* CopyButton */}
                                        <div>
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-lg font-medium text-gray-900">Prompt Review</h3>
                                                <CopyButton text={generatePromptReview()} label="Prompt Review"/>
                                            </div>
                                            <div
                                                className="bg-gray-50 rounded-lg p-4 min-h-[300px] max-h-[500px] overflow-y-auto border border-gray-200">
                                                <pre
                                                    className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                                                    {generatePromptReview() || 'No prompt content to review yet. Fill in the instruction, context, input example, output format, and constraints fields to see the complete prompt review.'}
                                                </pre>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-2">This shows how your complete
                                                prompt will be structured</p>
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
                                            <div className="lg:col-span-4">
                                                <h3 className="text-lg font-medium text-gray-900 mb-4">Results</h3>
                                                <div
                                                    className="bg-gray-50 rounded-lg p-4 min-h-[400px] max-h-[600px] overflow-y-auto border border-gray-200">
                                                    {isTesting ? (
                                                        <SkeletonLoader lines={5} hasHeading={true}/>
                                                    ) : testError ? (
                                                        <p className="text-sm text-red-600 text-center">{testError}</p>
                                                    ) : testResponse && (testResponse.status === 'PENDING' || testResponse.status === 'PROCESSING') ? (
                                                        <PulsingDotsLoader
                                                            text={`Test is ${testResponse.status.toLowerCase()}`}
                                                            variant="blue"
                                                        />
                                                    ) : testResponse && testResponse.status === 'COMPLETED' ? (
                                                        <div className="space-y-3">
                                                            <div
                                                                className="flex flex-wrap items-center gap-2 text-green-700">
                                                                <svg className="w-5 h-5" fill="none"
                                                                     stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round"
                                                                          strokeWidth="2" d="M5 13l4 4L19 7"/>
                                                                </svg>
                                                                <span className="text-sm font-medium">Test completed successfully</span>
                                                                <span
                                                                    className="text-xs text-green-600">Model: {testResponse.aiModel}</span>
                                                            </div>
                                                            <div
                                                                className="bg-white rounded-lg p-4 border border-gray-200 space-y-2">
                                                                <div className="flex items-center justify-between">
                                                                    <h4 className="text-sm font-medium text-gray-900">AI
                                                                        Response</h4>
                                                                    <CopyButton text={testResponse.output || ''}
                                                                                label="AI Response"/>
                                                                </div>
                                                                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                                                    {testResponse.output}
                                                                </p>
                                                            </div>
                                                            <div className="text-xs text-gray-500 space-y-1">
                                                                <p>Tokens
                                                                    used: {testResponse.tokensUsed.toLocaleString()} / {(testResponse.maxTokens ?? maxTokens).toLocaleString()}</p>
                                                                <p>Response
                                                                    time: {(testResponse.executionTimeMs / 1000).toFixed(2)}s</p>
                                                            </div>
                                                        </div>
                                                    ) : testResponse && (testResponse.status === 'PENDING' || testResponse.status === 'PROCESSING') ? (
                                                        <p className="text-gray-500 text-center">
                                                            Test is {testResponse.status.toLowerCase()}...
                                                        </p>
                                                    ) : (
                                                        <p className="text-gray-500 text-center">Run a test to see
                                                            results here</p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* ... (Settings) ... */}
                                            <div className="lg:col-span-2">
                                                <h3 className="text-lg font-medium text-gray-900 mb-4">Test
                                                    Settings</h3>
                                                <div className="space-y-3">
                                                    <div>
                                                        <label htmlFor="model"
                                                               className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                                                        <select
                                                            value={model}
                                                            onChange={(e) => setModel(e.target.value as PromptAiModel)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 hover:border-blue-400 hover:shadow-sm transition-all duration-200"
                                                        >
                                                            {MODEL_OPTIONS.map(option => (
                                                                <option key={option.value}
                                                                        value={option.value}>{option.label}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label htmlFor="temperature"
                                                               className="block text-sm font-medium text-gray-700 mb-1">
                                                            Temp: {temperature.toFixed(1)}
                                                        </label>
                                                        <input
                                                            type="range"
                                                            min="0"
                                                            max="1"
                                                            step="0.1"
                                                            value={temperature}
                                                            onChange={(e) => setTemperature(parseFloat(e.target.value))}
                                                            className="w-full"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label htmlFor="maxTokens"
                                                               className="block text-sm font-medium text-gray-700 mb-1">Max
                                                            Tokens</label>
                                                        <input
                                                            type="number"
                                                            value={maxTokens}
                                                            onChange={(e) => {
                                                                const value = parseInt(e.target.value, 10);
                                                                if (Number.isNaN(value)) {
                                                                    setMaxTokens(1);
                                                                    return;
                                                                }
                                                                setMaxTokens(Math.min(8192, Math.max(1, value))); // Increased max
                                                            }}
                                                            min="1"
                                                            max="8192"
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 hover:border-blue-400 hover:shadow-sm transition-all duration-200"
                                                        />
                                                    </div>
                                                    <button
                                                        type="button"
                                                        disabled={isTesting || isSaving}
                                                        onClick={handleTest}
                                                        className="w-full px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
                                                    >
                                                        {isTesting ? 'Testing...' : 'Run Test'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
}