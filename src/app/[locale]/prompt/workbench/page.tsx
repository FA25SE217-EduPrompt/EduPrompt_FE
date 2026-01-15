"use client";

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { WorkbenchEditor } from '@/components/workbench/WorkbenchEditor';
import { AIAssistant } from '@/components/workbench/AIAssistant';
import { WorkbenchProvider } from '@/components/workbench/WorkbenchContext';

import { PROMPT_TEMPLATES } from '@/data/prompt_templates';

// Helper component to read search params
const WorkbenchContent = () => {
    const searchParams = useSearchParams();
    const templateKey = searchParams.get('template');
    const template = templateKey ? PROMPT_TEMPLATES[templateKey] : null;

    // Map initialData from search params to our internal structure
    const contextInitialData = {
        title: searchParams.get('title') || template?.title || '',
        badges: searchParams.get('badges')?.split(',') || [],
        instruction: searchParams.get('instruction') || template?.instruction || '',
        context: searchParams.get('context') || template?.context || '',
        inputData: searchParams.get('inputExample') || template?.inputExample || '', // Note: mapped to inputData
        outputFormat: searchParams.get('outputFormat') || template?.outputFormat || '',
        constraints: searchParams.get('constraints') || template?.constraints || '',
    };

    return (
        <WorkbenchProvider initialData={contextInitialData}>
            <div className="flex h-[calc(100vh-64px)] overflow-hidden">
                {/* Left Panel: Editor (60%) */}
                <div className="w-[60%] h-full overflow-hidden">
                    <WorkbenchEditor />
                </div>

                {/* Right Panel: AI Assistant (40%) */}
                <div className="w-[40%] h-full overflow-hidden">
                    <AIAssistant />
                </div>
            </div>
        </WorkbenchProvider>
    );
};

export default function WorkbenchPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
            <WorkbenchContent />
        </Suspense>
    );
}
