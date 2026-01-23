import { apiClient } from './auth';
import {
    ScorePromptRequest,
    PromptScoreResult,
    OptimizePromptRequest,
    OptimizationResponse,
    PromptTaskType,
    GeneratePromptFromFileResponse
} from '@/types/prompt.api';

// 1. Prompt Scoring
export async function scorePrompt(data: ScorePromptRequest): Promise<{ data: PromptScoreResult }> {
    const response = await apiClient.post('/api/v2/prompts/score', data, {
        timeout: 300000 // 5 minutes explicit timeout (user requested removal of 30s limit)
    });
    return response.data;
}

// 2. Prompt Optimization
export async function optimizePrompt(data: OptimizePromptRequest): Promise<{ data: OptimizationResponse }> {
    const response = await apiClient.post('/api/v2/prompts/optimize', data, {
        timeout: 300000 // 5 minutes explicit timeout
    });
    return response.data;
}

// 3. Prompt Generation (from File)
export async function generatePromptFromFile(
    file: File,
    promptTask: PromptTaskType,
    customInstruction?: string
): Promise<{ data: GeneratePromptFromFileResponse }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('promptTask', promptTask);
    if (customInstruction) {
        formData.append('customInstruction', customInstruction);
    }

    const response = await apiClient.post('/api/prompts/generate-from-file', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        timeout: 300000 // 5 minutes explicit timeout
    });
    return response.data;
}
