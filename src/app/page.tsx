"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {useEffect} from "react";
import {useAuth} from "@/hooks/useAuth";
import Button from '@/components/ui/Button';
import SectionHeader from '@/components/landing/SectionHeader';
import FeatureCard from '@/components/landing/FeatureCard';
import PricingCard from '@/components/landing/PricingCard';

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
    const {isAuthenticated, isLoading, user} = useAuth();

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
            <Navbar/>

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
                                        Welcome back, {user?.firstName || 'Teacher'}!<br/>
                                        <span className="text-brand-highlight">Ready to create amazing lessons?</span>
                                    </h1>
                                    <p className="text-xl text-brand-subtle mb-8 max-w-3xl mx-auto">
                                        Continue your journey with AI-powered teaching tools. Access your saved prompts,
                                        create new ones, and discover fresh ideas for your classroom.
                                    </p>
                                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                        <Button variant="primary" href="/dashboard">
                                            Go to Dashboard
                                        </Button>
                                        <Button variant="secondary" href="/profile">
                                            View Profile
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <h1 className="text-4xl md:text-6xl font-bold text-text-on-brand mb-6">
                                        AI-Powered Teaching<br/>
                                        <span className="text-brand-highlight">Made Simple</span>
                                    </h1>
                                    <p className="text-xl text-brand-subtle mb-8 max-w-3xl mx-auto">
                                        Streamline your lesson planning with our intelligent prompt management system.
                                        Create, share, and personalize AI prompts tailored to your teaching style and
                                        curriculum.
                                    </p>
                                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                        <Button variant="primary" href="/register">
                                            Start Free Trial
                                        </Button>
                                        <Button variant="secondary" onClick={() => console.log('Watch Demo')}>
                                            Watch Demo
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
                            title="Everything You Need to Enhance Teaching"
                            subtitle="Discover powerful features designed specifically for high school educators"
                        />

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <FeatureCard
                                icon={<FeatureIcon1/>}
                                title="Prompt Repository"
                                description="Access thousands of categorized prompts organized by subject, grade level, and teaching objectives."
                            />
                            <FeatureCard
                                icon={<FeatureIcon2/>}
                                title="Personalization Engine"
                                description="AI adapts prompts to match your unique teaching style, subject expertise, and classroom needs."
                            />
                            <FeatureCard
                                icon={<FeatureIcon3/>}
                                title="Collaboration Hub"
                                description="Share, rate, and collaborate on prompts with fellow educators in your school and beyond."
                            />
                            <FeatureCard
                                icon={<FeatureIcon4/>}
                                title="AI Suggestions"
                                description="Get intelligent recommendations based on your teaching patterns and curriculum requirements."
                            />
                            <FeatureCard
                                icon={<FeatureIcon5/>}
                                title="Role-Based Access"
                                description="Secure permissions system for teachers, administrators, and system managers."
                            />
                            <FeatureCard
                                icon={<FeatureIcon6/>}
                                title="Cross-Platform"
                                description="Access your prompts anywhere with our responsive web platform and mobile app."
                            />
                        </div>
                    </div>
                </section>

                {/* Pricing Section */}
                <section id="pricing" className="py-20 bg-bg-primary">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <SectionHeader
                            title="Choose Your Plan"
                            subtitle="Flexible pricing options for individual teachers and schools"
                        />

                        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                            <PricingCard
                                title="Free Trial"
                                price="$0"
                                pricePer="/month"
                                features={['Limited prompt library', '1 teacher per school', 'Basic features']}
                                buttonProps={{
                                    variant: 'neutral',
                                    href: '/register',
                                    children: 'Start Free Trial',
                                }}
                            />
                            <PricingCard
                                title="Standard"
                                price="$29"
                                pricePer="/teacher/month"
                                features={['Full repository access', 'AI personalization', 'Collaboration features', 'Priority support']}
                                buttonProps={{
                                    variant: 'primary',
                                    href: '/register',
                                    children: 'Get Started',
                                }}
                                popular={true}
                            />
                            <PricingCard
                                title="School-Wide"
                                price="$499"
                                pricePer="/school/year"
                                features={['Unlimited teachers', 'Admin dashboard', 'Analytics & reporting', 'Premium add-ons']}
                                buttonProps={{
                                    variant: 'solid-dark',
                                    onClick: () => console.log('Contact Sales'),
                                    children: 'Contact Sales',
                                }}
                            />
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="gradient-bg py-20">
                    <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
                        <h2 className="text-3xl md:text-4xl font-bold text-text-on-brand mb-6">
                            Ready to Transform Your Teaching?
                        </h2>
                        <p className="text-xl text-brand-subtle mb-8">
                            Join thousands of educators already using EduPrompt to create more engaging and effective
                            lessons.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button variant="primary" href="/register">
                                Start Your Free Trial
                            </Button>
                            <Button variant="outline-light" onClick={() => console.log('Schedule Demo')}>
                                Schedule Demo
                            </Button>
                        </div>
                    </div>
                </section>
            </main>

            <Footer/>
        </div>
    );
}