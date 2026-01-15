"use client";

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Upload, FileText, Send, Sparkles, Tag, Globe, Lock, Save, FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWorkbench } from '../WorkbenchContext';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export const DraftTab = () => {
    const t = useTranslations('Workbench');
    const { updatePromptField, deductQuota } = useWorkbench();

    // Switcher State: 'save' (was From Scratch) vs 'file' (From File)
    const [mode, setMode] = useState<'save' | 'file'>('save');

    // Generate/File State
    const [taskType, setTaskType] = useState('LESSON_PLAN');
    const [userNote, setUserNote] = useState('');

    // Save State
    const [tagName, setTagName] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [visibility, setVisibility] = useState<'private' | 'public'>('private');
    const [collection, setCollection] = useState('');

    const handleGenerate = () => {
        deductQuota(450);
        updatePromptField('instruction', `Draft generated for ${taskType}. Focus: ${userNote || 'General'}`);
        updatePromptField('context', `Context derived from uploaded file.`);
        toast.success("Generated (Cost: 450 Tokens)");
    };

    const handleAddTag = () => {
        if (tagName.trim() && !tags.includes(tagName.trim())) {
            setTags([...tags, tagName.trim()]);
            setTagName('');
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const handleSave = () => {
        toast.success("Prompt saved to library!");
        // API call would go here
    };

    return (
        <div className="flex flex-col h-full">
            {/* Action Mode Switcher */}
            <div className="flex p-1 bg-gray-100 rounded-lg mx-6 mt-6 mb-4 relative z-0">
                {['save', 'file'].map((m) => (
                    <button
                        key={m}
                        onClick={() => setMode(m as 'save' | 'file')}
                        className={cn(
                            "flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors relative z-10",
                            mode === m ? "text-slate-900" : "text-gray-500 hover:text-gray-700"
                        )}
                    >
                        {m === 'save' ? 'Save Prompt' : 'From File'}
                        {mode === m && (
                            <motion.div
                                layoutId="draftModePill"
                                className="absolute inset-0 bg-white rounded-md shadow-sm -z-10"
                                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            />
                        )}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-8">

                {mode === 'file' ? (
                    <>
                        {/* File Upload UI */}
                        <motion.div
                            whileHover={{ scale: 1.02, borderColor: '#3b82f6', backgroundColor: '#eff6ff' }}
                            whileTap={{ scale: 0.98 }}
                            className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-center transition-colors cursor-pointer group bg-white"
                        >
                            <motion.div
                                initial={{ scale: 1 }}
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center mb-3 text-primary"
                            >
                                <Upload size={20} />
                            </motion.div>
                            <h4 className="text-sm font-semibold text-gray-700">Upload Source Material</h4>
                            <p className="text-xs text-gray-400 mt-1">PDF, DOCX, TXT (Max 10MB)</p>
                        </motion.div>

                        {/* Task Selector */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Task Type</label>
                            <select
                                className="w-full p-2.5 rounded-lg border border-gray-200 text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
                                value={taskType}
                                onChange={(e) => setTaskType(e.target.value)}
                            >
                                <option value="LESSON_PLAN">Lesson Plan</option>
                                <option value="SLIDE_OUTLINE">Slide Deck Outline</option>
                                <option value="QUIZ">Quiz / Assessment</option>
                                <option value="RUBRIC">Grading Rubric</option>
                                <option value="EMAIL">Email / Communication</option>
                            </select>
                        </div>

                        {/* Custom Note */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Custom Note (Optional)</label>
                            <textarea
                                className="w-full p-3 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                                rows={3}
                                placeholder="e.g. Focus on Chapter 3, make it engaging for kids..."
                                value={userNote}
                                onChange={(e) => setUserNote(e.target.value)}
                            />
                        </div>

                        {/* Action Button */}
                        <button
                            onClick={handleGenerate}
                            className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2"
                        >
                            <Sparkles size={18} />
                            Generate Draft
                        </button>
                    </>
                ) : (
                    <>
                        {/* Save Mode UI */}

                        {/* Tags Input */}
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                                <Tag size={12} /> Tags
                            </label>
                            <div className="flex gap-3">
                                <select className="w-1/3 p-2.5 rounded-lg border border-gray-200 text-sm bg-white">
                                    <option>Subject</option>
                                    <option>Topic</option>
                                    <option>Level</option>
                                </select>
                                <div className="flex-1 flex gap-2">
                                    <input
                                        type="text"
                                        className="flex-1 p-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                        placeholder="Tag value"
                                        value={tagName}
                                        onChange={(e) => setTagName(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                                    />
                                    <button
                                        onClick={handleAddTag}
                                        className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-semibold hover:bg-blue-100 transition-colors"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>

                            {/* Tags Display */}
                            <div className="flex flex-wrap gap-2 mt-2">
                                {tags.map(tag => (
                                    <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs flex items-center gap-1">
                                        {tag}
                                        <button onClick={() => handleRemoveTag(tag)} className="hover:text-red-500">&times;</button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Visibility */}
                        <div className="space-y-4 pt-2">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Visibility & Collection</label>
                            <div className="flex gap-6 mb-3">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="visibility"
                                        checked={visibility === 'private'}
                                        onChange={() => setVisibility('private')}
                                        className="text-primary focus:ring-primary"
                                    />
                                    <span className="text-sm text-slate-700 flex items-center gap-1"><Lock size={14} /> Private</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="visibility"
                                        checked={visibility === 'public'}
                                        onChange={() => setVisibility('public')}
                                        className="text-primary focus:ring-primary"
                                    />
                                    <span className="text-sm text-slate-700 flex items-center gap-1"><Globe size={14} /> Public</span>
                                </label>
                            </div>

                            {/* Collection Dropdown */}
                            <div className="relative">
                                <FolderOpen className="absolute left-3 top-2.5 text-gray-400" size={16} />
                                <select
                                    className="w-full pl-10 p-2.5 rounded-lg border border-gray-200 text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none cursor-pointer"
                                    value={collection}
                                    onChange={(e) => setCollection(e.target.value)}
                                >
                                    <option value="" disabled>Select Collection</option>
                                    <option value="my-prompts">My Prompts</option>
                                    <option value="school-shared">School Shared</option>
                                    <option value="favorites">Favorites</option>
                                </select>
                                <div className="absolute right-3 top-3 pointer-events-none">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                        </div>

                        {/* Save Action */}
                        <div className="pt-4">
                            <button
                                onClick={handleSave}
                                className="w-full py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-500/20 hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2"
                            >
                                <Save size={18} />
                                Save Prompt
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
