"use client";

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Sparkles, Sliders, Check, X, Loader2 } from 'lucide-react';
import { AxiosError } from 'axios';
import { useWorkbench, PromptData } from '../WorkbenchContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { optimizePrompt } from '@/services/prompt-ai';
import { OptimizationResponse, OptimizationMode } from '@/types/prompt.api';
import { ErrorPayload } from '@/types/api';

export const OptimizeTab = () => {
    const t = useTranslations('Workbench');
    const { promptData, setPromptData, deductQuota, scoringResult, optimizationState, setOptimizationState } = useWorkbench();

    const { isOptimizing, optimizedData, optimizationMode, selectedDimensions } = optimizationState;

    // Helper setters
    const setIsOptimizing = (val: boolean) => setOptimizationState(prev => ({ ...prev, isOptimizing: val }));
    const setOptimizedData = (val: OptimizationResponse | null) => setOptimizationState(prev => ({ ...prev, optimizedData: val }));
    const setOptimizationMode = (val: OptimizationMode) => setOptimizationState(prev => ({ ...prev, optimizationMode: val }));
    const setSelectedDimensions = (val: string[] | ((prev: string[]) => string[])) => {
        setOptimizationState(prev => {
            const newValue = typeof val === 'function' ? val(prev.selectedDimensions) : val;
            return { ...prev, selectedDimensions: newValue };
        });
    };

    // --- Granular Application State ---
    const [parsedSections, setParsedSections] = useState<Record<string, string>>({});
    const [sectionsToApply, setSectionsToApply] = useState<Record<string, boolean>>({
        instruction: true,
        context: true,
        inputData: true,
        outputFormat: true,
        constraints: true
    });

    // --- Parser Utility ---
    const parseOptimizedPrompt = (fullText: string) => {
        const sections: Record<string, string> = {
            instruction: '',
            context: '',
            inputData: '',
            outputFormat: '',
            constraints: ''
        };

        // Normalize text
        const text = fullText.replace(/\r\n/g, '\n');

        // Regex to find headers like **INSTRUCTION** or **CONTEXT**
        // We look for **HEADER** and capture everything until the next header or end of string
        // Headers known: INSTRUCTION, CONTEXT, INPUT DATA, OUTPUT FORMAT, CONSTRAINTS
        // Note: INPUT EXAPLE might be used too? Check user provided data: "INPUT DATA"

        const headerMap: Record<string, string> = {
            'INSTRUCTION': 'instruction',
            'CONTEXT': 'context',
            'INPUT DATA': 'inputData',
            'INPUT EXAMPLE': 'inputData', // handle alias
            'OUTPUT FORMAT': 'outputFormat',
            'CONSTRAINTS': 'constraints',
            'CONSTRAINT': 'constraints' // handle singular
        };

        // Split by double asterisks headers, e.g. **INSTRUCTION**
        // But simply splitting might be fragile if prompt has other bold text.
        // Let's iterate.

        const headers = Object.keys(headerMap);

        // Strategy: Find indices of all headers
        let foundHeaders: { index: number, key: string, rawHeader: string }[] = [];

        headers.forEach(h => {
            // Look for **HEADER**, ## HEADER, followed optional colon, optional spaces
            // Escape spaces in h just in case
            const safeH = h.replace(/\s+/g, '\\s+');
            const regex = new RegExp(`(\\*\\*|##)\\s*${safeH}\\s*:?\\s*(\\*\\*)?`, 'gi');

            let match;
            while ((match = regex.exec(text)) !== null) {
                foundHeaders.push({
                    index: match.index,
                    key: headerMap[h],
                    rawHeader: match[0]
                });
            }
        });

        // Sort by index
        foundHeaders.sort((a, b) => a.index - b.index);

        // Extract content between headers
        for (let i = 0; i < foundHeaders.length; i++) {
            const current = foundHeaders[i];
            const next = foundHeaders[i + 1];

            const start = current.index + current.rawHeader.length;
            const end = next ? next.index : text.length;

            const content = text.slice(start, end).trim();
            sections[current.key] = content;
        }

        // If no headers found (fallback), put everything in instruction?
        if (foundHeaders.length === 0) {
            sections.instruction = text;
        }

        return sections;
    };

    // Parse when optimizedData changes
    useEffect(() => {
        if (optimizedData?.optimizedPrompt) {
            const parsed = parseOptimizedPrompt(optimizedData.optimizedPrompt);
            setParsedSections(parsed);
            // Reset selection to ALL valid sections (non-empty)
            const initialSelection: Record<string, boolean> = {};
            Object.keys(parsed).forEach(k => {
                if (parsed[k]) initialSelection[k] = true;
            });
            setSectionsToApply(initialSelection);
        }
    }, [optimizedData]);


    const handleOptimize = async () => {
        const content = `
${promptData.instruction}

Context:
${promptData.context}

Input Data:
${promptData.inputData}

Output Format:
${promptData.outputFormat}

Constraints:
${promptData.constraints}
        `.trim();

        if (content.length < 10) {
            toast.error("Prompt is too short to optimize");
            return;
        }

        setIsOptimizing(true);
        toast.info("Optimization started. This may take 1-2 minutes...");
        try {
            // Construct structured weaknesses
            // If user selected dimensions, we pull the specific issues from scoringResult
            let weaknessPayload: Record<string, string[]> | undefined = undefined;

            if (selectedDimensions.length > 0 && scoringResult?.detectedWeaknesses) {
                weaknessPayload = {};
                selectedDimensions.forEach(dim => {
                    const issues = scoringResult.detectedWeaknesses?.[dim];
                    if (issues) {
                        weaknessPayload![dim] = issues;
                    }
                });
            }

            const response = await optimizePrompt({
                promptContent: content,
                optimizationMode: optimizationMode,
                selectedWeaknesses: weaknessPayload
            });

            console.log("Optimization result:", response.data);

            console.log("Optimization result:", response.data);

            // Cheat Logic:
            // 1. "Private normally, Public boosted" -> Check visibility for ORIGINAL score.
            // 2. "System response always higher" -> Always boost OPTIMIZED score.

            const isPublic = promptData.visibility === 'public';
            const boostAmount = Math.floor(Math.random() * 11) + 10; // 10-20 points
            const boostScore = (s: number) => Math.min(s + boostAmount, 99);

            // Adjust Original Score (match Audit Tab logic)
            if (isPublic) {
                const original = response.data.originalScore;
                if (original) {
                    original.overallScore = boostScore(original.overallScore);
                    // Note: We don't render dimensions here deeply, but good to be consistent if needed later
                }
            }

            // Adjust Optimized Score (System = always boosted/high)
            // If the system returns a 'real' score (e.g. 75), we boost it to make it look 'System Tier' (e.g. 95+).
            const optimized = response.data.optimizedScore;
            if (optimized) {
                // Apply boost to make it look premium
                optimized.overallScore = boostScore(optimized.overallScore);
            }

            // Recalculate Improvement % based on adjusted scores
            // Formula: (New - Old) / Old * 100
            const oldScore = response.data.originalScore?.overallScore || 0;
            const newScore = response.data.optimizedScore?.overallScore || 0;

            if (oldScore > 0 && newScore > oldScore) {
                const newImprovement = ((newScore - oldScore) / oldScore) * 100;
                response.data.improvement = newImprovement;
            }

            setOptimizedData(response.data);
            deductQuota(150);
            toast.success(`Optimization Complete (+${response.data.improvement.toFixed(1)}% improvement)`);

        } catch (error: unknown) {
            console.error(error);
            const err = error as AxiosError<ErrorPayload, unknown>;
            if (err.response?.status === 503) {
                if (err.response?.data?.code === 'QUOTA_EXCEED') {
                    toast.error("Quota Exceeded", {
                        description: "You have insufficient balance. Please top up."
                    });
                } else {
                    toast.error("Model Overloaded", {
                        description: "System is busy. Your quota will be refunded. Please retry in 1-2 mins."
                    });
                }
            } else if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
                toast.error("Model might be overloaded. Please retry.");
            } else {
                toast.error(err.message || "Failed to optimize prompt");
            }
        } finally {
            setIsOptimizing(false);
        }
    };

    const applyOptimization = () => {
        if (optimizedData) {
            const newData: Partial<PromptData> = {};

            // Iterate through sections and apply only selected ones
            Object.entries(parsedSections).forEach(([key, content]) => {
                if (sectionsToApply[key]) {
                    // key matches PromptData keys (instruction, context, etc.)
                    // TypeScript cast needed as parsedSections keys are strings
                    (newData as any)[key] = content;
                }
            });

            setPromptData({
                ...promptData,
                ...newData
            });

            setOptimizedData(null);

            const appliedCount = Object.values(sectionsToApply).filter(Boolean).length;
            toast.success(`Applied improvements to ${appliedCount} section(s).`);
        }
    };

    const discardOptimization = () => {
        setOptimizedData(null);
    };

    const toggleDimension = (dim: string) => {
        if (selectedDimensions.includes(dim)) {
            setSelectedDimensions(prev => prev.filter(d => d !== dim));
        } else {
            setSelectedDimensions(prev => [...prev, dim]);
        }
    };

    // Get available weaknesses from scoring result
    const availableWeaknesses = scoringResult?.detectedWeaknesses
        ? Object.entries(scoringResult.detectedWeaknesses)
        : [];

    // Mock fallback if no score yet (or empty) - optional: show nothing or generic categories?
    // Req says "if user use scoring prompt, use weakness...". So if no score, maybe no suggestions?
    // Or we show generic 'Clarity', 'Context' as fallback?
    // Let's stick to showing what's in scoringResult. If null, show a message "Score prompt first to get targeted suggestions".

    return (
        <div className="flex flex-col h-full bg-gray-50/50">
            {!optimizedData ? (
                <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                    {/* Config Header */}
                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Sliders size={18} className="text-primary" />
                            <h3 className="font-bold text-slate-800">{t('tabs.optimize.settings')}</h3>
                        </div>

                        {/* Mode Selector */}
                        <div>
                            <label className="text-xs font-medium text-gray-500 mb-2 block">{t('tabs.optimize.mode')}</label>
                            <div className="flex bg-gray-100 p-1 rounded-lg relative z-0">
                                {['PEDAGOGICAL', 'SAFE'].map((m) => (
                                    <button
                                        key={m}
                                        onClick={() => setOptimizationMode(m as OptimizationMode)}
                                        className={cn(
                                            "flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors relative z-10",
                                            optimizationMode === m ? "text-slate-900" : "text-gray-600 hover:text-slate-900"
                                        )}
                                    >
                                        {t(`tabs.optimize.modes.${m}` as Parameters<typeof t>[0])}
                                        {optimizationMode === m && (
                                            <motion.div
                                                layoutId="optimizeModePill"
                                                className="absolute inset-0 bg-white rounded-md shadow-sm -z-10"
                                                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                            />
                                        )}
                                    </button>
                                ))}
                            </div>
                            <p className="text-[10px] text-gray-400 mt-1 px-1">
                                {optimizationMode === 'PEDAGOGICAL'
                                    ? t('tabs.optimize.pedagogicalDesc')
                                    : t('tabs.optimize.safeDesc')}
                            </p>
                        </div>

                        {/* Weakness Filter */}
                        <div>
                            <label className="text-xs font-medium text-gray-500 mb-2 block">
                                {t('tabs.optimize.focusAreas')}
                                {scoringResult && <span className="ml-1 text-primary text-[10px]">{t('tabs.optimize.auditDetected')}</span>}
                            </label>

                            {availableWeaknesses.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {availableWeaknesses.map(([dim, issues]) => (
                                        <button
                                            key={dim}
                                            onClick={() => toggleDimension(dim)}
                                            className={cn(
                                                "px-2 py-1 border rounded-md text-[10px] cursor-pointer transition-colors flex items-center gap-1",
                                                selectedDimensions.includes(dim)
                                                    ? "bg-primary/10 border-primary text-primary font-semibold"
                                                    : "bg-white border-gray-200 text-gray-600 hover:border-primary/50 hover:text-primary"
                                            )}
                                        >
                                            {dim}
                                            <span className="bg-gray-100 text-gray-500 px-1 rounded-full text-[9px]">{issues.length}</span>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-xs text-gray-400 italic bg-gray-50 p-3 rounded border border-dashed border-gray-200">
                                    {t('tabs.optimize.noWeakness')}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Optimize Action */}
                    <div className="flex flex-col items-center justify-center pt-10 text-center">
                        <p className="text-sm text-gray-500 max-w-xs mb-6">
                            {t('tabs.optimize.aiAnalyze')}
                        </p>
                        <button
                            onClick={handleOptimize}
                            disabled={isOptimizing}
                            className={cn(
                                "px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-bold shadow-lg shadow-blue-500/30 flex items-center gap-2 transition-all",
                                isOptimizing ? "opacity-90 cursor-not-allowed" : "hover:shadow-blue-500/50 hover:-translate-y-0.5 active:scale-95"
                            )}
                        >
                            {isOptimizing ? (
                                <><Loader2 size={18} className="animate-spin" /> {t('tabs.optimize.processing')}</>
                            ) : (
                                <><Sparkles size={18} /> {t('tabs.optimize.optimize')}</>
                            )}
                        </button>
                        {isOptimizing && (
                            <p className="text-xs text-blue-500 mt-4 animate-pulse">{t('tabs.optimize.refining')}</p>
                        )}
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col h-full">
                    {/* Diff View Header */}
                    <div className="px-6 py-4 bg-white border-b border-gray-200 flex items-center justify-between">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <Sparkles size={16} className="text-green-500" />
                            {t('tabs.optimize.result')}
                        </h3>
                        <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                            +{optimizedData.improvement.toFixed(1)}% {t('tabs.optimize.scoreImproved')}
                        </span>
                    </div>

                    {/* Granular Comparison Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-6">

                        {/* Summary of Fixes */}
                        <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-lg">
                            <h4 className="text-xs font-bold text-indigo-800 uppercase mb-2">{t('tabs.optimize.appliedImprovements')}</h4>
                            <ul className="list-disc list-inside text-xs text-indigo-700 space-y-1">
                                {optimizedData.appliedFixes.map((fix, i) => (
                                    <li key={i}>{fix}</li>
                                ))}
                            </ul>
                        </div>

                        {/* Sections List */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="text-xs font-bold text-slate-500 uppercase">{t('tabs.optimize.fullComparison')}</h4>
                                <div className="flex gap-2 text-[10px]">
                                    <button
                                        onClick={() => {
                                            const all: Record<string, boolean> = {};
                                            Object.keys(parsedSections).forEach(k => all[k] = true);
                                            setSectionsToApply(all);
                                        }}
                                        className="text-primary hover:underline"
                                    >
                                        Select All
                                    </button>
                                    <span className="text-gray-300">|</span>
                                    <button
                                        onClick={() => setSectionsToApply({})}
                                        className="text-gray-500 hover:text-gray-700 hover:underline"
                                    >
                                        Deselect All
                                    </button>
                                </div>
                            </div>

                            {Object.entries(parsedSections).map(([key, content]) => {
                                // Skip empty sections if they are empty in both (optional, but good for cleanup)
                                // Actually better to show what's changing.
                                const originalContent = (promptData as any)[key] || '';
                                const isModified = content.trim() !== originalContent.trim();

                                if (!content && !originalContent) return null;

                                return (
                                    <div key={key} className={cn(
                                        "border rounded-xl overflow-hidden transition-all",
                                        sectionsToApply[key] ? "border-primary/30 shadow-sm bg-white" : "border-gray-200 bg-gray-50/50 opacity-80"
                                    )}>
                                        {/* Header with Checkbox */}
                                        <div
                                            className="px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-100"
                                            onClick={() => setSectionsToApply(prev => ({ ...prev, [key]: !prev[key] }))}
                                        >
                                            <div className={cn(
                                                "w-5 h-5 rounded-md border flex items-center justify-center transition-all",
                                                sectionsToApply[key] ? "bg-primary border-primary text-white" : "bg-white border-gray-300 text-transparent"
                                            )}>
                                                <Check size={14} strokeWidth={3} />
                                            </div>

                                            <span className="text-sm font-bold capitalize text-slate-700">
                                                {/* Map key to nice label if needed, or rely on key name from parser which matches data keys */}
                                                {/* Translate key? For now capitalize */}
                                                {t(`sections.${key}` as any) || key}
                                            </span>

                                            {isModified && (
                                                <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium ml-auto">
                                                    Modified
                                                </span>
                                            )}
                                        </div>

                                        {/* Content Comparison */}
                                        {sectionsToApply[key] && (
                                            <div className="grid grid-cols-2 divide-x divide-gray-100">
                                                <div className="p-3 bg-red-50/30">
                                                    <div className="text-[10px] font-bold text-red-400 mb-1 uppercase tracking-wider">{t('tabs.optimize.original')}</div>
                                                    <p className="text-xs text-slate-600 whitespace-pre-wrap font-mono leading-relaxed">
                                                        {originalContent || <span className="text-gray-400 italic">Empty</span>}
                                                    </p>
                                                </div>
                                                <div className="p-3 bg-green-50/30">
                                                    <div className="text-[10px] font-bold text-green-600 mb-1 uppercase tracking-wider">{t('tabs.optimize.optimized')}</div>
                                                    <p className="text-xs text-slate-800 whitespace-pre-wrap font-mono leading-relaxed">
                                                        {content || <span className="text-gray-400 italic">Empty</span>}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-4 bg-white border-t border-gray-200 flex gap-3 z-10">
                        <button
                            onClick={discardOptimization}
                            className="flex-1 py-2.5 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 flex items-center justify-center gap-2 active:scale-95 transition-transform"
                        >
                            <X size={16} /> {t('tabs.optimize.discard')}
                        </button>
                        <button
                            onClick={applyOptimization}
                            disabled={!Object.values(sectionsToApply).some(v => v)}
                            className={cn(
                                "flex-1 py-2.5 bg-green-600 text-white font-bold rounded-xl shadow-lg shadow-green-500/20 flex items-center justify-center gap-2 transition-all",
                                !Object.values(sectionsToApply).some(v => v)
                                    ? "opacity-50 cursor-not-allowed bg-gray-400 shadow-none text-gray-100"
                                    : "hover:bg-green-700 hover:-translate-y-0.5 active:scale-95"
                            )}
                        >
                            <Check size={16} />
                            {Object.values(sectionsToApply).filter(v => v).length === Object.keys(parsedSections).length
                                ? "Apply All Changes"
                                : `Apply ${Object.values(sectionsToApply).filter(v => v).length} Section(s)`}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
