"use client";

import React from 'react';
import Link from 'next/link';

export default function LandingFooter() {
    return (
        <footer id="about" className="bg-canvas border-t border-border pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">

                    {/* Brand */}
                    <div className="col-span-2 md:col-span-1">
                        <Link href="/" className="text-xl font-bold text-ink tracking-tight mb-4 block">
                            EduPrompt.
                        </Link>
                        <p className="text-sm text-ink/60">
                            The operating system for modern education.
                        </p>
                    </div>

                    {/* Column 1 */}
                    <div className="flex flex-col gap-3">
                        <h4 className="font-semibold text-ink text-sm">Product</h4>
                        <Link href="/features" className="text-sm text-ink/60 hover:text-ink transition-colors">Features</Link>
                        <Link href="/pricing" className="text-sm text-ink/60 hover:text-ink transition-colors">Pricing</Link>
                        <Link href="/changelog" className="text-sm text-ink/60 hover:text-ink transition-colors">Changelog</Link>
                    </div>

                    {/* Column 2 */}
                    <div className="flex flex-col gap-3">
                        <h4 className="font-semibold text-ink text-sm">Company</h4>
                        <Link href="/about" className="text-sm text-ink/60 hover:text-ink transition-colors">About</Link>
                        <Link href="/careers" className="text-sm text-ink/60 hover:text-ink transition-colors">Careers</Link>
                        <Link href="/contact" className="text-sm text-ink/60 hover:text-ink transition-colors">Contact</Link>
                    </div>

                    {/* Column 3 */}
                    <div className="flex flex-col gap-3">
                        <h4 className="font-semibold text-ink text-sm">Legal</h4>
                        <Link href="/privacy" className="text-sm text-ink/60 hover:text-ink transition-colors">Privacy</Link>
                        <Link href="/terms" className="text-sm text-ink/60 hover:text-ink transition-colors">Terms</Link>
                    </div>
                </div>

                <div className="pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-ink/40">
                        &copy; {new Date().getFullYear()} EduPrompt Inc. All rights reserved.
                    </p>
                    <div className="flex items-center gap-4">
                        {/* Socials placeholder */}
                        <div className="w-4 h-4 rounded-full bg-border" />
                        <div className="w-4 h-4 rounded-full bg-border" />
                        <div className="w-4 h-4 rounded-full bg-border" />
                    </div>
                </div>
            </div>
        </footer>
    );
}
