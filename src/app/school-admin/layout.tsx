"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    HomeIcon,
    UserGroupIcon,
    AcademicCapIcon,
    CreditCardIcon,
    Cog6ToothIcon,
    ArrowLeftOnRectangleIcon,
    XMarkIcon,
    Bars3Icon
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

export default function SchoolAdminLayout({
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
                    <span className="text-xl font-bold">EduPrompt Admin</span>
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
                        href="/school-admin"
                    />
                    <NavItem
                        icon={<AcademicCapIcon className="h-5 w-5" />}
                        label="My School"
                        href="/school-admin/school"
                    />
                    <NavItem
                        icon={<UserGroupIcon className="h-5 w-5" />}
                        label="Teachers"
                        href="/school-admin/teachers"
                    />
                    <NavItem
                        icon={<CreditCardIcon className="h-5 w-5" />}
                        label="Subscription"
                        href="/school-admin/subscription"
                    />
                    <NavItem
                        icon={<Cog6ToothIcon className="h-5 w-5" />}
                        label="Settings"
                        href="/school-admin/settings"
                    />
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
                                School Administrator
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-blue-200 hover:text-white hover:bg-blue-800 rounded-md transition-colors"
                    >
                        <ArrowLeftOnRectangleIcon className="h-5 w-5" />
                        <span>Sign Out</span>
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
                        <span className="ml-4 text-lg font-semibold text-gray-900">EduPrompt Admin</span>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
