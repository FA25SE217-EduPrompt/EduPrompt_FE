import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { CheckCircle, Sliders, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DraftTab } from './tabs/DraftTab';
import { AuditTab } from './tabs/AuditTab';
import { OptimizeTab } from './tabs/OptimizeTab';
import { motion, AnimatePresence } from 'framer-motion';

interface AIAssistantProps {
    initialTab?: 'draft' | 'audit' | 'optimize';
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ initialTab = 'draft' }) => {
    const t = useTranslations('Workbench');
    const [activeTab, setActiveTab] = useState<'draft' | 'audit' | 'optimize'>(initialTab);

    const tabs = [
        { id: 'draft', label: t('tabs.draft.label'), icon: FileText },
        { id: 'audit', label: t('tabs.audit.label'), icon: CheckCircle },
        { id: 'optimize', label: t('tabs.optimize.label'), icon: Sliders },
    ];

    return (
        <div className="h-full flex flex-col bg-white border-l border-gray-200">
            {/* Tabs Header */}
            <div className="flex border-b border-gray-200 bg-white relative">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as 'draft' | 'audit' | 'optimize')}
                        className={cn(
                            "flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 relative z-10",
                            activeTab === tab.id ? "text-primary" : "text-gray-400 hover:text-gray-600"
                        )}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                        {activeTab === tab.id && (
                            <motion.div
                                layoutId="activeTabUnderline"
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-hidden relative">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10, transition: { duration: 0.1 } }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="h-full w-full"
                    >
                        {activeTab === 'draft' && <DraftTab />}
                        {activeTab === 'audit' && <AuditTab />}
                        {activeTab === 'optimize' && <OptimizeTab />}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

