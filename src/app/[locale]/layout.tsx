import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query";
import { Toaster } from "sonner";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "EduPrompt - AI-Powered Education Platform",
    description: "Transform your teaching with AI-powered prompts and educational tools",
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const locale = await getLocale();
    const messages = await getMessages();

    return (
        <html lang={locale}>
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <NextIntlClientProvider messages={messages}>
                    <QueryClientProvider client={queryClient}>
                        <AuthProvider>
                            {children}
                            <Toaster
                                position="top-right"
                                richColors
                                toastOptions={{
                                    className: 'rounded-xl border border-gray-100 shadow-xl shadow-gray-200/50 bg-white/90 backdrop-blur-md',
                                    classNames: {
                                        toast: 'bg-white border-gray-100',
                                        title: 'text-sm font-bold text-slate-800',
                                        description: 'text-xs text-slate-500',
                                        actionButton: 'bg-blue-600 text-white hover:bg-blue-700',
                                        cancelButton: 'bg-gray-100 text-slate-500 hover:bg-gray-200',
                                        error: 'bg-red-50 border-red-100 text-red-600',
                                        success: 'bg-green-50 border-green-100 text-green-600',
                                        warning: 'bg-yellow-50 border-yellow-100 text-yellow-600',
                                        info: 'bg-blue-50 border-blue-100 text-blue-600',
                                    },
                                }}
                            />
                        </AuthProvider>
                    </QueryClientProvider>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}

// Consider adding Open Graph/SEO later.
