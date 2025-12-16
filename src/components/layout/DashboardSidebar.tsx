"use client";

import React from "react";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
    BookOpenIcon,
    ChartBarIcon,
    Cog6ToothIcon,
    MagnifyingGlassIcon,
    SparklesIcon,
    WalletIcon,
    XMarkIcon,
} from "@heroicons/react/24/outline";
import { UserAvatar } from "./UserAvatar";
import { useAuth } from "@/hooks/useAuth";
import { useTranslations } from "next-intl";

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

// School Badge Component
import { SchoolService } from "@/services/resources/school";
import { AcademicCapIcon } from "@heroicons/react/24/solid";

const SchoolBadge: React.FC<{ userId?: string | number }> = ({ userId }) => {
    const [schoolName, setSchoolName] = React.useState<string | null>(null);

    React.useEffect(() => {
        const fetchSchool = async () => {
            if (!userId) return;
            try {
                const response = await SchoolService.getSchoolByUserId(userId);
                // Adjust based on actual response structure. 
                // Assuming response.data contains school info or the response itself is the school object
                // If response.data.name exists:
                if (response.data?.name) {
                    setSchoolName(response.data.name);
                }
            } catch (error) {
                // Silently fail if not part of a school or error
                console.log("Not part of a school or failed to fetch school info");
            }
        };
        fetchSchool();
    }, [userId]);

    if (!schoolName) return null;

    return (
        <div className="mx-4 mb-2 p-3 bg-indigo-50 rounded-xl border border-indigo-100 flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                <AcademicCapIcon className="h-5 w-5" />
            </div>
            <div className="overflow-hidden">
                <p className="text-xs text-indigo-600 font-semibold uppercase tracking-wider">School Plan</p>
                <p className="text-sm font-bold text-indigo-900 truncate" title={schoolName}>
                    {schoolName}
                </p>
            </div>
        </div>
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
    const t = useTranslations('Dashboard.Sidebar');
    const { user } = useAuth();

    return (
        <aside
            className={`w-64 bg-white border-r border-gray-200 text-gray-600 flex flex-col h-screen fixed top-0 left-0 z-40 transition-transform duration-300 ease-in-out ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                }`}
        >
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <Link href="/" className="flex items-center gap-2">
                    <Image
                        src="/logo.png"
                        alt="EduPrompt Logo"
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-lg"
                    />
                    <span className="text-2xl font-bold text-sky-700">EduPrompt</span>
                </Link>
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
                    label={t('myPrompts')}
                    href="/dashboard/prompts"
                />
                <NavItem
                    icon={<MagnifyingGlassIcon className="h-5 w-5" />}
                    label={t('searchPrompts')}
                    href="/prompt/search"
                />
                <NavItem
                    icon={<BookOpenIcon className="h-5 w-5" />}
                    label={t('myCollections')}
                    href="/dashboard/collections"
                />
                <NavItem
                    icon={<ChartBarIcon className="h-5 w-5" />}
                    label={t('myGroups')}
                    href="/dashboard/groups"
                />
                <NavItem
                    icon={<WalletIcon className="h-5 w-5" />}
                    label={t('subscription')}
                    href="/dashboard/subscription"
                />
                <NavItem
                    icon={<Cog6ToothIcon className="h-5 w-5" />}
                    label={t('myWallet')}
                    href="/dashboard/wallet"
                />
            </nav>

            {/* School Badge */}
            <SchoolBadge userId={user?.id} />

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