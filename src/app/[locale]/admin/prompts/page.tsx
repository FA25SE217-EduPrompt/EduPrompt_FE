'use client';

import React, { useEffect, useState } from "react";
import { promptsService } from "@/services/resources/prompts";
import { PromptResponse } from "@/types/prompt.api";
import {
    DocumentTextIcon,
    MagnifyingGlassIcon,
    ArrowPathIcon,
    FunnelIcon,
    TrashIcon,
    EyeIcon,
    XMarkIcon,
    GlobeAltIcon,
    LockClosedIcon,
} from "@heroicons/react/24/outline";
import Spinner from "@/components/ui/Spinner";
import { toast } from "sonner";
import { useTranslations } from 'next-intl';

export default function PromptsManagementPage() {
    const t = useTranslations('Admin.Prompts');
    const tCommon = useTranslations('Admin.Common');

    const [prompts, setPrompts] = useState<PromptResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [visibilityFilter, setVisibilityFilter] = useState("ALL");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const [selectedPrompt, setSelectedPrompt] = useState<PromptResponse | null>(null);
    const [promptToDelete, setPromptToDelete] = useState<PromptResponse | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const promptsPerPage = 10;

    // Fetch prompts from API (server-side pagination)
    const fetchPrompts = async (page = 0) => {
        setLoading(true);
        setError("");
        try {
            const response = await promptsService.getAllPromptsAdmin(page, promptsPerPage);
            console.log("=== PROMPTS API DEBUG ===");
            console.log("API Response:", response);

            if (response && response.data) {
                if (Array.isArray(response.data.content)) {
                    setPrompts(response.data.content);
                    setTotalPages(response.data.totalPages || 0);
                    setTotalItems(response.data.totalElements || 0);
                    console.log(`✅ Loaded page ${page + 1}: ${response.data.content.length} prompts`);
                    console.log(`Total pages: ${response.data.totalPages}, Total items: ${response.data.totalElements}`);

                    if (response.data.content.length > 0) {
                        toast.success(t('loadedPage', { page: page + 1, count: response.data.content.length }), { duration: 3000 });
                    }
                } else {
                    console.error("Unexpected response structure:", response);
                    setPrompts([]);
                    setTotalPages(0);
                    setTotalItems(0);
                }
            }
        } catch (err: unknown) {
            console.error("❌ Error fetching prompts:", err);
            const axiosError = err as { response?: { status?: number } };
            console.error("Error response:", axiosError.response);
            const errorMsg = axiosError.response?.status === 403
                ? t('permissionDenied')
                : t('failedToLoad');
            setError(errorMsg);
            toast.error(errorMsg, { duration: 3000 });
            setPrompts([]);
            setTotalPages(0);
            setTotalItems(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPrompts(currentPage - 1); // API uses 0-based indexing
    }, [currentPage]);

    // Filter prompts (client-side filtering on current page data)
    const filteredPrompts = prompts.filter(prompt => {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
            (prompt.title && prompt.title.toLowerCase().includes(query)) ||
            (prompt.description && prompt.description.toLowerCase().includes(query)) ||
            (prompt.instruction && prompt.instruction.toLowerCase().includes(query));

        const matchesVisibility = visibilityFilter === "ALL" || prompt.visibility === visibilityFilter.toLowerCase();

        return matchesSearch && matchesVisibility;
    });

    // Use filtered prompts for display (no client-side pagination slicing)
    const currentPrompts = filteredPrompts;

    // Handle view prompt
    const handleViewPrompt = (prompt: PromptResponse) => {
        setSelectedPrompt(prompt);
    };

    // Handle delete click
    const handleDeleteClick = (prompt: PromptResponse) => {
        setPromptToDelete(prompt);
    };

    // Handle confirm delete
    const handleConfirmDelete = async () => {
        if (!promptToDelete) return;

        setIsDeleting(true);
        try {
            await promptsService.deletePromptAdmin(promptToDelete.id);
            setPrompts(prompts.filter(p => p.id !== promptToDelete.id));
            toast.success(t('deleteSuccess', { title: promptToDelete.title }), { duration: 3000 });
            setPromptToDelete(null);
        } catch (err) {
            console.error("Failed to delete prompt:", err);
            toast.error(t('deleteFailed'), { duration: 3000 });
        } finally {
            setIsDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
                <Spinner size="page" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
            {/* Header */}
            <header className="mb-8 flex justify-between items-start">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
                        <DocumentTextIcon className="h-10 w-10 text-blue-600" />
                        {t('title')}
                    </h1>
                    <p className="text-gray-600 mt-2">{t('description')}</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-sm text-gray-500">{t('totalPrompts')}</p>
                        <p className="text-2xl font-bold text-blue-600">{totalItems}</p>
                    </div>
                    <button
                        onClick={() => fetchPrompts(currentPage - 1)}
                        className="p-3 bg-white rounded-full shadow-md hover:shadow-lg transition-all hover:scale-105"
                        title={tCommon('refresh')}
                    >
                        <ArrowPathIcon className="h-6 w-6 text-blue-600" />
                    </button>
                </div>
            </header>

            {/* Error Message */}
            {error && (
                <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-lg shadow-sm">
                    <p className="font-medium">{tCommon('error')}</p>
                    <p className="text-sm">{error}</p>
                </div>
            )}

            {/* Filters */}
            <div className="mb-6 bg-white rounded-xl shadow-md p-6 border border-gray-200">
                <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                        <FunnelIcon className="h-5 w-5 text-gray-500" />
                        <span className="font-semibold text-gray-700">{tCommon('filters')}:</span>
                    </div>

                    {/* Visibility Filter */}
                    <select
                        value={visibilityFilter}
                        onChange={(e) => {
                            setVisibilityFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                        <option value="ALL">{t('allVisibility')}</option>
                        <option value="public">{tCommon('public')}</option>
                        <option value="private">{tCommon('private')}</option>
                        <option value="group">{t('group')}</option>
                    </select>

                    {/* Clear Filters */}
                    {visibilityFilter !== "ALL" && (
                        <button
                            onClick={() => {
                                setVisibilityFilter("ALL");
                                setCurrentPage(1);
                            }}
                            className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                            {tCommon('clearFilters')}
                        </button>
                    )}
                </div>
            </div>

            {/* Prompts List */}
            <section className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                {/* Search Bar */}
                <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-blue-50 to-purple-50">
                    <h2 className="text-xl font-semibold text-gray-900">{t('allPrompts')}</h2>
                    <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            placeholder={t('searchPlaceholder')}
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-80"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 text-gray-900 font-semibold border-b-2 border-gray-200">
                            <tr>
                                <th className="px-6 py-4">ID</th>
                                <th className="px-6 py-4">{t('title_field')}</th>
                                <th className="px-6 py-4">{t('description_field')}</th>
                                <th className="px-6 py-4">{t('visibility')}</th>
                                <th className="px-6 py-4">Tags</th>
                                <th className="px-6 py-4">{t('createdAt')}</th>
                                <th className="px-6 py-4">{tCommon('actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {currentPrompts.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                        {searchQuery || visibilityFilter !== "ALL"
                                            ? t('noPromptsFound')
                                            : t('noPrompts')}
                                    </td>
                                </tr>
                            ) : (
                                currentPrompts.map((prompt) => (
                                    <tr key={prompt.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                                            {prompt.id.substring(0, 8)}...
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900 max-w-xs truncate">
                                            {prompt.title}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 max-w-xs truncate">
                                            {prompt.description || t('noDescription')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 w-fit ${prompt.visibility === 'public'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                {prompt.visibility === 'public' ? (
                                                    <><GlobeAltIcon className="h-4 w-4" /> {tCommon('public')}</>
                                                ) : (
                                                    <><LockClosedIcon className="h-4 w-4" /> {tCommon('private')}</>
                                                )}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {prompt.tags.slice(0, 2).map((tag) => (
                                                    <span key={tag.id} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                                                        {tag.value}
                                                    </span>
                                                ))}
                                                {prompt.tags.length > 2 && (
                                                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                                        +{prompt.tags.length - 2}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {new Date(prompt.createdAt).toLocaleDateString('vi-VN')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleViewPrompt(prompt)}
                                                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg font-medium text-sm transition-colors"
                                                    title={tCommon('viewDetails')}
                                                >
                                                    <EyeIcon className="h-4 w-4" />
                                                    {tCommon('view')}
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(prompt)}
                                                    className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg font-medium text-sm transition-colors"
                                                    title={tCommon('delete')}
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                    {tCommon('delete')}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
                        <span className="text-sm text-gray-500">
                            {tCommon('page')} {currentPage} {tCommon('of')} {totalPages} - {tCommon('totalItems', { count: totalItems, entity: 'prompts' })}
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                            >
                                {tCommon('previous')}
                            </button>
                            <span className="px-4 py-2 text-sm font-medium text-gray-700">
                                {tCommon('page')} {currentPage} {tCommon('of')} {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                            >
                                {tCommon('next')}
                            </button>
                        </div>
                    </div>
                )}
            </section>

            {/* View Prompt Modal */}
            {selectedPrompt && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl flex justify-between items-center">
                            <h3 className="text-2xl font-bold">{t('promptDetails')}</h3>
                            <button
                                onClick={() => setSelectedPrompt(null)}
                                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div>
                                <label className="text-sm font-semibold text-gray-500 uppercase">Tiêu đề</label>
                                <p className="text-lg font-medium text-gray-900 mt-1">{selectedPrompt.title}</p>
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-gray-500 uppercase">Mô tả</label>
                                <p className="text-gray-700 mt-1">{selectedPrompt.description || "Không có mô tả"}</p>
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-gray-500 uppercase">Hướng dẫn</label>
                                <p className="text-gray-700 mt-1 whitespace-pre-wrap">{selectedPrompt.instruction}</p>
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-gray-500 uppercase">Ngữ cảnh</label>
                                <p className="text-gray-700 mt-1 whitespace-pre-wrap">{selectedPrompt.context}</p>
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-gray-500 uppercase">Ví dụ đầu vào</label>
                                <pre className="text-gray-700 mt-1 bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm">{selectedPrompt.inputExample}</pre>
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-gray-500 uppercase">Định dạng đầu ra</label>
                                <pre className="text-gray-700 mt-1 bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm">{selectedPrompt.outputFormat}</pre>
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-gray-500 uppercase">Ràng buộc</label>
                                <p className="text-gray-700 mt-1 whitespace-pre-wrap">{selectedPrompt.constraints}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-semibold text-gray-500 uppercase">Hiển thị</label>
                                    <p className="mt-1">
                                        <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${selectedPrompt.visibility === 'public'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-gray-100 text-gray-700'
                                            }`}>
                                            {selectedPrompt.visibility === 'public' ? 'Công khai' : 'Riêng tư'}
                                        </span>
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-gray-500 uppercase">Tags</label>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {selectedPrompt.tags.map((tag) => (
                                            <span key={tag.id} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                                                {tag.type}: {tag.value}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-200 flex justify-end">
                            <button
                                onClick={() => setSelectedPrompt(null)}
                                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium transition-colors"
                            >
                                {tCommon('close')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {promptToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
                        <div className="bg-red-600 text-white p-6 rounded-t-2xl flex justify-between items-center">
                            <h3 className="text-2xl font-bold">{t('confirmDelete')}</h3>
                            <button
                                onClick={() => setPromptToDelete(null)}
                                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="p-6">
                            <p className="text-gray-700 text-lg">
                                {t('confirmDeleteMessage')}{" "}
                                <span className="font-bold text-gray-900">
                                    &quot;{promptToDelete.title}&quot;
                                </span>?
                            </p>
                            <p className="text-gray-500 mt-2">{t('confirmDeleteNote')}</p>
                        </div>
                        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                            <button
                                onClick={() => setPromptToDelete(null)}
                                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                                disabled={isDeleting}
                            >
                                {tCommon('cancel')}
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                                disabled={isDeleting}
                            >
                                {isDeleting ? (
                                    <>
                                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                        {tCommon('deleting')}
                                    </>
                                ) : (
                                    tCommon('delete')
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
