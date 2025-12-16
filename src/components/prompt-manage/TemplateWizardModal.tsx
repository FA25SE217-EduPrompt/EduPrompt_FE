import React, { useState } from 'react';
import Button from "@/components/ui/Button";
import { Template, TemplateQuestion } from '@/lib/prompt-templates';
import { useTranslations } from 'next-intl';
import { ChevronRight, Sparkles, SkipForward } from 'lucide-react';

interface TemplateWizardModalProps {
    isOpen: boolean;
    onClose: () => void;
    template: Template;
    onGenerate: (optimizationInstruction: string) => void;
    onSkip: () => void;
}

export function TemplateWizardModal({ isOpen, onClose, template, onGenerate, onSkip }: TemplateWizardModalProps) {
    const t = useTranslations('Prompt.Wizard');
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [step, setStep] = useState<'groupA' | 'groupB'>('groupA');

    if (!isOpen || !template.questions) {
        return null;
    }

    const currentGroup = step === 'groupA' ? template.questions.groupA : template.questions.groupB;

    const handleNext = () => {
        if (step === 'groupA') {
            setStep('groupB');
        } else {
            handleFinish();
        }
    };

    const handleBack = () => {
        if (step === 'groupB') {
            setStep('groupA');
        }
    };

    const handleFinish = () => {
        // Construct the instruction string
        let instruction = `Based on the ${template.id} template (${template.title}), here are the user's specific requirements:\n\n`;

        // Add Group A answers
        instruction += `--- ${t('groupA')} ---\n`;
        template.questions?.groupA.questions.forEach(q => {
            const ans = answers[q.id] || 'Not specified';
            instruction += `${q.label}: ${ans}\n`;
        });

        // Add Group B answers
        instruction += `\n--- ${t('groupB')} ---\n`;
        template.questions?.groupB.questions.forEach(q => {
            const ans = answers[q.id] || 'Not specified';
            instruction += `${q.label}: ${ans}\n`;
        });

        instruction += `\nPlease optimize the prompt to specifically address these needs.`;

        onGenerate(instruction);
    };

    const handleAnswerChange = (id: string, value: string) => {
        setAnswers(prev => ({ ...prev, [id]: value }));
    };

    const renderQuestion = (q: TemplateQuestion) => {
        return (
            <div key={q.id} className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block">
                    {q.label}
                </label>
                {q.type === 'textarea' ? (
                    <textarea
                        placeholder={q.placeholder || t('placeholder')}
                        value={answers[q.id] || ''}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                        className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300"
                    />
                ) : q.type === 'select' ? (
                    <div className="relative">
                        <select
                            onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                            value={answers[q.id] || ''}
                            className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus:ring-slate-300 appearance-none"
                        >
                            <option value="" disabled>{t('selectPlaceholder') || "Select..."}</option>
                            {q.options?.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                        <ChevronRight className="absolute right-3 top-3 h-4 w-4 rotate-90 text-slate-500 pointer-events-none" />
                    </div>
                ) : (
                    <input
                        placeholder={q.placeholder || t('placeholder')}
                        value={answers[q.id] || ''}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                        className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300"
                    />
                )}
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg max-w-[600px] w-full max-h-[90vh] flex flex-col relative animate-in zoom-in-95 duration-200">
                <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-semibold leading-none tracking-tight">{t('title')}</h2>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {t('subtitle')}
                    </p>
                </div>

                <div className="p-6 py-4 space-y-6 flex-1 overflow-y-auto">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                            {step === 'groupA' ? t('groupA') : t('groupB')}
                        </h3>
                        <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">
                            Step {step === 'groupA' ? '1' : '2'} of 2
                        </span>
                    </div>

                    <div className="space-y-4 pr-2">
                        {currentGroup.questions.map(renderQuestion)}
                    </div>
                </div>

                <div className="p-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between mt-auto">
                    <Button variant="ghost" onClick={step === 'groupA' ? onSkip : handleBack} className="text-slate-500 hover:text-slate-700">
                        {step === 'groupA' ? (
                            <span className="flex items-center gap-2">
                                <SkipForward className="w-4 h-4" /> {t('skip')}
                            </span>
                        ) : (
                            t('back')
                        )}
                    </Button>

                    <Button onClick={handleNext} className="bg-blue-600 hover:bg-blue-700 text-white gap-2 flex items-center">
                        {step === 'groupB' ? (
                            <>
                                <Sparkles className="w-4 h-4" />
                                {t('generate')}
                            </>
                        ) : (
                            <>
                                {t('next')}
                                <ChevronRight className="w-4 h-4" />
                            </>
                        )}
                    </Button>
                </div>
            </div>
            {/* Backdrop click to close */}
            <div className="absolute inset-0 -z-10" onClick={onClose} />
        </div>
    );
}
