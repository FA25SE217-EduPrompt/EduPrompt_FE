"use client";

import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { curriculumData, CurriculumNode } from '@/data/curriculum';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface CurriculumSidebarProps {
    onSelectLesson: (lesson: CurriculumNode) => void;
    selectedLessonId?: string;
}

export const CurriculumSidebar: React.FC<CurriculumSidebarProps> = ({ onSelectLesson, selectedLessonId }) => {
    const t = useTranslations('Explorer');
    const [activeGrade, setActiveGrade] = useState<string>('10');
    const [activeSubjectId, setActiveSubjectId] = useState<string>('');
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

    // Derive subjects for the current grade
    const subjects = useMemo(() => {
        return curriculumData[activeGrade] || [];
    }, [activeGrade]);

    // Set default subject if none selected
    React.useEffect(() => {
        if (subjects.length > 0 && !activeSubjectId) {
            setActiveSubjectId(subjects[0].id);
            setExpandedNodes(new Set([subjects[0].id]));
        }
    }, [subjects, activeSubjectId]);

    const currentSubject = subjects.find(s => s.id === activeSubjectId);

    const toggleNode = (nodeId: string) => {
        const newExpanded = new Set(expandedNodes);
        if (newExpanded.has(nodeId)) {
            newExpanded.delete(nodeId);
        } else {
            newExpanded.add(nodeId);
        }
        setExpandedNodes(newExpanded);
    };

    const renderTree = (nodes: CurriculumNode[]) => {
        return (
            <div className="space-y-0.5">
                {nodes.map((node) => {
                    const isExpanded = expandedNodes.has(node.id);
                    const isSelected = node.id === selectedLessonId;
                    const hasChildren = node.children && node.children.length > 0;

                    // Swiss Typography Styles
                    let nodeStyles = "py-2 px-3 text-sm cursor-pointer transition-colors border-l-2 border-transparent";
                    let labelStyles = "text-text-muted";

                    if (node.type === 'semester') {
                        nodeStyles = "mt-4 mb-1 pt-4 border-t border-gray-100 uppercase tracking-wider text-xs font-semibold px-4 text-gray-400 select-none cursor-default";
                        labelStyles = "text-inherit";
                    } else if (node.type === 'chapter') {
                        nodeStyles = "font-bold text-slate-900 py-2.5 px-4 hover:bg-gray-50 flex items-center justify-between group";
                        labelStyles = "text-slate-900";
                    } else if (node.type === 'lesson') {
                        nodeStyles = cn(
                            "ml-0 pl-8 py-2 pr-3 hover:bg-gray-50 transition-all border-l-[3px]",
                            isSelected ? "border-primary bg-primary/5 text-primary font-medium" : "border-transparent hover:border-gray-200"
                        );
                        labelStyles = isSelected ? "text-primary" : "text-text-muted group-hover:text-slate-700";
                    }

                    if (node.type === 'semester') {
                        return (
                            <div key={node.id} className={nodeStyles}>
                                {node.title}
                                {hasChildren && <div className="mt-1 font-normal text-base normal-case border-t-0 p-0">{renderTree(node.children!)}</div>}
                            </div>
                        )
                    }

                    return (
                        <div key={node.id}>
                            <div
                                className={cn("flex items-center group", nodeStyles)}
                                onClick={() => {
                                    if (hasChildren) {
                                        toggleNode(node.id);
                                    } else if (node.type === 'lesson') {
                                        onSelectLesson(node);
                                    }
                                }}
                            >
                                {/* Icon / Chevron only for chapters/subjects not lessons */}
                                {hasChildren && node.type !== 'semester' && (
                                    <span className="mr-2 text-gray-400 flex-shrink-0 group-hover:text-slate-600 transition-colors">
                                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                    </span>
                                )}

                                <span className={cn("truncate", labelStyles)}>{node.title}</span>
                            </div>

                            {hasChildren && isExpanded && (
                                <div className="">
                                    {renderTree(node.children!)}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full bg-white border-r border-gray-200">
            {/* Top Section: Subject & Grade */}
            <div className="p-4 border-b border-gray-200 bg-white z-10 space-y-4">

                {/* Subject Dropdown - Moved to Top */}
                <div className="relative">
                    <label className="text-[10px] uppercase font-bold text-gray-400 mb-1 block tracking-wider">
                        {t('tagTypes.subject')}
                    </label>
                    <div className="relative">
                        <select
                            value={activeSubjectId}
                            onChange={(e) => setActiveSubjectId(e.target.value)}
                            className="w-full pl-3 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none appearance-none cursor-pointer transition-colors hover:bg-white hover:border-gray-300"
                        >
                            {subjects.map(sub => (
                                <option key={sub.id} value={sub.id}>{sub.title}</option>
                            ))}
                            {subjects.length === 0 && <option disabled>No subjects</option>}
                        </select>
                        <ChevronDown className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" size={16} />
                    </div>
                </div>

                {/* Grade Tabs */}
                <div className="flex bg-gray-100 p-1 rounded-lg relative z-0">
                    {['10', '11', '12'].map((grade) => (
                        <button
                            key={grade}
                            onClick={() => { setActiveGrade(grade); setActiveSubjectId(''); }}
                            className={cn(
                                "flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors relative z-10",
                                activeGrade === grade
                                    ? "text-slate-900"
                                    : "text-text-muted hover:text-text-main"
                            )}
                        >
                            {t('grade')} {grade}
                            {activeGrade === grade && (
                                <motion.div
                                    layoutId="gradePill"
                                    className="absolute inset-0 bg-white rounded-md shadow-sm -z-10"
                                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Scrollable Tree Content */}
            <div className="flex-1 overflow-y-auto scrollbar-thin">
                {currentSubject ? renderTree(currentSubject.children || []) : (
                    <div className="text-center py-10 text-xs text-gray-400">Select a subject</div>
                )}
            </div>
        </div>
    );
};
