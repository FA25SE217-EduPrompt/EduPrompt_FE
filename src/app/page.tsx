"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import {useEffect} from "react";
import {useAuth} from "@/hooks/useAuth";
import {useRouter} from "next/navigation";

export default function Home() {
    const {isAuthenticated, isLoading, user} = useAuth();
    const router = useRouter();

    // Don't redirect authenticated users, show them personalized content
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
        <div className="bg-white">
            <Navbar/>

            <main>
                {/* Hero Section */}
                <section className="gradient-bg py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            {isLoading ? (
                                <>
                                    <div className="animate-pulse">
                                        <div className="h-16 bg-sky-200 rounded mb-6 max-w-4xl mx-auto"></div>
                                        <div className="h-6 bg-sky-100 rounded mb-8 max-w-3xl mx-auto"></div>
                                        <div className="h-6 bg-sky-100 rounded mb-8 max-w-2xl mx-auto"></div>
                                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                            <div className="h-12 bg-sky-200 rounded-lg w-48 mx-auto"></div>
                                            <div className="h-12 bg-sky-200 rounded-lg w-48 mx-auto"></div>
                                        </div>
                                    </div>
                                </>
                            ) : isAuthenticated ? (
                                <>
                                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                                        Welcome back, {user?.firstName || 'Teacher'}!<br/>
                                        <span className="text-sky-200">Ready to create amazing lessons?</span>
                                    </h1>
                                    <p className="text-xl text-sky-100 mb-8 max-w-3xl mx-auto">
                                        Continue your journey with AI-powered teaching tools. Access your saved prompts,
                                        create new ones, and discover fresh ideas for your classroom.
                                    </p>
                                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                        <Link href="/dashboard"
                                              className="btn-primary text-white px-8 py-4 rounded-lg text-lg font-semibold">
                                            Go to Dashboard
                                        </Link>
                                        <Link href="/profile"
                                              className="bg-white text-blue-800 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors">
                                            View Profile
                                        </Link>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                                        AI-Powered Teaching<br/>
                                        <span className="text-sky-200">Made Simple</span>
                                    </h1>
                                    <p className="text-xl text-sky-100 mb-8 max-w-3xl mx-auto">
                                        Streamline your lesson planning with our intelligent prompt management system.
                                        Create, share, and personalize AI prompts tailored to your teaching style and
                                        curriculum.
                                    </p>
                                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                        <Link href="/register"
                                              className="btn-primary text-white px-8 py-4 rounded-lg text-lg font-semibold">
                                            Start Free Trial
                                        </Link>
                                        <button
                                            className="bg-white text-blue-800 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors">
                                            Watch Demo
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="py-20 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-blue-800 mb-4">
                                Everything You Need to Enhance Teaching
                            </h2>
                            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                                Discover powerful features designed specifically for high school educators
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {/* Feature 1 */}
                            <div className="feature-card bg-white p-8 rounded-xl shadow-sm">
                                <div className="w-12 h-12 bg-sky-500 rounded-lg flex items-center justify-center mb-6">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor"
                                         viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-blue-800 mb-3">Prompt Repository</h3>
                                <p className="text-gray-600">Access thousands of categorized prompts organized by
                                    subject, grade level, and teaching objectives.</p>
                            </div>

                            {/* Feature 2 */}
                            <div className="feature-card bg-white p-8 rounded-xl shadow-sm">
                                <div className="w-12 h-12 bg-sky-500 rounded-lg flex items-center justify-center mb-6">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor"
                                         viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-blue-800 mb-3">Personalization Engine</h3>
                                <p className="text-gray-600">AI adapts prompts to match your unique teaching style,
                                    subject expertise, and classroom needs.</p>
                            </div>

                            {/* Feature 3 */}
                            <div className="feature-card bg-white p-8 rounded-xl shadow-sm">
                                <div className="w-12 h-12 bg-sky-500 rounded-lg flex items-center justify-center mb-6">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor"
                                         viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-blue-800 mb-3">Collaboration Hub</h3>
                                <p className="text-gray-600">Share, rate, and collaborate on prompts with fellow
                                    educators in your school and beyond.</p>
                            </div>

                            {/* Feature 4 */}
                            <div className="feature-card bg-white p-8 rounded-xl shadow-sm">
                                <div className="w-12 h-12 bg-sky-500 rounded-lg flex items-center justify-center mb-6">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor"
                                         viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-blue-800 mb-3">AI Suggestions</h3>
                                <p className="text-gray-600">Get intelligent recommendations based on your teaching
                                    patterns and curriculum requirements.</p>
                            </div>

                            {/* Feature 5 */}
                            <div className="feature-card bg-white p-8 rounded-xl shadow-sm">
                                <div className="w-12 h-12 bg-sky-500 rounded-lg flex items-center justify-center mb-6">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor"
                                         viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-blue-800 mb-3">Role-Based Access</h3>
                                <p className="text-gray-600">Secure permissions system for teachers, administrators, and
                                    system managers.</p>
                            </div>

                            {/* Feature 6 */}
                            <div className="feature-card bg-white p-8 rounded-xl shadow-sm">
                                <div className="w-12 h-12 bg-sky-500 rounded-lg flex items-center justify-center mb-6">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor"
                                         viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                              d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-blue-800 mb-3">Cross-Platform</h3>
                                <p className="text-gray-600">Access your prompts anywhere with our responsive web
                                    platform and mobile app.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Pricing Section */}
                <section id="pricing" className="py-20 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-blue-800 mb-4">
                                Choose Your Plan
                            </h2>
                            <p className="text-xl text-gray-600">
                                Flexible pricing options for individual teachers and schools
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                            {/* Free Tier */}
                            <div className="bg-gray-50 p-8 rounded-xl">
                                <h3 className="text-2xl font-bold text-blue-800 mb-4">Free Trial</h3>
                                <div className="text-4xl font-bold text-blue-800 mb-6">$0<span
                                    className="text-lg text-gray-500">/month</span></div>
                                <ul className="space-y-3 mb-8">
                                    <li className="flex items-center text-gray-600">
                                        <svg className="w-5 h-5 text-sky-500 mr-3" fill="currentColor"
                                             viewBox="0 0 20 20">
                                            <path fillRule="evenodd"
                                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                  clipRule="evenodd"></path>
                                        </svg>
                                        Limited prompt library
                                    </li>
                                    <li className="flex items-center text-gray-600">
                                        <svg className="w-5 h-5 text-sky-500 mr-3" fill="currentColor"
                                             viewBox="0 0 20 20">
                                            <path fillRule="evenodd"
                                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                  clipRule="evenodd"></path>
                                        </svg>
                                        1 teacher per school
                                    </li>
                                    <li className="flex items-center text-gray-600">
                                        <svg className="w-5 h-5 text-sky-500 mr-3" fill="currentColor"
                                             viewBox="0 0 20 20">
                                            <path fillRule="evenodd"
                                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                  clipRule="evenodd"></path>
                                        </svg>
                                        Basic features
                                    </li>
                                </ul>
                                <Link href="/register"
                                      className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors block text-center">
                                    Start Free Trial
                                </Link>
                            </div>

                            {/* Standard */}
                            <div className="bg-white border-2 border-sky-500 p-8 rounded-xl relative">
                                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                    <span
                                        className="bg-sky-500 text-white px-4 py-1 rounded-full text-sm font-semibold">Most Popular</span>
                                </div>
                                <h3 className="text-2xl font-bold text-blue-800 mb-4">Standard</h3>
                                <div className="text-4xl font-bold text-blue-800 mb-6">$29<span
                                    className="text-lg text-gray-500">/teacher/month</span></div>
                                <ul className="space-y-3 mb-8">
                                    <li className="flex items-center text-gray-600">
                                        <svg className="w-5 h-5 text-sky-500 mr-3" fill="currentColor"
                                             viewBox="0 0 20 20">
                                            <path fillRule="evenodd"
                                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                  clipRule="evenodd"></path>
                                        </svg>
                                        Full repository access
                                    </li>
                                    <li className="flex items-center text-gray-600">
                                        <svg className="w-5 h-5 text-sky-500 mr-3" fill="currentColor"
                                             viewBox="0 0 20 20">
                                            <path fillRule="evenodd"
                                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                  clipRule="evenodd"></path>
                                        </svg>
                                        AI personalization
                                    </li>
                                    <li className="flex items-center text-gray-600">
                                        <svg className="w-5 h-5 text-sky-500 mr-3" fill="currentColor"
                                             viewBox="0 0 20 20">
                                            <path fillRule="evenodd"
                                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                  clipRule="evenodd"></path>
                                        </svg>
                                        Collaboration features
                                    </li>
                                    <li className="flex items-center text-gray-600">
                                        <svg className="w-5 h-5 text-sky-500 mr-3" fill="currentColor"
                                             viewBox="0 0 20 20">
                                            <path fillRule="evenodd"
                                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                  clipRule="evenodd"></path>
                                        </svg>
                                        Priority support
                                    </li>
                                </ul>
                                <button className="w-full btn-primary text-white py-3 rounded-lg font-semibold">
                                    Get Started
                                </button>
                            </div>

                            {/* School-Wide */}
                            <div className="bg-gray-50 p-8 rounded-xl">
                                <h3 className="text-2xl font-bold text-blue-800 mb-4">School-Wide</h3>
                                <div className="text-4xl font-bold text-blue-800 mb-6">$499<span
                                    className="text-lg text-gray-500">/school/year</span></div>
                                <ul className="space-y-3 mb-8">
                                    <li className="flex items-center text-gray-600">
                                        <svg className="w-5 h-5 text-sky-500 mr-3" fill="currentColor"
                                             viewBox="0 0 20 20">
                                            <path fillRule="evenodd"
                                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                  clipRule="evenodd"></path>
                                        </svg>
                                        Unlimited teachers
                                    </li>
                                    <li className="flex items-center text-gray-600">
                                        <svg className="w-5 h-5 text-sky-500 mr-3" fill="currentColor"
                                             viewBox="0 0 20 20">
                                            <path fillRule="evenodd"
                                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                  clipRule="evenodd"></path>
                                        </svg>
                                        Admin dashboard
                                    </li>
                                    <li className="flex items-center text-gray-600">
                                        <svg className="w-5 h-5 text-sky-500 mr-3" fill="currentColor"
                                             viewBox="0 0 20 20">
                                            <path fillRule="evenodd"
                                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                  clipRule="evenodd"></path>
                                        </svg>
                                        Analytics & reporting
                                    </li>
                                    <li className="flex items-center text-gray-600">
                                        <svg className="w-5 h-5 text-sky-500 mr-3" fill="currentColor"
                                             viewBox="0 0 20 20">
                                            <path fillRule="evenodd"
                                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                  clipRule="evenodd"></path>
                                        </svg>
                                        Premium add-ons
                                    </li>
                                </ul>
                                <button
                                    className="w-full bg-blue-800 text-white py-3 rounded-lg font-semibold hover:bg-blue-900 transition-colors">
                                    Contact Sales
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="gradient-bg py-20">
                    <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                            Ready to Transform Your Teaching?
                        </h2>
                        <p className="text-xl text-sky-100 mb-8">
                            Join thousands of educators already using EduPrompt to create more engaging and effective
                            lessons.
                        </p>
                        <Link href="/register"
                              className="btn-primary text-white px-8 py-4 rounded-lg text-lg font-semibold mr-4">
                            Start Your Free Trial
                        </Link>
                        <button
                            className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-800 transition-colors">
                            Schedule Demo
                        </button>
                    </div>
                </section>
            </main>

            <Footer/>
        </div>
    );
}