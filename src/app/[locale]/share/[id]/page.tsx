"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { promptsService } from '@/services/resources/prompts';
import { PromptShareResponse } from '@/types/prompt.api';
import Spinner from '@/components/ui/Spinner';
import { Link } from '@/i18n/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function SharedPromptPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const promptId = params.id as string;
    const token = searchParams.get('token');

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [promptData, setPromptData] = useState<PromptShareResponse | null>(null);

    useEffect(() => {
        if (!promptId || !token) {
            setError('Invalid link. Missing prompt ID or token.');
            setLoading(false);
            return;
        }

        const fetchSharedPrompt = async () => {
            try {
                setLoading(true);
                const response = await promptsService.getSharedPrompt(promptId, token);
                if (response.data) {
                    setPromptData(response.data);
                } else {
                    setError('Prompt not found or link expired.');
                }
            } catch (err) {
                console.error("Failed to fetch shared prompt:", err);
                setError('Failed to load prompt. The link may be invalid or expired.');
            } finally {
                setLoading(false);
            }
        };

        fetchSharedPrompt();
    }, [promptId, token]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Spinner size="page" />
            </div>
        );
    }

    if (error || !promptData) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
                <div className="text-center max-w-md">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Ops! Something went wrong</h1>
                    <p className="text-gray-600 mb-6">{error || 'Prompt not found.'}</p>
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Go Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
            {/* Simple Header */}
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Link href="/" className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            EduPrompt
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">

                    {/* Hero / Header Section of the Prompt */}
                    <div className="p-8 border-b border-gray-100 bg-gradient-to-br from-white to-gray-50">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">{promptData.title}</h1>
                                {promptData.description && (
                                    <p className="text-lg text-gray-600 leading-relaxed">
                                        {promptData.description}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-8 space-y-8">

                        {/* Prompt Content */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Prompt Instruction</h3>
                            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 text-gray-800 whitespace-pre-wrap font-mono text-sm leading-relaxed">
                                {promptData.instruction}
                            </div>
                        </div>

                        {/* Context / Input / Output - Only show if they exist */}
                        {promptData.context && (
                            <div className="space-y-3">
                                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Context</h3>
                                <div className="text-gray-700 leading-relaxed">
                                    {promptData.context}
                                </div>
                            </div>
                        )}

                        {promptData.inputExample && (
                            <div className="space-y-3">
                                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Input Example</h3>
                                <div className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-100 font-mono text-sm">
                                    {promptData.inputExample}
                                </div>
                            </div>
                        )}

                        {promptData.outputFormat && (
                            <div className="space-y-3">
                                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Output Format</h3>
                                <div className="text-gray-700 leading-relaxed">
                                    {promptData.outputFormat}
                                </div>
                            </div>
                        )}

                        {promptData.constraints && (
                            <div className="space-y-3">
                                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Constraints</h3>
                                <div className="text-gray-700 leading-relaxed">
                                    {promptData.constraints}
                                </div>
                            </div>
                        )}

                    </div>

                    {/* Footer Call to Action */}
                    <div className="bg-gray-50 p-8 border-t border-gray-100 text-center">
                        <p className="text-gray-600 mb-4">Want to use this prompt or create your own? Or browse more?</p>
                        <div className="flex justify-center gap-4">
                            <Link
                                href="/signup"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                            >
                                Get Started
                            </Link>
                            <Link
                                href="/"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all shadow-sm hover:shadow-md"
                            >
                                Browse Prompts
                            </Link>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
