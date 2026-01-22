import Navbar from "@/components/layout/Navbar";
import Hero from '@/components/landing/Hero';
import FeaturesBento from '@/components/landing/FeaturesBento';
import SocialTicker from '@/components/landing/SocialTicker';
import PricingSection from '@/components/landing/PricingSection';
import LandingFooter from '@/components/landing/LandingFooter';

export default function Home() {
    return (
        <div className="bg-surface min-h-screen flex flex-col font-sans text-text-main relative overflow-x-hidden">
            <Navbar />

            <main className="flex-1 w-full flex flex-col z-10">
                <Hero />
                <SocialTicker />
                <FeaturesBento />
                <PricingSection />
            </main>

            <LandingFooter />
        </div>
    );
}