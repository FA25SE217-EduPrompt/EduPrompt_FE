"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { PromptScoreResult } from '@/types/prompt.api';
import { useAuth } from '@/contexts/AuthContext';

// Define the shape of our Prompt Data
export interface PromptData {
    id?: string;
    ownerId?: string;
    title: string;
    badges: string[]; // e.g., ["Grade 10", "Math"]
    instruction: string;
    context: string;
    inputData: string;
    outputFormat: string;
    constraints: string;
}

// Define the Context Value
interface WorkbenchContextType {
    // State
    promptData: PromptData;
    quota: number;
    scoringResult: PromptScoreResult | null;


    // Versioning State
    viewingVersionId: string | null;
    isHistoryMode: boolean;

    // Computed
    isOwner: boolean;

    // UI State
    activeSection: string | null;
    highlightSection: (section: string) => void;

    // Actions
    updatePromptField: (field: keyof PromptData, value: string | string[]) => void;
    setPromptData: (data: PromptData) => void;
    setScoringResult: (result: PromptScoreResult | null) => void;
    setViewingVersionId: (versionId: string | null) => void;
    deductQuota: (amount: number) => void;
}

// Default values
const defaultPromptData: PromptData = {
    title: '',
    badges: [],
    instruction: '',
    context: '',
    inputData: '',
    outputFormat: '',
    constraints: '',
};

const WorkbenchContext = createContext<WorkbenchContextType | undefined>(undefined);

export const WorkbenchProvider: React.FC<{ children: ReactNode; initialData?: Partial<PromptData> }> = ({ children, initialData }) => {
    const { user } = useAuth();

    // Initialize state with default values merged with initialData
    const [promptData, setPromptDataState] = useState<PromptData>({
        ...defaultPromptData,
        ...initialData
    });

    // Compute ownership
    const isOwner = Boolean(user?.id && promptData.ownerId && user.id === promptData.ownerId);

    // Mock User Quota (will be real later)
    const [quota, setQuota] = useState(10000);
    const [scoringResult, setScoringResult] = useState<PromptScoreResult | null>(null);
    const [viewingVersionId, setViewingVersionId] = useState<string | null>(null);

    const isHistoryMode = !!viewingVersionId;

    // UI State for interaction between panels
    const [activeSection, setActiveSection] = useState<string | null>(null);

    const updatePromptField = (field: keyof PromptData, value: string | string[]) => {
        setPromptDataState(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const setPromptData = (data: PromptData) => {
        setPromptDataState(data);
    };

    const deductQuota = (amount: number) => {
        setQuota(prev => Math.max(0, prev - amount));
    };

    const highlightSection = (section: string) => {
        setActiveSection(section);
        // Optional: clear highlight after some time or keep it?
        // For now, simple setter.
    };

    return (
        <WorkbenchContext.Provider value={{
            promptData,
            quota,
            scoringResult,
            isOwner,
            activeSection,
            updatePromptField,
            setPromptData,
            setScoringResult,
            viewingVersionId,
            setViewingVersionId,
            isHistoryMode,
            deductQuota,
            highlightSection
        }}>
            {children}
        </WorkbenchContext.Provider>
    );
};

export const useWorkbench = () => {
    const context = useContext(WorkbenchContext);
    if (!context) {
        throw new Error('useWorkbench must be used within a WorkbenchProvider');
    }
    return context;
};
