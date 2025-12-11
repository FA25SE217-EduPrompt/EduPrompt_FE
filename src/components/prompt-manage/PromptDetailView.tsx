import React from 'react';
import { PromptResponse } from '@/types/prompt.api';
import { ApplySuggestion } from '@/components/ui/ApplySuggestion';
import { OptimizedPromptFields } from '@/utils/prompt-optimization';

interface PromptDetailViewProps {
    prompt: PromptResponse;
    suggestions?: OptimizedPromptFields;
    onApplySuggestion?: (field: keyof OptimizedPromptFields, value: string) => void;
}

export const PromptDetailView: React.FC<PromptDetailViewProps> = ({ prompt, suggestions, onApplySuggestion }) => {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Instruction</h3>
                {suggestions?.instruction && onApplySuggestion && (
                    <ApplySuggestion
                        suggestion={suggestions.instruction}
                        onApply={() => onApplySuggestion('instruction', suggestions.instruction!)}
                    />
                )}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-gray-800 whitespace-pre-wrap font-mono text-sm leading-relaxed">
                    {prompt.instruction}
                </div>
            </div>

            {prompt.context && (
                <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Context</h3>
                    {suggestions?.context && onApplySuggestion && (
                        <ApplySuggestion
                            suggestion={suggestions.context}
                            onApply={() => onApplySuggestion('context', suggestions.context!)}
                        />
                    )}
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-gray-800 whitespace-pre-wrap text-sm leading-relaxed">
                        {prompt.context}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {prompt.inputExample && (
                    <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Input Example</h3>
                        {suggestions?.inputExample && onApplySuggestion && (
                            <ApplySuggestion
                                suggestion={suggestions.inputExample}
                                onApply={() => onApplySuggestion('inputExample', suggestions.inputExample!)}
                            />
                        )}
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-gray-600 italic text-sm leading-relaxed">
                            {prompt.inputExample}
                        </div>
                    </div>
                )}

                {prompt.outputFormat && (
                    <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Output Format</h3>
                        {suggestions?.outputFormat && onApplySuggestion && (
                            <ApplySuggestion
                                suggestion={suggestions.outputFormat}
                                onApply={() => onApplySuggestion('outputFormat', suggestions.outputFormat!)}
                            />
                        )}
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-gray-600 font-mono text-sm leading-relaxed">
                            {prompt.outputFormat}
                        </div>
                    </div>
                )}
            </div>

            {prompt.constraints && (
                <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Constraints</h3>
                    {suggestions?.constraints && onApplySuggestion && (
                        <ApplySuggestion
                            suggestion={suggestions.constraints}
                            onApply={() => onApplySuggestion('constraints', suggestions.constraints!)}
                        />
                    )}
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-gray-800 text-sm leading-relaxed">
                        {prompt.constraints}
                    </div>
                </div>
            )}
        </div>
    );
};
