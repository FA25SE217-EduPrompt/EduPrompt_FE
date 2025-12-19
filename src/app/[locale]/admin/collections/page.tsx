'use client';

import React, { useEffect, useState } from "react";
import { getAllCollections, deleteCollection } from "@/services/resources/collections";
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
} from "@heroicons/react/24/outline";
import Spinner from "@/components/ui/Spinner";
import { toast } from "sonner";

export default function CollectionsManagementPage() {
    const [collections, setCollections] = useState<Collection[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [visibilityFilter, setVisibilityFilter] = useState("ALL");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
    const [collectionToDelete, setCollectionToDelete] = useState<Collection | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const collectionsPerPage = 10;

    // Fetch collections from API
    const fetchCollections = async () => {
        setLoading(true);
        setError("");
        try {
            const response = await getAllCollections();
            console.log("=== COLLECTIONS API DEBUG ===");
            console.log("Full API Response:", response);

            let collectionsData: Collection[] = [];

            // Handle different response structures
            if (Array.isArray(response)) {
                collectionsData = response;
            } else if (response && response.data) {
                if (Array.isArray(response.data.content)) {
                    collectionsData = response.data.content;
                } else if (Array.isArray(response.data)) {
                    collectionsData = response.data;
                }
            } else if (response && Array.isArray(response.content)) {
                collectionsData = response.content;
            }

            console.log("Extracted collections count:", collectionsData.length);
            setCollections(collectionsData);

            if (collectionsData.length > 0) {
                toast.success(`Đã tải ${collectionsData.length} bộ sưu tập`);
            }
        } catch (err: any) {
            console.error("❌ Error fetching collections:", err);
            const errorMsg = err.response?.status === 403
                ? "Bạn không có quyền truy cập. Vui lòng đăng nhập với tài khoản ADMIN."
                : "Không thể tải danh sách bộ sưu tập";
            setError(errorMsg);
            toast.error(errorMsg);
            setCollections([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCollections();
    }, []);

    // Filter collections
    const filteredCollections = collections.filter(collection => {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
            (collection.name && collection.name.toLowerCase().includes(query)) ||
            (collection.description && collection.description.toLowerCase().includes(query));

        const matchesVisibility = visibilityFilter === "ALL" || collection.visibility === visibilityFilter;

        return matchesSearch && matchesVisibility;
    });

    // Pagination
    const indexOfLastCollection = currentPage * collectionsPerPage;
    const indexOfFirstCollection = indexOfLastCollection - collectionsPerPage;
    const currentCollections = filteredCollections.slice(indexOfFirstCollection, indexOfLastCollection);
    const totalPages = Math.ceil(filteredCollections.length / collectionsPerPage);

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
            setCollections(collections.filter(c => c.id !== collectionToDelete.id));
            toast.success(`Đã xóa bộ sưu tập "${collectionToDelete.name}"`);
            setCollectionToDelete(null);
        } catch (err) {
            console.error("Failed to delete collection:", err);
            toast.error("Không thể xóa bộ sưu tập");
        } finally {
            setIsDeleting(false);
        }
    };

    // Get visibility icon and label
    const getVisibilityDisplay = (visibility: string) => {
        switch (visibility) {
            case 'PUBLIC':
                return {
                    icon: <GlobeAltIcon className="h-4 w-4" />,
                    label: 'Công khai',
                    color: 'bg-green-100 text-green-700'
                };
            case 'PRIVATE':
                return {
                    icon: <LockClosedIcon className="h-4 w-4" />,
                    label: 'Riêng tư',
                    color: 'bg-gray-100 text-gray-700'
                };
            case 'GROUP':
                return {
                    icon: <UsersIcon className="h-4 w-4" />,
                    label: 'Nhóm',
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
                        Quản Lý Bộ Sưu Tập
                    </h1>
                    <p className="text-gray-600 mt-2">Quản lý tất cả bộ sưu tập trong hệ thống</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-sm text-gray-500">Tổng Số Bộ Sưu Tập</p>
                        <p className="text-2xl font-bold text-blue-600">{filteredCollections.length}</p>
                    </div>
                    <button
                        onClick={fetchCollections}
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

                    {/* Visibility Filter */}
                    <select
                        value={visibilityFilter}
                        onChange={(e) => {
                            setVisibilityFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                        <option value="ALL">Tất cả</option>
                        <option value="PUBLIC">Công khai</option>
                        <option value="PRIVATE">Riêng tư</option>
                        <option value="GROUP">Nhóm</option>
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
                            Xóa bộ lọc
                        </button>
                    )}
                </div>
            </div>

            {/* Collections List */}
            <section className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                {/* Search Bar */}
                <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-blue-50 to-purple-50">
                    <h2 className="text-xl font-semibold text-gray-900">Tất Cả Bộ Sưu Tập</h2>
                    <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            placeholder="Tìm kiếm bộ sưu tập..."
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
                                <th className="px-6 py-4">Tên</th>
                                <th className="px-6 py-4">Mô tả</th>
                                <th className="px-6 py-4">Hiển thị</th>
                                <th className="px-6 py-4">Tags</th>
                                <th className="px-6 py-4">Ngày tạo</th>
                                <th className="px-6 py-4">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {currentCollections.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                        {searchQuery || visibilityFilter !== "ALL"
                                            ? "Không tìm thấy bộ sưu tập phù hợp với bộ lọc."
                                            : "Không có bộ sưu tập nào."}
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
                                                {collection.description || <span className="text-gray-400 italic">Không có mô tả</span>}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 w-fit ${visDisplay.color}`}>
                                                    {visDisplay.icon} {visDisplay.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {collection.tags.length === 0 ? (
                                                        <span className="text-gray-400 text-sm italic">Không có tag</span>
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
                                                        title="Xem chi tiết"
                                                    >
                                                        <EyeIcon className="h-4 w-4" />
                                                        Xem
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(collection)}
                                                        className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg font-medium text-sm transition-colors"
                                                        title="Xóa bộ sưu tập"
                                                    >
                                                        <TrashIcon className="h-4 w-4" />
                                                        Xóa
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
                            Hiển thị {indexOfFirstCollection + 1} đến {Math.min(indexOfLastCollection, filteredCollections.length)} trong tổng số {filteredCollections.length} bộ sưu tập
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

            {/* View Collection Modal */}
            {selectedCollection && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl flex justify-between items-center">
                            <h3 className="text-2xl font-bold">Chi Tiết Bộ Sưu Tập</h3>
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
                                <p className="text-gray-700 mt-1">{selectedCollection.description || "Không có mô tả"}</p>
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
                                Đóng
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
                            <h3 className="text-2xl font-bold">Xác Nhận Xóa</h3>
                            <button
                                onClick={() => setCollectionToDelete(null)}
                                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="p-6">
                            <p className="text-gray-700 text-lg">
                                Bạn có chắc chắn muốn xóa bộ sưu tập{" "}
                                <span className="font-bold text-gray-900">
                                    "{collectionToDelete.name}"
                                </span>?
                            </p>
                            <p className="text-gray-500 mt-2">Hành động này không thể hoàn tác.</p>
                        </div>
                        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                            <button
                                onClick={() => setCollectionToDelete(null)}
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
