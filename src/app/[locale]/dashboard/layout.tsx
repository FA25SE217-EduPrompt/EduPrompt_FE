"use client";

import React, {useState} from "react";
import {DashboardSidebar} from "@/components/layout/DashboardSidebar";
import {DashboardNavbar} from "@/components/layout/DashboardNavbar";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import {Toaster} from "sonner";

export default function DashboardLayout({children}: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <ProtectedRoute>
            <Toaster position="top-right" richColors/>
            <div className="min-h-screen bg-bg-secondary">
                {/* Mobile Backdrop */}
                {/* This div darkens the content and closes the sidebar on click */}
                <div
                    onClick={() => setIsSidebarOpen(false)}
                    className={`fixed inset-0 bg-black/50 z-30 transition-opacity duration-300 lg:hidden ${
                        isSidebarOpen
                            ? "opacity-100"
                            : "opacity-0 pointer-events-none"
                    }`}
                    aria-hidden="true"
                />

                <DashboardSidebar
                    isSidebarOpen={isSidebarOpen}
                    setIsSidebarOpen={setIsSidebarOpen}
                />

                <div
                    className={`flex flex-col transition-all duration-300 ease-in-out ${
                        isSidebarOpen ? "lg:ml-64" : "ml-0"
                    }`}
                >
                    <DashboardNavbar
                        isSidebarOpen={isSidebarOpen}
                        setIsSidebarOpen={setIsSidebarOpen}
                    />

                    <div className="mt-16">{children}</div>
                </div>
            </div>
        </ProtectedRoute>
    );
}