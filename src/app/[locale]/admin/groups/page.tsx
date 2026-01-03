'use client';

import React, { useEffect, useState } from "react";
import { getAllGroups, deleteGroup } from "@/services/resources/groups";
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
} from "@heroicons/react/24/outline";
import Spinner from "@/components/ui/Spinner";
import { toast } from "sonner";

export default function GroupsManagementPage() {
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
                    toast.success(`Đã tải trang ${page + 1} (${response.data.content.length} nhóm)`, { duration: 3000 });
                }
            } else {
                console.error("Unexpected response structure:", response);
                setGroups([]);
                setTotalPages(0);
                setTotalItems(0);
            }
        } catch (err: unknown) {
            console.error("❌ Error fetching groups:", err);
            const errorMsg = err.response?.status === 403
                ? "Bạn không có quyền truy cập. Vui lòng đăng nhập với tài khoản ADMIN."
                : "Không thể tải danh sách nhóm";
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
            setGroups(groups.filter(g => g.id !== groupToDelete.id));
            toast.success(`Đã xóa nhóm "${groupToDelete.name}"`, { duration: 3000 });
            setGroupToDelete(null);
        } catch (err) {
            console.error("Failed to delete group:", err);
            toast.error("Không thể xóa nhóm", { duration: 3000 });
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
                        <UserGroupIcon className="h-10 w-10 text-blue-600" />
                        Quản Lý Nhóm
                    </h1>
                    <p className="text-gray-600 mt-2">Quản lý tất cả nhóm trong hệ thống</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-sm text-gray-500">Tổng Số Nhóm</p>
                        <p className="text-2xl font-bold text-blue-600">{totalItems}</p>
                    </div>
                    <button
                        onClick={() => fetchGroups(currentPage - 1)}
                        className="p-3 bg-white rounded-full shadow-md hover:shadow-lg transition-all hover:scale-105"
                        title="Làm mới"
                    >
                        <ArrowPathIcon className="h-6 w-6 text-blue-600" />
                    </button>
                </div>
            </header>

            {/* Error Message */}
            {error && (
                <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-lg shadow-sm">
                    <p className="font-medium">Lỗi</p>
                    <p className="text-sm">{error}</p>
                </div>
            )}

            {/* Filters */}
            <div className="mb-6 bg-white rounded-xl shadow-md p-6 border border-gray-200">
                <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                        <FunnelIcon className="h-5 w-5 text-gray-500" />
                        <span className="font-semibold text-gray-700">Bộ lọc:</span>
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
                        <option value="ALL">Tất cả</option>
                        <option value="ACTIVE">Hoạt động</option>
                        <option value="INACTIVE">Không hoạt động</option>
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
                            Xóa bộ lọc
                        </button>
                    )}
                </div>
            </div>

            {/* Groups List */}
            <section className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                {/* Search Bar */}
                <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-blue-50 to-purple-50">
                    <h2 className="text-xl font-semibold text-gray-900">Tất Cả Nhóm</h2>
                    <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            placeholder="Tìm kiếm nhóm..."
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
                                <th className="px-6 py-4">Tên nhóm</th>
                                <th className="px-6 py-4">School ID</th>
                                <th className="px-6 py-4">Trạng thái</th>
                                <th className="px-6 py-4">Ngày tạo</th>
                                <th className="px-6 py-4">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {currentGroups.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        {searchQuery || statusFilter !== "ALL"
                                            ? "Không tìm thấy nhóm phù hợp với bộ lọc."
                                            : "Không có nhóm nào."}
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
                                                <span className="text-gray-400 italic">Không có</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 w-fit ${group.isActive
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                {group.isActive ? (
                                                    <><CheckCircleIcon className="h-4 w-4" /> Hoạt động</>
                                                ) : (
                                                    <><XCircleIcon className="h-4 w-4" /> Không hoạt động</>
                                                )}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {new Date(group.createdAt).toLocaleDateString('vi-VN')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleViewGroup(group)}
                                                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg font-medium text-sm transition-colors"
                                                    title="Xem chi tiết"
                                                >
                                                    <EyeIcon className="h-4 w-4" />
                                                    Xem
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(group)}
                                                    className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg font-medium text-sm transition-colors"
                                                    title="Xóa nhóm"
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                    Xóa
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
                            Trang {currentPage} / {totalPages} - Tổng số {totalItems} nhóm
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                            >
                                Trước
                            </button>
                            <span className="px-4 py-2 text-sm font-medium text-gray-700">
                                Trang {currentPage} / {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                            >
                                Tiếp
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
                            <h3 className="text-2xl font-bold">Chi Tiết Nhóm</h3>
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
                                        {selectedGroup.isActive ? 'Hoạt động' : 'Không hoạt động'}
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
                                Đóng
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
                            <h3 className="text-2xl font-bold">Xác Nhận Xóa</h3>
                            <button
                                onClick={() => setGroupToDelete(null)}
                                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="p-6">
                            <p className="text-gray-700 text-lg">
                                Bạn có chắc chắn muốn xóa nhóm{" "}
                                <span className="font-bold text-gray-900">
                                    &quot;{groupToDelete.name}&quot;
                                </span>?
                            </p>
                            <p className="text-gray-500 mt-2">Hành động này không thể hoàn tác.</p>
                        </div>
                        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                            <button
                                onClick={() => setGroupToDelete(null)}
                                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                                disabled={isDeleting}
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                                disabled={isDeleting}
                            >
                                {isDeleting ? (
                                    <>
                                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                        Đang xóa...
                                    </>
                                ) : (
                                    "Xóa"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
