"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export default function Footer() {
    const t = useTranslations('Footer');

    return (
        <footer className="bg-blue-800 text-white py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid md:grid-cols-4 gap-8">
                    <div>
                        <div className="flex items-center mb-4">
                            <Image
                                src="/logo.png"
                                alt="EduPrompt Logo"
                                width={40}
                                height={40}
                                className="w-10 h-10 rounded-lg mr-3"
                            />
                            <span className="text-xl font-bold">EduPrompt</span>
                        </div>
                        <p className="text-sky-200">{t('tagline')}</p>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">{t('product')}</h4>
                        <ul className="space-y-2 text-sky-200">
                            <li><a href="#features" className="hover:text-white transition-colors">{t('features')}</a></li>
                            <li><a href="#pricing" className="hover:text-white transition-colors">{t('pricing')}</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">{t('demo')}</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">{t('support')}</h4>
                        <ul className="space-y-2 text-sky-200">
                            <li><a href="#" className="hover:text-white transition-colors">{t('helpCenter')}</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">{t('contactUs')}</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">{t('training')}</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">{t('company')}</h4>
                        <ul className="space-y-2 text-sky-200">
                            <li><a href="#" className="hover:text-white transition-colors">{t('about')}</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">{t('blog')}</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">{t('careers')}</a></li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-sky-700 mt-8 pt-8 text-center text-sky-200">
                    <p>&copy; 2024 EduPrompt. {t('rightsReserved')}</p>
                </div>
            </div>
        </footer>
    );
}


