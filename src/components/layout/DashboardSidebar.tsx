"use client";

import React from "react";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {
    BookOpenIcon,
    ChartBarIcon,
    Cog6ToothIcon,
    SparklesIcon,
    WalletIcon,
    XMarkIcon,
} from "@heroicons/react/24/outline";
import {UserAvatar} from "./UserAvatar";
import {useAuth} from "@/hooks/useAuth";

// NavItem
const NavItem: React.FC<{
    icon: React.ReactNode;
    label: string;
    href: string;
}> = ({icon, label, href}) => {
    const pathname = usePathname();
    const isActive = pathname === href;

    return (
        <Link
            href={href}
            className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition ${
                isActive
                    ? "bg-brand-secondary/20 text-text-on-brand"
                    : "text-text-on-brand/80 hover:bg-brand-secondary/10 hover:text-text-on-brand"
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
    const {user} = useAuth();

    return (
        <aside
            className={`w-64 bg-brand-primary text-text-on-brand flex flex-col h-screen fixed top-0 left-0 z-40 transition-transform duration-300 ease-in-out ${
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
        >
            <div className="flex items-center justify-between p-5 border-b border-brand-secondary/30">
        <span className="text-2xl font-bold">
          <Link href="/">EduPrompt</Link>
        </span>
                {/* close button for mobile/toggle */}
                <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="lg:hidden text-text-on-brand/80 hover:text-text-on-brand"
                    aria-label="Close menu"
                >
                    <XMarkIcon className="h-6 w-6"/>
                </button>
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                <NavItem
                    icon={<SparklesIcon className="h-5 w-5"/>}
                    label="My Prompts"
                    href="/dashboard/teacher"
                />
                <NavItem
                    icon={<BookOpenIcon className="h-5 w-5"/>}
                    label="My Collections"
                    href="/dashboard/collections"
                />
                <NavItem
                    icon={<ChartBarIcon className="h-5 w-5"/>}
                    label="Explore"
                    href="/dashboard/explore"
                />
                <NavItem
                    icon={<Cog6ToothIcon className="h-5 w-5"/>}
                    label="Personalization"
                    href="/dashboard/personalization"
                />
                <NavItem
                    icon={<WalletIcon className="h-5 w-5"/>}
                    label="Subscription"
                    href="/dashboard/subscription"
                />
            </nav>

            <div className="p-4 border-t border-brand-secondary/30">
                <div className="flex items-center gap-3">
                    <UserAvatar className="w-9 h-9" textClassName="text-base"/>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-medium text-text-on-brand truncate">
                            {user?.firstName || "User"} {user?.lastName || ""}
                        </p>
                        <p className="text-xs text-text-on-brand/70 truncate">
                            {user?.email || "No email"}
                        </p>
                    </div>
                </div>
            </div>
        </aside>
    );
};