
import { useTranslations } from 'next-intl';

export enum TierId {
    FREE = '749b7164-4960-411f-af63-5beea4020197',
    PRO = '2accc462-c160-4a7e-9748-d43876737996',
    PREMIUM = 'd6415c57-5ef5-454d-802a-8d8e7c377b37',
    SCHOOL = 'school_tier_id_placeholder' // No ID provided, effectively contact sales
}

import { useAuth } from '@/hooks/useAuth';
import { ButtonProps } from "@/components/ui/Button";

export type TierPlan = {
    id: string;
    name: string;
    price: number;
    priceVND: number;
    priceString: string;
    period: string;
    features: string[];
    limits?: {
        tokens: string;
        unlocks: string;
        executions: string;
        collections: string;
    };
    buttonText: string;
    buttonVariant: ButtonProps['variant'];
    href?: string;
    action?: () => void;
    recommended: boolean;
    isCurrent: boolean;
};

export const useTierPlans = () => {
    const t = useTranslations('LandingPage.Pricing');
    const { user } = useAuth();

    const allPlans: TierPlan[] = [
        {
            id: TierId.FREE,
            name: t('Tiers.Free.name'),
            price: 0,
            priceVND: 0,
            priceString: t('Tiers.Free.price'),
            period: t('perMonth'),
            features: [
                t('Tiers.Free.features.0'),
                t('Tiers.Free.features.1'),
                t('Tiers.Free.features.2')
            ],
            buttonText: t('buttons.startFreeTrial'),
            buttonVariant: 'neutral' as const,
            href: '/register',
            recommended: false,
            isCurrent: !!user?.isFreeTier
        },
        {
            id: TierId.PRO,
            name: t('Tiers.Pro.name'),
            price: 2.49,
            priceVND: 59000,
            priceString: t('Tiers.Pro.price'),
            period: t('perTeacherMonth'),
            features: [
                t('Tiers.Pro.features.0'),
                t('Tiers.Pro.features.1'),
                t('Tiers.Pro.features.2')
            ],
            limits: {
                tokens: "1,000,000",
                unlocks: "100",
                executions: "2,000",
                collections: "200"
            },
            buttonText: user?.isProTier ? t('buttons.currentPlan') : t('buttons.getStarted'),
            buttonVariant: user?.isProTier ? 'outline' as const : 'primary' as const,
            href: user?.isProTier ? '#' : `/payment/checkout?tierId=${TierId.PRO}`,
            recommended: true,
            isCurrent: !!user?.isProTier
        },
        {
            id: TierId.PREMIUM,
            name: t('Tiers.Premium.name'),
            price: 9.99,
            priceVND: 239000,
            priceString: t('Tiers.Premium.price'),
            period: t('perMonth'),
            features: [
                t('Tiers.Premium.features.0'),
                t('Tiers.Premium.features.1'),
                t('Tiers.Premium.features.2')
            ],
            limits: {
                tokens: "10,000,000",
                unlocks: "1,000",
                executions: "50,000",
                collections: "5,000"
            },
            buttonText: user?.isPremiumTier ? t('buttons.currentPlan') : t('buttons.upgradeNow'),
            buttonVariant: user?.isPremiumTier ? 'outline' as const : 'solid-dark' as const,
            href: user?.isPremiumTier ? '#' : `/payment/checkout?tierId=${TierId.PREMIUM}`,
            recommended: false,
            isCurrent: !!user?.isPremiumTier
        },
        {
            id: TierId.SCHOOL,
            name: t('School.title'),
            price: -1,
            priceVND: -1,
            priceString: t('negotiated'),
            period: t('perSchoolYear'),
            features: [
                t('School.subtitle'),
                t('features.schoolNoQuota'),
                t('features.schoolSharedPool')
            ],
            buttonText: user?.hasSchoolSubscription ? t('buttons.currentPlan') : t('buttons.contactSales'),
            buttonVariant: user?.hasSchoolSubscription ? 'outline' as const : 'outline' as const,
            href: '/contact-sales',
            recommended: false,
            isCurrent: !!user?.hasSchoolSubscription
        }
    ];

    // Filter logic based on user subscription
    if (user?.hasSchoolSubscription) {
        // If user has school subscription, only show School tier
        return allPlans.filter(plan => plan.id === TierId.SCHOOL);
    }

    // For other users, show all relevant plans (Free usually filtered out in UI, but keep here for completeness)
    // We might want to filter out Free if user is already Pro/Premium to avoid clutter?
    // But usually you just show the upgrade path.
    // Logic: 
    // If Pro: Show Pro (Current), Premium (Upgrade), School.
    // If Premium: Show Pro (Downgrade?), Premium (Current), School.
    // If Free: Show Free (Current), Pro, Premium, School.

    return allPlans;
};
