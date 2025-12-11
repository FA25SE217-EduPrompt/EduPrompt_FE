

export type OptimizedPromptFields = {
    title?: string;
    description?: string;
    instruction?: string;
    context?: string;
    inputExample?: string;
    outputFormat?: string;
    constraints?: string;
    tags?: string;
};

export const fieldMap: Record<string, keyof OptimizedPromptFields> = {
    'Title': 'title',
    'Description': 'description',
    'Instruction': 'instruction',
    'Context': 'context',
    'Input Example': 'inputExample',
    'Output Format': 'outputFormat',
    'Constraints': 'constraints',
    'Tags': 'tags',
};

export function parseOptimizationOutput(rawOutput: string): OptimizedPromptFields {
    const suggestions: OptimizedPromptFields = {};
    const regex = /\*\*(.*?):\*\*\s*([\s\S]*?)(?=\n\n\*\*|$)/g;
    let match;
    while ((match = regex.exec(rawOutput)) !== null) {
        const apiLabel = match[1].trim();
        const content = match[2].trim();
        const stateKey = fieldMap[apiLabel];
        if (stateKey && content) {
            suggestions[stateKey] = content;
        }
    }
    return suggestions;
}
