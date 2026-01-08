"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import {
    Database,
    UploadCloud,
    Zap, // For Optimization/Auditor
    Smartphone, // For Cross-Platform
    Search
} from 'lucide-react';

export default function FeaturesBento() {
    const t = useTranslations('LandingPage.Features');

    return (
        <section id="features" className="w-full bg-primary-light/30 py-20 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="mb-12 text-center md:text-left">
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-text-main mb-4">
                        {t('title')}
                    </h2>
                    <p className="text-text-muted max-w-2xl text-lg">
                        {t('subtitle')}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 auto-rows-[250px] gap-6">

                    {/* Cell A: The Repository (Search & Semantic) - Large Cell */}
                    <div className="group lg:col-span-2 lg:row-span-2 bg-surface border border-border rounded-2xl p-8 flex flex-col hover:border-primary/50 hover:shadow-lg transition-all duration-300 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Database size={160} className="text-primary" />
                        </div>
                        <div className="relative z-10 flex flex-col h-full">
                            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-6 text-primary">
                                <Search size={24} />
                            </div>

                            <h3 className="text-2xl font-bold text-text-main mb-4">{t('repository.title')}</h3>
                            <p className="text-text-muted text-lg leading-relaxed flex-1">
                                {t('repository.body')}
                            </p>

                            {/* Visual Hint for 5 Tasks */}
                            <div className="mt-6 flex flex-wrap gap-2">
                                {[0, 1, 2, 3, 4].map((i) => (
                                    <span key={i} className="px-3 py-1 bg-gray-50 border border-gray-100 rounded-full text-xs font-medium text-gray-600">
                                        {t(`tags.${i}`)}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Cell B: AI Generation & Personalization */}
                    <div className="group lg:col-span-2 lg:row-span-1 bg-surface border border-border rounded-2xl p-8 flex flex-col justify-center hover:border-primary/50 hover:shadow-lg transition-all duration-300">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
                                <UploadCloud size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-text-main mb-2">{t('personalization.title')}</h3>
                                <p className="text-text-muted">
                                    {t('personalization.body')}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Cell C: Optimization Engine (Prompt Auditor) */}
                    <div className="group lg:col-span-1 lg:row-span-1 bg-surface border border-border rounded-2xl p-6 flex flex-col hover:border-primary/50 hover:shadow-lg transition-all duration-300">
                        <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center mb-4 text-orange-600 shrink-0">
                            <Zap size={20} />
                        </div>
                        <h3 className="text-base font-bold text-text-main mb-2 leading-tight">{t('optimization.title')}</h3>
                        <p className="text-xs text-text-muted leading-relaxed line-clamp-4">
                            {t('optimization.body')}
                        </p>
                        {/* Fake Score Widget */}
                        <div className="mt-auto flex items-center gap-2 pt-2">
                            <div className="text-xl font-bold text-green-600">98/100</div>
                            <span className="text-xs text-text-muted">{t('score')}</span>
                        </div>
                    </div>

                    {/* Cell D: Ecosystem (Cross-Platform) */}
                    <div className="group lg:col-span-1 lg:row-span-1 bg-surface border border-border rounded-2xl p-8 flex flex-col hover:border-primary/50 hover:shadow-lg transition-all duration-300">
                        <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center mb-4 text-green-600">
                            <Smartphone size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-text-main mb-2">{t('ecosystem.title')}</h3>
                        <p className="text-sm text-text-muted">
                            {t('ecosystem.body')}
                        </p>
                    </div>

                </div>
            </div>
        </section>
    );
}
