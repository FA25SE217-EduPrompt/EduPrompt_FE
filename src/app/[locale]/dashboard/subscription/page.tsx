"use client";

import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { useGetQuota } from "@/hooks/queries/quota";
import { Loader2 } from "lucide-react";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import PricingCard from "@/components/landing/PricingCard";

import { useTranslations } from "next-intl";

const SubscriptionPage: React.FC = () => {
    const { user } = useAuth();
    const { data: quotaData, isLoading } = useGetQuota();
    const t = useTranslations('Dashboard.Subscription');

    const planName = React.useMemo(() => {
        if (user?.hasSchoolSubscription) return t('plans.school');
        if (user?.isPremiumTier) return t('plans.premium');
        if (user?.isProTier) return t('plans.pro');
        if (user?.isFreeTier) return t('plans.free');
        return t('plans.unknown');
    }, [user, t]);

    const optimizationUsage = quotaData?.data ?
        ((quotaData.data.optimizationQuotaLimit - quotaData.data.optimizationQuotaRemaining) / quotaData.data.optimizationQuotaLimit) * 100
        : 0;

    const testingUsage = quotaData?.data ?
        ((quotaData.data.testingQuotaLimit - quotaData.data.testingQuotaRemaining) / quotaData.data.testingQuotaLimit) * 100
        : 0;

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
                    {/* Free Plan (Optional to show, mostly for reference if upgrade is from Free) 
                        For now we focus on Pro and Premium as "Upgrade" targets if user is Free.
                        But user requested "we need pro plan card", so showing both is good.
                    */}
                    <PricingCard
                        title={t('upgrade.proDesc')}
                        price="$4.99"
                        pricePer={t('pricing.perMonth') || "/month"}
                        popular={true}
                        features={[
                            t('upgrade.fullRepository'),
                            t('upgrade.aiPersonalization'),
                            t('upgrade.oneMillionTokens')
                        ]}
                        buttonProps={{
                            variant: 'primary',
                            children: t('upgrade.upgradeNow'),
                            onClick: () => console.log('Upgrade to Pro')
                        }}
                        details={
                            <div className="mt-2 space-y-1">
                                <DetailRow label={t('upgrade.limits.tokens')} value="1,000,000" />
                                <DetailRow label={t('upgrade.limits.promptUnlocks')} value="100" />
                                <DetailRow label={t('upgrade.limits.promptExecutions')} value="2,000" />
                                <DetailRow label={t('upgrade.limits.collections')} value="200" />
                            </div>
                        }
                    />
                    <PricingCard
                        title={t('upgrade.premiumDesc')}
                        price="$29.99"
                        pricePer={t('pricing.perMonth') || "/month"}
                        features={[
                            t('upgrade.unlimitedTeachers'), // Reusing keys where appropriate or add new ones if distinct
                            t('upgrade.adminDashboard'),
                            t('upgrade.tenMillionTokens'),
                            t('upgrade.prioritySupport')
                        ]}
                        buttonProps={{
                            variant: 'solid-dark',
                            children: t('upgrade.upgradeNow'),
                            onClick: () => console.log('Upgrade to Premium')
                        }}
                        details={
                            <div className="mt-2 space-y-1">
                                <DetailRow label={t('upgrade.limits.tokens')} value="10,000,000" />
                                <DetailRow label={t('upgrade.limits.promptUnlocks')} value="1,000" />
                                <DetailRow label={t('upgrade.limits.promptExecutions')} value="50,000" />
                                <DetailRow label={t('upgrade.limits.collections')} value="5,000" />
                            </div>
                        }
                    />
                    <PricingCard
                        title={t('upgrade.schoolWideDesc')}
                        price={t('pricing.negotiated')}
                        pricePer=""
                        features={[
                            t('upgrade.unlimitedTeachers'),
                            t('upgrade.adminDashboard'),
                            t('upgrade.analytics'),
                            t('upgrade.premiumAddons')
                        ]}
                        buttonProps={{
                            variant: 'outline',
                            children: t('upgrade.contactSales'),
                            onClick: () => console.log('Contact Sales')
                        }}
                        details={
                            <div className="mt-2 p-2 bg-gray-50 text-xs text-gray-600 rounded">
                                {t('upgrade.customSchoolLimits')}
                            </div>
                        }
                    />
                </div>
            </section>
        </main>
    );
};

export default SubscriptionPage;
