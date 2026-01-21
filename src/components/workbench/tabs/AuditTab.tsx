"use client";

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { AlertTriangle, AlertCircle, RefreshCw, BarChart3, Loader2 } from 'lucide-react';
import { useWorkbench } from '../WorkbenchContext';
import { cn } from '@/lib/utils';
import { scorePrompt } from '@/services/prompt-ai';
import { DimensionScore } from '@/types/prompt.api';
import { toast } from 'sonner';

export const AuditTab = () => {
    const t = useTranslations('Workbench');
    const { promptData, highlightSection, setScoringResult } = useWorkbench();
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState<{
        score: number,
        dimensions: { name: string, score: number, status: 'good' | 'warning' | 'error' }[],
        issues: { id: string, type: 'warning' | 'error', text: string, field: string }[]
    } | null>(null);

    const mapDimensionToField = (dimName: string): string => {
        switch (dimName) {
            case 'Instruction Clarity': return 'instruction';
            case 'Context Completeness': return 'context';
            case 'Output Specification': return 'outputFormat';
            case 'Constraint Strength': return 'constraints';
            // Fallback for others
            default: return 'instruction';
        }
    };

    const handleScore = async () => {
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
            toast.error("Prompt is too short to score");
            return;
        }

        setAnalyzing(true);
        try {
            const response = await scorePrompt({ promptContent: content });
            const data = response.data;

            // Transform API result to UI format
            const dimensions = [
                data.instructionClarity,
                data.contextCompleteness,
                data.outputSpecification,
                data.constraintStrength,
                data.curriculumAlignment,
                data.pedagogicalQuality
            ].map((d: DimensionScore) => ({
                name: d.dimensionName,
                score: d.score,
                status: d.score >= 80 ? 'good' : d.score >= 60 ? 'warning' : 'error'
            })) as { name: string, score: number, status: 'good' | 'warning' | 'error' }[];

            const issues: { id: string, type: 'warning' | 'error', text: string, field: string }[] = [];

            // Collect issues
            [
                data.instructionClarity,
                data.contextCompleteness,
                data.outputSpecification,
                data.constraintStrength,
                data.curriculumAlignment,
                data.pedagogicalQuality
            ].forEach((d: DimensionScore) => {
                if (d.issues && d.issues.length > 0) {
                    d.issues.forEach((issue, idx) => {
                        issues.push({
                            id: `${d.dimensionName}-${idx}`,
                            type: d.score < 60 ? 'error' : 'warning',
                            text: issue,
                            field: mapDimensionToField(d.dimensionName)
                        });
                    });
                }
            });

            setResult({
                score: data.overallScore,
                dimensions,
                issues
            });
            setScoringResult(data); // Save raw result to context for other tabs
            toast.success("Prompt scored successfully");

        } catch (error: unknown) {
            console.error(error);
            const err = error as { message?: string };
            toast.error(err.message || "Failed to score prompt");
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-gray-50/50">
            {!result ? (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-gray-500">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-gray-100">
                        <BarChart3 size={32} className="text-gray-300" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">{t('tabs.audit.ready')}</h3>
                    <p className="text-sm text-gray-400 mb-6 max-w-xs">{t('tabs.audit.description')}</p>
                    <button
                        onClick={handleScore}
                        disabled={analyzing}
                        className={cn(
                            "px-6 py-2.5 bg-white border border-primary text-primary font-semibold rounded-xl shadow-sm flex items-center gap-2",
                            analyzing ? "opacity-70 cursor-not-allowed" : "hover:bg-primary/5 hover:-translate-y-0.5 active:scale-95 transition-all"
                        )}
                    >
                        {analyzing ? (
                            <><Loader2 size={16} className="animate-spin" /> {t('tabs.audit.scoring')}</>
                        ) : (
                            t('tabs.audit.scorePrompt')
                        )}
                    </button>
                    {analyzing && <p className="text-xs text-gray-400 mt-4">{t('tabs.audit.evaluating')}</p>}
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {/* Scorecard Visual */}
                    <div className="flex items-center justify-center relative">
                        {/* Re-score button absolute positioned */}
                        <button
                            onClick={handleScore}
                            disabled={analyzing}
                            className="absolute top-0 right-0 p-2 text-gray-400 hover:text-primary transition-colors"
                            title={t('tabs.audit.reScore')}
                        >
                            <RefreshCw size={16} className={cn(analyzing && "animate-spin")} />
                        </button>

                        <div className="relative w-40 h-40 flex items-center justify-center">
                            {/* Simple SVG Ring */}
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="80" cy="80" r="70" stroke="#e2e8f0" strokeWidth="12" fill="transparent" />
                                <circle
                                    cx="80" cy="80" r="70"
                                    stroke={result.score >= 80 ? "#22c55e" : result.score >= 60 ? "#f59e0b" : "#ef4444"}
                                    strokeWidth="12"
                                    fill="transparent"
                                    strokeDasharray="440"
                                    strokeDashoffset={440 - (440 * result.score) / 100}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute flex flex-col items-center">
                                <span className="text-4xl font-bold text-slate-800">{result.score.toFixed(1)}</span>
                                <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">{t('tabs.audit.overall')}</span>
                            </div>
                        </div>
                    </div>

                    {/* Dimensions */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t('tabs.audit.dimensions')}</h4>
                        {result.dimensions.map((dim) => (
                            <div key={dim.name} className="flex items-center justify-between text-sm">
                                <span className="text-slate-600 font-medium">{dim.name}</span>
                                <div className="flex items-center gap-3">
                                    <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className={cn(
                                                "h-full rounded-full transition-all duration-500",
                                                dim.status === 'good' ? "bg-green-500" : dim.status === 'warning' ? "bg-orange-500" : "bg-red-500"
                                            )}
                                            style={{ width: `${dim.score}%` }}
                                        />
                                    </div>
                                    <span className="text-xs font-mono text-gray-500 w-8 text-right">{dim.score.toFixed(0)}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Issues List */}
                    {result.issues.length > 0 && (
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t('tabs.audit.detectedIssues')}</h4>
                            {result.issues.map((issue) => (
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
                                            {t('tabs.audit.clickToFix', { field: issue.field })}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

