import React, { useState } from 'react';
import { PromptResponse, PromptAiModel } from '@/types/prompt.api';
import { BoltIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { Loader2 } from 'lucide-react';

interface OptimizationPanelProps {
    prompt: PromptResponse;
    onOptimize: (model: PromptAiModel, input: string) => void;
    isOptimizing: boolean;
}

const MODEL_OPTIONS = [
    { label: 'GPT-4o mini', value: 'GPT_4O_MINI' },
    { label: 'Claude 3.5 Sonnet', value: 'CLAUDE_3_5_SONNET' },
    { label: 'Gemini 2.5 Flash', value: 'GEMINI_2_5_FLASH' },
];

export const OptimizationPanel: React.FC<OptimizationPanelProps> = ({ onOptimize, isOptimizing }) => {
    const [selectedModel, setSelectedModel] = useState<PromptAiModel>('GPT_4O_MINI');
    const [optimizationInput, setOptimizationInput] = useState('');

    const handleOptimize = () => {
        onOptimize(selectedModel, optimizationInput);
    };

    return (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-white rounded-lg shadow-sm text-indigo-600">
                    <SparklesIcon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">AI Optimization</h3>
            </div>

            <p className="text-sm text-gray-600 mb-6">
                Enhance your prompt using AI. Select a model and provide specific instructions on how you want to improve it.
            </p>

            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">AI Model</label>
                    <select
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value as PromptAiModel)}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    >
                        {MODEL_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Optimization Instructions (Optional)</label>
                    <textarea
                        value={optimizationInput}
                        onChange={(e) => setOptimizationInput(e.target.value)}
                        placeholder="e.g., Make it more concise, add more examples, fix grammar..."
                        rows={3}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
                    />
                </div>

                <button
                    onClick={handleOptimize}
                    disabled={isOptimizing}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isOptimizing ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Optimizing...</span>
                        </>
                    ) : (
                        <>
                            <BoltIcon className="w-4 h-4" />
                            <span>Optimize Prompt</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};
