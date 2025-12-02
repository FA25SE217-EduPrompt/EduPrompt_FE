import React from 'react';
import { PromptResponse } from '@/types/prompt.api';

interface PromptDetailViewProps {
    prompt: PromptResponse;
}

export const PromptDetailView: React.FC<PromptDetailViewProps> = ({ prompt }) => {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Instruction</h3>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-gray-800 whitespace-pre-wrap font-mono text-sm leading-relaxed">
                    {prompt.instruction}
                </div>
            </div>

            {prompt.context && (
                <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Context</h3>
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-gray-800 whitespace-pre-wrap text-sm leading-relaxed">
                        {prompt.context}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {prompt.inputExample && (
                    <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Input Example</h3>
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-gray-600 italic text-sm leading-relaxed">
                            {prompt.inputExample}
                        </div>
                    </div>
                )}

                {prompt.outputFormat && (
                    <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Output Format</h3>
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-gray-600 font-mono text-sm leading-relaxed">
                            {prompt.outputFormat}
                        </div>
                    </div>
                )}
            </div>

            {prompt.constraints && (
                <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Constraints</h3>
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-gray-800 text-sm leading-relaxed">
                        {prompt.constraints}
                    </div>
                </div>
            )}
        </div>
    );
};
