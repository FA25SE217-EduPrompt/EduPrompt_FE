"use client";

import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTranslations } from "next-intl";

export default function Navbar() {
    const t = useTranslations('Navbar');
    const { isAuthenticated, user, logout } = useAuth();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Add scroll effect to navigation
        const handleScroll = () => {
            const nav = document.querySelector('nav');
            if (window.scrollY > 50) {
                nav?.classList.add('shadow-lg');
            } else {
                nav?.classList.remove('shadow-lg');
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") setIsDropdownOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        }
    }, []);

    const handleLogout = async () => {
        await logout();
        setIsDropdownOpen(false);
    };

    return (
        <nav className="bg-white shadow-sm border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 flex items-center">
                            <Link href="/" className="flex items-center">
                                <Image
                                    src="/logo.png"
                                    alt="EduPrompt Logo"
                                    width={48}
                                    height={48}
                                    className="w-12 h-12 rounded-lg"
                                />
                                <span className="ml-3 text-2xl font-bold text-sky-700">EduPrompt</span>
                            </Link>
                        </div>
                    </div>

                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-8">
                            <a href="#features"
                                className="text-gray-600 hover:text-sky-700 px-3 py-2 text-sm font-medium transition-colors">{t('features')}</a>
                            <a href="#pricing"
                                className="text-gray-600 hover:text-sky-700 px-3 py-2 text-sm font-medium transition-colors">{t('pricing')}</a>
                            <a href="#about"
                                className="text-gray-600 hover:text-sky-700 px-3 py-2 text-sm font-medium transition-colors">{t('about')}</a>

                            {isAuthenticated ? (
                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        type="button"
                                        id="user-menu-button"
                                        aria-haspopup="menu"
                                        aria-expanded={isDropdownOpen}
                                        aria-controls="user-menu"
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        className="flex items-center space-x-2 text-gray-700 hover:text-sky-700 px-3 py-2 text-sm font-medium transition-colors"
                                    >
                                        <div
                                            className="w-8 h-8 bg-gradient-to-br from-sky-600 to-sky-800 rounded-full flex items-center justify-center">
                                            <span className="text-white text-sm font-semibold">
                                                {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                                            </span>
                                        </div>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                            aria-hidden="true" focusable="false">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                d="M19 9l-7 7-7-7"></path>
                                        </svg>
                                    </button>

                                    {isDropdownOpen && (
                                        <div
                                            id="user-menu"
                                            role="menu"
                                            aria-labelledby="user-menu-button"
                                            className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
                                        >
                                            <div className="px-4 py-2 border-b border-gray-100">
                                                <p className="text-sm font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
                                                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                                            </div>
                                            <Link
                                                href="/profile"
                                                role="menuitem"
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                                onClick={() => setIsDropdownOpen(false)}
                                            >
                                                {t('profile')}
                                            </Link>
                                            <Link
                                                href="/dashboard"
                                                role="menuitem"
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                                onClick={() => setIsDropdownOpen(false)}
                                            >
                                                {t('dashboard')}
                                            </Link>
                                            <button
                                                onClick={handleLogout}
                                                type="button"
                                                role="menuitem"
                                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                            >
                                                {t('logout')}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <Link href="/login"
                                    className="bg-sky-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-sky-700 transition-colors">
                                    {t('signIn')}
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
