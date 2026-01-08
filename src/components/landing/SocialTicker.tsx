"use client";

import React from 'react';
import { useTranslations } from 'next-intl';

// Assuming you have logos or I can use placeholders. 
// I'll use text placeholders styled like logos if images are missing, or generic SVGs.
// Since I don't have the logos, I'll create a text-based marquee which is also very Swiss.
// Or I can use placeholders.

const SCHOOLS = [
    "Trường THPT Chuyên Lê Hồng Phong",
    "Trường THPT chuyên Trần Đại Nghĩa",
    "Trường Phổ thông Năng khiếu TP.HCM", // Shortened slightly for ticker
    "THPT Lê Quý Đôn",
    "THPT Nguyễn Thượng Hiền",
    "THPT Nguyễn Thị Minh Khai",
    "FPT University"
];

export default function SocialTicker() {
    const t = useTranslations('LandingPage.SocialTicker');

    return (
        <section className="w-full bg-surface border-b border-border py-8 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
                <p className="text-xs font-mono text-text-muted/60 uppercase tracking-widest text-center">{t('trustedBy')}</p>
            </div>

            {/* Ticker Container */}
            <div className="relative w-full flex overflow-hidden mask-linear-fade">
                <div className="animate-marquee flex whitespace-nowrap gap-16 items-center">
                    {/* First set */}
                    {SCHOOLS.map((school, i) => (
                        <span
                            key={i}
                            className={`text-xl font-bold tracking-tight transition-colors cursor-default select-none ${school.includes("FPT")
                                ? "text-text-muted/40 hover:text-[#F36F21]" // FPT Orange
                                : "text-text-muted/30 hover:text-text-muted"
                                }`}
                        >
                            {school}
                        </span>
                    ))}
                    {/* Duplicate set for seamless loop */}
                    {SCHOOLS.map((school, i) => (
                        <span
                            key={`dup-${i}`}
                            className={`text-xl font-bold tracking-tight transition-colors cursor-default select-none ${school.includes("FPT")
                                ? "text-text-muted/40 hover:text-[#F36F21]"
                                : "text-text-muted/30 hover:text-text-muted"
                                }`}
                        >
                            {school}
                        </span>
                    ))}
                </div>
            </div>

            <style jsx>{`
                .animate-marquee {
                    animation: marquee 40s linear infinite;
                }
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .mask-linear-fade {
                    mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
                }
            `}</style>
        </section>
    );
}
