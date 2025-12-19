'use client';

import React, { useEffect, useState } from "react";
import { promptsService } from "@/services/resources/prompts";
import { Prompt } from "@/types/prompt.types";
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

export default function PromptsManagementPage() {
    const [prompts, setPrompts] = useState<Prompt[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [visibilityFilter, setVisibilityFilter] = useState("ALL");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
    const [promptToDelete, setPromptToDelete] = useState<Prompt | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const promptsPerPage = 10;

    // Fetch prompts from API
    const fetchPrompts = async () => {
        setLoading(true);
        setError("");
        try {
            const response = await promptsService.getAllPromptsAdmin();
            console.log("=== PROMPTS API DEBUG ===");
            console.log("Full API Response:", response);
            console.log("Response type:", typeof response);
            console.log("Is Array?:", Array.isArray(response));
            console.log("Has data?:", response?.data);
            console.log("Has content?:", response?.content);
            console.log("Has data.content?:", response?.data?.content);

            let promptsData: Prompt[] = [];

            // Handle different response structures
            if (Array.isArray(response)) {
                console.log("✅ Using: Direct array");
                promptsData = response;
            } else if (response && response.data) {
                if (Array.isArray(response.data.content)) {
                    console.log("✅ Using: response.data.content");
                    promptsData = response.data.content;
                } else if (Array.isArray(response.data)) {
                    console.log("✅ Using: response.data");
                    promptsData = response.data;
                }
            } else if (response && Array.isArray(response.content)) {
                console.log("✅ Using: response.content");
                promptsData = response.content;
            }

            console.log("Extracted prompts count:", promptsData.length);
            console.log("First prompt:", promptsData[0]);
            setPrompts(promptsData);

            if (promptsData.length > 0) {
                toast.success(`Đã tải ${promptsData.length} prompts`);
            }
        } catch (err: any) {
            console.error("❌ Error fetching prompts:", err);
            console.error("Error response:", err.response);
            const errorMsg = err.response?.status === 403
                ? "Bạn không có quyền truy cập. Vui lòng đăng nhập với tài khoản ADMIN."
                : "Không thể tải danh sách prompts";
            setError(errorMsg);
            toast.error(errorMsg);
            setPrompts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPrompts();
    }, []);

    // Filter prompts
    const filteredPrompts = prompts.filter(prompt => {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
            (prompt.title && prompt.title.toLowerCase().includes(query)) ||
            (prompt.description && prompt.description.toLowerCase().includes(query)) ||
            (prompt.instruction && prompt.instruction.toLowerCase().includes(query));

        const matchesVisibility = visibilityFilter === "ALL" || prompt.visibility === visibilityFilter;

        return matchesSearch && matchesVisibility;
    });

    // Pagination
    const indexOfLastPrompt = currentPage * promptsPerPage;
    const indexOfFirstPrompt = indexOfLastPrompt - promptsPerPage;
    const currentPrompts = filteredPrompts.slice(indexOfFirstPrompt, indexOfLastPrompt);
    const totalPages = Math.ceil(filteredPrompts.length / promptsPerPage);

    // Handle view prompt
    const handleViewPrompt = (prompt: Prompt) => {
        setSelectedPrompt(prompt);
    };

    // Handle delete click
    const handleDeleteClick = (prompt: Prompt) => {
        setPromptToDelete(prompt);
    };

    // Handle confirm delete
    const handleConfirmDelete = async () => {
        if (!promptToDelete) return;

        setIsDeleting(true);
        try {
            await promptsService.deletePromptAdmin(promptToDelete.id);
            setPrompts(prompts.filter(p => p.id !== promptToDelete.id));
            toast.success(`Đã xóa prompt "${promptToDelete.title}"`);
            setPromptToDelete(null);
        } catch (err) {
            console.error("Failed to delete prompt:", err);
            toast.error("Không thể xóa prompt");
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
                        Quản Lý Prompts
                    </h1>
                    <p className="text-gray-600 mt-2">Quản lý tất cả prompts trong hệ thống</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-sm text-gray-500">Tổng Số Prompts</p>
                        <p className="text-2xl font-bold text-blue-600">{filteredPrompts.length}</p>
                    </div>
                    <button
                        onClick={fetchPrompts}
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

            {/* Prompts List */}
            <section className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                {/* Search Bar */}
                <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-blue-50 to-purple-50">
                    <h2 className="text-xl font-semibold text-gray-900">Tất Cả Prompts</h2>
                    <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            placeholder="Tìm kiếm prompts..."
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
                                <th className="px-6 py-4">Tiêu đề</th>
                                <th className="px-6 py-4">Mô tả</th>
                                <th className="px-6 py-4">Hiển thị</th>
                                <th className="px-6 py-4">Tags</th>
                                <th className="px-6 py-4">Ngày tạo</th>
                                <th className="px-6 py-4">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {currentPrompts.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                        {searchQuery || visibilityFilter !== "ALL"
                                            ? "Không tìm thấy prompt phù hợp với bộ lọc."
                                            : "Không có prompt nào."}
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
                                            {prompt.description || "Không có mô tả"}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 w-fit ${prompt.visibility === 'PUBLIC'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                {prompt.visibility === 'PUBLIC' ? (
                                                    <><GlobeAltIcon className="h-4 w-4" /> Công khai</>
                                                ) : (
                                                    <><LockClosedIcon className="h-4 w-4" /> Riêng tư</>
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
                                                    title="Xem chi tiết"
                                                >
                                                    <EyeIcon className="h-4 w-4" />
                                                    Xem
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(prompt)}
                                                    className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg font-medium text-sm transition-colors"
                                                    title="Xóa prompt"
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
                            Hiển thị {indexOfFirstPrompt + 1} đến {Math.min(indexOfLastPrompt, filteredPrompts.length)} trong tổng số {filteredPrompts.length} prompts
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

            {/* View Prompt Modal */}
            {selectedPrompt && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl flex justify-between items-center">
                            <h3 className="text-2xl font-bold">Chi Tiết Prompt</h3>
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
                                        <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${selectedPrompt.visibility === 'PUBLIC'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-gray-100 text-gray-700'
                                            }`}>
                                            {selectedPrompt.visibility === 'PUBLIC' ? 'Công khai' : 'Riêng tư'}
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
                                Đóng
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
                            <h3 className="text-2xl font-bold">Xác Nhận Xóa</h3>
                            <button
                                onClick={() => setPromptToDelete(null)}
                                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="p-6">
                            <p className="text-gray-700 text-lg">
                                Bạn có chắc chắn muốn xóa prompt{" "}
                                <span className="font-bold text-gray-900">
                                    "{promptToDelete.title}"
                                </span>?
                            </p>
                            <p className="text-gray-500 mt-2">Hành động này không thể hoàn tác.</p>
                        </div>
                        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                            <button
                                onClick={() => setPromptToDelete(null)}
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
