import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query";

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
    icons: {
        icon: '/favicon.png',
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <React.StrictMode>
                    <QueryClientProvider client={queryClient}>
                        <AuthProvider>
                            {children}
                        </AuthProvider>
                    </QueryClientProvider>
                </React.StrictMode>

            </body>
        </html>
    );
}

// Consider adding Open Graph/SEO later.
