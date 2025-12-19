'use client';

import React, { useEffect, useState } from "react";
import { getAllUsers, deleteUser } from "@/services/resources/users";
import { User, UserRole } from "@/types/user.types";
import {
    UserGroupIcon,
    MagnifyingGlassIcon,
    ArrowPathIcon,
    FunnelIcon,
    TrashIcon,
    EyeIcon,
    XMarkIcon,
} from "@heroicons/react/24/outline";
import Spinner from "@/components/ui/Spinner";
import { toast } from "sonner";

export default function UsersManagementPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [roleFilter, setRoleFilter] = useState("ALL");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const usersPerPage = 10;

    // Fetch users from API
    const fetchUsers = async () => {
        setLoading(true);
        setError("");
        try {
            const response = await getAllUsers();
            console.log("API Response:", response);

            // Handle different response structures
            let usersData: User[] = [];
            if (response && response.data && Array.isArray(response.data.content)) {
                // Paginated response: { data: { content: [...], totalElements, totalPages, ... } }
                usersData = response.data.content;
                console.log("Total elements:", response.data.totalElements);
                console.log("Total pages:", response.data.totalPages);
            } else if (Array.isArray(response)) {
                // Direct array response
                usersData = response;
            } else if (response && Array.isArray(response.data)) {
                // Response with data property
                usersData = response.data;
            } else {
                console.error("Unexpected response structure:", response);
                console.error("Response keys:", response ? Object.keys(response) : "null");
                usersData = [];
                setError("Cấu trúc response không đúng. Vui lòng kiểm tra console.");
            }

            console.log("Users data:", usersData);
            console.log("Users count:", usersData.length);
            setUsers(usersData);

            if (usersData.length > 0) {
                toast.success(`Đã tải ${usersData.length} người dùng thành công`);
            } else {
                toast.warning("Không tìm thấy người dùng");
            }
        } catch (err: any) {
            console.error("Failed to fetch users:", err);
            console.error("Error details:", err.response?.data);
            setError(err.message || "Không thể tải danh sách người dùng. Vui lòng thử lại.");
            toast.error("Không thể tải người dùng");
            setUsers([]); // Set empty array on error
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Get user status from isActive and isVerified
    const getUserStatus = (user: User): string => {
        if (!user.isVerified) return "Chờ xác nhận";
        if (!user.isActive) return "Không hoạt động";
        return "Hoạt động";
    };

    // Get status badge color
    const getStatusColor = (isActive: boolean, isVerified: boolean) => {
        const status = getUserStatus({ isActive, isVerified } as User);
        switch (status) {
            case "Hoạt động":
                return "bg-green-100 text-green-700";
            case "Không hoạt động":
                return "bg-gray-100 text-gray-700";
            case "Chờ xác nhận":
                return "bg-yellow-100 text-yellow-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    // Filter users based on search query, status, and role
    const filteredUsers = users.filter(user => {
        // Hide SYSTEM_ADMIN users
        if (user.role === UserRole.SYSTEM_ADMIN) {
            return false;
        }

        const query = searchQuery.toLowerCase();
        const matchesSearch =
            user.email.toLowerCase().includes(query) ||
            user.firstName.toLowerCase().includes(query) ||
            user.lastName.toLowerCase().includes(query) ||
            user.role.toLowerCase().includes(query);

        const userStatus = getUserStatus(user);
        const matchesStatus = statusFilter === "ALL" || userStatus === statusFilter;
        const matchesRole = roleFilter === "ALL" || user.role === roleFilter;

        return matchesSearch && matchesStatus && matchesRole;
    });

    // Pagination
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    // Handle view user
    const handleViewUser = (user: User) => {
        setSelectedUser(user);
    };

    // Handle delete click
    const handleDeleteClick = (user: User) => {
        setUserToDelete(user);
    };

    // Handle confirm delete
    const handleConfirmDelete = async () => {
        if (!userToDelete) return;

        setIsDeleting(true);
        try {
            await deleteUser(userToDelete.id);
            setUsers(users.filter(u => u.id !== userToDelete.id));
            toast.success(`Đã xóa người dùng ${userToDelete.firstName} ${userToDelete.lastName} thành công`);
            setUserToDelete(null);
        } catch (err) {
            console.error("Failed to delete user:", err);
            toast.error("Không thể xóa người dùng. Vui lòng thử lại.");
        } finally {
            setIsDeleting(false);
        }
    };

    // Get role badge color
    const getRoleColor = (role: string) => {
        switch (role) {
            case "SYSTEM_ADMIN":
                return "bg-red-100 text-red-700";
            case "ADMIN":
                return "bg-purple-100 text-purple-700";
            case "SCHOOL_ADMIN":
                return "bg-blue-100 text-blue-700";
            case "TEACHER":
                return "bg-indigo-100 text-indigo-700";
            case "STUDENT":
                return "bg-teal-100 text-teal-700";
            default:
                return "bg-gray-100 text-gray-700";
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
                        Quản Lý Người Dùng
                    </h1>
                    <p className="text-gray-600 mt-2">Quản lý tất cả người dùng trong hệ thống</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-sm text-gray-500">Tổng Số Người Dùng</p>
                        <p className="text-2xl font-bold text-blue-600">{filteredUsers.length}</p>
                    </div>
                    <button
                        onClick={fetchUsers}
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
                        <option value="ALL">Tất cả trạng thái</option>
                        <option value="Hoạt động">Hoạt động</option>
                        <option value="Không hoạt động">Không hoạt động</option>
                        <option value="Chờ xác nhận">Chờ xác nhận</option>
                    </select>

                    {/* Role Filter */}
                    <select
                        value={roleFilter}
                        onChange={(e) => {
                            setRoleFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                        <option value="ALL">Tất cả vai trò</option>
                        <option value={UserRole.ADMIN}>Quản trị viên</option>
                        <option value={UserRole.SCHOOL_ADMIN}>Quản trị trường</option>
                        <option value={UserRole.TEACHER}>Giáo viên</option>
                        <option value={UserRole.STUDENT}>Học sinh</option>
                    </select>

                    {/* Clear Filters */}
                    {(statusFilter !== "ALL" || roleFilter !== "ALL") && (
                        <button
                            onClick={() => {
                                setStatusFilter("ALL");
                                setRoleFilter("ALL");
                                setCurrentPage(1);
                            }}
                            className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                            Xóa bộ lọc
                        </button>
                    )}
                </div>
            </div>

            {/* Users List */}
            <section className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                {/* Search Bar */}
                <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-blue-50 to-purple-50">
                    <h2 className="text-xl font-semibold text-gray-900">Tất Cả Người Dùng</h2>
                    <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            placeholder="Tìm kiếm người dùng..."
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
                                <th className="px-6 py-4">Họ và Tên</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4">Số điện thoại</th>
                                <th className="px-6 py-4">Vai trò</th>
                                <th className="px-6 py-4">Trạng thái</th>
                                <th className="px-6 py-4">Ngày tạo</th>
                                <th className="px-6 py-4">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {currentUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                                        {searchQuery || statusFilter !== "ALL" || roleFilter !== "ALL"
                                            ? "Không tìm thấy người dùng phù hợp với bộ lọc."
                                            : "Không có người dùng."}
                                    </td>
                                </tr>
                            ) : (
                                currentUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                                            {user.id.substring(0, 8)}...
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {user.firstName} {user.lastName}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{user.email}</td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {user.phoneNumber || "N/A"}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getRoleColor(user.role)}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(user.isActive, user.isVerified)}`}>
                                                {getUserStatus(user)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleViewUser(user)}
                                                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg font-medium text-sm transition-colors"
                                                    title="Xem chi tiết"
                                                >
                                                    <EyeIcon className="h-4 w-4" />
                                                    Xem
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(user)}
                                                    className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg font-medium text-sm transition-colors"
                                                    title="Xóa người dùng"
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
                            Hiển thị {indexOfFirstUser + 1} đến {Math.min(indexOfLastUser, filteredUsers.length)} trong tổng số {filteredUsers.length} người dùng
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

            {/* View User Modal */}
            {selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl flex justify-between items-center">
                            <h3 className="text-2xl font-bold">Chi Tiết Người Dùng</h3>
                            <button
                                onClick={() => setSelectedUser(null)}
                                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6">
                            {/* User Info Grid */}
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="text-sm font-semibold text-gray-500 uppercase">Tên</label>
                                    <p className="text-lg font-medium text-gray-900 mt-1">{selectedUser.firstName}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-gray-500 uppercase">Họ</label>
                                    <p className="text-lg font-medium text-gray-900 mt-1">{selectedUser.lastName}</p>
                                </div>
                                <div className="col-span-2">
                                    <label className="text-sm font-semibold text-gray-500 uppercase">Email</label>
                                    <p className="text-lg font-medium text-gray-900 mt-1">{selectedUser.email}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-gray-500 uppercase">Số điện thoại</label>
                                    <p className="text-lg font-medium text-gray-900 mt-1">{selectedUser.phoneNumber || "Không có"}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-gray-500 uppercase">User ID</label>
                                    <p className="text-sm font-mono text-gray-600 mt-1">{selectedUser.id}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-gray-500 uppercase">Vai trò</label>
                                    <p className="mt-1">
                                        <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${getRoleColor(selectedUser.role)}`}>
                                            {selectedUser.role}
                                        </span>
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-gray-500 uppercase">Trạng thái</label>
                                    <p className="mt-1">
                                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(selectedUser.isActive, selectedUser.isVerified)}`}>
                                            {getUserStatus(selectedUser)}
                                        </span>
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-gray-500 uppercase">Đang hoạt động</label>
                                    <p className="mt-1">
                                        <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${selectedUser.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {selectedUser.isActive ? 'Có' : 'Không'}
                                        </span>
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-gray-500 uppercase">Đã xác thực</label>
                                    <p className="mt-1">
                                        <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${selectedUser.isVerified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                            {selectedUser.isVerified ? 'Có' : 'Không'}
                                        </span>
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-gray-500 uppercase">Ngày tạo</label>
                                    <p className="text-lg font-medium text-gray-900 mt-1">
                                        {new Date(selectedUser.createdAt).toLocaleString('vi-VN')}
                                    </p>
                                </div>
                                {selectedUser.updatedAt && (
                                    <div>
                                        <label className="text-sm font-semibold text-gray-500 uppercase">Ngày cập nhật</label>
                                        <p className="text-lg font-medium text-gray-900 mt-1">
                                            {new Date(selectedUser.updatedAt).toLocaleString('vi-VN')}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-gray-200 flex justify-end">
                            <button
                                onClick={() => setSelectedUser(null)}
                                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium transition-colors"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {userToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
                        {/* Modal Header */}
                        <div className="bg-red-600 text-white p-6 rounded-t-2xl flex justify-between items-center">
                            <h3 className="text-2xl font-bold">Xác Nhận Xóa</h3>
                            <button
                                onClick={() => setUserToDelete(null)}
                                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6">
                            <p className="text-gray-700 text-lg">
                                Bạn có chắc chắn muốn xóa người dùng{" "}
                                <span className="font-bold text-gray-900">
                                    {userToDelete.firstName} {userToDelete.lastName}
                                </span>?
                            </p>
                            <p className="text-gray-500 mt-2">Hành động này không thể hoàn tác.</p>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                            <button
                                onClick={() => setUserToDelete(null)}
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
