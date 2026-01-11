'use client';

import React, { useEffect, useState } from "react";
import { getAllCollections, deleteCollection, createCollection, updateCollection } from "@/services/resources/collections";
import { Collection } from "@/types/collection.types";
import {
    FolderIcon,
    MagnifyingGlassIcon,
    ArrowPathIcon,
    FunnelIcon,
    TrashIcon,
    EyeIcon,
    XMarkIcon,
    GlobeAltIcon,
    LockClosedIcon,
    UserGroupIcon as UsersIcon,
    PlusIcon,
    PencilIcon,
} from "@heroicons/react/24/outline";
import Spinner from "@/components/ui/Spinner";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export default function CollectionsManagementPage() {
    const t = useTranslations('Admin.Collections');
    const tCommon = useTranslations('Admin.Common');
    const [collections, setCollections] = useState<Collection[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [visibilityFilter, setVisibilityFilter] = useState("ALL");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
    const [collectionToDelete, setCollectionToDelete] = useState<Collection | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [newCollectionData, setNewCollectionData] = useState({
        name: '',
        description: '',
        visibility: 'PUBLIC' as 'PUBLIC' | 'PRIVATE' | 'GROUP',
    });
    const [showEditModal, setShowEditModal] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [editCollectionData, setEditCollectionData] = useState<{
        id: string;
        name: string;
        description: string;
        visibility: 'PUBLIC' | 'PRIVATE' | 'GROUP';
    } | null>(null);
    const collectionsPerPage = 10;

    // Fetch collections from API (server-side pagination)
    const fetchCollections = async (page = 0) => {
        setLoading(true);
        setError("");
        try {
            const response = await getAllCollections(page, collectionsPerPage);
            console.log("=== COLLECTIONS API DEBUG ===");
            console.log("Full API Response:", response);

            if (response && response.data && Array.isArray(response.data.content)) {
                setCollections(response.data.content);
                setTotalPages(response.data.totalPages || 0);
                setTotalItems(response.data.totalElements || 0);
                console.log(`✅ Loaded page ${page + 1}: ${response.data.content.length} collections`);

                if (response.data.content.length > 0) {
                    toast.success(t('loadedPage', { page: page + 1, count: response.data.content.length }), { duration: 3000 });
                }
            } else {
                console.error("Unexpected response structure:", response);
                setCollections([]);
                setTotalPages(0);
                setTotalItems(0);
            }
        } catch (err: unknown) {
            console.error("❌ Error fetching collections:", err);
            const errorMsg = (err as any).response?.status === 403
                ? t('permissionDenied')
                : t('failedToLoad');
            setError(errorMsg);
            toast.error(errorMsg, { duration: 3000 });
            setCollections([]);
            setTotalPages(0);
            setTotalItems(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCollections(currentPage - 1);
    }, [currentPage]);

    // Filter collections (client-side filtering on current page)
    const filteredCollections = collections.filter(collection => {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
            (collection.name && collection.name.toLowerCase().includes(query)) ||
            (collection.description && collection.description.toLowerCase().includes(query));

        const matchesVisibility = visibilityFilter === "ALL" || collection.visibility === visibilityFilter;

        return matchesSearch && matchesVisibility;
    });

    // Use filtered collections for display
    const currentCollections = filteredCollections;

    // Handle view collection
    const handleViewCollection = (collection: Collection) => {
        setSelectedCollection(collection);
    };

    // Handle delete click
    const handleDeleteClick = (collection: Collection) => {
        setCollectionToDelete(collection);
    };

    // Handle confirm delete
    const handleConfirmDelete = async () => {
        if (!collectionToDelete) return;

        setIsDeleting(true);
        try {
            await deleteCollection(collectionToDelete.id);
            toast.success(t('deleteSuccess', { name: collectionToDelete.name }), { duration: 3000 });
            setCollectionToDelete(null);
            // Refresh the list from server
            fetchCollections(currentPage - 1);
        } catch (err) {
            console.error("Failed to delete collection:", err);
            toast.error(t('deleteFailed'), { duration: 3000 });
        } finally {
            setIsDeleting(false);
        }
    };

    // Handle create collection
    const handleCreateCollection = async () => {
        if (!newCollectionData.name.trim()) {
            toast.error(t('validationError'), { duration: 3000 });
            return;
        }

        setIsCreating(true);
        try {
            const collectionToCreate = {
                name: newCollectionData.name.trim(),
                description: newCollectionData.description.trim() || undefined,
                visibility: newCollectionData.visibility.toLowerCase() as 'public' | 'private' | 'group',
            };

            const newCollection = await createCollection(collectionToCreate);
            toast.success(t('createSuccess', { name: newCollection.name }), { duration: 3000 });
            setShowCreateModal(false);
            setNewCollectionData({ name: '', description: '', visibility: 'PUBLIC' });
            // Refresh the list
            fetchCollections(currentPage - 1);
        } catch (err) {
            console.error('Failed to create collection:', err);
            toast.error(t('createFailed'), { duration: 3000 });
        } finally {
            setIsCreating(false);
        }
    };

    // Handle edit click
    const handleEditClick = (collection: Collection) => {
        setEditCollectionData({
            id: collection.id,
            name: collection.name,
            description: collection.description || '',
            visibility: collection.visibility.toUpperCase() as 'PUBLIC' | 'PRIVATE' | 'GROUP',
        });
        setShowEditModal(true);
    };

    // Handle update collection
    const handleUpdateCollection = async () => {
        if (!editCollectionData || !editCollectionData.name.trim()) {
            toast.error(t('validationError'), { duration: 3000 });
            return;
        }

        setIsUpdating(true);
        try {
            const updateData = {
                name: editCollectionData.name.trim(),
                description: editCollectionData.description.trim() || undefined,
                visibility: editCollectionData.visibility.toLowerCase() as 'public' | 'private' | 'group',
            };

            await updateCollection(editCollectionData.id, updateData);
            toast.success(t('updateSuccess', { name: editCollectionData.name }), { duration: 3000 });
            setShowEditModal(false);
            setEditCollectionData(null);
            // Refresh the list
            fetchCollections(currentPage - 1);
        } catch (err) {
            console.error('Failed to update collection:', err);
            toast.error(t('updateFailed'), { duration: 3000 });
        } finally {
            setIsUpdating(false);
        }
    };

    // Get visibility icon and label
    const getVisibilityDisplay = (visibility: string) => {
        switch (visibility) {
            case 'PUBLIC':
                return {
                    icon: <GlobeAltIcon className="h-4 w-4" />,
                    label: tCommon('public'),
                    color: 'bg-green-100 text-green-700'
                };
            case 'PRIVATE':
                return {
                    icon: <LockClosedIcon className="h-4 w-4" />,
                    label: tCommon('private'),
                    color: 'bg-gray-100 text-gray-700'
                };
            case 'GROUP':
                return {
                    icon: <UsersIcon className="h-4 w-4" />,
                    label: t('group'),
                    color: 'bg-blue-100 text-blue-700'
                };
            default:
                return {
                    icon: <LockClosedIcon className="h-4 w-4" />,
                    label: visibility,
                    color: 'bg-gray-100 text-gray-700'
                };
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
                        <FolderIcon className="h-10 w-10 text-blue-600" />
                        {t('title')}
                    </h1>
                    <p className="text-gray-600 mt-2">{t('description')}</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-sm text-gray-500">{t('totalCollections')}</p>
                        <p className="text-2xl font-bold text-blue-600">{totalItems}</p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all hover:scale-105 font-medium"
                        title={t('createCollection')}
                    >
                        <PlusIcon className="h-5 w-5" />
                        {t('createNew')}
                    </button>
                    <button
                        onClick={() => fetchCollections(currentPage - 1)}
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
                        <option value="PUBLIC">{tCommon('public')}</option>
                        <option value="PRIVATE">{tCommon('private')}</option>
                        <option value="GROUP">{t('group')}</option>
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

            {/* Collections List */}
            <section className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                {/* Search Bar */}
                <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-blue-50 to-purple-50">
                    <h2 className="text-xl font-semibold text-gray-900">{t('allCollections')}</h2>
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
                                <th className="px-6 py-4">{t('name')}</th>
                                <th className="px-6 py-4">{t('description')}</th>
                                <th className="px-6 py-4">{t('visibility')}</th>
                                <th className="px-6 py-4">Tags</th>
                                <th className="px-6 py-4">{t('createdAt')}</th>
                                <th className="px-6 py-4">{tCommon('actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {currentCollections.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                        {searchQuery || visibilityFilter !== "ALL"
                                            ? t('noCollectionsFound')
                                            : t('noCollections')}
                                    </td>
                                </tr>
                            ) : (
                                currentCollections.map((collection) => {
                                    const visDisplay = getVisibilityDisplay(collection.visibility);
                                    return (
                                        <tr key={collection.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                                                {collection.id.substring(0, 8)}...
                                            </td>
                                            <td className="px-6 py-4 font-medium text-gray-900 max-w-xs truncate">
                                                {collection.name}
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 max-w-xs truncate">
                                                {collection.description || <span className="text-gray-400 italic">{t('noDescription')}</span>}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 w-fit ${visDisplay.color}`}>
                                                    {visDisplay.icon} {visDisplay.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {collection.tags.length === 0 ? (
                                                        <span className="text-gray-400 text-sm italic">{t('noTags')}</span>
                                                    ) : (
                                                        <>
                                                            {collection.tags.slice(0, 2).map((tag) => (
                                                                <span key={tag.id} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                                                                    {tag.type}: {tag.value}
                                                                </span>
                                                            ))}
                                                            {collection.tags.length > 2 && (
                                                                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                                                    +{collection.tags.length - 2}
                                                                </span>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500">
                                                {new Date(collection.createdAt).toLocaleDateString('vi-VN')}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleViewCollection(collection)}
                                                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg font-medium text-sm transition-colors"
                                                        title={tCommon('viewDetails')}
                                                    >
                                                        <EyeIcon className="h-4 w-4" />
                                                        {tCommon('view')}
                                                    </button>
                                                    <button
                                                        onClick={() => handleEditClick(collection)}
                                                        className="flex items-center gap-1 px-3 py-1.5 bg-amber-100 text-amber-700 hover:bg-amber-200 rounded-lg font-medium text-sm transition-colors"
                                                        title={t('edit')}
                                                    >
                                                        <PencilIcon className="h-4 w-4" />
                                                        {t('edit')}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(collection)}
                                                        className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg font-medium text-sm transition-colors"
                                                        title={tCommon('delete')}
                                                    >
                                                        <TrashIcon className="h-4 w-4" />
                                                        {tCommon('delete')}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
                        <span className="text-sm text-gray-500">
                            {tCommon('page')} {currentPage} {tCommon('of')} {totalPages} - {tCommon('totalItems', { count: totalItems, entity: 'collections' })}
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

            {/* View Collection Modal */}
            {selectedCollection && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl flex justify-between items-center">
                            <h3 className="text-2xl font-bold">{t('collectionDetails')}</h3>
                            <button
                                onClick={() => setSelectedCollection(null)}
                                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div>
                                <label className="text-sm font-semibold text-gray-500 uppercase">ID</label>
                                <p className="text-gray-900 mt-1 font-mono">{selectedCollection.id}</p>
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-gray-500 uppercase">Tên</label>
                                <p className="text-lg font-medium text-gray-900 mt-1">{selectedCollection.name}</p>
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-gray-500 uppercase">Mô tả</label>
                                <p className="text-gray-700 mt-1">{selectedCollection.description || t('noDescription')}</p>
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-gray-500 uppercase">Hiển thị</label>
                                <p className="mt-1">
                                    {(() => {
                                        const visDisplay = getVisibilityDisplay(selectedCollection.visibility);
                                        return (
                                            <span className={`px-3 py-1 rounded-lg text-sm font-semibold inline-flex items-center gap-1 ${visDisplay.color}`}>
                                                {visDisplay.icon} {visDisplay.label}
                                            </span>
                                        );
                                    })()}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-gray-500 uppercase">Tags</label>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {selectedCollection.tags.length === 0 ? (
                                        <span className="text-gray-400 italic">Không có tag</span>
                                    ) : (
                                        selectedCollection.tags.map((tag) => (
                                            <span key={tag.id} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                                                {tag.type}: {tag.value}
                                            </span>
                                        ))
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-gray-500 uppercase">Ngày tạo</label>
                                <p className="text-gray-700 mt-1">
                                    {new Date(selectedCollection.createdAt).toLocaleString('vi-VN')}
                                </p>
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-200 flex justify-end">
                            <button
                                onClick={() => setSelectedCollection(null)}
                                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium transition-colors"
                            >
                                {tCommon('close')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Collection Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl flex justify-between items-center">
                            <h3 className="text-2xl font-bold">{t('createCollection')}</h3>
                            <button
                                onClick={() => {
                                    setShowCreateModal(false);
                                    setNewCollectionData({ name: '', description: '', visibility: 'PUBLIC' });
                                }}
                                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    {t('name')} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={newCollectionData.name}
                                    onChange={(e) => setNewCollectionData({ ...newCollectionData, name: e.target.value })}
                                    placeholder={t('namePlaceholder')}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    {t('description_field')}
                                </label>
                                <textarea
                                    value={newCollectionData.description}
                                    onChange={(e) => setNewCollectionData({ ...newCollectionData, description: e.target.value })}
                                    placeholder={t('descriptionPlaceholder')}
                                    rows={3}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            {/* Visibility */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    {t('visibility')} <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={newCollectionData.visibility}
                                    onChange={(e) => setNewCollectionData({ ...newCollectionData, visibility: e.target.value as 'PUBLIC' | 'PRIVATE' | 'GROUP' })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="PUBLIC">{tCommon('public')}</option>
                                    <option value="PRIVATE">{tCommon('private')}</option>
                                    <option value="GROUP">{t('group')}</option>
                                </select>
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowCreateModal(false);
                                    setNewCollectionData({ name: '', description: '', visibility: 'PUBLIC' });
                                }}
                                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                                disabled={isCreating}
                            >
                                {tCommon('cancel')}
                            </button>
                            <button
                                onClick={handleCreateCollection}
                                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg font-medium transition-all flex items-center gap-2 disabled:opacity-50"
                                disabled={isCreating}
                            >
                                {isCreating ? (
                                    <>
                                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                        {t('creating')}
                                    </>
                                ) : (
                                    <>
                                        <PlusIcon className="h-5 w-5" />
                                        {t('createNew')}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {collectionToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
                        <div className="bg-red-600 text-white p-6 rounded-t-2xl flex justify-between items-center">
                            <h3 className="text-2xl font-bold">{t('confirmDelete')}</h3>
                            <button
                                onClick={() => setCollectionToDelete(null)}
                                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="p-6">
                            <p className="text-gray-700 text-lg">
                                {t('confirmDeleteMessage')}{" "}
                                <span className="font-bold text-gray-900">
                                    &quot;{collectionToDelete.name}&quot;
                                </span>?
                            </p>
                            <p className="text-gray-500 mt-2">{t('confirmDeleteNote')}</p>
                        </div>
                        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                            <button
                                onClick={() => setCollectionToDelete(null)}
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

            {/* Edit Collection Modal */}
            {showEditModal && editCollectionData && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
                        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-6 rounded-t-2xl flex justify-between items-center">
                            <h3 className="text-2xl font-bold">{t('editCollection')}</h3>
                            <button
                                onClick={() => {
                                    setShowEditModal(false);
                                    setEditCollectionData(null);
                                }}
                                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    {t('name')} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={editCollectionData.name}
                                    onChange={(e) => setEditCollectionData({ ...editCollectionData, name: e.target.value })}
                                    placeholder={t('namePlaceholder')}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    {t('description')}
                                </label>
                                <textarea
                                    value={editCollectionData.description}
                                    onChange={(e) => setEditCollectionData({ ...editCollectionData, description: e.target.value })}
                                    placeholder={t('descriptionPlaceholder')}
                                    rows={4}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                />
                            </div>

                            {/* Visibility */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    {t('visibility')} <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={editCollectionData.visibility}
                                    onChange={(e) => setEditCollectionData({ ...editCollectionData, visibility: e.target.value as 'PUBLIC' | 'PRIVATE' | 'GROUP' })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                >
                                    <option value="PUBLIC">{tCommon('public')}</option>
                                    <option value="PRIVATE">{tCommon('private')}</option>
                                    <option value="GROUP">{t('group')}</option>
                                </select>
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowEditModal(false);
                                    setEditCollectionData(null);
                                }}
                                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                                disabled={isUpdating}
                            >
                                {tCommon('cancel')}
                            </button>
                            <button
                                onClick={handleUpdateCollection}
                                className="px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                                disabled={isUpdating}
                            >
                                {isUpdating ? (
                                    <>
                                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                        {t('updating')}
                                    </>
                                ) : (
                                    <>
                                        <PencilIcon className="h-5 w-5" />
                                        {t('update')}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
