"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    BookOpenIcon,
    ChartBarIcon,
    Cog6ToothIcon,
    SparklesIcon,
    WalletIcon,
    XMarkIcon,
} from "@heroicons/react/24/outline";
import { UserAvatar } from "./UserAvatar";
import { useAuth } from "@/hooks/useAuth";

// NavItem
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
                ? "bg-sky-100 text-sky-800"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
        >
            {icon}
            <span className="text-sm font-medium">{label}</span>
        </Link>
    );
};

interface DashboardSidebarProps {
    isSidebarOpen: boolean;
    setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
    isSidebarOpen,
    setIsSidebarOpen,
}) => {
    const { user } = useAuth();

    return (
        <aside
            className={`w-64 bg-white border-r border-gray-200 text-gray-600 flex flex-col h-screen fixed top-0 left-0 z-40 transition-transform duration-300 ease-in-out ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                }`}
        >
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <span className="text-2xl font-bold text-sky-700">
                    <Link href="/">EduPrompt</Link>
                </span>
                {/* close button for mobile/toggle */}
                <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="lg:hidden text-gray-400 hover:text-gray-600"
                    aria-label="Close menu"
                >
                    <XMarkIcon className="h-6 w-6" />
                </button>
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                <NavItem
                    icon={<SparklesIcon className="h-5 w-5" />}
                    label="My Prompts"
                    href="/dashboard/prompts"
                />
                <NavItem
                    icon={<BookOpenIcon className="h-5 w-5" />}
                    label="My Collections"
                    href="/dashboard/collections"
                />
                <NavItem
                    icon={<ChartBarIcon className="h-5 w-5" />}
                    label="My Groups"
                    href="/dashboard/groups"
                />
                <NavItem
                    icon={<WalletIcon className="h-5 w-5" />}
                    label="Subscription"
                    href="/dashboard/subscription"
                />
                <NavItem
                    icon={<Cog6ToothIcon className="h-5 w-5" />}
                    label="My Wallet"
                    href="/dashboard/wallet"
                />
            </nav>

            <div className="p-4 border-t border-gray-100">
                <div className="flex items-center gap-3">
                    <UserAvatar className="w-9 h-9" textClassName="text-base" />
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-medium text-gray-900 truncate">
                            {user?.firstName || "User"} {user?.lastName || ""}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                            {user?.email || "No email"}
                        </p>
                    </div>
                </div>
            </div>
        </aside>
    );
};