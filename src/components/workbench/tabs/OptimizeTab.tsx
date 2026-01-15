"use client";

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Sparkles, Sliders, Check, X, ArrowRight, Loader2 } from 'lucide-react';
import { useWorkbench } from '../WorkbenchContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export const OptimizeTab = () => {
    const t = useTranslations('Workbench');
    const { promptData, setPromptData, deductQuota } = useWorkbench();

    const [isOptimizing, setIsOptimizing] = useState(false);
    const [optimizedData, setOptimizedData] = useState<any>(null);
    const [optimizationMode, setOptimizationMode] = useState('Balanced');

    const handleOptimize = () => {
        setIsOptimizing(true);
        // Mock Optimization API
        setTimeout(() => {
            deductQuota(150);
            setIsOptimizing(false);
            setOptimizedData({
                ...promptData,
                instruction: promptData.instruction + " (Refined for clarity)",
                constraints: promptData.constraints + "\n- Explicitly state assumptions."
            });
            toast.success("Optimization Complete (Cost: 150 Tokens)");
        }, 2000);
    };

    const applyOptimization = () => {
        if (optimizedData) {
            setPromptData(optimizedData);
            setOptimizedData(null);
            toast.success("Changes Applied");
        }
    };

    const discardOptimization = () => {
        setOptimizedData(null);
    };

    return (
        <div className="flex flex-col h-full bg-gray-50/50">
            {!optimizedData ? (
                <div className="flex-1 p-6 space-y-6">
                    {/* Config Header */}
                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Sliders size={18} className="text-primary" />
                            <h3 className="font-bold text-slate-800">Optimization Settings</h3>
                        </div>

                        {/* Mode Selector */}
                        <div>
                            <label className="text-xs font-medium text-gray-500 mb-2 block">Optimization Mode</label>
                            <div className="flex bg-gray-100 p-1 rounded-lg relative z-0">
                                {['Creative', 'Balanced', 'Precise'].map((m) => (
                                    <button
                                        key={m}
                                        onClick={() => setOptimizationMode(m)}
                                        className={cn(
                                            "flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors relative z-10",
                                            optimizationMode === m ? "text-slate-900" : "text-gray-600 hover:text-slate-900"
                                        )}
                                    >
                                        {m}
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
                        </div>

                        {/* Weakness Filter */}
                        <div>
                            <label className="text-xs font-medium text-gray-500 mb-2 block">Focus Areas</label>
                            <div className="flex flex-wrap gap-2">
                                {['Clarity', 'Context', 'Tone', 'Structure'].map(tag => (
                                    <span key={tag} className="px-2 py-1 bg-white border border-gray-200 rounded-md text-[10px] text-gray-600 cursor-pointer hover:border-primary/50 hover:text-primary transition-colors">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Optimize Action */}
                    <div className="flex flex-col items-center justify-center pt-10 text-center">
                        <p className="text-sm text-gray-500 max-w-xs mb-6">
                            AI will analyze your prompt and suggest structural and semantic improvements.
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
                                <><Loader2 size={18} className="animate-spin" /> Processing...</>
                            ) : (
                                <><Sparkles size={18} /> Optimize Prompt</>
                            )}
                        </button>
                        {isOptimizing && (
                            <p className="text-xs text-blue-500 mt-4 animate-pulse">AI is refining your pedagogical approach...</p>
                        )}
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col h-full">
                    {/* Diff View Header */}
                    <div className="px-6 py-4 bg-white border-b border-gray-200 flex items-center justify-between">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <Sparkles size={16} className="text-green-500" />
                            Optimization Result
                        </h3>
                        <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">+15% Score Improved</span>
                    </div>

                    {/* Comparison Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {/* Example Diff Item: Instruction */}
                        <div className="space-y-2">
                            <h4 className="text-xs font-bold text-slate-500 uppercase">Instruction</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-xs text-red-900 opacity-70">
                                    {promptData.instruction}
                                </div>
                                <div className="p-3 bg-green-50 border border-green-100 rounded-lg text-xs text-green-900">
                                    {optimizedData.instruction}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h4 className="text-xs font-bold text-slate-500 uppercase">Constraints</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-xs text-red-900 opacity-70">
                                    {promptData.constraints}
                                </div>
                                <div className="p-3 bg-green-50 border border-green-100 rounded-lg text-xs text-green-900">
                                    {optimizedData.constraints}
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
                            <X size={16} /> Discard
                        </button>
                        <button
                            onClick={applyOptimization}
                            className="flex-1 py-2.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 shadow-lg shadow-green-500/20 flex items-center justify-center gap-2 hover:-translate-y-0.5 active:scale-95 transition-all"
                        >
                            <Check size={16} /> Apply Changes
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
