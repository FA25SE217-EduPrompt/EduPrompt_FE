"use client";

import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { useGetQuota } from "@/hooks/queries/quota";
import { Loader2 } from "lucide-react";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import PricingCard from "@/components/landing/PricingCard";

import { useTranslations } from "next-intl";
import { useTierPlans, TierId } from "@/lib/tiers";
import { ButtonProps } from "@/components/ui/Button";

const SubscriptionPage: React.FC = () => {
    const { user } = useAuth();
    const { data: quotaData, isLoading } = useGetQuota();
    const t = useTranslations('Dashboard.Subscription');
    const plans = useTierPlans();

    const planName = React.useMemo(() => {
        if (user?.hasSchoolSubscription) return t('plans.school');
        if (user?.isPremiumTier) return t('plans.premium');
        if (user?.isProTier) return t('plans.pro');
        if (user?.isFreeTier) return t('plans.free');
        return t('plans.unknown');
    }, [user, t]);


    if (isLoading) {
        return <div className="flex justify-center p-12"><Loader2 className="animate-spin h-8 w-8 text-brand-primary" /></div>;
    }

    // Helper to render detail row
    const DetailRow = ({ label, value }: { label: string, value: string }) => (
        <div className="flex justify-between py-2 border-b border-gray-100 last:border-0">
            <span className="text-sm text-gray-500">{label}</span>
            <span className="text-sm font-medium text-gray-900">{value}</span>
        </div>
    );

    return (
        <main className="flex-1 overflow-y-auto p-6 space-y-8">
            {/* Current Plan Section */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">{t('currentSubscription')}</h2>
                        <p className="text-gray-500 text-sm">{t('manageBilling')}</p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                        {t('active')}
                    </span>
                </div>

                <div className="flex flex-col md:flex-row gap-8">
                    <div className="flex-1">
                        <div className="text-3xl font-bold text-gray-900 mb-2">{planName}</div>

                        <div className="space-y-3 mt-6">
                            <div className="flex items-center text-sm text-gray-600">
                                <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                                <span>{user?.hasSchoolSubscription || user?.isPremiumTier ? t('features.accessToPremium') : t('features.accessToBasic')}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                                <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                                <span>{t('features.tokensLimit', { count: quotaData?.data?.individualTokenLimit?.toLocaleString() || '0' })}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                                <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                                <span>{t('features.optimizationsPerMonth', { count: quotaData?.data?.optimizationQuotaLimit || 0 })}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                                <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                                <span>{t('features.collectionsLimit', { count: quotaData?.data?.collectionActionLimit || 0 })}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 border-t md:border-t-0 md:border-l border-gray-200 pt-6 md:pt-0 md:pl-8">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">{t('usageAndLimits')}</h3>
                        </div>

                        <div className="space-y-6">
                            {!user?.hasSchoolSubscription && (
                                <>
                                    {/* Tokens */}
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="font-medium text-gray-700">{t('tokens')}</span>
                                            <span className="font-medium text-gray-900">
                                                {quotaData?.data ?
                                                    <span><span className="text-green-600 font-bold">{quotaData.data.individualTokenRemaining.toLocaleString()}</span> / {quotaData.data.individualTokenLimit.toLocaleString()}</span>
                                                    : "Loading..."}
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2 mb-1 relative">
                                            <div
                                                className="bg-green-500 h-2 rounded-full transition-all duration-500 relative z-10"
                                                style={{ width: quotaData?.data ? `${(quotaData.data.individualTokenRemaining / quotaData.data.individualTokenLimit) * 100}%` : '0%' }}
                                            ></div>
                                        </div>
                                        <p className="text-xs text-gray-500">{t('tokensDesc')}</p>
                                    </div>

                                    {/* Optimizations */}
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="font-medium text-gray-700">{t('aiOptimizations')}</span>
                                            <span className="font-medium text-gray-900">
                                                {quotaData?.data ?
                                                    <span><span className="text-green-600 font-bold">{quotaData.data.optimizationQuotaRemaining}</span> / {quotaData.data.optimizationQuotaLimit}</span>
                                                    : "Loading..."}
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2 mb-1 relative">
                                            <div
                                                className="bg-green-500 h-2 rounded-full transition-all duration-500 relative z-10"
                                                style={{ width: quotaData?.data ? `${(quotaData.data.optimizationQuotaRemaining / quotaData.data.optimizationQuotaLimit) * 100}%` : '0%' }}
                                            ></div>
                                        </div>
                                        <p className="text-xs text-gray-500">{t('aiOptimizationsDesc')}</p>
                                    </div>

                                    {/* Testing Quota */}
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="font-medium text-gray-700">{t('testingRun')}</span>
                                            <span className="font-medium text-gray-900">
                                                {quotaData?.data ?
                                                    <span><span className="text-green-600 font-bold">{quotaData.data.testingQuotaRemaining}</span> / {quotaData.data.testingQuotaLimit}</span>
                                                    : "Loading..."}
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2 mb-1 relative">
                                            <div
                                                className="bg-green-500 h-2 rounded-full transition-all duration-500 relative z-10"
                                                style={{ width: quotaData?.data ? `${(quotaData.data.testingQuotaRemaining / quotaData.data.testingQuotaLimit) * 100}%` : '0%' }}
                                            ></div>
                                        </div>
                                        <p className="text-xs text-gray-500">{t('testingRunDesc')}</p>
                                    </div>

                                    {/* Collection Limit */}
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="font-medium text-gray-700">{t('collections')}</span>
                                            <span className="font-medium text-gray-900">
                                                {quotaData?.data ?
                                                    <span><span className="text-green-600 font-bold">{quotaData.data.collectionActionRemaining}</span> / {quotaData.data.collectionActionLimit}</span>
                                                    : "Loading..."}
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2 mb-1 relative">
                                            <div
                                                className="bg-green-500 h-2 rounded-full transition-all duration-500 relative z-10"
                                                style={{ width: quotaData?.data ? `${(quotaData.data.collectionActionRemaining / quotaData.data.collectionActionLimit) * 100}%` : '0%' }}
                                            ></div>
                                        </div>
                                        <p className="text-xs text-gray-500">{t('collectionsDesc')}</p>
                                    </div>

                                    {/* Token/Prompt View Limit */}
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="font-medium text-gray-700">{t('promptViews')}</span>
                                            <span className="font-medium text-gray-900">
                                                {quotaData?.data ?
                                                    <span><span className="text-green-600 font-bold">{quotaData.data.promptActionRemaining}</span> / {quotaData.data.promptActionLimit}</span>
                                                    : "Loading..."}
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2 mb-1 relative">
                                            <div
                                                className="bg-green-500 h-2 rounded-full transition-all duration-500 relative z-10"
                                                style={{ width: quotaData?.data ? `${(quotaData.data.promptActionRemaining / quotaData.data.promptActionLimit) * 100}%` : '0%' }}
                                            ></div>
                                        </div>
                                        <p className="text-xs text-gray-500">{t('promptViewsDesc')}</p>
                                    </div>
                                </>
                            )}
                            {user?.hasSchoolSubscription && (
                                <div className="space-y-4">
                                    <div className="p-4 bg-indigo-50 text-indigo-700 rounded-lg text-sm border border-indigo-100 flex items-start gap-3">
                                        <CheckCircleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-semibold mb-1">{t('unlimitedAccess')}</p>
                                            <p>{t('schoolSubscriptionGrant')}</p>
                                            <ul className="list-disc list-inside mt-2 space-y-1 opacity-90">
                                                <li>{t('aiOptimizations')}</li>
                                                <li>{t('testingRun')}</li>
                                                <li>{t('collections')}</li>
                                                <li>{t('premiumPromptLibrary')}</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Upgrade Options */}
            <section>
                <h2 className="text-xl font-bold text-gray-900 mb-6">{t('upgrade.title')}</h2>
                <div className="grid md:grid-cols-3 gap-6">
                    {/* Filter out Free plan and current plan ideally, but simple list for now. */}
                    {/* Actually, Subscription page usually shows upgrades. */}
                    {/* Logic: if user is Pro, show Premium. If Free, show Pro and Premium. */}
                    {/* For simplicity, show Pro, Premium, School. */}

                    {plans.filter(p => p.id !== TierId.FREE).map((plan) => {
                        const buttonProps = plan.href !== '#'
                            ? { variant: plan.buttonVariant, children: plan.buttonText, href: plan.href }
                            : { variant: plan.buttonVariant, children: plan.buttonText, onClick: plan.action };

                        return (
                            <PricingCard
                                key={plan.id}
                                title={plan.name}
                                price={plan.priceString}
                                pricePer={plan.period || "/month"}
                                popular={plan.recommended}
                                features={plan.features}
                                buttonProps={buttonProps as ButtonProps}
                                isCurrent={plan.isCurrent}
                                details={
                                    plan.limits && (
                                        <div className="mt-2 space-y-1">
                                            <DetailRow label={t('upgrade.limits.tokens')} value={plan.limits.tokens} />
                                            <DetailRow label={t('upgrade.limits.promptUnlocks')} value={plan.limits.unlocks} />
                                            <DetailRow label={t('upgrade.limits.promptExecutions')} value={plan.limits.executions} />
                                            <DetailRow label={t('upgrade.limits.collections')} value={plan.limits.collections} />
                                        </div>
                                    )
                                }
                            />
                        );
                    })}
                </div>
            </section>
        </main>
    );
};

export default SubscriptionPage;
