import React from "react";
import { useTranslations } from "next-intl";
import { Search, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface DashboardSearchProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    searchType: 'keyword' | 'semantic';
    setSearchType: (type: 'keyword' | 'semantic') => void;
    onSearch: () => void;
}

export const DashboardSearch: React.FC<DashboardSearchProps> = ({
    searchQuery,
    setSearchQuery,
    searchType,
    setSearchType,
    onSearch,
}) => {
    const t = useTranslations('Dashboard.Manage');

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            onSearch();
        }
    };

    return (
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={t('searchPlaceholder')}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none transition-all"
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="flex bg-gray-100 rounded-lg p-1 relative z-0">
                        <button
                            onClick={() => setSearchType('keyword')}
                            className={cn(
                                "px-3 py-1.5 text-sm font-medium rounded-md transition-colors relative z-10",
                                searchType === 'keyword' ? "text-brand-primary" : "text-gray-500 hover:text-gray-700"
                            )}
                        >
                            {t('keyword')}
                            {searchType === 'keyword' && (
                                <motion.div
                                    layoutId="searchTypePill"
                                    className="absolute inset-0 bg-white rounded-md shadow-sm -z-10"
                                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                />
                            )}
                        </button>
                        <button
                            onClick={() => setSearchType('semantic')}
                            className={cn(
                                "px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-1 relative z-10",
                                searchType === 'semantic' ? "text-brand-secondary" : "text-gray-500 hover:text-gray-700"
                            )}
                        >
                            <Sparkles className="w-3 h-3" />
                            {t('semantic')}
                            {searchType === 'semantic' && (
                                <motion.div
                                    layoutId="searchTypePill"
                                    className="absolute inset-0 bg-white rounded-md shadow-sm -z-10"
                                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                />
                            )}
                        </button>
                    </div>
                    <button
                        onClick={onSearch}
                        className="px-6 py-2.5 bg-brand-primary text-white font-medium rounded-lg hover:bg-brand-primary/90 transition-colors shadow-sm whitespace-nowrap"
                    >
                        {t('search')}
                    </button>
                </div>
            </div>
        </section>
    );
};
