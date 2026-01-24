"use client";

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { WorkbenchEditor } from '@/components/workbench/WorkbenchEditor';
import { AIAssistant } from '@/components/workbench/AIAssistant';
import { WorkbenchProvider } from '@/components/workbench/WorkbenchContext';
import { toast } from 'sonner';
import { DashboardNavbar } from '@/components/layout/DashboardNavbar';
import { useTranslations } from 'next-intl';

import { PROMPT_TEMPLATES } from '@/data/prompt_templates';

// Helper component to read search params
const WorkbenchContent = () => {
    const searchParams = useSearchParams();
    const loadPromptId = searchParams.get('loadPromptId');
    const templateKey = searchParams.get('template');
    const template = templateKey ? PROMPT_TEMPLATES[templateKey] : null;

    const [isLoading, setIsLoading] = React.useState(!!loadPromptId);
    const [fetchedData, setFetchedData] = React.useState<{
        id: string;
        ownerId?: string;
        title: string;
        description?: string;
        instruction: string;
        context?: string;
        inputData?: string;
        outputFormat?: string;
        constraints?: string;
    } | null>(null);

    React.useEffect(() => {
        if (!loadPromptId) return;

        const fetchPrompt = async () => {
            setIsLoading(true);
            try {
                const { promptsService } = await import('@/services/resources/prompts');

                // Fire and forget view logging - don't await/block
                promptsService.logPromptView(loadPromptId).catch(err => {
                    console.error("Failed to log prompt view", err);
                    // Handle Quota Exceeded (503)
                    if (err.response && err.response.status === 503) {
                        toast.error("Unlock Quota Exceeded", {
                            description: "You have reached your daily limit for viewing prompts."
                        });
                    }
                });

                const response = await promptsService.getPrompt(loadPromptId);
                if (response.data) {
                    setFetchedData({
                        id: response.data.id,
                        ownerId: response.data.ownerId,
                        title: response.data.title,
                        description: response.data.description,
                        instruction: response.data.instruction,
                        context: response.data.context,
                        inputData: response.data.inputExample,
                        outputFormat: response.data.outputFormat,
                        constraints: response.data.constraints,
                    });
                }
            } catch (error: any) {
                console.error("Failed to load prompt", error);
                if (error.response?.status === 403) {
                    toast.error("Access Denied", { description: "You do not have permission to view this prompt." });
                } else if (error.response?.status === 503) {
                    toast.error("Quota Exceeded", { description: "Cannot view prompt details." });
                } else {
                    toast.error("Failed to load prompt details");
                }
            } finally {
                setIsLoading(false);
            }
        };
        fetchPrompt();
    }, [loadPromptId]);

    if (isLoading) {
        return <div className="flex items-center justify-center h-full text-sm text-gray-500">Loading prompt details...</div>;
    }

    // Map initialData
    const contextInitialData = {
        id: fetchedData?.id || undefined,
        ownerId: fetchedData?.ownerId || undefined,
        title: fetchedData?.title || searchParams.get('title') || template?.title || '',
        badges: searchParams.get('badges')?.split(',') || [],
        instruction: fetchedData?.instruction || searchParams.get('instruction') || template?.instruction || '',
        context: fetchedData?.context || searchParams.get('context') || template?.context || '',
        inputData: fetchedData?.inputData || searchParams.get('inputExample') || template?.inputExample || '',
        outputFormat: fetchedData?.outputFormat || searchParams.get('outputFormat') || template?.outputFormat || '',
        constraints: fetchedData?.constraints || searchParams.get('constraints') || template?.constraints || '',
    };

    // Get initial tab from URL if present
    const initialTab = (searchParams.get('tab') as 'draft' | 'audit' | 'optimize') || 'draft';

    return (
        <WorkbenchProvider initialData={contextInitialData}>
            <div className="flex h-[calc(100vh-64px)] overflow-hidden">
                {/* Left Panel: Editor (60%) */}
                <div className="w-[60%] h-full overflow-hidden">
                    <WorkbenchEditor />
                </div>

                {/* Right Panel: AI Assistant (40%) */}
                <div className="w-[40%] h-full overflow-hidden">
                    <AIAssistant initialTab={initialTab} />
                </div>
            </div>
        </WorkbenchProvider>
    );
};

export default function WorkbenchPage() {
    const t = useTranslations('Workbench');
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

    return (
        <>
            <DashboardNavbar
                isSidebarOpen={isSidebarOpen}
                setIsSidebarOpen={setIsSidebarOpen}
                hideSidebarTrigger={true}
                hideCreateButton={true}
            />
            <div className="pt-16">
                <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
                    <WorkbenchContent />
                </Suspense>
            </div>
        </>
    );
}
