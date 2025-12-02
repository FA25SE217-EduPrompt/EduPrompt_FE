"use client";

import React from "react";
import PricingCard from "@/components/landing/PricingCard";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

const SubscriptionPage: React.FC = () => {
    return (
        <main className="flex-1 overflow-y-auto p-6 space-y-8">
            {/* Current Plan Section */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Current Subscription</h2>
                        <p className="text-gray-500 text-sm">Manage your billing and plan details</p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                        Active
                    </span>
                </div>

                <div className="flex flex-col md:flex-row gap-8">
                    <div className="flex-1">
                        <div className="text-3xl font-bold text-gray-900 mb-2">Free Trial</div>
                        <p className="text-gray-600 mb-4">Your trial ends in <span className="font-semibold text-blue-600">14 days</span></p>

                        <div className="space-y-3">
                            <div className="flex items-center text-sm text-gray-600">
                                <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                                <span>Access to basic prompt library</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                                <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                                <span>50 AI optimizations / month</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                                <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                                <span>Create up to 3 collections</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 border-t md:border-t-0 md:border-l border-gray-200 pt-6 md:pt-0 md:pl-8">
                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Usage This Month</h3>

                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-600">AI Tokens</span>
                                    <span className="font-medium text-gray-900">1,250 / 5,000</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '25%' }}></div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-600">Storage</span>
                                    <span className="font-medium text-gray-900">45%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Upgrade Options */}
            <section>
                <h2 className="text-xl font-bold text-gray-900 mb-6">Upgrade Your Plan</h2>
                <div className="grid md:grid-cols-3 gap-6">
                    <PricingCard
                        title="Standard"
                        price="$29"
                        pricePer="/teacher/month"
                        features={['Full repository access', 'AI personalization', 'Collaboration features', 'Priority support']}
                        buttonProps={{
                            variant: 'primary',
                            children: 'Upgrade Now',
                            onClick: () => console.log('Upgrade to Standard')
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
                            children: 'Contact Sales',
                            onClick: () => console.log('Contact Sales')
                        }}
                    />
                </div>
            </section>
        </main>
    );
};

export default SubscriptionPage;
