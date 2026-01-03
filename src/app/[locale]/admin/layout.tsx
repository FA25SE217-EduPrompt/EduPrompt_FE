"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    HomeIcon,
    UserGroupIcon,
    DocumentTextIcon,
    TagIcon,
    FolderIcon,
    ArrowLeftOnRectangleIcon,
    XMarkIcon,
    Bars3Icon,
    UsersIcon
} from "@heroicons/react/24/outline";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

const NavItem: React.FC<{
    icon: React.ReactNode;
    label: string;
    href: string;
}> = ({ icon, label, href }) => {
    const pathname = usePathname();
    const isActive = pathname === href;

    return (
        <Link
            href={href}
            title=""
            className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition ${isActive
                ? "bg-blue-800 text-white"
                : "text-blue-100 hover:bg-blue-800/50 hover:text-white"
                }`}
        >
            {icon}
            <span className="text-sm font-medium">{label}</span>
        </Link>
    );
};

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const { user, logout } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        await logout();
        router.replace('/login');
    };

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <aside
                className={`bg-blue-900 text-white flex flex-col fixed inset-y-0 left-0 z-50 w-64 transition-transform duration-300 ease-in-out ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                    } lg:relative lg:translate-x-0`}
            >
                <div className="flex items-center justify-between p-5 border-b border-blue-800">
                    <span className="text-xl font-bold">Admin Dashboard</span>
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="lg:hidden text-blue-200 hover:text-white"
                    >
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    <NavItem
                        icon={<HomeIcon className="h-5 w-5" />}
                        label="Dashboard"
                        href="/admin"
                    />
                    <NavItem
                        icon={<UsersIcon className="h-5 w-5" />}
                        label="Quản Lý Users"
                        href="/admin/users"
                    />
                    <NavItem
                        icon={<DocumentTextIcon className="h-5 w-5" />}
                        label="Quản Lý Prompts"
                        href="/admin/prompts"
                    />
                    <NavItem
                        icon={<TagIcon className="h-5 w-5" />}
                        label="Quản Lý Tags"
                        href="/admin/tags"
                    />
                    <NavItem
                        icon={<UserGroupIcon className="h-5 w-5" />}
                        label="Quản Lý Groups"
                        href="/admin/groups"
                    />
                    <NavItem
                        icon={<FolderIcon className="h-5 w-5" />}
                        label="Quản Lý Collections"
                        href="/admin/collections"
                    />


                    {/* Divider */}
                    <div className="pt-4 mt-4 border-t border-blue-800">
                        <Link
                            href="/"
                            title=""
                            className="flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition bg-blue-800/30 text-blue-100 hover:bg-blue-700 hover:text-white border border-blue-700"
                        >
                            <HomeIcon className="h-5 w-5" />
                            <span className="text-sm font-medium">Về Trang Chủ</span>
                        </Link>
                    </div>
                </nav>

                <div className="p-4 border-t border-blue-800">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-blue-700 flex items-center justify-center text-sm font-bold">
                            {user?.firstName?.charAt(0) || 'A'}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-medium truncate">
                                {user?.firstName || "Admin"}
                            </p>
                            <p className="text-xs text-blue-300 truncate">
                                System Admin
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-blue-200 hover:text-white hover:bg-blue-800 rounded-md transition-colors"
                    >
                        <ArrowLeftOnRectangleIcon className="h-5 w-5" />
                        <span>Đăng Xuất</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white shadow-sm lg:hidden">
                    <div className="flex items-center p-4">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <Bars3Icon className="h-6 w-6" />
                        </button>
                        <span className="ml-4 text-lg font-semibold text-gray-900">Admin Dashboard</span>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto scrollbar-hide">
                    {children}
                </main>
            </div>
        </div>
    );
}
