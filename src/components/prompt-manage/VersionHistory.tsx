import React from 'react';
import { PromptVersionResponse } from '@/types/prompt.api';
import { Clock, RotateCcw } from 'lucide-react';

interface VersionHistoryProps {
    versions: PromptVersionResponse[];
    currentVersionId: string;
    onRollback: (versionId: string) => void;
    isRollingBack: boolean;
}

export const VersionHistory: React.FC<VersionHistoryProps> = ({ versions, currentVersionId, onRollback, isRollingBack }) => {
    if (!versions || versions.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500 text-sm">
                No version history available.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Version History
            </h3>
            <div className="space-y-3">
                {versions.map((version) => (
                    <div
                        key={version.id}
                        className={`p-3 rounded-lg border transition-all ${version.id === currentVersionId
                            ? 'bg-blue-50 border-blue-200 shadow-sm'
                            : 'bg-white border-gray-100 hover:border-gray-300'
                            }`}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${version.id === currentVersionId ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                    v{version.versionNumber}
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500">
                                        {new Date(version.createdAt).toLocaleString()}
                                    </div>
                                    {version.isAiGenerated && (
                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-100 text-purple-800 mt-1">
                                            AI Generated
                                        </span>
                                    )}
                                </div>
                            </div>

                            {version.id !== currentVersionId && (
                                <button
                                    onClick={() => onRollback(version.id)}
                                    disabled={isRollingBack}
                                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                    title="Rollback to this version"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {/* Preview of changes (simplified) */}
                        <div className="mt-2 text-xs text-gray-600 line-clamp-2 font-mono bg-gray-50 p-1.5 rounded">
                            {version.instruction}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
