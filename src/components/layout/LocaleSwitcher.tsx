"use client";

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { Globe, Check } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function LocaleSwitcher() {
    const t = useTranslations('LocaleSwitcher');
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const onSelectChange = (nextLocale: string) => {
        router.replace(pathname, { locale: nextLocale });
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-1 p-2 rounded-lg text-text-muted hover:text-primary hover:bg-primary/5 transition-colors"
                aria-label={t('label')}
            >
                <Globe size={20} />
                <span className="hidden lg:inline text-sm font-medium uppercase">{locale}</span>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-surface rounded-xl shadow-xl border border-border py-1 animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                    <div className="px-3 py-2 border-b border-border/50 bg-subtle/30">
                        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                            {t('label')}
                        </p>
                    </div>
                    <div className="p-1">
                        <button
                            onClick={() => onSelectChange('en')}
                            className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors flex items-center justify-between ${locale === 'en' ? 'bg-primary/10 text-primary font-medium' : 'text-text-main hover:bg-subtle'
                                }`}
                        >
                            <span>{t('en')}</span>
                            {locale === 'en' && <Check size={14} />}
                        </button>
                        <button
                            onClick={() => onSelectChange('vi')}
                            className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors flex items-center justify-between ${locale === 'vi' ? 'bg-primary/10 text-primary font-medium' : 'text-text-main hover:bg-subtle'
                                }`}
                        >
                            <span>{t('vi')}</span>
                            {locale === 'vi' && <Check size={14} />}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
