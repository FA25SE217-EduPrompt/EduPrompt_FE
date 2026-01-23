"use client";

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
    ChevronDown,
    ChevronRight,
    Upload,
    Eye,
    Edit3,
    History,
    RotateCcw,
    X,
    Loader2,
    Tag,
    User
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useWorkbench } from './WorkbenchContext';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { useGetPromptVersions, useGetPrompt, useRollbackPromptVersion } from '@/hooks/queries/prompt';
import { format } from 'date-fns';
import { toast } from 'sonner';

// --- Components ---

const AccordionItem = ({
    title,
    isOpen,
    onToggle,
    children,
    heightClass = "h-32",
    id
}: {
    title: string;
    isOpen: boolean;
    onToggle: () => void;
    children: React.ReactNode;
    heightClass?: string;
    id?: string;
}) => {
    return (
        <div id={id} className="border-b border-gray-100 last:border-0">
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors group"
            >
                <span className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2 group-hover:text-primary transition-colors">
                    {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    {title}
                </span>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className={cn("p-4 pt-0", heightClass)}>
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};



export const WorkbenchEditor: React.FC = () => {
    const t = useTranslations('Workbench');
    const {
        promptData,
        updatePromptField,
        activeSection,
        setPromptData,
        viewingVersionId,
        setViewingVersionId,
        isHistoryMode,
        isOwner
    } = useWorkbench();

    // History Panel State
    const [showHistory, setShowHistory] = useState(false);

    // Queries
    const { data: versions, isLoading: isLoadingVersions } = useGetPromptVersions(promptData.id || '', {
        // Only fetch if ID exists and panel is opening/open? 
        // We can let react-query handle caching, but enabled is good
    });

    const { mutateAsync: rollbackMutation, isPending: isRollingBack } = useRollbackPromptVersion();

    // Fetch original "latest" prompt data to revert back
    const { refetch: refetchLatest } = useGetPrompt(promptData.id || '', undefined, {
        enabled: false // Only fetch manually when exiting history mode to be safe
    });

    const handleVersionSelect = (version: { id: string; instruction: string; context?: string; inputExample?: string; outputFormat?: string; constraints?: string }) => {
        // Set context data to this version
        // Map version fields to PromptData

        // Note: badges, title might not be in version if version only tracks content.
        // Assuming version response has content fields.
        setPromptData({
            ...promptData,
            instruction: version.instruction,
            context: version.context || '',
            inputData: version.inputExample || '', // API naming diff
            outputFormat: version.outputFormat || '',
            constraints: version.constraints || '',
            // Keep current title/badges or use version's if available? 
            // Typically title isn't versioned in some systems, but let's assume content focus.
        });
        setViewingVersionId(version.id);
        // Don't close panel, user might want to browse
    };

    const handleExitHistory = async () => {
        // Reload latest data
        try {
            const res = await refetchLatest();
            if (res.data && res.data.data) {
                const latest = res.data.data;
                setPromptData({
                    ...promptData,
                    instruction: latest.instruction,
                    context: latest.context || '',
                    inputData: latest.inputExample || '',
                    outputFormat: latest.outputFormat || '',
                    constraints: latest.constraints || ''
                });
            }
        } catch (e) {
            console.error(e);
        }
        setViewingVersionId(null);
        setShowHistory(false);
    };

    const handleRestore = async () => {
        if (!promptData.id || !viewingVersionId) return;

        try {
            await rollbackMutation({ promptId: promptData.id, versionId: viewingVersionId });
            toast.success("Restored version successfully!");

            // Exit history mode, which refreshes data via query invalidation in hook
            setViewingVersionId(null);
            setShowHistory(false);
        } catch {
            toast.error("Failed to restore version");
        }
    };


    // Mode State: 'edit' or 'preview'
    const [mode, setMode] = useState<'edit' | 'preview'>('edit');

    // Accordion State
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({
        instruction: true,
        context: true,
        inputData: false,
        outputFormat: false,
        constraints: false
    });

    // Valid sections list to check against
    const validSections = React.useMemo(() => ['instruction', 'context', 'inputData', 'outputFormat', 'constraints'], []);

    React.useEffect(() => {
        if (activeSection && validSections.includes(activeSection)) {
            // Force edit mode if external trigger
            setMode('edit');
            setOpenSections(prev => ({
                ...prev,
                [activeSection]: true
            }));

            // Scroll to element maybe? 
            const element = document.getElementById(`section-${activeSection}`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }, [activeSection, validSections]);

    const toggleSection = (section: string) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    // Combine for Preview
    const combinedPrompt = `
**Instruction:**
${promptData.instruction}

**Context:**
${promptData.context}

**Input Example:**
${promptData.inputData}

**Output Format:**
${promptData.outputFormat}

**Constraints:**
${promptData.constraints}
    `.trim();

    return (
        <div className="h-full flex flex-col bg-white border-r border-gray-200 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)] z-10 relative">

            {/* --- Header Bar --- */}
            <div className="px-6 py-5 border-b border-gray-100 flex flex-col gap-4 bg-white">

                {/* Top Row: Title & Metadata */}
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                        <input
                            type="text"
                            placeholder={t('untitled')}
                            className="w-full text-xl font-bold text-slate-900 placeholder-gray-300 border border-transparent hover:border-gray-200 focus:border-primary/20 focus:bg-gray-50 rounded-lg px-2 -ml-2 transition-all"
                            value={promptData.title}
                            onChange={(e) => updatePromptField('title', e.target.value)}
                        />
                        <div className="flex gap-2 items-center mt-1">
                            {/* Dynamic Badges */}
                            {promptData.badges.map((badge, index) => (
                                <motion.div
                                    key={index}
                                    whileHover={{ scale: 1.05, y: -1 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-[11px] font-bold uppercase tracking-wider border border-indigo-100 shadow-sm select-none cursor-help"
                                >
                                    <Tag size={12} className="stroke-[2.5]" />
                                    <span>{badge}</span>
                                </motion.div>
                            ))}

                            {/* Owner Badge */}
                            {isOwner && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-[11px] font-bold uppercase tracking-wider border border-amber-100 shadow-sm select-none"
                                >
                                    <User size={12} className="stroke-[2.5]" />
                                    <span>{t('myPrompt')}</span>
                                </motion.div>
                            )}
                        </div>
                    </div>
                    {/* History Toggle */}
                    {promptData.id && (
                        <button
                            onClick={() => setShowHistory(!showHistory)}
                            className={cn(
                                "p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500",
                                showHistory && "bg-blue-50 text-blue-600"
                            )}
                            title={t('versionHistory')}
                        >
                            <History size={20} />
                        </button>
                    )}
                </div>

                {/* Mode Switcher - Segmented Control */}
                <div className="bg-gray-100 p-1 rounded-lg flex items-center self-center">
                    {(['edit', 'preview'] as const).map((m) => (
                        <button
                            key={m}
                            onClick={() => setMode(m)}
                            className={cn(
                                "relative px-6 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-2 z-10",
                                mode === m ? "text-slate-900" : "text-gray-500 hover:text-gray-700"
                            )}
                        >
                            {mode === m && (
                                <motion.div
                                    layoutId="activeMode"
                                    className="absolute inset-0 bg-white rounded-md shadow-sm -z-10"
                                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                />
                            )}
                            {m === 'edit' ? <Edit3 size={14} /> : <Eye size={14} />}
                            <span className="capitalize">{t(m)}</span>
                        </button>
                    ))}
                </div>

            </div>


            {/* --- History Mode Banner --- */}
            {
                isHistoryMode && (
                    <div className="bg-amber-50 border-b border-amber-100 px-6 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-amber-800 text-sm">
                            <History size={16} />
                            <span className="font-medium">{t('viewingOlder')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleExitHistory}
                                className="px-3 py-1 text-xs font-semibold text-gray-600 hover:bg-white/50 rounded-md transition-colors"
                            >
                                {t('cancel')}
                            </button>
                            <button
                                onClick={handleRestore}
                                disabled={isRollingBack}
                                className="px-3 py-1 text-xs font-semibold bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors flex items-center gap-1"
                            >
                                {isRollingBack ? <Loader2 size={12} className="animate-spin" /> : <RotateCcw size={12} />}
                                {t('restore')}
                            </button>
                        </div>
                    </div>
                )
            }

            {/* --- History Sidebar (Drawer) --- */}
            <AnimatePresence>
                {showHistory && (
                    <motion.div
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 280, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        className="absolute top-[81px] right-0 bottom-0 bg-white border-l border-gray-200 shadow-xl z-20 overflow-hidden flex flex-col"
                    >
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                            <h3 className="font-semibold text-sm text-gray-700 flex items-center gap-2">
                                <History size={16} /> {t('versionHistory')}
                            </h3>
                            <button onClick={() => setShowHistory(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={16} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-2 space-y-2">
                            {isLoadingVersions ? (
                                <div className="flex justify-center py-8 text-gray-400"><Loader2 className="animate-spin" /></div>
                            ) : versions?.data?.map((v) => (
                                <button
                                    key={v.id}
                                    onClick={() => handleVersionSelect(v)}
                                    className={cn(
                                        "w-full text-left p-3 rounded-lg text-sm border transition-all",
                                        viewingVersionId === v.id
                                            ? "bg-blue-50 border-blue-200 ring-1 ring-blue-200"
                                            : "bg-white border-gray-100 hover:border-gray-300 hover:shadow-sm"
                                    )}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-bold text-slate-700">v{v.versionNumber}</span>
                                        {viewingVersionId === v.id && <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-bold">{t('viewing')}</span>}
                                    </div>
                                    <p className="text-xs text-gray-500 mb-1">
                                        {format(new Date(v.createdAt), 'MMM d, yyyy • h:mm a')}
                                    </p>
                                    <p className="text-[10px] text-gray-400">
                                        {v.editorId || 'Unknown User'}
                                    </p>
                                </button>
                            ))}
                            {versions?.data?.length === 0 && (
                                <p className="text-center text-xs text-gray-400 py-4">{t('noHistory')}</p>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- Content Area --- */}
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 hover:scrollbar-thumb-gray-300">
                {mode === 'preview' ? (
                    <div className="p-8">
                        <div className="prose prose-slate prose-sm max-w-none bg-gray-50 p-8 rounded-2xl border border-gray-100 shadow-sm">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {combinedPrompt}
                            </ReactMarkdown>
                            {combinedPrompt.length < 20 && (
                                <div className="text-center text-gray-400 italic py-10">
                                    {t('startTyping')}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <>
                        {/* 1. Instruction */}
                        <AccordionItem
                            id="section-instruction"
                            title={t('sections.instruction')}
                            isOpen={openSections.instruction}
                            onToggle={() => toggleSection('instruction')}
                            heightClass="h-64" // Tall
                        >
                            <textarea
                                className={cn(
                                    "w-full h-full p-4 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none font-mono bg-gray-50/50 leading-relaxed",
                                    isHistoryMode && "opacity-60 cursor-not-allowed bg-gray-100"
                                )}
                                placeholder={t('placeholders.instruction')}
                                value={promptData.instruction}
                                onChange={(e) => updatePromptField('instruction', e.target.value)}
                                disabled={isHistoryMode}
                            />
                        </AccordionItem>

                        {/* 2. Context */}
                        <AccordionItem
                            id="section-context"
                            title={t('sections.context')}
                            isOpen={openSections.context}
                            onToggle={() => toggleSection('context')}
                            heightClass="h-48" // Medium
                        >
                            <div className="relative h-full group">
                                <textarea
                                    className={cn(
                                        "w-full h-full p-4 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none bg-gray-50/50",
                                        isHistoryMode && "opacity-60 cursor-not-allowed bg-gray-100"
                                    )}
                                    placeholder={t('placeholders.context')}
                                    value={promptData.context}
                                    onChange={(e) => updatePromptField('context', e.target.value)}
                                    disabled={isHistoryMode}
                                />

                                {/* Drop Zone Visual Cue */}
                                <div className="absolute bottom-3 right-3 pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity">
                                    <span className="text-[10px] bg-white px-2 py-1 rounded-md border border-gray-200 text-gray-400 flex items-center gap-1">
                                        <Upload size={10} /> {t('dropFile')}
                                    </span>
                                </div>
                            </div>
                        </AccordionItem>

                        {/* 3. Input Data */}
                        <AccordionItem
                            id="section-inputData"
                            title={t('sections.inputData')}
                            isOpen={openSections.inputData}
                            onToggle={() => toggleSection('inputData')}
                            heightClass="h-40"
                        >
                            <textarea
                                className={cn(
                                    "w-full h-full p-4 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none bg-gray-50/50",
                                    isHistoryMode && "opacity-60 cursor-not-allowed bg-gray-100"
                                )}
                                placeholder={t('placeholders.inputData')}
                                value={promptData.inputData}
                                onChange={(e) => updatePromptField('inputData', e.target.value)}
                                disabled={isHistoryMode}
                            />
                        </AccordionItem>

                        {/* 4. Output Format */}
                        <AccordionItem
                            id="section-outputFormat"
                            title={t('sections.outputFormat')}
                            isOpen={openSections.outputFormat}
                            onToggle={() => toggleSection('outputFormat')}
                            heightClass="h-32"
                        >
                            <textarea
                                className={cn(
                                    "w-full h-full p-4 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none bg-gray-50/50",
                                    isHistoryMode && "opacity-60 cursor-not-allowed bg-gray-100"
                                )}
                                placeholder={t('placeholders.outputFormat')}
                                value={promptData.outputFormat}
                                onChange={(e) => updatePromptField('outputFormat', e.target.value)}
                                disabled={isHistoryMode}
                            />
                        </AccordionItem>

                        {/* 5. Constraints */}
                        <AccordionItem
                            id="section-constraints"
                            title={t('sections.constraints')}
                            isOpen={openSections.constraints}
                            onToggle={() => toggleSection('constraints')}
                            heightClass="h-32"
                        >
                            <textarea
                                className={cn(
                                    "w-full h-full p-4 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none bg-gray-50/50",
                                    isHistoryMode && "opacity-60 cursor-not-allowed bg-gray-100"
                                )}
                                placeholder={t('placeholders.constraints')}
                                value={promptData.constraints}
                                onChange={(e) => updatePromptField('constraints', e.target.value)}
                                disabled={isHistoryMode}
                            />
                        </AccordionItem>
                    </>
                )}
            </div>
        </div>
    );
};
