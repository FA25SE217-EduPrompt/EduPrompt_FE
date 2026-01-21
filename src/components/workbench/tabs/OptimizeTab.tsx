"use client";

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Sparkles, Sliders, Check, X, Loader2 } from 'lucide-react';
import { useWorkbench } from '../WorkbenchContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { optimizePrompt } from '@/services/prompt-ai';
import { OptimizationResponse, OptimizationMode } from '@/types/prompt.api';

export const OptimizeTab = () => {
    const t = useTranslations('Workbench');
    const { promptData, setPromptData, deductQuota, scoringResult } = useWorkbench();

    const [isOptimizing, setIsOptimizing] = useState(false);
    const [optimizedData, setOptimizedData] = useState<OptimizationResponse | null>(null);
    const [optimizationMode, setOptimizationMode] = useState<OptimizationMode>('PEDAGOGICAL');

    // selectedWeaknesses is now a Record<dimension, suggestions[]>
    // For UI simplicity, we might just select WHOLE dimensions to focus on, 
    // or select specific suggestions if we want granular control.
    // Based on requirements: "if user use scoring prompt , use weakness from the response to suggest in prompt optimization instead of filter."
    // So we should pick from `scoringResult.detectedWeaknesses`.

    // Let's store selected dimensions. When sending to API, we send the full array of suggestions for that dimension?
    // Or does the API expect us to filter specific strings?
    // "selectedWeaknesses": { "weakness1": ["string"] }
    // Let's assume user selects a Dimension ("Instruction Clarity") and we send all its detected weaknesses.
    // Or we allow selecting individual weakness strings. 

    // Implementation: Allow selecting DIMENSIONS that have weaknesses.
    const [selectedDimensions, setSelectedDimensions] = useState<string[]>([]);

    useEffect(() => {
        // Auto-select all dimensions with weaknesses initially? Or let user choose.
        // Let's reset when scoringResult changes
        setSelectedDimensions([]);
    }, [scoringResult]);

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

            setOptimizedData(response.data);
            deductQuota(150);
            toast.success(`Optimization Complete (+${response.data.improvement.toFixed(1)}% improvement)`);

        } catch (error: unknown) {
            console.error(error);
            const err = error as { code?: string; message?: string };
            if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
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
            setPromptData({
                ...promptData,
                instruction: optimizedData.optimizedPrompt,
                context: '',
                inputData: '',
                outputFormat: '',
                constraints: ''
            });

            setOptimizedData(null);
            toast.success("Changes Applied. Note: Full prompt merged into Instruction field.");
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

                    {/* Comparison Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">

                        {/* Summary of Fixes */}
                        <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-lg">
                            <h4 className="text-xs font-bold text-indigo-800 uppercase mb-2">{t('tabs.optimize.appliedImprovements')}</h4>
                            <ul className="list-disc list-inside text-xs text-indigo-700 space-y-1">
                                {optimizedData.appliedFixes.map((fix, i) => (
                                    <li key={i}>{fix}</li>
                                ))}
                            </ul>
                        </div>

                        {/* Since API returns full text, we compare full text. */}
                        <div className="space-y-2">
                            <h4 className="text-xs font-bold text-slate-500 uppercase">{t('tabs.optimize.fullComparison')}</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-[10px] font-bold text-red-500 mb-1 uppercase">{t('tabs.optimize.original')}</div>
                                    <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-xs text-red-900 opacity-70 whitespace-pre-wrap max-h-96 overflow-y-auto">
                                        {optimizedData.originalPrompt}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-[10px] font-bold text-green-600 mb-1 uppercase">{t('tabs.optimize.optimized')}</div>
                                    <div className="p-3 bg-green-50 border border-green-100 rounded-lg text-xs text-green-900 whitespace-pre-wrap max-h-96 overflow-y-auto">
                                        {optimizedData.optimizedPrompt}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-4 bg-white border-t border-gray-200 flex gap-3">
                        <button
                            onClick={discardOptimization}
                            className="flex-1 py-2.5 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 flex items-center justify-center gap-2 active:scale-95 transition-transform"
                        >
                            <X size={16} /> {t('tabs.optimize.discard')}
                        </button>
                        <button
                            onClick={applyOptimization}
                            className="flex-1 py-2.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 shadow-lg shadow-green-500/20 flex items-center justify-center gap-2 hover:-translate-y-0.5 active:scale-95 transition-all"
                        >
                            <Check size={16} /> {t('tabs.optimize.apply')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
