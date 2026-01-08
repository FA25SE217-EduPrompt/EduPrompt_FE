"use client";

import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { BarChart3, BookOpen, CheckCircle2, MoreHorizontal, Plus } from 'lucide-react';

export default function Hero() {
    const t = useTranslations('LandingPage.Hero');

    return (
        <section className="w-full bg-surface border-b border-border py-16 lg:py-24 overflow-hidden relative">
            {/* Background Decorative Blob */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl opacity-50 pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

                    {/* Left Column: Copy */}
                    <div className="flex flex-col gap-6 max-w-2xl text-center lg:text-left">
                        <h1 className="text-4xl lg:text-6xl font-bold tracking-tight text-text-main leading-tight">
                            {t('headline')}
                        </h1>
                        <p className="text-lg text-text-muted leading-relaxed max-w-lg mx-auto lg:mx-0">
                            {t('subhead')}
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center lg:justify-start">
                            <Link
                                href="/register"
                                className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
                            >
                                {t('getStarted')}
                            </Link>
                            <Link
                                href="/demo"
                                className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-gray-200 text-text-main font-medium hover:bg-gray-50 transition-colors"
                            >
                                {t('watchDemo')}
                            </Link>
                        </div>
                    </div>

                    {/* Right Column: Visual (Abstract Dashboard) */}
                    <div className="relative w-full aspect-[4/3] lg:aspect-square max-h-[500px] flex items-center justify-center">
                        <div className="w-full h-full bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden flex flex-col relative transform rotate-1 hover:rotate-0 transition-transform duration-500 ease-out">
                            {/* Dashboard Header */}
                            <div className="h-12 border-b border-gray-100 flex items-center px-4 justify-between bg-gray-50/50">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center text-primary">
                                        <BookOpen size={16} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-text-main">{t('mockup.math')}</span>
                                        <span className="text-[10px] text-text-muted">{t('mockup.grade')}</span>
                                    </div>
                                </div>
                                <div className="text-gray-300">
                                    <MoreHorizontal size={20} />
                                </div>
                            </div>

                            {/* Dashboard Content Mockup */}
                            <div className="p-6 flex-1 bg-gray-50/30">
                                <div className="space-y-4">
                                    {/* Item 1 */}
                                    <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm flex items-start gap-4">
                                        <div className="bg-green-100 p-2 rounded-full text-green-600 mt-1">
                                            <CheckCircle2 size={16} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-semibold text-text-main">{t('mockup.lessonPlan')}</h4>
                                            <p className="text-xs text-text-muted mt-1">{t('mockup.lessonDetails')}</p>
                                        </div>
                                    </div>

                                    {/* Item 2 */}
                                    <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm flex items-start gap-4 opacity-80">
                                        <div className="bg-blue-100 p-2 rounded-full text-primary mt-1">
                                            <BarChart3 size={16} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-semibold text-text-main">{t('mockup.quiz')}</h4>
                                            <p className="text-xs text-text-muted mt-1">{t('mockup.quizDetails')}</p>
                                        </div>
                                    </div>

                                    {/* Action Button Mock */}
                                    <div className="mt-8 flex justify-center">
                                        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm rounded-md shadow-lg shadow-blue-500/20 hover:scale-105 transition-transform">
                                            <Plus size={16} />
                                            {t('mockup.generate')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
