import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { CreateCollectionRequest } from '@/types/collection.api';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Loader2 } from 'lucide-react';

interface CollectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateCollectionRequest) => void;
    isLoading?: boolean;
    initialData?: CreateCollectionRequest;
    title?: string;
    submitLabel?: string;
}

export const CollectionModal: React.FC<CollectionModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    isLoading = false,
    initialData,
    title = 'Create Collection',
    submitLabel = 'Create',
}) => {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<CreateCollectionRequest>({
        defaultValues: {
            name: '',
            description: '',
            visibility: 'public',
            tags: [],
        },
    });

    // Reset form when opening or when initialData changes
    useEffect(() => {
        if (isOpen) {
            reset(initialData || {
                name: '',
                description: '',
                visibility: 'public',
                tags: [],
            });
        }
    }, [isOpen, initialData, reset]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-1 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            {...register('name', { required: 'Name is required' })}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all"
                            placeholder="e.g., Biology 101"
                        />
                        {errors.name && (
                            <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            {...register('description')}
                            rows={3}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all resize-none"
                            placeholder="What is this collection about?"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Visibility
                        </label>
                        <select
                            {...register('visibility')}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all"
                        >
                            <option value="public">Public</option>
                            <option value="private">Private</option>
                            <option value="group">Group</option>
                        </select>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-4 py-2 text-sm font-medium text-white bg-brand-primary hover:bg-brand-primary/90 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {submitLabel}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
