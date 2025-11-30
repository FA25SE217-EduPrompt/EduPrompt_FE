import {SparklesIcon} from '@heroicons/react/24/outline';

type ApplySuggestionProps = {
    suggestion?: string;
    onApply: () => void;
};

/**
 * a small component that appears above a form field
 * to show an AI suggestion and an 'Apply' button.
 */
export const ApplySuggestion = ({suggestion, onApply}: ApplySuggestionProps) => {
    if (!suggestion) {
        return null;
    }

    return (
        <div className="mb-2 rounded-lg border border-purple-200 bg-purple-50 p-3 text-sm">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <SparklesIcon className="h-5 w-5 text-purple-600"/>
                    <span className="font-medium text-purple-700">AI Suggestion</span>
                </div>
                <button
                    type="button"
                    onClick={onApply}
                    className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-purple-700 shadow-sm ring-1 ring-inset ring-purple-300 hover:bg-purple-50"
                >
                    Apply
                </button>
            </div>
            <p className="mt-2 text-gray-700 whitespace-pre-wrap">
                {suggestion}
            </p>
        </div>
    );
};