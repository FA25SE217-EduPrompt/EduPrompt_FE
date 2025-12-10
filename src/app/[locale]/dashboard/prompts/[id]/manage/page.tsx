"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Spinner from "@/components/ui/Spinner";
import { Toaster, toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { promptsService } from "@/services/resources/prompts";
import { useGetPrompt, useRequestOptimization, useGetOptimizationStatus } from "@/hooks/queries/prompt";
import { PromptDetailView } from "@/components/prompt-manage/PromptDetailView";


import { VersionHistory } from "@/components/prompt-manage/VersionHistory";
import { MetadataEditor } from "@/components/prompt-manage/MetadataEditor";
import { OptimizationPanel } from "@/components/prompt-manage/OptimizationPanel";
import { ShareModal } from "@/components/prompt-manage/ShareModal";
import { PromptAiModel, UpdatePromptMetadataRequest } from "@/types/prompt.api";
import { ShareIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import { Link } from "@/i18n/navigation";

import { parseOptimizationOutput, OptimizedPromptFields } from "@/utils/prompt-optimization";
import { useTranslations } from "next-intl";

export default function PromptManagePage() {
    const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
    const router = useRouter();
    const params = useParams();
    const promptId = params.id as string;
    const queryClient = useQueryClient();
    const tManage = useTranslations('Dashboard.Manage');
    const tCommon = useTranslations('Dashboard.Common');

    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [shareToken, setShareToken] = useState<string | undefined>(undefined);
    const [optimizationInstruction, setOptimizationInstruction] = useState('');
    const [optimizedSuggestions, setOptimizedSuggestions] = useState<OptimizedPromptFields | null>(null);

    const [pollingOptimizeId, setPollingOptimizeId] = useState<string | null>(null);
    const [optimizationError, setOptimizationError] = useState<string | null>(null);

    // --- Queries ---
    const { data: promptData, isLoading: isPromptLoading, error: promptError } = useGetPrompt(promptId);
    const prompt = promptData?.data;

    const { data: versionsData, isLoading: isVersionsLoading } = useQuery({
        queryKey: ['promptVersions', promptId],
        queryFn: () => promptsService.getPromptVersions(promptId),
        enabled: !!promptId,
    });
    const versions = versionsData?.data || [];

    // --- Mutations ---
    const updateMetadataMutation = useMutation({
        mutationFn: (data: UpdatePromptMetadataRequest) => promptsService.updatePromptMetadata(promptId, data),
        onSuccess: () => {
            toast.success(tManage('metadataUpdated'));
            queryClient.invalidateQueries({ queryKey: ['prompts', 'detail', promptId] });
        },
        onError: () => toast.error(tManage('metadataUpdateFailed')),
    });

    const optimizeMutation = useRequestOptimization();

    const { data: pollingOptimizeResult } = useGetOptimizationStatus(
        pollingOptimizeId!,
        undefined,
        {
            enabled: !!pollingOptimizeId,
            refetchInterval: (query) => {
                const data = query.state.data;
                if (!data || !data.data) return 3000;
                const status = data.data.status;
                if (status === 'COMPLETED' || status === 'FAILED') {
                    return false;
                }
                return 3000;
            },
            refetchOnWindowFocus: false,
        }
    );

    const shareMutation = useMutation({
        mutationFn: () => promptsService.sharePrompt(promptId), onSuccess: (response) => {
            setShareToken(response.data || undefined);
            toast.success(tManage('shareLinkGenerated'));
        },
        onError: () => toast.error(tManage('shareLinkFailed')),
    });

    const revokeShareMutation = useMutation({
        mutationFn: () => promptsService.revokeSharePrompt(promptId),
        onSuccess: () => {
            setShareToken(undefined);
            toast.success(tManage('shareLinkRevoked'));
        },
        onError: () => toast.error(tManage('shareLinkRevokeFailed')),
    });

    const rollbackMutation = useMutation({
        mutationFn: (versionId: string) => promptsService.rollbackPromptVersion(promptId, versionId),
        onSuccess: () => {
            toast.success(tManage('rolledBack'));
            queryClient.invalidateQueries({ queryKey: ['prompts', 'detail', promptId] });
            queryClient.invalidateQueries({ queryKey: ['promptVersions', promptId] });
        },
        onError: () => toast.error(tManage('rollBackFailed')),
    });

    // --- Effects ---
    useEffect(() => {
        if (!isAuthLoading && !isAuthenticated) {
            router.replace("/login");
        }
    }, [isAuthenticated, isAuthLoading, router]);

    useEffect(() => {
        if (!pollingOptimizeResult || !pollingOptimizeResult.data) return;

        const queueEntry = pollingOptimizeResult.data;
        const { status, errorMessage, output } = queueEntry;

        if (status === 'COMPLETED' && output) {
            const parsedSuggestions = parseOptimizationOutput(output);
            setOptimizedSuggestions(parsedSuggestions);
            // In Manage Page, we probably want to update the Prompt form or show suggestions.
            // For now, let's just show a success message and maybe log it.
            // The logic to apply suggestions is more complex in Manage page (MetadataEditor etc.)
            // Assuming for now the user just wants to see it finished.
            // TODO: How to handle the output in Manage Page?
            // The Create Page uses `setOptimizedSuggestions`.
            // The Manage Page has `PromptDetailView` and `MetadataEditor`.
            // Maybe we just toast success and perhaps show a modal or apply it?

            // For this specific bug fix, the goal is to keep the loading state correct.
            setPollingOptimizeId(null);
            toast.success(tManage('optimizationComplete') || "Optimization complete");
        } else if (status === 'COMPLETED') {
            setPollingOptimizeId(null);
            toast.success(tManage('optimizationComplete') || "Optimization complete");
        } else if (status === 'FAILED') {
            setOptimizationError(errorMessage || "Optimization failed.");
            setPollingOptimizeId(null);
            toast.error(errorMessage || "Optimization failed.");
        }
    }, [pollingOptimizeResult, tManage]);

    // Check for existing share token (this would typically come from the prompt details if the backend returned it,
    // but for now we might need a separate call or just rely on generating a new one if needed.
    // Assuming prompt details might contain it in the future, but currently they don't seem to.)

    // --- Handlers ---
    const handleUpdateMetadata = (data: UpdatePromptMetadataRequest) => {
        updateMetadataMutation.mutate(data);
    };

    const handleApplySuggestion = (field: keyof OptimizedPromptFields, value: string) => {
        if (!prompt) return;

        // Construct the full update payload
        const updatePayload: UpdatePromptMetadataRequest = {
            title: field === 'title' ? value : prompt.title,
            description: field === 'description' ? value : prompt.description,
            instruction: field === 'instruction' ? value : prompt.instruction,
            context: field === 'context' ? value : prompt.context,
            inputExample: field === 'inputExample' ? value : prompt.inputExample,
            outputFormat: field === 'outputFormat' ? value : prompt.outputFormat,
            constraints: field === 'constraints' ? value : prompt.constraints,
        };

        updateMetadataMutation.mutate(updatePayload, {
            onSuccess: () => {
                toast.success(tManage('appliedSuggestion') || `Applied ${field} suggestion`);
                setOptimizedSuggestions(prev => {
                    if (!prev) return null;
                    const next = { ...prev };
                    delete next[field];
                    return Object.keys(next).length > 0 ? next : null;
                });
            }
        });
    };

    const handleOptimize = (model: PromptAiModel, input: string) => {
        optimizeMutation.mutate({
            request: {
                promptId,
                aiModel: model,
                optimizationInput: input,
            }
        }, {
            onSuccess: (response) => {
                if (response.data) {
                    setPollingOptimizeId(response.data.id);
                }
                toast.success(tManage('optimizationStarted'));
            },
            onError: () => toast.error(tManage('optimizationFailed')),
        });
    };

    const isOptimizing = optimizeMutation.isPending || !!pollingOptimizeId;

    const handleRollback = (versionId: string) => {
        if (confirm(tManage('confirmRollback'))) {
            rollbackMutation.mutate(versionId);
        }
    };

    if (isAuthLoading || isPromptLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spinner size="page" />
            </div>
        );
    }

    if (!isAuthenticated || !prompt) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-gray-500">
                <p>{tManage('promptNotFound')}</p>
                <Link href="/dashboard/prompts" className="mt-4 text-blue-600 hover:underline">
                    {tCommon('backToPrompts')}
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-800 pb-20">
            <div className="max-w-7xl mx-auto p-6">
                <Toaster position="top-right" />

                {/* Custom Header / Breadcrumbs */}
                <div className="mb-6">
                    <nav className="flex items-center space-x-1 text-sm text-gray-500 mb-4">
                        <Link href="/dashboard/prompts" className="hover:text-gray-900 transition-colors">
                            {tCommon('myPrompts')}
                        </Link>
                        <span className="text-gray-400">/</span>
                        <span className="text-gray-900 font-medium truncate max-w-xs">
                            {prompt.title}
                        </span>
                    </nav>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <Link href="/dashboard/prompts" className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                                <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">{prompt.title}</h1>
                                <p className="text-sm text-gray-500">
                                    {tCommon('createdOn')} {new Date(prompt.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setIsShareModalOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                            >
                                <ShareIcon className="w-5 h-5" />
                                {tCommon('share')}
                            </button>
                            <Link
                                href={`/prompt/${promptId}`}
                                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                            >
                                {tCommon('viewPublicPage')}
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content (Left Column) */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Prompt Details */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-semibold text-gray-900">{tManage('promptContent')}</h2>
                            </div>
                            <PromptDetailView prompt={prompt} />
                        </div>

                        {/* Optimization Panel */}
                        <OptimizationPanel
                            onOptimize={handleOptimize}
                            isOptimizing={isOptimizing}
                            instruction={optimizationInstruction}
                            onInstructionChange={setOptimizationInstruction}
                        />
                    </div>

                    {/* Sidebar (Right Column) */}
                    <div className="space-y-8">
                        {/* Metadata Editor */}
                        <MetadataEditor
                            prompt={prompt}
                            onUpdate={handleUpdateMetadata}
                            isUpdating={updateMetadataMutation.isPending}
                        />

                        {/* Version History */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <VersionHistory
                                versions={versions}
                                currentVersionId={prompt.id} // Assuming the fetched prompt is the current version
                                onRollback={handleRollback}
                                isRollingBack={rollbackMutation.isPending}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <ShareModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                shareToken={shareToken}
                promptId={promptId}
                onShare={() => shareMutation.mutate()}
                onRevoke={() => revokeShareMutation.mutate()}
                isLoading={shareMutation.isPending || revokeShareMutation.isPending}
            />
        </div>
    );
}
