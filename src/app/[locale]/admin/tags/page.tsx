'use client';

import React, { useEffect, useState } from "react";
import { getAllTags, deleteTag, createTag, updateTag } from "@/services/resources/tags";
import { Tag } from "@/types/tag.types";
import {
    TagIcon,
    MagnifyingGlassIcon,
    ArrowPathIcon,
    TrashIcon,
    EyeIcon,
    PencilIcon,
    PlusIcon,
    XMarkIcon,
} from "@heroicons/react/24/outline";
import Spinner from "@/components/ui/Spinner";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export default function TagsManagementPage() {
    const t = useTranslations('Admin.Tags');
    const tCommon = useTranslations('Admin.Common');
    const [tags, setTags] = useState<Tag[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
    const [tagToDelete, setTagToDelete] = useState<Tag | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [tagToEdit, setTagToEdit] = useState<Tag | null>(null);
    const [formData, setFormData] = useState({ type: "", value: "" });
    const [isSaving, setIsSaving] = useState(false);
    const tagsPerPage = 10;

    // Fetch tags from API (server-side pagination)
    const fetchTags = async (page = 0) => {
        setLoading(true);
        setError("");
        try {
            const response = await getAllTags(page, tagsPerPage);
            console.log("API Response:", response);

            if (response && response.data && Array.isArray(response.data.content)) {
                setTags(response.data.content);
                setTotalPages(response.data.totalPages || 0);
                setTotalItems(response.data.totalElements || 0);
                console.log(`✅ Loaded page ${page + 1}: ${response.data.content.length} tags`);

                if (response.data.content.length > 0) {
                    toast.success(t('loadedPage', { page: page + 1, count: response.data.content.length }), { duration: 3000 });
                }
            } else {
                console.error("Unexpected response structure:", response);
                setTags([]);
                setTotalPages(0);
                setTotalItems(0);
            }
        } catch (err: unknown) {
            console.error("Failed to fetch tags:", err);
            const errorMessage = err instanceof Error ? err.message : t('failedToLoad');
            setError(errorMessage);
            toast.error(t('failedToLoad'), { duration: 3000 });
            setTags([]);
            setTotalPages(0);
            setTotalItems(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTags(currentPage - 1);
    }, [currentPage]);

    // Filter tags based on search query (client-side filtering on current page)
    const filteredTags = tags.filter(tag => {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
            (tag.type && tag.type.toLowerCase().includes(query)) ||
            (tag.value && tag.value.toLowerCase().includes(query));

        return matchesSearch;
    });

    // Use filtered tags for display
    const currentTags = filteredTags;

    // Handle view tag
    const handleViewTag = (tag: Tag) => {
        setSelectedTag(tag);
    };

    // Handle delete click
    const handleDeleteClick = (tag: Tag) => {
        setTagToDelete(tag);
    };

    // Handle confirm delete
    const handleConfirmDelete = async () => {
        if (!tagToDelete) return;

        setIsDeleting(true);
        try {
            await deleteTag(tagToDelete.id);
            setTags(tags.filter(t => t.id !== tagToDelete.id));
            toast.success(t('deleteSuccess', { value: tagToDelete.value, type: tagToDelete.type }), { duration: 3000 });
            setTagToDelete(null);
        } catch (err) {
            console.error("Failed to delete tag:", err);
            toast.error(t('deleteFailed'), { duration: 3000 });
        } finally {
            setIsDeleting(false);
        }
    };

    // Handle create tag
    const handleCreateTag = () => {
        setFormData({ type: "", value: "" });
        setShowCreateModal(true);
    };

    // Handle edit tag
    const handleEditTag = (tag: Tag) => {
        setTagToEdit(tag);
        setFormData({ type: tag.type, value: tag.value });
        setShowEditModal(true);
    };

    // Handle save (create or update)
    const handleSave = async () => {
        if (!formData.type.trim() || !formData.value.trim()) {
            toast.error(t('validationError'), { duration: 3000 });
            return;
        }

        setIsSaving(true);
        try {
            if (showCreateModal) {
                // Create new tag
                const newTag = await createTag(formData);
                setTags([newTag, ...tags]);
                toast.success(t('createSuccess', { value: formData.value, type: formData.type }), { duration: 3000 });
                setShowCreateModal(false);
            } else if (showEditModal && tagToEdit) {
                // Update existing tag
                const updatedTag = await updateTag(tagToEdit.id, formData);
                setTags(tags.map(t => t.id === tagToEdit.id ? updatedTag : t));
                toast.success(t('updateSuccess', { value: formData.value, type: formData.type }), { duration: 3000 });
                setShowEditModal(false);
            }
            setFormData({ type: "", value: "" });
        } catch (err: unknown) {
            console.error("Failed to save tag:", err);
            const errorMessage = (err as any)?.response?.data?.message || t('saveFailed');
            toast.error(errorMessage, { duration: 3000 });
        } finally {
            setIsSaving(false);
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
                        <TagIcon className="h-10 w-10 text-blue-600" />
                        {t('title')}
                    </h1>
                    <p className="text-gray-600 mt-2">{t('description')}</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-sm text-gray-500">{t('totalTags')}</p>
                        <p className="text-2xl font-bold text-blue-600">{totalItems}</p>
                    </div>
                    <button
                        onClick={() => fetchTags(currentPage - 1)}
                        className="p-3 bg-white rounded-full shadow-md hover:shadow-lg transition-all hover:scale-105"
                        title={tCommon('refresh')}
                    >
                        <ArrowPathIcon className="h-6 w-6 text-blue-600" />
                    </button>
                    <button
                        onClick={handleCreateTag}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md hover:shadow-lg transition-all font-medium"
                    >
                        <PlusIcon className="h-5 w-5" />
                        {t('createTag')}
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

            {/* Tags List */}
            <section className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                {/* Search Bar */}
                <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-blue-50 to-purple-50">
                    <h2 className="text-xl font-semibold text-gray-900">{t('allTags')}</h2>
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
                                <th className="px-6 py-4">{t('type')}</th>
                                <th className="px-6 py-4">{t('value')}</th>
                                <th className="px-6 py-4">{tCommon('actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {currentTags.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                        {searchQuery
                                            ? t('noTagsFound')
                                            : t('noTags')}
                                    </td>
                                </tr>
                            ) : (
                                currentTags.map((tag) => (
                                    <tr key={tag.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                                            {tag.id.substring(0, 8)}...
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
                                                {tag.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {tag.value}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleViewTag(tag)}
                                                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg font-medium text-sm transition-colors"
                                                    title={tCommon('viewDetails')}
                                                >
                                                    <EyeIcon className="h-4 w-4" />
                                                    {tCommon('view')}
                                                </button>
                                                <button
                                                    onClick={() => handleEditTag(tag)}
                                                    className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg font-medium text-sm transition-colors"
                                                    title={tCommon('edit')}
                                                >
                                                    <PencilIcon className="h-4 w-4" />
                                                    {tCommon('edit')}
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(tag)}
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
                            {tCommon('page')} {currentPage} {tCommon('of')} {totalPages} - {tCommon('totalItems', { count: totalItems, entity: 'tags' })}
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

            {/* View Tag Modal */}
            {selectedTag && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl flex justify-between items-center">
                            <h3 className="text-2xl font-bold">{t('tagDetails')}</h3>
                            <button
                                onClick={() => setSelectedTag(null)}
                                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="text-sm font-semibold text-gray-500 uppercase">Loại Tag</label>
                                    <p className="text-lg font-medium text-gray-900 mt-1">
                                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded">{selectedTag.type}</span>
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-gray-500 uppercase">Giá trị</label>
                                    <p className="text-lg font-medium text-gray-900 mt-1">{selectedTag.value}</p>
                                </div>
                                <div className="col-span-2">
                                    <label className="text-sm font-semibold text-gray-500 uppercase">Tag ID</label>
                                    <p className="text-sm font-mono text-gray-600 mt-1">{selectedTag.id}</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-200 flex justify-end">
                            <button
                                onClick={() => setSelectedTag(null)}
                                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium transition-colors"
                            >
                                {tCommon('close')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {tagToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
                        <div className="bg-red-600 text-white p-6 rounded-t-2xl flex justify-between items-center">
                            <h3 className="text-2xl font-bold">{t('confirmDelete')}</h3>
                            <button
                                onClick={() => setTagToDelete(null)}
                                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="p-6">
                            <p className="text-gray-700 text-lg">
                                {t('confirmDeleteMessage')}{" "}
                                <span className="font-bold text-gray-900">
                                    &quot;{tagToDelete.value}&quot; ({tagToDelete.type})
                                </span>?
                            </p>
                            <p className="text-gray-500 mt-2">{t('confirmDeleteNote')}</p>
                        </div>
                        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                            <button
                                onClick={() => setTagToDelete(null)}
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

            {/* Create/Edit Tag Modal */}
            {(showCreateModal || showEditModal) && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
                        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 rounded-t-2xl flex justify-between items-center">
                            <h3 className="text-2xl font-bold">
                                {showCreateModal ? t('createTag') : t('editTag')}
                            </h3>
                            <button
                                onClick={() => {
                                    setShowCreateModal(false);
                                    setShowEditModal(false);
                                    setFormData({ type: "", value: "" });
                                }}
                                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Loại Tag <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Nhập loại tag (vd: môn, khối, subject)..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Giá trị <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.value}
                                        onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Nhập giá trị tag (vd: toán học, 10, coding)..."
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowCreateModal(false);
                                    setShowEditModal(false);
                                    setFormData({ type: "", value: "" });
                                }}
                                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                                disabled={isSaving}
                            >
                                {tCommon('cancel')}
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                                disabled={isSaving}
                            >
                                {isSaving ? (
                                    <>
                                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                        {tCommon('loading')}
                                    </>
                                ) : (
                                    showCreateModal ? tCommon('create') : tCommon('save')
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
