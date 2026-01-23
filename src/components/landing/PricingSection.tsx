"use client";

import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Check, Building2, Crown, Star, Sparkles } from 'lucide-react';

export default function PricingSection() {
    const t = useTranslations('LandingPage.Pricing');

    // Helper to get features array safely since useTranslations returns rich objects or strings
    // In next-intl, arrays in JSON are accessible by index "0", "1", etc. or we can just iterate if we know the count.
    // However, cleaner way is to use `useMessages` or just trust the keys since we know them.
    // A robust way for fixed lists in new structure:
    const getFeatures = (tierKey: string) => {
        // We know we have 3 features for each in the new JSON
        return [0, 1, 2].map(i => t(`Tiers.${tierKey}.features.${i}`));
    };

    return (
        <section id="pricing" className="w-full bg-surface py-20 px-4 border-t border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-text-main mb-4">
                        {t('title')}
                    </h2>
                    <p className="text-xl text-text-muted">
                        {t('subtitle')}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">

                    {/* Free (renamed from Starter) */}
                    <div className="flex flex-col p-8 bg-white border border-border rounded-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-primary/30 shadow-sm">
                        <div className="mb-4">
                            <h3 className="text-xl font-bold text-text-main flex items-center gap-2">
                                {t('Tiers.Free.name')}
                            </h3>
                        </div>
                        <div className="mb-4 flex items-baseline">
                            <span className="text-4xl font-bold text-text-main">{t('Tiers.Free.price')}</span>
                        </div>
                        <p className="text-text-muted text-sm mb-6">{t('Tiers.Free.desc')}</p>

                        <ul className="mb-8 space-y-4 flex-1">
                            {getFeatures('Free').map((feat, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm text-text-muted">
                                    <Check className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                    <span>{feat}</span>
                                </li>
                            ))}
                        </ul>

                        <Link href="/" className="w-full py-2.5 px-4 bg-gray-50 text-text-main font-medium rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors text-center mt-auto">
                            {t('buttons.startFreeTrial')}
                        </Link>
                    </div>

                    {/* Pro (renamed from Professional) - Highlighted */}
                    <div className="flex flex-col p-8 bg-white rounded-2xl border-2 border-primary shadow-xl relative transform transition-all duration-300 md:-translate-y-4 hover:translate-y-[-24px] hover:shadow-2xl z-10">
                        <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg flex items-center gap-1">
                            <Star size={12} fill="currentColor" /> {t('Tiers.Pro.badge')}
                        </div>
                        <div className="mb-4">
                            <h3 className="text-xl font-bold text-primary flex items-center gap-2">
                                <Sparkles size={20} />
                                {t('Tiers.Pro.name')}
                            </h3>
                        </div>
                        <div className="mb-4 flex items-baseline">
                            <span className="text-4xl font-bold text-text-main">{t('Tiers.Pro.price')}</span>
                            <span className="text-text-muted ml-2">{t('perMonth')}</span>
                        </div>
                        <p className="text-text-muted text-sm mb-6">{t('Tiers.Pro.desc')}</p>

                        <ul className="mb-8 space-y-4 flex-1">
                            {getFeatures('Pro').map((feat, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm text-text-main font-medium">
                                    <Check className="w-5 h-5 text-primary flex-shrink-0" />
                                    <span>{feat}</span>
                                </li>
                            ))}
                        </ul>

                        <Link href="/register?plan=pro" className="w-full py-3 px-4 bg-primary text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-center mt-auto shadow-md shadow-blue-200">
                            {t('buttons.getStarted')}
                        </Link>
                    </div>

                    {/* Premium (renamed from Expert) */}
                    <div className="flex flex-col p-8 bg-text-main text-white border border-text-main rounded-2xl shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
                        <div className="mb-4">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <Crown size={20} className="text-amber-400" />
                                {t('Tiers.Premium.name')}
                            </h3>
                        </div>
                        <div className="mb-4 flex items-baseline">
                            <span className="text-4xl font-bold text-white">{t('Tiers.Premium.price')}</span>
                            <span className="text-white/60 ml-2">{t('perMonth')}</span>
                        </div>
                        <p className="text-white/60 text-sm mb-6">{t('Tiers.Premium.desc')}</p>

                        <ul className="mb-8 space-y-4 flex-1">
                            {getFeatures('Premium').map((feat, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm text-white/90">
                                    <Check className="w-5 h-5 text-amber-400 flex-shrink-0" />
                                    <span>{feat}</span>
                                </li>
                            ))}
                        </ul>

                        <Link href="/payment/checkout?tierId=d6415c57-5ef5-454d-802a-8d8e7c377b37" className="w-full py-2.5 px-4 bg-white/10 text-white font-medium rounded-lg border border-white/20 hover:bg-white/20 transition-colors text-center mt-auto">
                            {t('buttons.getStarted')}
                        </Link>
                    </div>

                </div>

                {/* School Plan Banner */}
                <div className="max-w-6xl mx-auto rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-start gap-6">
                        <div className="hidden md:flex w-16 h-16 rounded-2xl bg-white items-center justify-center text-primary shadow-sm shrink-0">
                            <Building2 size={32} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-text-main mb-2">{t('School.title')}</h3>
                            <p className="text-primary font-semibold mb-2">
                                {t('School.subtitle')}
                            </p>
                            <p className="text-text-muted max-w-xl text-lg">
                                {t('School.benefit')}
                            </p>
                        </div>
                    </div>
                    <Link href="/contact-sales" className="whitespace-nowrap px-8 py-4 bg-white text-primary font-bold rounded-xl border border-blue-200 hover:shadow-lg transition-all shadow-sm">
                        {t('School.cta')}
                    </Link>
                </div>

            </div>
        </section>
    );
}
