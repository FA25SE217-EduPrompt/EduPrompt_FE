"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ShieldExclamationIcon, HomeIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import { Link } from "@/i18n/navigation";

export default function ForbiddenPage() {
    const router = useRouter();
    const t = useTranslations('Forbidden');

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center px-4 py-12">
            <div className="max-w-2xl w-full text-center">
                {/* Icon */}
                <div className="flex justify-center mb-8">
                    <div className="relative">
                        <div className="absolute inset-0 bg-red-500 opacity-20 blur-3xl rounded-full"></div>
                        <div className="relative bg-gradient-to-br from-red-500 to-orange-600 p-8 rounded-full shadow-2xl">
                            <ShieldExclamationIcon className="h-24 w-24 text-white" />
                        </div>
                    </div>
                </div>

                {/* Error Code */}
                <div className="mb-6">
                    <h1 className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600">
                        403
                    </h1>
                </div>

                {/* Title */}
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                    {t('title')}
                </h2>

                {/* Description */}
                <p className="text-xl text-gray-600 mb-8 max-w-lg mx-auto">
                    {t('description')}
                </p>

                {/* Additional Info */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8 max-w-md mx-auto">
                    <p className="text-sm text-gray-700 mb-2">
                        <span className="font-semibold">{t('reason')}:</span>
                    </p>
                    <ul className="text-sm text-gray-600 space-y-2 text-left">
                        <li className="flex items-start gap-2">
                            <span className="text-red-500 mt-1">•</span>
                            <span>{t('reasonNotAdmin')}</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-red-500 mt-1">•</span>
                            <span>{t('reasonNoPermission')}</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-red-500 mt-1">•</span>
                            <span>{t('reasonContactAdmin')}</span>
                        </li>
                    </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={() => router.back()}
                        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 focus:outline-none focus:ring-4 focus:ring-gray-300"
                    >
                        <ArrowLeftIcon className="h-5 w-5" />
                        {t('goBack')}
                    </button>
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300"
                    >
                        <HomeIcon className="h-5 w-5" />
                        {t('goHome')}
                    </Link>
                </div>

                {/* Help Text */}
                <p className="mt-8 text-sm text-gray-500">
                    {t('needHelp')}{" "}
                    <Link href="/contact" className="text-blue-600 hover:text-blue-800 font-medium underline">
                        {t('contactSupport')}
                    </Link>
                </p>
            </div>
        </div>
    );
}
