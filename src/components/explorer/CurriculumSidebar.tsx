"use client";

import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { CurriculumNode } from '@/data/curriculum';
import { useCurriculumTree } from '@/hooks/useCurriculum';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface CurriculumSidebarProps {
    onSelectLesson: (lesson: CurriculumNode) => void;
    selectedLessonId?: string;
}

export const CurriculumSidebar: React.FC<CurriculumSidebarProps> = ({ onSelectLesson, selectedLessonId }) => {
    const t = useTranslations('Explorer');
    const [activeGrade] = useState<string>('10');
    // Default subject name for API
    const [activeSubjectName, setActiveSubjectName] = useState<string>('Toán học');
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

    // Fetch data from API
    const { data: apiData, isLoading, isError } = useCurriculumTree(activeSubjectName, parseInt(activeGrade));

    // Define available subjects statically for now (since API requires subjectName to filter)
    const SUBJECT_OPTIONS = [
        { name: 'Toán học', label: 'Toán học' },
        { name: 'Ngữ văn', label: 'Ngữ văn' },
        { name: 'Vật lí', label: 'Vật lí' },
        { name: 'Hóa học', label: 'Hóa học' },
        { name: 'Sinh học', label: 'Sinh học' },
        { name: 'Lịch sử', label: 'Lịch sử' },
        { name: 'Địa lí', label: 'Địa lí' },
        { name: 'Tin học', label: 'Tin học' },
    ];

    // Transform API data to CurriculumNode structure
    const currentSubject: CurriculumNode | undefined = useMemo(() => {
        if (!apiData || !apiData.semesters) return undefined;

        return {
            id: `subject-${activeSubjectName}-${activeGrade}`,
            title: activeSubjectName,
            type: 'subject',
            children: apiData.semesters.map(semester => ({
                id: semester.id,
                title: semester.name,
                type: 'semester',
                children: semester.listOfChapter.map(chapter => ({
                    id: chapter.id,
                    title: chapter.name,
                    type: 'chapter',
                    children: chapter.listOfLesson.map(lesson => ({
                        id: lesson.id,
                        title: lesson.name,
                        type: 'lesson',
                        // Store the full lesson object if needed, or just enough for the UI
                    }))
                }))
            }))
        };
    }, [apiData, activeSubjectName, activeGrade]);

    // Auto-expand first semester/chapter on load
    React.useEffect(() => {
        if (currentSubject?.children?.[0]) {
            const firstSemester = currentSubject.children[0];
            const newExpanded = new Set<string>();
            newExpanded.add(firstSemester.id);

            if (firstSemester.children?.[0]) {
                newExpanded.add(firstSemester.children[0].id);
            }
            setExpandedNodes(newExpanded);
        }
    }, [currentSubject]);

    const toggleNode = (nodeId: string) => {
        const newExpanded = new Set(expandedNodes);
        if (newExpanded.has(nodeId)) {
            newExpanded.delete(nodeId);
        } else {
            newExpanded.add(nodeId);
        }
        setExpandedNodes(newExpanded);
    };

    // --- Skeletons ---
    const TreeSkeleton = () => (
        <div className="space-y-4 px-4 py-4 animate-pulse">
            {[1, 2].map((i) => (
                <div key={i} className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                    <div className="space-y-3 pl-4">
                        <div className="h-5 bg-gray-100 rounded w-3/4"></div>
                        <div className="space-y-2 pl-6 border-l-2 border-gray-100">
                            <div className="h-3 bg-gray-50 rounded w-5/6"></div>
                            <div className="h-3 bg-gray-50 rounded w-4/6"></div>
                            <div className="h-3 bg-gray-50 rounded w-full"></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    const renderTree = (nodes: CurriculumNode[]) => {
        const variants = {
            hidden: { opacity: 0, height: 0, overflow: 'hidden' },
            visible: { opacity: 1, height: 'auto', overflow: 'hidden' }
        };

        return (
            <div className="space-y-0.5">
                {nodes.map((node) => {
                    const isExpanded = expandedNodes.has(node.id);
                    const isSelected = node.id === selectedLessonId;
                    const hasChildren = node.children && node.children.length > 0;

                    // Swiss Typography Styles & States
                    let nodeStyles = "py-2 px-3 text-sm cursor-pointer transition-all duration-200 border-l-2 border-transparent select-none";
                    let labelStyles = "text-text-muted transition-colors duration-200";
                    let iconStyles = "text-gray-400 transition-transform duration-200";

                    if (node.type === 'semester') {
                        nodeStyles = "mt-6 mb-2 pt-2 border-t border-transparent uppercase tracking-wider text-[11px] font-bold text-gray-400 px-4 cursor-default select-none";
                        labelStyles = "text-inherit";
                    } else if (node.type === 'chapter') {
                        nodeStyles = cn(
                            "font-semibold text-slate-800 py-2.5 px-4 mx-2 rounded-md hover:bg-gray-100/80 cursor-pointer flex items-center gap-2",
                            isExpanded ? "bg-gray-50 text-slate-900" : ""
                        );
                        labelStyles = "text-inherit";
                        iconStyles = cn("text-gray-400", isExpanded && "rotate-90 text-slate-600");
                    } else if (node.type === 'lesson') {
                        nodeStyles = cn(
                            "py-2 pr-3 pl-8 mx-2 rounded-md cursor-pointer border-l-0 relative overflow-hidden",
                            isSelected
                                ? "bg-blue-50/80 text-blue-700 font-medium shadow-sm ring-1 ring-blue-100"
                                : "hover:bg-gray-50 text-slate-600 hover:text-slate-900"
                        );
                        labelStyles = "text-inherit z-10 relative";
                    }

                    if (node.type === 'semester') {
                        return (
                            <div key={node.id} className={nodeStyles}>
                                {node.title}
                                {hasChildren && (
                                    <div className="mt-1 font-normal text-base normal-case border-t-0 p-0">
                                        {renderTree(node.children!)}
                                    </div>
                                )}
                            </div>
                        )
                    }

                    return (
                        <div key={node.id}>
                            <div
                                className={cn("flex items-center group w-full outline-none", nodeStyles)}
                                onClick={() => {
                                    if (hasChildren) {
                                        toggleNode(node.id);
                                    } else if (node.type === 'lesson') {
                                        onSelectLesson(node);
                                    }
                                }}
                            >
                                {/* Icon / Chevron only for chapters */}
                                {hasChildren && node.type === 'chapter' && (
                                    <span className={iconStyles}>
                                        <ChevronRight size={14} />
                                    </span>
                                )}

                                <span className={cn("truncate flex-1 font-sans", labelStyles)}>{node.title}</span>

                                {/* Active Indicator for Lesson */}
                                {isSelected && node.type === 'lesson' && (
                                    <motion.div
                                        layoutId="activeLessonIndicator"
                                        className="absolute inset-0 bg-blue-50/50 -z-0"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                            </div>

                            {hasChildren && (
                                <motion.div
                                    initial={isExpanded ? "visible" : "hidden"}
                                    animate={isExpanded ? "visible" : "hidden"}
                                    variants={variants}
                                    transition={{ duration: 0.2, ease: "easeInOut" }}
                                >
                                    {renderTree(node.children!)}
                                </motion.div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="h-full flex flex-col bg-white border-r border-gray-200">
            {/* Sidebar Header */}
            <div className="p-4 border-b border-gray-200 bg-white/50 backdrop-blur-xl sticky top-0 z-10">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-bold text-slate-800 uppercase tracking-tight">
                        {t('title')}
                    </h2>
                </div>

                {/* Subject Selector (Visual Only for now) */}
                <div className="relative">
                    <select
                        className="w-full appearance-none bg-gray-50 border border-gray-200 text-slate-700 text-sm rounded-lg pl-3 pr-8 py-2 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all cursor-pointer font-medium hover:border-gray-300"
                        value={activeSubjectName}
                        onChange={(e) => setActiveSubjectName(e.target.value)}
                    >
                        {SUBJECT_OPTIONS.map(opt => (
                            <option key={opt.name} value={opt.name}>{opt.label}</option>
                        ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-500">
                        <ChevronDown size={14} />
                    </div>
                </div>
            </div>

            {/* Tree Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pb-10">
                {isLoading ? (
                    <TreeSkeleton />
                ) : isError ? (
                    <div className="p-8 text-center">
                        <div className="text-red-500 text-sm font-medium mb-1">{t('unableToLoadCurriculum')}</div>
                        <p className="text-xs text-gray-400">{t('checkConnection')}</p>
                    </div>
                ) : currentSubject ? (
                    <div className="px-2">
                        {renderTree(currentSubject.children || [])}
                    </div>
                ) : (
                    <div className="p-8 text-center text-sm text-gray-400">
                        {t('noCurriculumData')}
                    </div>
                )}
            </div>
        </div>
    );
};

