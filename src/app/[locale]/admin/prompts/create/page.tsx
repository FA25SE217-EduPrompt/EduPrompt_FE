import { BaseResponse } from '@/types/api';
import { PromptResponse } from '@/types/prompt.api';
import { useState } from 'react';
import { useAdminCreatePromptStandalone, useAdminCreatePromptInCollection } from '@/hooks/queries/admin';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type PromptType = 'standalone' | 'in-collection';

export default function CreatePromptPage() {
    const router = useRouter();
    const [promptType, setPromptType] = useState<PromptType>('standalone');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        instruction: '',
        context: '',
        inputExample: '',
        outputFormat: '',
        constraints: '',
        visibility: 'private' as 'private' | 'group' | 'public' | 'school',
        collectionId: '',
        tagIds: [] as string[],
    });
    const [result, setResult] = useState<string>('');

    const createStandalone = useAdminCreatePromptStandalone();
    const createInCollection = useAdminCreatePromptInCollection();

    const handleChange = (field: string, value: string | string[]) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setResult('Creating prompt...');

        try {
            let response: BaseResponse<PromptResponse>;

            if (promptType === 'standalone') {
                response = await createStandalone.mutateAsync({
                    payload: {
                        title: formData.title,
                        description: formData.description || undefined,
                        instruction: formData.instruction,
                        context: formData.context || undefined,
                        inputExample: formData.inputExample || undefined,
                        outputFormat: formData.outputFormat || undefined,
                        constraints: formData.constraints || undefined,
                        visibility: formData.visibility,
                        tagIds: formData.tagIds.length > 0 ? formData.tagIds : undefined,
                    },
                }) as BaseResponse<PromptResponse>;
            } else {
                if (!formData.collectionId) {
                    setResult('❌ Error: Collection ID is required for in-collection prompts');
                    return;
                }
                response = await createInCollection.mutateAsync({
                    payload: {
                        title: formData.title,
                        description: formData.description || undefined,
                        instruction: formData.instruction,
                        context: formData.context || undefined,
                        inputExample: formData.inputExample || undefined,
                        outputFormat: formData.outputFormat || undefined,
                        constraints: formData.constraints || undefined,
                        visibility: formData.visibility,
                        collectionId: formData.collectionId,
                        tagIds: formData.tagIds.length > 0 ? formData.tagIds : undefined,
                    },
                }) as BaseResponse<PromptResponse>;
            }

            if (response.error) {
                setResult(`❌ Error: ${response.error.messages.join(', ')}`);
            } else {
                setResult(`✅ Prompt created successfully!\nID: ${response.data?.id}\nTitle: ${response.data?.title}`);
                // Optionally redirect
                setTimeout(() => {
                    router.push('/admin/prompts');
                }, 2000);
            }
        } catch (err: unknown) {
            const error = err as { message: string };
            setResult(`❌ Exception: ${error.message}`);
        }
    };

    const isPending = createStandalone.isPending || createInCollection.isPending;

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <Link
                    href="/admin/prompts"
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
                >
                    <ArrowLeftIcon className="h-4 w-4 mr-2" />
                    Back to Prompts
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">Create New Prompt</h1>
                <p className="mt-2 text-gray-600">Tạo prompt standalone hoặc trong collection</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Form */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Prompt Type Selection */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Prompt Type <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setPromptType('standalone')}
                                className={`p-4 rounded-lg border-2 transition-all ${promptType === 'standalone'
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-300 hover:border-gray-400'
                                    }`}
                            >
                                <h3 className="font-semibold mb-1">Standalone</h3>
                                <p className="text-sm text-gray-600">Prompt độc lập</p>
                            </button>
                            <button
                                type="button"
                                onClick={() => setPromptType('in-collection')}
                                className={`p-4 rounded-lg border-2 transition-all ${promptType === 'in-collection'
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-300 hover:border-gray-400'
                                    }`}
                            >
                                <h3 className="font-semibold mb-1">In Collection</h3>
                                <p className="text-sm text-gray-600">Thuộc collection</p>
                            </button>
                        </div>
                    </div>

                    {/* Main Form Fields */}
                    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => handleChange('title', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Math Problem Solver"
                                required
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => handleChange('description', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                rows={2}
                                placeholder="A helpful assistant for solving math problems"
                            />
                        </div>

                        {/* Instruction */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Instruction <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={formData.instruction}
                                onChange={(e) => handleChange('instruction', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                rows={4}
                                placeholder="Solve the following math problem step by step..."
                                required
                            />
                        </div>

                        {/* Context */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Context
                            </label>
                            <textarea
                                value={formData.context}
                                onChange={(e) => handleChange('context', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                rows={3}
                                placeholder="You are a math tutor helping students..."
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Input Example */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Input Example
                                </label>
                                <input
                                    type="text"
                                    value={formData.inputExample}
                                    onChange={(e) => handleChange('inputExample', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="What is 2+2?"
                                />
                            </div>

                            {/* Output Format */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Output Format
                                </label>
                                <input
                                    type="text"
                                    value={formData.outputFormat}
                                    onChange={(e) => handleChange('outputFormat', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Step-by-step solution"
                                />
                            </div>
                        </div>

                        {/* Constraints */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Constraints
                            </label>
                            <textarea
                                value={formData.constraints}
                                onChange={(e) => handleChange('constraints', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                rows={2}
                                placeholder="Use simple language, avoid complex formulas..."
                            />
                        </div>

                        {/* Visibility */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Visibility <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.visibility}
                                onChange={(e) => handleChange('visibility', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="private">Private</option>
                                <option value="group">Group</option>
                                <option value="public">Public</option>
                                <option value="school">School</option>
                            </select>
                        </div>

                        {/* Collection ID (only for in-collection) */}
                        {promptType === 'in-collection' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Collection ID <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.collectionId}
                                    onChange={(e) => handleChange('collectionId', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="collection-abc-123"
                                    required={promptType === 'in-collection'}
                                />
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isPending ? 'Creating...' : 'Create Prompt'}
                        </button>
                    </form>
                </div>

                {/* Sidebar - Result & Info */}
                <div className="space-y-6">
                    {/* Result */}
                    {result && (
                        <div className={`p-4 rounded-lg ${result.includes('✅') ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                            }`}>
                            <h3 className="font-semibold mb-2">Result:</h3>
                            <pre className="text-sm whitespace-pre-wrap">{result}</pre>
                        </div>
                    )}

                    {/* Tips */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <h3 className="font-semibold text-yellow-900 mb-2">💡 Tips</h3>
                        <ul className="text-sm text-yellow-800 space-y-1">
                            <li>• <strong>Title</strong>: Ngắn gọn, mô tả rõ ràng</li>
                            <li>• <strong>Instruction</strong>: Chi tiết, cụ thể</li>
                            <li>• <strong>Context</strong>: Vai trò, môi trường</li>
                            <li>• <strong>Visibility</strong>: Chọn phù hợp với mục đích</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
