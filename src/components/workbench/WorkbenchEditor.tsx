"use client";

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
    ChevronDown,
    ChevronRight,
    Settings2,
    Upload,
    Coins,
    BookOpen,
    GraduationCap,
    Eye,
    Edit3
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useWorkbench, PromptData } from './WorkbenchContext';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';

// --- Components ---

const AccordionItem = ({
    title,
    isOpen,
    onToggle,
    children,
    heightClass = "h-32",
    id
}: {
    title: string;
    isOpen: boolean;
    onToggle: () => void;
    children: React.ReactNode;
    heightClass?: string;
    id?: string;
}) => {
    return (
        <div id={id} className="border-b border-gray-100 last:border-0">
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors group"
            >
                <span className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2 group-hover:text-primary transition-colors">
                    {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    {title}
                </span>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className={cn("p-4 pt-0", heightClass)}>
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};



export const WorkbenchEditor: React.FC = () => {
    const t = useTranslations('Workbench');
    const { promptData, updatePromptField, quota, activeSection } = useWorkbench();

    // Mode State: 'edit' or 'preview'
    const [mode, setMode] = useState<'edit' | 'preview'>('edit');

    // Accordion State
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({
        instruction: true,
        context: true,
        inputData: false,
        outputFormat: false,
        constraints: false
    });

    // Valid sections list to check against
    const validSections = ['instruction', 'context', 'inputData', 'outputFormat', 'constraints'];

    React.useEffect(() => {
        if (activeSection && validSections.includes(activeSection)) {
            // Force edit mode if external trigger
            setMode('edit');
            setOpenSections(prev => ({
                ...prev,
                [activeSection]: true
            }));

            // Scroll to element maybe? 
            const element = document.getElementById(`section-${activeSection}`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }, [activeSection]);

    const toggleSection = (section: string) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const handleBadgeUpdate = (index: number, value: string) => {
        const newBadges = [...promptData.badges];
        if (newBadges.length <= index) {
            // Fill up to index
            for (let i = newBadges.length; i <= index; i++) newBadges.push("");
        }
        newBadges[index] = value;
        updatePromptField('badges', newBadges);
    };

    // Ensure we have defaults
    const grade = promptData.badges[0] || 'Grade 10';
    const subject = promptData.badges[1] || 'General';

    // Combine for Preview
    const combinedPrompt = `
${promptData.instruction}

**Context:**
${promptData.context}

**Input Data:**
${promptData.inputData}

**Output Format:**
${promptData.outputFormat}

**Constraints:**
${promptData.constraints}
    `.trim();

    return (
        <div className="h-full flex flex-col bg-white border-r border-gray-200 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)] z-10 relative">

            {/* --- Header Bar --- */}
            <div className="px-6 py-5 border-b border-gray-100 flex flex-col gap-4 bg-white">

                {/* Top Row: Title & Metadata */}
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                        <input
                            type="text"
                            placeholder="Untitled Prompt"
                            className="w-full text-xl font-bold text-slate-900 placeholder-gray-300 border border-transparent hover:border-gray-200 focus:border-primary/20 focus:bg-gray-50 rounded-lg px-2 -ml-2 transition-all"
                            value={promptData.title}
                            onChange={(e) => updatePromptField('title', e.target.value)}
                        />
                        <div className="flex gap-2 items-center mt-1">
                            {/* Static Badges - Visual Only */}
                            <motion.div
                                whileHover={{ scale: 1.05, y: -1 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-[11px] font-bold uppercase tracking-wider border border-indigo-100 shadow-sm select-none cursor-help"
                                title="Grade Level"
                            >
                                <GraduationCap size={12} className="stroke-[2.5]" />
                                <span>{grade}</span>
                            </motion.div>
                            <motion.div
                                whileHover={{ scale: 1.05, y: -1 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center gap-1.5 px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-[11px] font-bold uppercase tracking-wider border border-teal-100 shadow-sm select-none cursor-help"
                                title="Subject"
                            >
                                <BookOpen size={12} className="stroke-[2.5]" />
                                <span>{subject}</span>
                            </motion.div>
                        </div>
                    </div>
                </div>

                {/* View Toggles */}
                <div className="flex bg-gray-100 p-1 rounded-lg self-start relative z-0">
                    {['edit', 'preview'].map((m) => (
                        <button
                            key={m}
                            onClick={() => setMode(m as 'edit' | 'preview')}
                            className={cn(
                                "flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-bold transition-all relative z-10",
                                mode === m ? "text-slate-900" : "text-gray-500 hover:text-gray-700"
                            )}
                        >
                            {m === 'edit' ? <Edit3 size={14} /> : <Eye size={14} />}
                            {m === 'edit' ? 'Editor' : 'Combined Preview'}
                            {mode === m && (
                                <motion.div
                                    layoutId="viewModePill"
                                    className="absolute inset-0 bg-white rounded-md shadow-sm -z-10"
                                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* --- Content Area --- */}
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 hover:scrollbar-thumb-gray-300">
                {mode === 'preview' ? (
                    <div className="p-8">
                        <div className="prose prose-slate prose-sm max-w-none bg-gray-50 p-8 rounded-2xl border border-gray-100 shadow-sm">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {combinedPrompt}
                            </ReactMarkdown>
                            {combinedPrompt.length < 20 && (
                                <div className="text-center text-gray-400 italic py-10">
                                    Start typing in the editor to see your prompt here...
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <>
                        {/* 1. Instruction */}
                        <AccordionItem
                            id="section-instruction"
                            title="1. Instruction"
                            isOpen={openSections.instruction}
                            onToggle={() => toggleSection('instruction')}
                            heightClass="h-64" // Tall
                        >
                            <textarea
                                className="w-full h-full p-4 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none font-mono bg-gray-50/50 leading-relaxed"
                                placeholder="Describe explicitly what the AI should do..."
                                value={promptData.instruction}
                                onChange={(e) => updatePromptField('instruction', e.target.value)}
                            />
                        </AccordionItem>

                        {/* 2. Context */}
                        <AccordionItem
                            id="section-context"
                            title="2. Context"
                            isOpen={openSections.context}
                            onToggle={() => toggleSection('context')}
                            heightClass="h-48" // Medium
                        >
                            <div className="relative h-full group">
                                <textarea
                                    className="w-full h-full p-4 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none bg-gray-50/50"
                                    placeholder="Paste background info or drag files here..."
                                    value={promptData.context}
                                    onChange={(e) => updatePromptField('context', e.target.value)}
                                />

                                {/* Drop Zone Visual Cue */}
                                <div className="absolute bottom-3 right-3 pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity">
                                    <span className="text-[10px] bg-white px-2 py-1 rounded-md border border-gray-200 text-gray-400 flex items-center gap-1">
                                        <Upload size={10} /> Drop files or type
                                    </span>
                                </div>
                            </div>
                        </AccordionItem>

                        {/* 3. Input Data */}
                        <AccordionItem
                            id="section-inputData"
                            title="3. Input Data"
                            isOpen={openSections.inputData}
                            onToggle={() => toggleSection('inputData')}
                            heightClass="h-40"
                        >
                            <textarea
                                className="w-full h-full p-4 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none bg-gray-50/50"
                                placeholder="Specific data the AI needs to process..."
                                value={promptData.inputData}
                                onChange={(e) => updatePromptField('inputData', e.target.value)}
                            />
                        </AccordionItem>

                        {/* 4. Output Format */}
                        <AccordionItem
                            id="section-outputFormat"
                            title="4. Output Format"
                            isOpen={openSections.outputFormat}
                            onToggle={() => toggleSection('outputFormat')}
                            heightClass="h-32"
                        >
                            <textarea
                                className="w-full h-full p-4 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none bg-gray-50/50"
                                placeholder="e.g. Markdown table, JSON, Bullet points..."
                                value={promptData.outputFormat}
                                onChange={(e) => updatePromptField('outputFormat', e.target.value)}
                            />
                        </AccordionItem>

                        {/* 5. Constraints */}
                        <AccordionItem
                            id="section-constraints"
                            title="5. Constraints"
                            isOpen={openSections.constraints}
                            onToggle={() => toggleSection('constraints')}
                            heightClass="h-32"
                        >
                            <textarea
                                className="w-full h-full p-4 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none bg-gray-50/50"
                                placeholder="e.g. Under 200 words, Professional tone, No jargon..."
                                value={promptData.constraints}
                                onChange={(e) => updatePromptField('constraints', e.target.value)}
                            />
                        </AccordionItem>
                    </>
                )}
            </div>
        </div>
    );
};
