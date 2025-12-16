"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Building, MapPin, Globe, Phone, Mail } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { SchoolService } from "@/services/resources/school";
import { School } from "@/types/school.api";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

// Extended School interface for potential extra fields
interface SchoolDetails extends School {
    address?: string;
    website?: string;
    phoneNumber?: string;
    email?: string;
    description?: string;
}

const SchoolInfoPage: React.FC = () => {
    const router = useRouter();
    const { user, isLoading } = useAuth();
    const t = useTranslations('SchoolAdmin.Info');
    const [loading, setLoading] = useState(true);
    const [school, setSchool] = useState<SchoolDetails | null>(null);

    useEffect(() => {
        if (!isLoading && user) {
            if (!user.isSchoolAdmin && !user.isSystemAdmin) {
                router.push('/dashboard');
                return;
            }
        }
    }, [user, isLoading, router]);

    useEffect(() => {
        const fetchSchoolInfo = async () => {
            if (!user?.id) return;
            try {
                setLoading(true);
                const response = await SchoolService.getSchoolByUserId(user.id);
                if (response.data) {
                    setSchool(response.data);
                }
            } catch (error) {
                console.error("Failed to fetch school info:", error);
                toast.error(t('fetchFailed') || "Failed to load school information");
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchSchoolInfo();
        }
    }, [user]);

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
            </div>
        );
    }

    if (!school) {
        return (
            <div className="p-6 text-center">
                <p className="text-gray-500">{t('notAvailable')}</p>
                <button
                    onClick={() => router.back()}
                    className="mt-4 text-brand-primary hover:underline"
                >
                    {t('goBack')}
                </button>
            </div>
        );
    }

    return (
        <main className="flex-1 overflow-y-auto p-6 space-y-8">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <ArrowLeft className="h-6 w-6 text-gray-600" />
                </button>
                <h1 className="text-2xl font-bold text-text-primary">{t('title')}</h1>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">{school.name}</h2>
                        </div>
                        <div className="h-12 w-12 bg-brand-primary/10 rounded-lg flex items-center justify-center">
                            <Building className="h-6 w-6 text-brand-primary" />
                        </div>
                    </div>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">{t('contactDetails')}</h3>

                        <div className="flex items-center gap-3 text-gray-700">
                            <MapPin className="h-5 w-5 text-gray-400" />
                            <span>{school.address || t('noAddress')}</span>
                        </div>

                        <div className="flex items-center gap-3 text-gray-700">
                            <Phone className="h-5 w-5 text-gray-400" />
                            <span>{school.phoneNumber || t('noPhone')}</span>
                        </div>

                        <div className="flex items-center gap-3 text-gray-700">
                            <Mail className="h-5 w-5 text-gray-400" />
                            <span>{school.email || t('noEmail')}</span>
                        </div>

                        <div className="flex items-center gap-3 text-gray-700">
                            <Globe className="h-5 w-5 text-gray-400" />
                            {school.website ? (
                                <a href={school.website} target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline">
                                    {school.website}
                                </a>
                            ) : (
                                <span>{t('noWebsite')}</span>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">{t('additionalInfo')}</h3>
                        <p className="text-gray-700 whitespace-pre-wrap">
                            {school.description || t('noDescription')}
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default SchoolInfoPage;
