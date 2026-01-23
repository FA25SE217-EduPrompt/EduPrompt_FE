"use client";

import React, { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Upload, FileText, Sparkles, Tag, Globe, Lock, Save, FolderOpen, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWorkbench } from '../WorkbenchContext';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { generatePromptFromFile } from '@/services/prompt-ai';
import { PromptTaskType, PromptCreateRequest, PromptCreateWithCollectionRequest, CreatePromptVersionRequest } from '@/types/prompt.api';
import { useCreatePrompt, useCreatePromptWithCollection, useCreatePromptVersion } from '@/hooks/queries/prompt';
import { useCreateTagsBatch } from '@/hooks/queries/tag';
import { useGetMyCollections, useCreateCollection } from '@/hooks/queries/collection';
import { CreateCollectionRequest } from '@/types/collection.api';

const COLLECTION_NONE = '_NONE_';
const COLLECTION_NEW = '_NEW_';

export const DraftTab = () => {
    const t = useTranslations('Workbench');
    const { deductQuota, setPromptData, promptData, isOwner } = useWorkbench();

    // Switcher State: 'save' (was From Scratch) vs 'file' (From File)
    const [mode, setMode] = useState<'save' | 'file'>('save');

    // Generate/File State
    const [taskType, setTaskType] = useState<PromptTaskType>('LESSON_PLAN');
    const [userNote, setUserNote] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    // Hidden file input ref
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Save State
    const [tagName, setTagName] = useState('');
    const [tags, setTags] = useState<string[]>([]); // UI only holds string values for now
    // In a real app we might want structured tags {type, value}, simplified for now to match UI
    const [tagType, setTagType] = useState('subject'); // default type

    const [visibility, setVisibility] = useState<'private' | 'public'>('private');
    const [collection, setCollection] = useState(COLLECTION_NONE);
    const [customCollectionName, setCustomCollectionName] = useState('');

    // Query Hooks
    const { data: myCollections } = useGetMyCollections(0, 100); // Fetch enough collections
    const { mutateAsync: createTagsBatch, isPending: isSavingTags } = useCreateTagsBatch();
    const { mutateAsync: createPromptMutation, isPending: isSavingStandalone } = useCreatePrompt();
    const { mutateAsync: createPromptWithCollectionMutation, isPending: isSavingToCollection } = useCreatePromptWithCollection();
    const { mutateAsync: createCollectionMutation, isPending: isCreatingCollection } = useCreateCollection();
    const { mutateAsync: createPromptVersionMutation, isPending: isSavingVersion } = useCreatePromptVersion();

    const isSaving = isSavingTags || isSavingStandalone || isSavingToCollection || isCreatingCollection || isSavingVersion;

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 10 * 1024 * 1024) {
                toast.error("File size must be under 10MB");
                return;
            }
            setSelectedFile(file);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            if (file.size > 10 * 1024 * 1024) {
                toast.error("File size must be under 10MB");
                return;
            }
            setSelectedFile(file);
        }
    };

    const handleGenerate = async () => {
        if (!selectedFile) {
            toast.error("Please upload a source file first.");
            return;
        }

        setIsGenerating(true);
        toast.info("Generating prompt draft. This may take 1-2 minutes for large files...");
        try {
            const response = await generatePromptFromFile(selectedFile, taskType, userNote);
            const data = response.data;

            setPromptData({
                ...promptData,
                instruction: data.instruction,
                context: data.context,
                inputData: data.inputExample,
                outputFormat: data.outputFormat,
                constraints: data.constraints,
                title: promptData.title || `Generated ${taskType} Prompt`,
                badges: [taskType, data.aiModel]
            });

            deductQuota(data.totalTokens);
            toast.success(`Generated successfully (Cost: ${data.totalTokens} Tokens)`);

            setSelectedFile(null);
            setUserNote('');
            setMode('save'); // Switch to save view to review/save

        } catch (error: unknown) {
            console.error(error);
            const err = error as { code?: string; message?: string };
            if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
                toast.error("Model might be overloaded. Please retry.");
            } else {
                toast.error(err.message || "Failed to generate prompt");
            }
        } finally {
            setIsGenerating(false);
        }
    };

    const handleAddTag = () => {
        if (tagName.trim() && !tags.includes(tagName.trim())) {
            setTags([...tags, tagName.trim()]);
            setTagName('');
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const handleSave = async () => {
        // Validation
        if (!promptData.title.trim()) {
            toast.error("Prompt title is required. Please set it in the editor.");
            return;
        }
        if (promptData.instruction.trim().length < 20) {
            toast.error("Instruction must be at least 20 characters.");
            return;
        }
        if (collection === COLLECTION_NEW && !customCollectionName.trim()) {
            toast.error("Please enter a name for the new collection.");
            return;
        }

        try {
            // 0. CHECK OWNERSHIP: If Owner, Create New Version
            if (isOwner && promptData.id) {
                const versionPayload: CreatePromptVersionRequest = {
                    instruction: promptData.instruction,
                    context: promptData.context,
                    inputExample: promptData.inputData,
                    outputFormat: promptData.outputFormat,
                    constraints: promptData.constraints,
                    isAiGenerated: false // Manual save is typically user-edited
                };

                const versionResult = await createPromptVersionMutation({
                    promptId: promptData.id,
                    payload: versionPayload
                });

                if (versionResult.error) {
                    toast.error(versionResult.error.messages.join(', '));
                    return;
                }

                toast.success("New version saved successfully!");
                return; // Exit after saving version
            }

            // --- IF NOT OWNER OR NEW PROMPT: SAVE AS COPY/NEW ---

            // 1. Create Tags
            let tagIds: string[] = [];
            if (tags.length > 0) {
                // Assuming all tags are of selected 'tagType' for simplicity in this UI
                // In full create page, tags have individual types.
                const tagsPayload = tags.map(val => ({ type: tagType, value: val }));
                const tagResult = await createTagsBatch({ tags: tagsPayload });
                if (tagResult.error || !tagResult.data) {
                    toast.error(tagResult.error?.messages.join(', ') || 'Failed to create tags.');
                    return;
                }
                tagIds = tagResult.data.map(t => t.id);
            }

            // 2. Handle Collection
            let finalCollectionId = collection;

            if (collection === COLLECTION_NEW) {
                const collectionPayload: CreateCollectionRequest = {
                    name: customCollectionName.trim(),
                    visibility: visibility,
                    tags: tagIds, // new collection inherits prompt tags? Optional decision.
                };

                const collectionResult = await createCollectionMutation({ payload: collectionPayload });

                if (collectionResult.error || !collectionResult.data) {
                    toast.error(collectionResult.error?.messages.join(', ') || 'Failed to create collection.');
                    return;
                }
                finalCollectionId = collectionResult.data.id;
            } else if (collection === COLLECTION_NONE) {
                finalCollectionId = ''; // No collection
            }

            // 3. Create Prompt
            const basePrompt = {
                title: promptData.title,
                description: '', // Not in workbench UI currently
                instruction: promptData.instruction,
                context: promptData.context,
                inputExample: promptData.inputData,
                outputFormat: promptData.outputFormat,
                constraints: promptData.constraints,
                visibility: visibility === 'public' ? 'public' as const : 'private' as const, // Explicit map
            };

            // IMPORTANT: Clear ID to force creation of new prompt
            // (Though we are building a fresh payload, simpler to just not include ID)

            let promptResult;

            if (finalCollectionId) {
                const payload: PromptCreateWithCollectionRequest = {
                    ...basePrompt,
                    tagIds: tagIds,
                    collectionId: finalCollectionId,
                    visibility: visibility // Ensure type matches what API expects
                };
                promptResult = await createPromptWithCollectionMutation({ payload });
            } else {
                const payload: PromptCreateRequest = {
                    ...basePrompt,
                    tagIds: tagIds,
                    visibility: visibility
                };
                promptResult = await createPromptMutation({ payload });
            }

            if (promptResult.error) {
                toast.error(promptResult.error.messages.join(', '));
                return;
            }

            if (promptResult.data) {
                const action = isOwner ? "saved" : "saved as copy";
                toast.success(`Prompt ${action} successfully!`);

                // Update context to reflect the new prompt if we just created a copy/new
                if (promptResult.data.id) {
                    // We might want to switch context to this new prompt?
                    // For now, let's just toast. Switching might confuse if user wanted to stay.
                    // But if they "Saved as Copy", arguably they are now working on that copy.
                    // The user request implied "Saving prompts not belonging to them" -> "Save as Copy".
                }

                // Reset collection form if new
                if (collection === COLLECTION_NEW) {
                    setCustomCollectionName('');
                    setCollection(finalCollectionId); // Select the new collection
                }
            }

        } catch (error: unknown) {
            console.error("Save failed:", error);
            const err = error as { message?: string };
            toast.error(err.message || "Failed to save prompt");
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Action Mode Switcher */}
            <div className="flex p-1 bg-gray-100 rounded-lg mx-6 mt-6 mb-4 relative z-0">
                {['save', 'file'].map((m) => (
                    <button
                        key={m}
                        onClick={() => setMode(m as 'save' | 'file')}
                        className={cn(
                            "flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors relative z-10",
                            mode === m ? "text-slate-900" : "text-gray-500 hover:text-gray-700"
                        )}
                    >
                        {m === 'save' ? t('tabs.draft.save') : t('tabs.draft.file')}
                        {mode === m && (
                            <motion.div
                                layoutId="draftModePill"
                                className="absolute inset-0 bg-white rounded-md shadow-sm -z-10"
                                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            />
                        )}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-8">

                {mode === 'file' ? (
                    <>
                        {/* File Upload UI */}
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                            onDrop={handleDrop}
                            className={cn(
                                "border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center transition-colors cursor-pointer group bg-white",
                                selectedFile ? "border-green-300 bg-green-50" : "border-gray-200 hover:border-primary hover:bg-blue-50"
                            )}>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                onChange={handleFileSelect}
                                accept=".pdf,.docx,.txt"
                            />

                            {selectedFile ? (
                                <div className="relative">
                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-3 text-green-600">
                                        <FileText size={20} />
                                    </div>
                                    <h4 className="text-sm font-semibold text-gray-700">{selectedFile.name}</h4>
                                    <p className="text-xs text-gray-500 mt-1">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                                        className="absolute -top-2 -right-10 p-1 bg-white rounded-full shadow-sm hover:text-red-500"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <motion.div
                                        initial={{ scale: 1 }}
                                        whileHover={{ scale: 1.1, rotate: 5 }}
                                        className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center mb-3 text-primary"
                                    >
                                        <Upload size={20} />
                                    </motion.div>
                                    <h4 className="text-sm font-semibold text-gray-700">{t('tabs.draft.uploadSource')}</h4>
                                    <p className="text-xs text-gray-400 mt-1">{t('tabs.draft.fileHint')}</p>
                                </>
                            )}
                        </div>

                        {/* Task Selector */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">{t('tabs.draft.taskType')}</label>
                            <select
                                className="w-full p-2.5 rounded-lg border border-gray-200 text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
                                value={taskType}
                                onChange={(e) => setTaskType(e.target.value as PromptTaskType)}
                            >
                                <option value="LESSON_PLAN">{t('tabs.draft.tasks.LESSON_PLAN')}</option>
                                <option value="SLIDE_OUTLINE">{t('tabs.draft.tasks.SLIDE_OUTLINE')}</option>
                                <option value="QUIZ">{t('tabs.draft.tasks.QUIZ')}</option>
                                <option value="TEST_MATRIX">{t('tabs.draft.tasks.TEST_MATRIX')}</option>
                                <option value="GROUP_ACTIVITY">{t('tabs.draft.tasks.GROUP_ACTIVITY')}</option>
                            </select>
                        </div>

                        {/* Custom Note */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">{t('tabs.draft.customNote')}</label>
                            <textarea
                                className="w-full p-3 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                                rows={3}
                                placeholder={t('tabs.draft.notePlaceholder')}
                                value={userNote}
                                onChange={(e) => setUserNote(e.target.value)}
                            />
                        </div>

                        {/* Action Button */}
                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating || !selectedFile}
                            className={cn(
                                "w-full py-3 bg-primary text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2",
                                (isGenerating || !selectedFile) ? "opacity-70 cursor-not-allowed" : "hover:bg-blue-700 hover:-translate-y-0.5 active:scale-95"
                            )}
                        >
                            {isGenerating ? (
                                <><Loader2 size={18} className="animate-spin" /> {t('tabs.draft.generating')}</>
                            ) : (
                                <><Sparkles size={18} /> {t('tabs.draft.generate')}</>
                            )}
                        </button>
                    </>
                ) : (
                    <>
                        {/* Save Mode UI */}

                        {/* Tags Input */}
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                                <Tag size={12} /> {t('tabs.draft.tags')}
                            </label>
                            <div className="flex gap-3">
                                <select
                                    className="w-1/3 p-2.5 rounded-lg border border-gray-200 text-sm bg-white"
                                    value={tagType}
                                    onChange={(e) => setTagType(e.target.value)}
                                >
                                    <option value="subject">{t('tabs.draft.tagTypes.subject')}</option>
                                    <option value="topic">{t('tabs.draft.tagTypes.topic')}</option>
                                    <option value="level">{t('tabs.draft.tagTypes.level')}</option>
                                    <option value="other">{t('tabs.draft.tagTypes.other')}</option>
                                </select>
                                <div className="flex-1 flex gap-2">
                                    <input
                                        type="text"
                                        className="flex-1 p-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                        placeholder={t('tabs.draft.tagPlaceholder')}
                                        value={tagName}
                                        onChange={(e) => setTagName(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                                    />
                                    <button
                                        onClick={handleAddTag}
                                        className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-semibold hover:bg-blue-100 transition-colors"
                                    >
                                        {t('tabs.draft.add')}
                                    </button>
                                </div>
                            </div>

                            {/* Tags Display */}
                            <div className="flex flex-wrap gap-2 mt-2">
                                {tags.map(tag => (
                                    <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs flex items-center gap-1">
                                        {tag}
                                        <button onClick={() => handleRemoveTag(tag)} className="hover:text-red-500">&times;</button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Visibility */}
                        <div className="space-y-4 pt-2">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">{t('tabs.draft.visibilityCollection')}</label>
                            <div className="flex gap-6 mb-3">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="visibility"
                                        checked={visibility === 'private'}
                                        onChange={() => setVisibility('private')}
                                        className="text-primary focus:ring-primary"
                                    />
                                    <span className="text-sm text-slate-700 flex items-center gap-1"><Lock size={14} /> {t('tabs.draft.private')}</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="visibility"
                                        checked={visibility === 'public'}
                                        onChange={() => setVisibility('public')}
                                        className="text-primary focus:ring-primary"
                                    />
                                    <span className="text-sm text-slate-700 flex items-center gap-1"><Globe size={14} /> {t('tabs.draft.public')}</span>
                                </label>
                            </div>

                            {/* Collection Dropdown */}
                            <div className="space-y-3">
                                <div className="relative">
                                    <FolderOpen className="absolute left-3 top-2.5 text-gray-400" size={16} />
                                    <select
                                        className="w-full pl-10 p-2.5 rounded-lg border border-gray-200 text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none cursor-pointer"
                                        value={collection}
                                        onChange={(e) => setCollection(e.target.value)}
                                    >
                                        <option value={COLLECTION_NONE}>{t('tabs.draft.noCollection')}</option>
                                        {myCollections?.data?.content?.map(col => (
                                            <option key={col.id} value={col.id}>{col.name}</option>
                                        ))}
                                        <option value={COLLECTION_NEW}>{t('tabs.draft.createNewCollection')}</option>
                                    </select>
                                    <div className="absolute right-3 top-3 pointer-events-none">
                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </div>
                                </div>

                                {collection === COLLECTION_NEW && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="bg-blue-50 p-3 rounded-lg border border-blue-100"
                                    >
                                        <label className="text-xs font-semibold text-blue-800 mb-1 block">{t('tabs.draft.newCollectionName')}</label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                autoFocus
                                                type="text"
                                                className="w-full text-sm p-2 rounded border border-blue-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                                placeholder={t('tabs.draft.newCollectionPlaceholder')}
                                                value={customCollectionName}
                                                onChange={(e) => setCustomCollectionName(e.target.value)}
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </div>

                        {/* Save Action */}
                        <div className="pt-4">
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className={cn(
                                    "w-full py-3 bg-green-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-green-500/20 flex items-center justify-center gap-2",
                                    isSaving ? "opacity-75 cursor-not-allowed" : "hover:bg-green-700 hover:-translate-y-0.5 active:scale-95"
                                )}
                            >
                                {isSaving ? (
                                    <><Loader2 size={18} className="animate-spin" /> {t('tabs.draft.saving')}</>
                                ) : (
                                    <><Save size={18} /> {isOwner && promptData.id ? t('tabs.draft.saveNewVersion') : t('tabs.draft.saveAsCopy')}</>
                                )}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
