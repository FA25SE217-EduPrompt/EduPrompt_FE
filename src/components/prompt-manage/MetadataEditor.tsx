import React, { useState, useEffect } from 'react';
import { PromptResponse, UpdatePromptMetadataRequest } from '@/types/prompt.api';
import { PencilSquareIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface MetadataEditorProps {
    prompt: PromptResponse;
    onUpdate: (data: UpdatePromptMetadataRequest) => void;
    isUpdating: boolean;
}

export const MetadataEditor: React.FC<MetadataEditorProps> = ({ prompt, onUpdate, isUpdating }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<UpdatePromptMetadataRequest>({
        title: prompt.title,
        description: prompt.description,
    });

    useEffect(() => {
        setFormData({
            title: prompt.title,
            description: prompt.description,
        });
    }, [prompt]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onUpdate(formData);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setFormData({
            title: prompt.title,
            description: prompt.description,
        });
        setIsEditing(false);
    };

    if (!isEditing) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                    <h2 className="text-xl font-bold text-gray-900">{prompt.title}</h2>
                    <button
                        onClick={() => setIsEditing(true)}
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                        title="Edit Metadata"
                    >
                        <PencilSquareIcon className="w-5 h-5" />
                    </button>
                </div>
                <p className="text-gray-600 text-sm">{prompt.description || "No description provided."}</p>

                <div className="mt-4 flex flex-wrap gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${prompt.visibility === 'public' ? 'bg-green-100 text-green-800' :
                            prompt.visibility === 'group' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                        }`}>
                        {prompt.visibility.charAt(0).toUpperCase() + prompt.visibility.slice(1)}
                    </span>
                    {/* Tags would go here */}
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-blue-200 p-4 shadow-sm ring-2 ring-blue-50">
            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Title</label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        required
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                        value={formData.description || ''}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                    <button
                        type="button"
                        onClick={handleCancel}
                        disabled={isUpdating}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <XMarkIcon className="w-4 h-4 mr-1" />
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isUpdating}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                        {isUpdating ? (
                            <span>Saving...</span>
                        ) : (
                            <>
                                <CheckIcon className="w-4 h-4 mr-1" />
                                Save
                            </>
                        )}
                    </button>
                </div>
            </div>
        </form>
    );
};
