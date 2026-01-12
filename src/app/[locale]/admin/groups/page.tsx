'use client';

import React, { useEffect, useState } from "react";
import { getAllGroups, deleteGroup, createGroup, updateGroup } from "@/services/resources/groups";
import { Group } from "@/types/group.types";
import {
    UserGroupIcon,
    MagnifyingGlassIcon,
    ArrowPathIcon,
    FunnelIcon,
    TrashIcon,
    EyeIcon,
    XMarkIcon,
    CheckCircleIcon,
    XCircleIcon,
    PlusIcon,
    PencilIcon,
} from "@heroicons/react/24/outline";
import Spinner from "@/components/ui/Spinner";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export default function GroupsManagementPage() {
    const t = useTranslations('Admin.Groups');
    const tCommon = useTranslations('Admin.Common');
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
    const [groupToDelete, setGroupToDelete] = useState<Group | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [newGroupData, setNewGroupData] = useState({
        name: '',
    });
    const [showEditModal, setShowEditModal] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [editGroupData, setEditGroupData] = useState<{
        id: string;
        name: string;
    } | null>(null);
    const groupsPerPage = 10;

    // Fetch groups from API (server-side pagination)
    const fetchGroups = async (page = 0) => {
        setLoading(true);
        setError("");
        try {
            const response = await getAllGroups(page, groupsPerPage);
            console.log("=== GROUPS API DEBUG ===");
            console.log("Full API Response:", response);

            if (response && response.data && Array.isArray(response.data.content)) {
                setGroups(response.data.content);
                setTotalPages(response.data.totalPages || 0);
                setTotalItems(response.data.totalElements || 0);
                console.log(`✅ Loaded page ${page + 1}: ${response.data.content.length} groups`);

                if (response.data.content.length > 0) {
                    toast.success(t('loadedPage', { page: page + 1, count: response.data.content.length }), { duration: 3000 });
                }
            } else {
                console.error("Unexpected response structure:", response);
                setGroups([]);
                setTotalPages(0);
                setTotalItems(0);
            }
        } catch (err: unknown) {
            console.error("❌ Error fetching groups:", err);
            const errorMsg = (err as any).response?.status === 403
                ? t('permissionDenied')
                : t('failedToLoad');
            setError(errorMsg);
            toast.error(errorMsg, { duration: 3000 });
            setGroups([]);
            setTotalPages(0);
            setTotalItems(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGroups(currentPage - 1);
    }, [currentPage]);

    // Filter groups (client-side filtering on current page)
    const filteredGroups = groups.filter(group => {
        const query = searchQuery.toLowerCase();
        const matchesSearch = group.name && group.name.toLowerCase().includes(query);

        const matchesStatus =
            statusFilter === "ALL" ||
            (statusFilter === "ACTIVE" && group.isActive) ||
            (statusFilter === "INACTIVE" && !group.isActive);

        return matchesSearch && matchesStatus;
    });

    // Use filtered groups for display
    const currentGroups = filteredGroups;

    // Handle view group
    const handleViewGroup = (group: Group) => {
        setSelectedGroup(group);
    };

    // Handle delete click
    const handleDeleteClick = (group: Group) => {
        setGroupToDelete(group);
    };

    // Handle confirm delete
    const handleConfirmDelete = async () => {
        if (!groupToDelete) return;

        setIsDeleting(true);
        try {
            await deleteGroup(groupToDelete.id);
            toast.success(t('deleteSuccess', { name: groupToDelete.name }), { duration: 3000 });
            setGroupToDelete(null);
            // Refresh the list from server
            fetchGroups(currentPage - 1);
        } catch (err) {
            console.error("Failed to delete group:", err);
            toast.error(t('deleteFailed'), { duration: 3000 });
        } finally {
            setIsDeleting(false);
        }
    };

    // Handle create group
    const handleCreateGroup = async () => {
        if (!newGroupData.name.trim()) {
            toast.error(t('validationError'), { duration: 3000 });
            return;
        }

        setIsCreating(true);
        try {
            const groupToCreate = {
                name: newGroupData.name.trim(),
            };

            const newGroup = await createGroup(groupToCreate);
            toast.success(t('createSuccess', { name: newGroup.name }), { duration: 3000 });
            setShowCreateModal(false);
            setNewGroupData({ name: '' });
            // Refresh the list
            fetchGroups(currentPage - 1);
        } catch (err) {
            console.error('Failed to create group:', err);
            toast.error(t('createFailed'), { duration: 3000 });
        } finally {
            setIsCreating(false);
        }
    };

    // Handle edit click
    const handleEditClick = (group: Group) => {
        setEditGroupData({
            id: group.id,
            name: group.name,
        });
        setShowEditModal(true);
    };

    // Handle update group
    const handleUpdateGroup = async () => {
        if (!editGroupData || !editGroupData.name.trim()) {
            toast.error(t('validationError'), { duration: 3000 });
            return;
        }

        setIsUpdating(true);
        try {
            const updateData = {
                name: editGroupData.name.trim(),
                isActive: true,
            };

            await updateGroup(editGroupData.id, updateData);
            toast.success(t('updateSuccess', { name: editGroupData.name }), { duration: 3000 });
            setShowEditModal(false);
            setEditGroupData(null);
            // Refresh the list
            fetchGroups(currentPage - 1);
        } catch (err) {
            console.error('Failed to update group:', err);
            toast.error(t('updateFailed'), { duration: 3000 });
        } finally {
            setIsUpdating(false);
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
                        <UserGroupIcon className="h-10 w-10 text-blue-600" />
                        {t('title')}
                    </h1>
                    <p className="text-gray-600 mt-2">{t('description')}</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-sm text-gray-500">{t('totalGroups')}</p>
                        <p className="text-2xl font-bold text-blue-600">{totalItems}</p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 font-medium transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                    >
                        <PlusIcon className="h-5 w-5" />
                        {t('createNew')}
                    </button>
                    <button
                        onClick={() => fetchGroups(currentPage - 1)}
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

                    {/* Status Filter */}
                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                        <option value="ALL">{tCommon('allStatuses')}</option>
                        <option value="ACTIVE">{tCommon('active')}</option>
                        <option value="INACTIVE">{tCommon('inactive')}</option>
                    </select>

                    {/* Clear Filters */}
                    {statusFilter !== "ALL" && (
                        <button
                            onClick={() => {
                                setStatusFilter("ALL");
                                setCurrentPage(1);
                            }}
                            className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                            {tCommon('clearFilters')}
                        </button>
                    )}
                </div>
            </div>

            {/* Groups List */}
            <section className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                {/* Search Bar */}
                <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-blue-50 to-purple-50">
                    <h2 className="text-xl font-semibold text-gray-900">{t('allGroups')}</h2>
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
                                <th className="px-6 py-4">School ID</th>
                                <th className="px-6 py-4">{t('status')}</th>
                                <th className="px-6 py-4">{t('createdAt')}</th>
                                <th className="px-6 py-4">{tCommon('actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {currentGroups.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        {searchQuery || statusFilter !== "ALL"
                                            ? t('noGroupsFound')
                                            : t('noGroups')}
                                    </td>
                                </tr>
                            ) : (
                                currentGroups.map((group) => (
                                    <tr key={group.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                                            {group.id.substring(0, 8)}...
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {group.name}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {group.schoolId ? (
                                                <span className="font-mono text-sm">{group.schoolId.substring(0, 8)}...</span>
                                            ) : (
                                                <span className="text-gray-400 italic">{t('noSchoolId')}</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 w-fit ${group.isActive
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                {group.isActive ? (
                                                    <><CheckCircleIcon className="h-4 w-4" /> {tCommon('active')}</>
                                                ) : (
                                                    <><XCircleIcon className="h-4 w-4" /> {tCommon('inactive')}</>
                                                )}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {new Date(group.createdAt).toLocaleDateString('vi-VN')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2 justify-center">
                                                <button
                                                    onClick={() => handleViewGroup(group)}
                                                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg font-medium text-sm transition-colors min-w-[90px] justify-center"
                                                    title={tCommon('viewDetails')}
                                                >
                                                    <EyeIcon className="h-4 w-4" />
                                                    {tCommon('view')}
                                                </button>
                                                <button
                                                    onClick={() => handleEditClick(group)}
                                                    className="flex items-center gap-1 px-3 py-1.5 bg-amber-100 text-amber-700 hover:bg-amber-200 rounded-lg font-medium text-sm transition-colors min-w-[90px] justify-center"
                                                    title={t('edit')}
                                                >
                                                    <PencilIcon className="h-4 w-4" />
                                                    {t('edit')}
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(group)}
                                                    className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg font-medium text-sm transition-colors min-w-[90px] justify-center"
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
                            {tCommon('page')} {currentPage} {tCommon('of')} {totalPages} - {tCommon('totalItems', { count: totalItems, entity: 'groups' })}
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

            {/* View Group Modal */}
            {selectedGroup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
                        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl flex justify-between items-center">
                            <h3 className="text-2xl font-bold">{t('groupDetails')}</h3>
                            <button
                                onClick={() => setSelectedGroup(null)}
                                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="text-sm font-semibold text-gray-500 uppercase">ID</label>
                                <p className="text-gray-900 mt-1 font-mono">{selectedGroup.id}</p>
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-gray-500 uppercase">Tên nhóm</label>
                                <p className="text-lg font-medium text-gray-900 mt-1">{selectedGroup.name}</p>
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-gray-500 uppercase">School ID</label>
                                <p className="text-gray-700 mt-1 font-mono">
                                    {selectedGroup.schoolId || <span className="text-gray-400 italic">Không có</span>}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-gray-500 uppercase">Trạng thái</label>
                                <p className="mt-1">
                                    <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${selectedGroup.isActive
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-gray-100 text-gray-700'
                                        }`}>
                                        {selectedGroup.isActive ? tCommon('active') : tCommon('inactive')}
                                    </span>
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-gray-500 uppercase">Ngày tạo</label>
                                <p className="text-gray-700 mt-1">
                                    {new Date(selectedGroup.createdAt).toLocaleString('vi-VN')}
                                </p>
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-200 flex justify-end">
                            <button
                                onClick={() => setSelectedGroup(null)}
                                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium transition-colors"
                            >
                                {tCommon('close')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {groupToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
                        <div className="bg-red-600 text-white p-6 rounded-t-2xl flex justify-between items-center">
                            <h3 className="text-2xl font-bold">{t('confirmDelete')}</h3>
                            <button
                                onClick={() => setGroupToDelete(null)}
                                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="p-6">
                            <p className="text-gray-700 text-lg">
                                {t('confirmDeleteMessage')}{" "}
                                <span className="font-bold text-gray-900">
                                    &quot;{groupToDelete.name}&quot;
                                </span>?
                            </p>
                            <p className="text-gray-500 mt-2">{t('confirmDeleteNote')}</p>
                        </div>
                        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                            <button
                                onClick={() => setGroupToDelete(null)}
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

            {/* Create Group Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl flex justify-between items-center">
                            <h3 className="text-2xl font-bold">{t('createGroup')}</h3>
                            <button
                                onClick={() => {
                                    setShowCreateModal(false);
                                    setNewGroupData({ name: '' });
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
                                    value={newGroupData.name}
                                    onChange={(e) => setNewGroupData({ ...newGroupData, name: e.target.value })}
                                    placeholder={t('namePlaceholder')}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                        </div>
                        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowCreateModal(false);
                                    setNewGroupData({ name: '' });
                                }}
                                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                                disabled={isCreating}
                            >
                                {tCommon('cancel')}
                            </button>
                            <button
                                onClick={handleCreateGroup}
                                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
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

            {/* Edit Group Modal */}
            {showEditModal && editGroupData && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
                        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-6 rounded-t-2xl flex justify-between items-center">
                            <h3 className="text-2xl font-bold">{t('editGroup')}</h3>
                            <button
                                onClick={() => {
                                    setShowEditModal(false);
                                    setEditGroupData(null);
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
                                    value={editGroupData.name}
                                    onChange={(e) => setEditGroupData({ ...editGroupData, name: e.target.value })}
                                    placeholder={t('namePlaceholder')}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                />
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowEditModal(false);
                                    setEditGroupData(null);
                                }}
                                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                                disabled={isUpdating}
                            >
                                {tCommon('cancel')}
                            </button>
                            <button
                                onClick={handleUpdateGroup}
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
