"use client";

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { CheckCircle, AlertTriangle, AlertCircle, RefreshCw, BarChart3, Loader2 } from 'lucide-react';
import { useWorkbench } from '../WorkbenchContext';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export const AuditTab = () => {
    const t = useTranslations('Workbench');
    const { promptData, highlightSection } = useWorkbench();
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState<any>(null); // Replace with proper type later

    const handleScore = () => {
        setAnalyzing(true);
        setTimeout(() => {
            setAnalyzing(false);
            // Mock Result
            setResult({
                score: 85.5,
                dimensions: [
                    { name: "Clarity", score: 90, status: 'good' },
                    { name: "Context", score: 80, status: 'good' },
                    { name: "Constraints", score: 60, status: 'warning' }
                ],
                issues: [
                    { id: 1, type: 'warning', text: "Instruction is slightly ambiguous.", field: 'instruction' },
                    { id: 2, type: 'error', text: "Missing output constraints.", field: 'constraints' }
                ]
            });
        }, 1500);
    };

    return (
        <div className="flex flex-col h-full bg-gray-50/50">
            {!result ? (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-gray-500">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-gray-100">
                        <BarChart3 size={32} className="text-gray-300" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Ready to Audit</h3>
                    <p className="text-sm text-gray-400 mb-6 max-w-xs">Analyze your prompt for clarity, missing context, and potential improvements.</p>
                    <button
                        onClick={handleScore}
                        disabled={analyzing}
                        className={cn(
                            "px-6 py-2.5 bg-white border border-primary text-primary font-semibold rounded-xl shadow-sm flex items-center gap-2",
                            analyzing ? "opacity-70 cursor-not-allowed" : "hover:bg-primary/5 hover:-translate-y-0.5 active:scale-95 transition-all"
                        )}
                    >
                        {analyzing ? (
                            <><Loader2 size={16} className="animate-spin" /> Scoring...</>
                        ) : (
                            "Score Prompt"
                        )}
                    </button>
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {/* Scorecard Visual */}
                    <div className="flex items-center justify-center">
                        <div className="relative w-40 h-40 flex items-center justify-center">
                            {/* Simple SVG Ring */}
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="80" cy="80" r="70" stroke="#e2e8f0" strokeWidth="12" fill="transparent" />
                                <circle
                                    cx="80" cy="80" r="70"
                                    stroke={result.score > 80 ? "#22c55e" : "#f59e0b"}
                                    strokeWidth="12"
                                    fill="transparent"
                                    strokeDasharray="440"
                                    strokeDashoffset={440 - (440 * result.score) / 100}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute flex flex-col items-center">
                                <span className="text-4xl font-bold text-slate-800">{result.score}</span>
                                <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">Overall</span>
                            </div>
                        </div>
                    </div>

                    {/* Dimensions */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Dimensions</h4>
                        {result.dimensions.map((dim: any) => (
                            <div key={dim.name} className="flex items-center justify-between text-sm">
                                <span className="text-slate-600 font-medium">{dim.name}</span>
                                <div className="flex items-center gap-3">
                                    <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className={cn("h-full rounded-full", dim.status === 'good' ? "bg-green-500" : "bg-orange-500")}
                                            style={{ width: `${dim.score}%` }}
                                        />
                                    </div>
                                    <span className="text-xs font-mono text-gray-500 w-6 text-right">{dim.score}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Issues List */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Detected Issues</h4>
                        {result.issues.map((issue: any) => (
                            <button
                                key={issue.id}
                                onClick={() => highlightSection(issue.field)}
                                className={cn(
                                    "w-full p-4 rounded-xl border flex items-start gap-3 transition-all hover:shadow-md text-left",
                                    issue.type === 'error' ? "bg-red-50 border-red-100" : "bg-orange-50 border-orange-100"
                                )}
                            >
                                {issue.type === 'error' ? (
                                    <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={16} />
                                ) : (
                                    <AlertTriangle className="text-orange-500 shrink-0 mt-0.5" size={16} />
                                )}
                                <div>
                                    <p className={cn("text-xs font-semibold mb-0.5", issue.type === 'error' ? "text-red-800" : "text-orange-800")}>
                                        {issue.text}
                                    </p>
                                    <p className={cn("text-[10px]", issue.type === 'error' ? "text-red-600" : "text-orange-600")}>
                                        Click to fix in {issue.field}
                                    </p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
