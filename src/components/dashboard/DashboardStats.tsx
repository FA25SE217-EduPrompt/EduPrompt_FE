import React from "react";
import {
    BoltIcon,
    BookOpenIcon,
    CircleStackIcon,
    SparklesIcon,
    WalletIcon,
    LockOpenIcon,
} from "@heroicons/react/24/outline";
import { StatCard } from "./StatCard";
import { useTranslations } from "next-intl";
import { QuotaResponse } from "@/types/quota.api";
import { User } from "@/contexts/AuthContext";

interface DashboardStatsProps {
    myPromptsCount?: string;
    collectionCount?: string;
    quotaData?: QuotaResponse;
    user: User | null;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
    myPromptsCount = "0",
    collectionCount = "0",
    quotaData,
    user,
}) => {
    const t = useTranslations('Dashboard.Manage');

    return (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
                title={t('promptsCreated')}
                value={myPromptsCount}
                icon={<SparklesIcon />}
                gradientClass="from-brand-secondary to-brand-secondary/70"
            />

            <StatCard
                title={t('collectionsOwned')}
                value={collectionCount}
                icon={<BookOpenIcon />}
                gradientClass="from-brand-primary to-brand-primary/70"
            />

            <StatCard
                title={t('promptUnlocks')}
                value={quotaData?.promptUnlockRemaining !== undefined
                    ? quotaData.promptUnlockRemaining.toString()
                    : "Loading..."}
                icon={<LockOpenIcon />}
                gradientClass="from-brand-secondary to-brand-secondary/70"
                progress={quotaData?.promptUnlockRemaining !== undefined ? {
                    current: quotaData.promptUnlockRemaining,
                    max: quotaData.promptUnlockLimit
                } : undefined}
            />

            {!user?.hasSchoolSubscription && (
                <>
                    <StatCard
                        title={t('tokensRemaining')}
                        value={quotaData?.individualTokenRemaining !== undefined
                            ? quotaData.individualTokenRemaining.toLocaleString()
                            : "Loading..."}
                        icon={<CircleStackIcon />}
                        gradientClass="from-brand-primary to-brand-primary/70"
                        progress={quotaData?.individualTokenRemaining !== undefined ? {
                            current: quotaData.individualTokenRemaining,
                            max: quotaData.individualTokenLimit
                        } : undefined}
                    />
                    <StatCard
                        title={t('optimizationQuota')}
                        value={quotaData?.optimizationQuotaRemaining !== undefined
                            ? quotaData.optimizationQuotaRemaining.toString()
                            : "Loading..."}
                        icon={<BoltIcon />}
                        gradientClass="from-brand-secondary to-brand-secondary/70"
                        progress={quotaData?.optimizationQuotaRemaining !== undefined ? {
                            current: quotaData.optimizationQuotaRemaining,
                            max: quotaData.optimizationQuotaLimit
                        } : undefined}
                    />

                    <StatCard
                        title="Testing Quota"
                        value={quotaData?.testingQuotaRemaining !== undefined
                            ? quotaData.testingQuotaRemaining.toString()
                            : "Loading..."}
                        icon={<WalletIcon />}
                        gradientClass="from-brand-primary to-brand-primary/70"
                        progress={quotaData?.testingQuotaRemaining !== undefined ? {
                            current: quotaData.testingQuotaRemaining,
                            max: quotaData.testingQuotaLimit
                        } : undefined}
                    />
                </>
            )}
        </section>
    );
};
