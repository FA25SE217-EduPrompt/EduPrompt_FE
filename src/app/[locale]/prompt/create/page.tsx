'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useCreateTagsBatch } from '@/hooks/queries/tag';
import {
    useCreatePrompt,
    useCreatePromptWithCollection,
    useGetOptimizationStatus,
    useGetTestUsage,
    useRequestOptimization,
    useRunPromptTest,
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
import { useCreateCollection, useGetMyCollections, } from '@/hooks/queries/collection';
import { CreateCollectionRequest } from '@/types/collection.api';
import { ApplySuggestion } from '@/components/ui/ApplySuggestion';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { toast, Toaster } from 'sonner';
import { CopyButton } from '@/components/ui/CopyButtonProps';
import { PulsingDotsLoader } from '@/components/ui/PulsingDotsLoaderProps';
import { CreatorNavbar } from '@/components/layout/CreatorNavbar'; // Import the new Navbar
import { OptimizationPanel } from '@/components/prompt-manage/OptimizationPanel';
import { useTranslations } from 'next-intl';

import { PROMPT_TEMPLATES, Template } from '@/lib/prompt-templates';
import { TemplateWizardModal } from '@/components/prompt-manage/TemplateWizardModal';
import TagService from '@/services/resources/tag';
import { TagResponse } from '@/types/tag.api';
import { MarkdownRenderer } from '@/components/ui/MarkdownRenderer';

// Restore missing type
type LocalUploadedFile = PromptUploadedFile & { file?: File };

const MODEL_OPTIONS: { label: string; value: PromptAiModel }[] = [
    { label: 'GPT-4o mini', value: 'GPT_4O_MINI' },
    { label: 'Claude 3.5 Sonnet', value: 'CLAUDE_3_5_SONNET' },
    { label: 'Gemini 2.5 Flash', value: 'GEMINI_2_5_FLASH' },
];

const COLLECTION_NONE = '_NONE_';
const COLLECTION_AUTO = '_AUTO_';
const COLLECTION_NEW = '_NEW_';

import { parseOptimizationOutput, OptimizedPromptFields } from "@/utils/prompt-optimization";

export default function CreatePromptPage() {
    const t = useTranslations('Prompt.Create');

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
    const [tagType, setTagType] = useState('môn');
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

    // Wizard State
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [wizardTemplate, setWizardTemplate] = useState<Template | null>(null);


    // MUTATION HOOKS
    const { mutateAsync: createTagsBatch, isPending: isSavingTags } = useCreateTagsBatch();
    const { mutateAsync: createPromptMutation, isPending: isSavingStandalone } = useCreatePrompt();
    const {
        mutateAsync: createPromptWithCollectionMutation,
        isPending: isSavingToCollection
    } = useCreatePromptWithCollection();
    const { mutateAsync: createCollectionMutation, isPending: isCreatingCollection } = useCreateCollection();
    const { mutateAsync: runTestMutation, isPending: isSubmittingTest } = useRunPromptTest();
    const { mutateAsync: requestOptimizationMutation, isPending: isSubmittingOptimize } = useRequestOptimization();

    // QUERY HOOKS
    const { data: myCollections, isLoading: isLoadingCollections } =
        useGetMyCollections(0, 20);

    const isSaving =
        isSavingTags ||
        isSavingStandalone ||
        isSavingToCollection ||
        isCreatingCollection;

    const { data: pollingResult, isLoading: isPollingTest } = useGetTestUsage(
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

    const { data: pollingOptimizeResult, isLoading: isPollingOptimize } = useGetOptimizationStatus(
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

    const isOptimizing = isSubmittingOptimize || !!pollingOptimizeId;

    useEffect(() => {
        if (!pollingOptimizeResult || !pollingOptimizeResult.data) return;

        const queueEntry = pollingOptimizeResult.data;
        const { status, errorMessage, output } = queueEntry;

        setOptimizationQueue(queueEntry);

        if (status === 'COMPLETED' && output) {
            console.log("Polling: Optimization COMPLETED");
            const parsedSuggestions = parseOptimizationOutput(output);
            setOptimizedSuggestions(parsedSuggestions);
            setOptimizationError(null);
            setPollingOptimizeId(null);
            toast.success(t('optimizationComplete'));
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

        const { status, errorMessage } = pollingResult.data;

        if (status === 'COMPLETED') {
            console.log("Polling: Test COMPLETED");
            setTestResponse(pollingResult.data);
            setTestError(null);
            setPollingUsageId(null);
            toast.success(t('testCompleted'));
        }

        if (status === 'FAILED') {
            console.error("Polling: Test FAILED");
            setTestError(errorMessage || "Test failed during processing.");
            setTestResponse(null);
            setPollingUsageId(null);
            toast.error(errorMessage || t('testFailed')); // Added error toast
        }
    }, [pollingResult]);

    // HANDLER FUNCTIONS
    const [optimizationInstruction, setOptimizationInstruction] = useState('');
    const [availableTags, setAvailableTags] = useState<TagResponse[]>([]);

    useEffect(() => {
        const fetchTags = async () => {
            // Only fetch if a type is selected, or fetch all?
            // Let's fetch based on the selected tagType to narrow down suggestions
            try {
                const res = await TagService.getAll({ type: [tagType], size: 50 });
                if (res.data) {
                    setAvailableTags(res.data.content);
                }
            } catch (e) {
                console.error("Failed to fetch tags", e);
            }
        };
        fetchTags();
    }, [tagType]);

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
                tags: [...prev.tags, { type: tagType, value: trimmed }],
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
                toast.error(t('fileSizeLimit')); // Use toast
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
        const normalizedAttachments = additions.map(({ file, ...rest }) => rest as PromptUploadedFile);
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

    const applyTemplateToForm = (templateId: string) => {
        const template = PROMPT_TEMPLATES[templateId];
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

        toast.success(t('templateApplied'));
    };

    const handleTemplateClick = (templateKey: string) => {
        const template = PROMPT_TEMPLATES[templateKey];
        if (template && template.questions) {
            setWizardTemplate(template);
            setIsWizardOpen(true);
        } else {
            applyTemplateToForm(templateKey);
        }
    };

    const handleWizardGenerate = (instruction: string) => {
        if (!wizardTemplate) return;
        applyTemplateToForm(wizardTemplate.id);
        setIsWizardOpen(false);
        // Set the instruction in the panel, allowing manual optimization trigger
        setOptimizationInstruction(instruction);
        toast.info(t('wizardInstructionApplied') || "Optimization advice added. Click 'Optimize' to apply.");
    };

    const handleWizardSkip = () => {
        if (!wizardTemplate) return;
        applyTemplateToForm(wizardTemplate.id);
        setIsWizardOpen(false);
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
            toast.error(t('titleRequired'));
            return;
        }

        if (form.instruction.trim().length < 20) {
            toast.error(t('instructionMinLength'));
            return;
        }

        if (form.collection === COLLECTION_NEW && !customCollectionName.trim()) {
            toast.error(t('collectionNameRequired'));
            return;
        }

        try {
            const sanitizedForm = sanitizeForm();
            const { tags, attachments, id, collection, ...restOfForm } = sanitizedForm;

            //create tags
            let tagIds: string[] = [];
            if (sanitizedForm.tags.length > 0) {
                const tagResult = await createTagsBatch({ tags: sanitizedForm.tags });
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
                promptResult = await createPromptMutation({ payload });
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

                    const collectionResult = await createCollectionMutation({ payload: collectionPayload });

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
                promptResult = await createPromptWithCollectionMutation({ payload });
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

                toast.success(t('saveSuccess'));
                return saved.id;
            }

            toast.error('Unexpected response from server.');
            return undefined;

        } catch (error) {
            toast.error(error instanceof Error ? error.message : t('saveFailed'));
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
                toast.error(t('pleaseSaveBeforeTest'));
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

    const handleOptimize = async (selectedModel?: PromptAiModel, optimizationInput?: string) => {
        setOptimizationError(null);
        setOptimizationQueue(null);
        setPollingOptimizeId(null);

        let promptId = form.id;
        if (!promptId) {
            promptId = await savePrompt();
            if (!promptId) {
                toast.error(t('pleaseSaveBeforeOptimize'));
                return;
            }
        }

        try {
            // Use provided model or fall back to state
            const aiModel = selectedModel || model;

            // Build input: if optimizationInput is provided (from panel), append it to the review
            let finalInput = buildOptimizationInput();
            if (optimizationInput) {
                finalInput += `\n\nSpecific Instructions: ${optimizationInput}`;
            }

            const optimizationPayload = {
                request: {
                    promptId,
                    aiModel,
                    optimizationInput: finalInput,
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
            <Toaster position="top-right" richColors />
            <div className="min-h-full bg-gradient-to-br from-blue-50 via-white to-indigo-50">
                <CreatorNavbar
                    onSave={handleSave}
                    isSaving={isSaving}
                    onTest={() => setShowTestModal(true)}
                    isTesting={isTesting}
                />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        <main className="lg:col-span-3">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h1 className="text-2xl font-bold text-gray-900 mb-6">
                                    {t('title')}
                                </h1>
                                <form className="space-y-6" onSubmit={(event) => event.preventDefault()}>
                                    {/* ... (Title, Description) ... */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                                                {t('promptTitle')} *
                                            </label>
                                            <CopyButton text={form.title} label={t('promptTitle')} />
                                        </div>
                                        <ApplySuggestion
                                            suggestion={optimizedSuggestions?.title}
                                            onApply={() => {
                                                if (optimizedSuggestions?.title) {
                                                    handleFieldChange('title', optimizedSuggestions.title);
                                                    setOptimizedSuggestions(s => ({ ...s, title: undefined }));
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
                                            placeholder={t('promptTitlePlaceholder')}
                                        />
                                        <p className="text-xs text-gray-500 mt-1">{t('maxChars')}</p>
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label htmlFor="description"
                                                className="block text-sm font-medium text-gray-700">
                                                {t('promptDescription')}
                                            </label>
                                            <CopyButton text={form.description || ''} label={t('promptDescription')} />
                                        </div>
                                        <ApplySuggestion
                                            suggestion={optimizedSuggestions?.description}
                                            onApply={() => {
                                                if (optimizedSuggestions?.description) {
                                                    handleFieldChange('description', optimizedSuggestions.description);
                                                    setOptimizedSuggestions(s => ({ ...s, description: undefined }));
                                                }
                                            }}
                                        />
                                        <textarea
                                            id="description"
                                            value={form.description ?? ''}
                                            onChange={(e) => handleFieldChange('description', e.target.value)}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-400 hover:shadow-sm transition-all duration-200"
                                            placeholder={t('promptDescriptionPlaceholder')}
                                        />
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label
                                                htmlFor="instruction"
                                                className="block text-sm font-medium text-gray-700"
                                            >
                                                {t('instruction')} *
                                            </label>
                                            <div className="flex items-center space-x-1">
                                                <CopyButton
                                                    text={form.instruction}
                                                    label={t('instruction')}
                                                />
                                            </div>
                                        </div>
                                        <ApplySuggestion
                                            suggestion={optimizedSuggestions?.instruction}
                                            onApply={() => {
                                                if (optimizedSuggestions?.instruction) {
                                                    handleFieldChange(
                                                        "instruction",
                                                        optimizedSuggestions.instruction
                                                    );
                                                    setOptimizedSuggestions((s) => ({
                                                        ...s,
                                                        instruction: undefined,
                                                    }));
                                                }
                                            }}
                                        />
                                        <textarea
                                            id="instruction"
                                            value={form.instruction}
                                            onChange={(e) =>
                                                handleFieldChange("instruction", e.target.value)
                                            }
                                            rows={4}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-400 hover:shadow-sm transition-all duration-200"
                                            placeholder="Detailed instructions for the AI model"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Minimum 20 characters required
                                        </p>

                                        <div className="mt-4">
                                            <OptimizationPanel
                                                onOptimize={(model, input) => {
                                                    setModel(model);
                                                    handleOptimize(model, input);
                                                }}
                                                isOptimizing={isOptimizing}
                                                instruction={optimizationInstruction}
                                                onInstructionChange={setOptimizationInstruction}
                                            />
                                        </div>
                                    </div>

                                    {/* ... (Context, Input, Output, Constraints, etc...) ... */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label htmlFor="context"
                                                className="block text-sm font-medium text-gray-700">
                                                {t('context')}
                                            </label>
                                            <CopyButton text={form.context || ''} label="Context" />
                                        </div>
                                        <ApplySuggestion
                                            suggestion={optimizedSuggestions?.context}
                                            onApply={() => {
                                                if (optimizedSuggestions?.context) {
                                                    handleFieldChange('context', optimizedSuggestions.context);
                                                    setOptimizedSuggestions(s => ({ ...s, context: undefined }));
                                                }
                                            }}
                                        />
                                        <textarea
                                            id="context"
                                            value={form.context ?? ''}
                                            onChange={(e) => handleFieldChange('context', e.target.value)}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-400 hover:shadow-sm transition-all duration-200"
                                            placeholder={t('fields.contextPlaceholder') || "Additional context or background information"}
                                        />
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label htmlFor="inputExample"
                                                className="block text-sm font-medium text-gray-700">
                                                {t('inputExample')}
                                            </label>
                                            <CopyButton text={form.inputExample || ''} label="Input Example" />
                                        </div>
                                        <ApplySuggestion
                                            suggestion={optimizedSuggestions?.inputExample}
                                            onApply={() => {
                                                if (optimizedSuggestions?.inputExample) {
                                                    handleFieldChange('inputExample', optimizedSuggestions.inputExample);
                                                    setOptimizedSuggestions(s => ({ ...s, inputExample: undefined }));
                                                }
                                            }}
                                        />
                                        <textarea
                                            id="inputExample"
                                            value={form.inputExample ?? ''}
                                            onChange={(e) => handleFieldChange('inputExample', e.target.value)}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-400 hover:shadow-sm transition-all duration-200"
                                            placeholder={t('fields.inputExamplePlaceholder') || "Example of expected input"}
                                        />
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label htmlFor="outputFormat"
                                                className="block text-sm font-medium text-gray-700">
                                                {t('outputFormat')}
                                            </label>
                                            <CopyButton text={form.outputFormat || ''} label="Output Format" />
                                        </div>
                                        <ApplySuggestion
                                            suggestion={optimizedSuggestions?.outputFormat}
                                            onApply={() => {
                                                if (optimizedSuggestions?.outputFormat) {
                                                    handleFieldChange('outputFormat', optimizedSuggestions.outputFormat);
                                                    setOptimizedSuggestions(s => ({ ...s, outputFormat: undefined }));
                                                }
                                            }}
                                        />
                                        <textarea
                                            id="outputFormat"
                                            value={form.outputFormat ?? ''}
                                            onChange={(e) => handleFieldChange('outputFormat', e.target.value)}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-400 hover:shadow-sm transition-all duration-200"
                                            placeholder={t('fields.outputFormatPlaceholder') || "Specify the desired output format"}
                                        />
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label htmlFor="constraints"
                                                className="block text-sm font-medium text-gray-700">
                                                {t('constraints')}
                                            </label>
                                            <CopyButton text={form.constraints || ''} label="Constraints" />
                                        </div>
                                        <ApplySuggestion
                                            suggestion={optimizedSuggestions?.constraints}
                                            onApply={() => {
                                                if (optimizedSuggestions?.constraints) {
                                                    handleFieldChange('constraints', optimizedSuggestions.constraints);
                                                    setOptimizedSuggestions(s => ({ ...s, constraints: undefined }));
                                                }
                                            }}
                                        />
                                        <textarea
                                            id="constraints"
                                            value={form.constraints ?? ''}
                                            onChange={(e) => handleFieldChange('constraints', e.target.value)}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-400 hover:shadow-sm transition-all duration-200"
                                            placeholder={t('fields.constraintsPlaceholder') || "Any limitations or constraints"}
                                        />
                                    </div>

                                    {/* ... (Tags) ... */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                                        <div className="space-y-3">
                                            {form.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-2">
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
                                            )}
                                            <div className="flex space-x-2">
                                                <select
                                                    value={tagType}
                                                    onChange={(e) => setTagType(e.target.value)}
                                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-400 hover:shadow-sm transition-all duration-200"
                                                >
                                                    <option value="môn">{t('tagTypes.subject')}</option>
                                                    <option value="khối">{t('tagTypes.grade')}</option>
                                                </select>
                                                <input
                                                    type="text"
                                                    list="tag-suggestions"
                                                    value={tagValue}
                                                    onChange={(e) => setTagValue(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            addTag();
                                                        }
                                                    }}
                                                    placeholder={t('fields.tagValuePlaceholder') || "Tag value"}
                                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-400 hover:shadow-sm transition-all duration-200"
                                                />
                                                <datalist id="tag-suggestions">
                                                    {availableTags.map((tag) => (
                                                        <option key={tag.id} value={tag.value} />
                                                    ))}
                                                </datalist>
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
                                                <option value={COLLECTION_NONE}></option>
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
                                                        {t('newCollectionName')}
                                                    </label>
                                                    <input
                                                        type="text"
                                                        id="custom-collection-name"
                                                        value={customCollectionName}
                                                        onChange={(e) => setCustomCollectionName(e.target.value)}
                                                        placeholder={t('newCollectionPlaceholder')}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* ... (Attachments) ... */}
                                    <div>
                                        <label
                                            className="block text-sm font-medium text-gray-700 mb-2">{t('attachments')}</label>
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
                                                        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                                <p className="mt-2 text-sm text-gray-600">{t('clickToUpload')}</p>
                                                <p className="text-xs text-gray-500">{t('fileSupport')}</p>
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

                                    {/* Removed old AI Optimization Box */}
                                </form>
                            </div>
                        </main>

                        {/* ... (Aside/Templates) ... */}
                        <aside className="lg:col-span-1">
                            <div
                                className="bg-white rounded-xl shadow-sm border border-gray-200 h-[calc(100vh-200px)] flex flex-col sticky top-24 transition-all duration-500 ease-in-out hover:shadow-lg">
                                <div className="p-6 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900">{t('templatesTitle')}</h3>
                                    <p className="text-sm text-gray-500 mt-1">{t('templatesSubtitle')}</p>
                                </div>
                                <div className="flex-1 overflow-y-auto p-4 space-y-3 scroll-smooth">
                                    {Object.entries(PROMPT_TEMPLATES).map(([key, template]) => (
                                        <div
                                            key={key}
                                            onClick={() => handleTemplateClick(key)}
                                            className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 hover:shadow-md hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 ease-out group"
                                        >
                                            <h4 className="text-sm font-medium text-gray-900 group-hover:text-blue-700 transition-colors duration-200">{template.title}</h4>
                                            <p className="text-xs text-gray-500 mt-1 group-hover:text-gray-600 transition-colors duration-200">
                                                {template.description}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                {wizardTemplate && (
                                    <TemplateWizardModal
                                        isOpen={isWizardOpen}
                                        onClose={() => setIsWizardOpen(false)}
                                        template={wizardTemplate}
                                        onGenerate={handleWizardGenerate}
                                        onSkip={handleWizardSkip}
                                    />
                                )}

                                <div
                                    className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-6 hover:shadow-md transition-all duration-300 ease-out">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3 hover:text-blue-700 transition-colors duration-200">💡
                                        {t('quickTipsTitle')}</h3>
                                    <ul className="text-sm text-gray-700 space-y-2">
                                        <li className="hover:text-blue-600 transition-colors duration-200 cursor-default">•
                                            {t('quickTips.specific')}
                                        </li>
                                        <li className="hover:text-blue-600 transition-colors duration-200 cursor-default">•
                                            {t('quickTips.examples')}
                                        </li>
                                        <li className="hover:text-blue-600 transition-colors duration-200 cursor-default">•
                                            {t('quickTips.constraints')}
                                        </li>
                                        <li className="hover:text-blue-600 transition-colors duration-200 cursor-default">•
                                            {t('quickTips.test')}
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>

                {/* ... (Test Modal) ... */}
                {showTestModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
                        <div className="flex items-center justify-center min-h-screen p-4">
                            <div
                                className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[95vh] overflow-hidden">
                                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                    <h2 className="text-xl font-semibold text-gray-900">{t('testPromptTitle')}</h2>
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
                                                <h3 className="text-lg font-medium text-gray-900">{t('promptReviewTitle')}</h3>
                                                <CopyButton text={generatePromptReview()} label={t('promptReviewTitle')} />
                                            </div>
                                            <div
                                                className="bg-gray-50 rounded-lg p-4 min-h-[300px] max-h-[500px] overflow-y-auto border border-gray-200">
                                                <pre
                                                    className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                                                    {generatePromptReview() || 'No prompt content to review yet. Fill in the instruction, context, input example, output format, and constraints fields to see the complete prompt review.'}
                                                </pre>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-2">{t('promptReviewSubtitle')}</p>
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
                                            <div className="lg:col-span-4">
                                                <h3 className="text-lg font-medium text-gray-900 mb-4">{t('resultsTitle')}</h3>
                                                <div
                                                    className="bg-gray-50 rounded-lg p-4 min-h-[400px] max-h-[600px] overflow-y-auto border border-gray-200">
                                                    {isTesting ? (
                                                        <SkeletonLoader lines={5} hasHeading={true} />
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
                                                                        strokeWidth="2" d="M5 13l4 4L19 7" />
                                                                </svg>
                                                                <span className="text-sm font-medium">{t('testSuccess')}</span>
                                                                <span
                                                                    className="text-xs text-green-600">{t('testModel')}: {testResponse.aiModel}</span>
                                                            </div>
                                                            <div
                                                                className="bg-white rounded-lg p-4 border border-gray-200 space-y-2">
                                                                <div className="flex items-center justify-between">
                                                                    <h4 className="text-sm font-medium text-gray-900">{t('aiResponse')}</h4>
                                                                    <CopyButton text={testResponse.output || ''}
                                                                        label={t('aiResponse')} />
                                                                </div>
                                                                <MarkdownRenderer content={testResponse.output || ''} />
                                                            </div>
                                                            <div className="text-xs text-gray-500 space-y-1">
                                                                <p>{t('tokensUsed')}: {testResponse.tokensUsed.toLocaleString()} / {(testResponse.maxTokens ?? maxTokens).toLocaleString()}</p>
                                                                <p>{t('responseTime')}: {(testResponse.executionTimeMs / 1000).toFixed(2)}s</p>
                                                            </div>
                                                        </div>
                                                    ) : testResponse && (testResponse.status === 'PENDING' || testResponse.status === 'PROCESSING') ? (
                                                        <p className="text-gray-500 text-center">
                                                            Test is {testResponse.status.toLowerCase()}...
                                                        </p>
                                                    ) : (
                                                        <p className="text-gray-500 text-center">{t('noResultsYet')}</p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* ... (Settings) ... */}
                                            <div className="lg:col-span-2">
                                                <h3 className="text-lg font-medium text-gray-900 mb-4">{t('testSettingsTitle')}</h3>
                                                <div className="space-y-3">
                                                    <div>
                                                        <label htmlFor="model"
                                                            className="block text-sm font-medium text-gray-700 mb-1">{t('modelLabel')}</label>
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
                                                            {t('temperatureLabel')}: {temperature.toFixed(1)}
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
                                                            className="block text-sm font-medium text-gray-700 mb-1">{t('maxTokensLabel')}</label>
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
                                                        {isTesting ? t('testingAction') : t('runTest')}
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