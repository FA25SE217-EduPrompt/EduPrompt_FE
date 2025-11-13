"use client";

import React from "react";
import Link from "next/link";
import {useAuth} from "@/hooks/useAuth";
import {UserAvatar} from "./UserAvatar";
import Button from "../ui/Button";
import {Bars3Icon} from "@heroicons/react/24/outline"; // hamburgar :v

interface DashboardNavbarProps {
    children?: React.ReactNode;
    isSidebarOpen: boolean;
    setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const DashboardNavbar: React.FC<DashboardNavbarProps> = ({
                                                                    children,
                                                                    isSidebarOpen,
                                                                    setIsSidebarOpen,
                                                                }) => {
    const {user, logout} = useAuth();
    const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

    return (
        <header
            className={`flex items-center justify-between bg-bg-primary/90 backdrop-blur-md shadow-sm px-6 py-3 h-16 fixed top-0 right-0 z-20 transition-all duration-300 ease-in-out ${
                isSidebarOpen ? "lg:left-64" : "left-0"
            }`}
        >
            <div className="flex items-center gap-4">
                {/* Hamburger Menu Toggle Button */}
                <button
                    onClick={() => setIsSidebarOpen((prev) => !prev)}
                    className="text-text-secondary hover:text-text-primary"
                    aria-label="Toggle menu"
                >
                    <Bars3Icon className="h-6 w-6"/>
                </button>

                {children || (
                    <h1 className="text-xl font-semibold text-text-primary">
                        Dashboard
                    </h1>
                )}
            </div>

            <div className="flex items-center gap-4">
                <Button
                    href="/prompt/create"
                    variant="primary"
                    className="!px-4 !py-2 !text-sm"
                >
                    New prompt
                </Button>

                <div className="relative">
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center gap-2"
                    >
                        <UserAvatar/>
                        <span className="text-sm font-medium text-text-secondary hidden sm:block">
              {user?.firstName || "User"}
            </span>
                        <svg
                            className="w-4 h-4 text-text-secondary"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 9l-7 7-7-7"
                            ></path>
                        </svg>
                    </button>

                    {isDropdownOpen && (
                        <div
                            className="absolute right-0 mt-2 w-48 bg-bg-primary rounded-lg shadow-lg border border-brand-subtle py-1 z-50"
                            onMouseLeave={() => setIsDropdownOpen(false)}
                        >
                            <div className="px-4 py-2 border-b border-brand-subtle">
                                <p className="text-sm font-medium text-text-primary truncate">
                                    {user?.firstName} {user?.lastName}
                                </p>
                                <p className="text-xs text-text-secondary truncate">
                                    {user?.email}
                                </p>
                            </div>
                            <Link
                                href="/profile"
                                className="block px-4 py-2 text-sm text-text-secondary hover:bg-bg-secondary"
                                onClick={() => setIsDropdownOpen(false)}
                            >
                                Profile
                            </Link>
                            <Link
                                href="/dashboard"
                                className="block px-4 py-2 text-sm text-text-secondary hover:bg-bg-secondary"
                                onClick={() => setIsDropdownOpen(false)}
                            >
                                Dashboard
                            </Link>
                            <button
                                onClick={() => {
                                    logout();
                                    setIsDropdownOpen(false);
                                }}
                                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-bg-secondary"
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};