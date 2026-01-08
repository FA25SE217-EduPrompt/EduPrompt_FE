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
    const [scrolled, setScrolled] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
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
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        await logout();
        setIsDropdownOpen(false);
    };

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${scrolled
                ? 'bg-surface/90 backdrop-blur-md border-border shadow-sm py-2'
                : 'bg-transparent border-transparent py-4'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-14">

                    {/* Logo Section */}
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center group">
                            <div className="relative w-10 h-10 overflow-hidden rounded-lg shadow-sm group-hover:shadow transition-all">
                                <Image
                                    src="/logo.png"
                                    alt="EduPrompt Logo"
                                    width={40}
                                    height={40}
                                    className="object-cover"
                                />
                            </div>
                            <span className="ml-3 text-xl font-bold text-text-main tracking-tight group-hover:text-primary transition-colors">
                                EduPrompt
                            </span>
                        </Link>
                    </div>

                    {/* Navigation - Desktop */}
                    <div className="hidden md:flex items-center space-x-1">
                        <NavLink href="/#features">{t('features')}</NavLink>
                        <NavLink href="/#pricing">{t('pricing')}</NavLink>
                        <NavLink href="/#about">{t('about')}</NavLink>

                        <div className="w-px h-6 bg-border mx-4" />

                        {isAuthenticated ? (
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="flex items-center space-x-2 pl-2 pr-1 py-1 rounded-full hover:bg-subtle transition-colors border border-transparent hover:border-border"
                                >
                                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                                        {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                                    </div>
                                    <span className="text-sm font-medium text-text-main max-w-[100px] truncate">
                                        {user?.firstName}
                                    </span>
                                </button>

                                {isDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-56 bg-surface rounded-xl shadow-xl border border-border py-1 animate-in fade-in slide-in-from-top-2 duration-200">
                                        <div className="px-4 py-3 border-b border-border/50 bg-subtle/30">
                                            <p className="text-sm font-medium text-text-main">{user?.firstName} {user?.lastName}</p>
                                            <p className="text-xs text-text-muted truncate">{user?.email}</p>
                                        </div>
                                        <div className="p-1">
                                            <DropdownLink href="/profile" onClick={() => setIsDropdownOpen(false)}>
                                                {t('profile')}
                                            </DropdownLink>
                                            <DropdownLink href="/dashboard" onClick={() => setIsDropdownOpen(false)}>
                                                {t('dashboard')}
                                            </DropdownLink>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center"
                                            >
                                                {t('logout')}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 ml-2">
                                <Link
                                    href="/login"
                                    className="text-sm font-medium text-text-main hover:text-primary transition-colors px-3 py-2"
                                >
                                    {t('signIn')}
                                </Link>
                                <Link
                                    href="/register"
                                    className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
                                >
                                    {t('getStarted')}
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <Link
            href={href}
            className="text-sm font-medium text-text-muted hover:text-primary px-4 py-2 rounded-lg hover:bg-primary/5 transition-all"
        >
            {children}
        </Link>
    );
}

function DropdownLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick?: () => void }) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className="block px-3 py-2 text-sm text-text-main hover:bg-subtle rounded-lg transition-colors"
        >
            {children}
        </Link>
    );
}
