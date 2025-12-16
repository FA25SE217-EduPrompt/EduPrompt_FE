"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import Button, { ButtonProps } from '@/components/ui/Button';
import SectionHeader from '@/components/landing/SectionHeader';
import FeatureCard from '@/components/landing/FeatureCard';

import PricingCard from '@/components/landing/PricingCard';
import { useTranslations } from 'next-intl';
import { useTierPlans, TierId } from '@/lib/tiers';

// Helper component to render pricing cards to avoid cluttering main component
const PricingDisplay = () => {
    const plans = useTierPlans();

    // Filter out plans if needed, e.g. maybe don't show Free on landing if we want to focus on paid?
    // But usually landing shows all.
    // The previous hardcoded ones were Free, Standard (Pro?), School.
    // My tiers.ts has Free, Pro, Premium, School.
    // Let's show Free, Pro, School or all?
    // The previous design had 3 columns.
    // Let's show Free, Pro, School for now to match 3 cols layout, or all 4 if Premium is important.
    // I will show Free, Pro, Premium. School is usually "Contact Sales".

    // Filtering to show relevant ones. Let's show FREE, PRO, PREMIUM. Or maybe Skip Free?
    // User request: "update plan card for home page following my tier plan"
    // I will show Pro, Premium, School (Negotiated). Free is usually implied or separate.
    // But the previous code showed "Free Trial ($0)".
    // I'll show Free, Pro, Premium, School - that's 4. Grid cols 3? 
    // Maybe hide Free? Or make grid cols 4?
    // The design has `grid md:grid-cols-3`.
    // Let's skip FREE for the main pricing cards if the user is logged out, but usually you want to show it.
    // The keys in `tiers.ts`: FREE, PRO, PREMIUM, SCHOOL.
    // I'll display PRO, PREMIUM, SCHOOL for a paid-focused look, consistent with "Upgrade".
    // Or if logged out, maybe Free is good.
    // Let's just map all of them and see how it looks, or stick to 3.
    // I'll stick to PRO, PREMIUM, SCHOOL for now as "Pricing Plans".

    const displayPlans = plans.filter(p => p.id !== TierId.FREE);

    return (
        <>
            {displayPlans.map((plan) => {
                const buttonProps = plan.href !== '#'
                    ? { variant: plan.buttonVariant, children: plan.buttonText, href: plan.href }
                    : { variant: plan.buttonVariant, children: plan.buttonText, onClick: plan.action };

                return (
                    <PricingCard
                        key={plan.id}
                        title={plan.name}
                        price={plan.priceString}
                        pricePer={plan.period}
                        features={plan.features}
                        popular={plan.recommended}
                        buttonProps={buttonProps as ButtonProps}
                        isCurrent={plan.isCurrent}
                        details={
                            plan.limits ? (
                                <div className="mt-2 text-xs text-gray-500 space-y-1">
                                    {Object.entries(plan.limits).map(([key, val]) => (
                                        <div key={key} className="flex justify-between">
                                            <span className="capitalize">{key}:</span>
                                            <span className="font-medium">{val}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : undefined
                        }
                    />
                );
            })}
        </>
    );
};


// Define icons for features
const FeatureIcon1 = () => (
    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
    </svg>
);
const FeatureIcon2 = () => (
    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
    </svg>
);
const FeatureIcon3 = () => (
    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
    </svg>
);
const FeatureIcon4 = () => (
    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
    </svg>
);
const FeatureIcon5 = () => (
    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
    </svg>
);
const FeatureIcon6 = () => (
    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
            d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
    </svg>
);


export default function Home() {
    const { isAuthenticated, isLoading, user } = useAuth();
    const t = useTranslations('HomePage');
    const tLanding = useTranslations('LandingPage');

    useEffect(() => {
        // Smooth scrolling for navigation links
        const handleClick = (e: Event) => {
            const target = e.currentTarget as HTMLAnchorElement;
            const href = target.getAttribute('href');
            if (href?.startsWith('#')) {
                e.preventDefault();
                const element = document.querySelector(href!);
                if (element) {
                    element.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        };

        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', handleClick);
        });

        return () => {
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.removeEventListener('click', handleClick);
            });
        };
    }, []);

    return (
        <div className="bg-bg-primary">
            <Navbar />

            <main>
                {/* Hero Section */}
                <section className="gradient-bg py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            {isLoading ? (
                                <>
                                    {/* Skeleton Loader */}
                                    <div className="animate-pulse">
                                        <div
                                            className="h-16 bg-brand-highlight/30 rounded mb-6 max-w-4xl mx-auto"></div>
                                        <div className="h-6 bg-brand-highlight/20 rounded mb-8 max-w-3xl mx-auto"></div>
                                        <div className="h-6 bg-brand-highlight/20 rounded mb-8 max-w-2xl mx-auto"></div>
                                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                            <div className="h-12 bg-brand-highlight/30 rounded-lg w-48 mx-auto"></div>
                                            <div className="h-12 bg-brand-highlight/30 rounded-lg w-48 mx-auto"></div>
                                        </div>
                                    </div>
                                </>
                            ) : isAuthenticated ? (
                                <>
                                    <h1 className="text-4xl md:text-6xl font-bold text-text-on-brand mb-6">
                                        {t('Hero.welcomeBack', { name: user?.firstName || 'Teacher' })}<br />
                                        <span className="text-brand-highlight">{t('Hero.readyToCreate')}</span>
                                    </h1>
                                    <p className="text-xl text-brand-subtle mb-8 max-w-3xl mx-auto">
                                        {t('Hero.continueJourney')}
                                    </p>
                                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                        <Button variant="primary" href="/dashboard">
                                            {t('Hero.goToDashboard')}
                                        </Button>
                                        <Button variant="secondary" href="/profile">
                                            {t('Hero.viewProfile')}
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <h1 className="text-4xl md:text-6xl font-bold text-text-on-brand mb-6">
                                        {t('Hero.aiTeaching')}<br />
                                        <span className="text-brand-highlight">{t('Hero.madeSimple')}</span>
                                    </h1>
                                    <p className="text-xl text-brand-subtle mb-8 max-w-3xl mx-auto">
                                        {t('Hero.streamline')}
                                    </p>
                                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                        <Button variant="primary" href="/register">
                                            {t('Hero.startFreeTrial')}
                                        </Button>
                                        <Button variant="secondary" onClick={() => console.log('Watch Demo')}>
                                            {t('Hero.watchDemo')}
                                        </Button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="py-20 bg-bg-secondary">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <SectionHeader
                            title={tLanding('Features.title')}
                            subtitle={tLanding('Features.subtitle')}
                        />

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <FeatureCard
                                icon={<FeatureIcon1 />}
                                title={tLanding('Features.repository')}
                                description={tLanding('Features.repositoryDesc')}
                            />
                            <FeatureCard
                                icon={<FeatureIcon2 />}
                                title={tLanding('Features.personalization')}
                                description={tLanding('Features.personalizationDesc')}
                            />
                            <FeatureCard
                                icon={<FeatureIcon3 />}
                                title={tLanding('Features.collaboration')}
                                description={tLanding('Features.collaborationDesc')}
                            />
                            <FeatureCard
                                icon={<FeatureIcon4 />}
                                title={tLanding('Features.suggestions')}
                                description={tLanding('Features.suggestionsDesc')}
                            />
                            <FeatureCard
                                icon={<FeatureIcon5 />}
                                title={tLanding('Features.access')}
                                description={tLanding('Features.accessDesc')}
                            />
                            <FeatureCard
                                icon={<FeatureIcon6 />}
                                title={tLanding('Features.crossPlatform')}
                                description={tLanding('Features.crossPlatformDesc')}
                            />
                        </div>
                    </div>
                </section>

                {/* Pricing Section */}
                <section id="pricing" className="py-20 bg-bg-primary">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <SectionHeader
                            title={tLanding('Pricing.title')}
                            subtitle={tLanding('Pricing.subtitle')}
                        />

                        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                            <PricingDisplay />
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="gradient-bg py-20">
                    <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
                        <h2 className="text-3xl md:text-4xl font-bold text-text-on-brand mb-6">
                            {tLanding('CTA.title')}
                        </h2>
                        <p className="text-xl text-brand-subtle mb-8">
                            {tLanding('CTA.subtitle')}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button variant="primary" href="/register">
                                {tLanding('CTA.startTrial')}
                            </Button>
                            <Button variant="outline-light" onClick={() => console.log('Schedule Demo')}>
                                {tLanding('CTA.scheduleDemo')}
                            </Button>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}