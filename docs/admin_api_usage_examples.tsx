// Example usage of Admin API endpoints
// This file demonstrates how to use the newly implemented admin endpoints

import { 
    useAdminCreatePromptStandalone,
    useAdminCreatePromptInCollection,
    useAdminUpdatePromptVisibility,
    useAdminUpdatePromptMetadata,
    useAdminCreateSchoolAdminAccount,
    useAdminCreateSchoolSubscription,
} from '@/hooks/queries/admin';

/**
 * Example Component: Create Standalone Prompt (Admin)
 * Endpoint: POST /api/v1/admin/prompt/standalone
 */
function ExampleCreateStandalonePrompt() {
    const createPromptMutation = useAdminCreatePromptStandalone();

    const handleCreatePrompt = async () => {
        const result = await createPromptMutation.mutateAsync({
            payload: {
                title: "Math Problem Solver",
                description: "A prompt to help solve math problems",
                instruction: "Solve the following math problem step by step",
                context: "You are a math tutor helping students",
                inputExample: "What is 2+2?",
                outputFormat: "Provide step-by-step solution",
                constraints: "Use simple language suitable for students",
                visibility: "public",
                tagIds: ["tag-id-1", "tag-id-2"],
            },
        });

        if (result.error) {
            console.error('Error:', result.error.messages);
        } else {
            console.log('Prompt created:', result.data);
        }
    };

    return (
        <button onClick={handleCreatePrompt}>
            Create Standalone Prompt
        </button>
    );
}

/**
 * Example Component: Create Prompt in Collection (Admin)
 * Endpoint: POST /api/v1/admin/prompt/in-collection
 */
function ExampleCreatePromptInCollection() {
    const createPromptMutation = useAdminCreatePromptInCollection();

    const handleCreatePrompt = async () => {
        const result = await createPromptMutation.mutateAsync({
            payload: {
                title: "Science Experiment Guide",
                description: "Guide for conducting science experiments",
                instruction: "Provide detailed steps for the experiment",
                context: "Safety-first approach for school lab",
                visibility: "school",
                collectionId: "collection-123",
                tagIds: ["science", "experiments"],
            },
        });

        if (result.error) {
            console.error('Error:', result.error.messages);
        } else {
            console.log('Prompt created in collection:', result.data);
        }
    };

    return (
        <button onClick={handleCreatePrompt}>
            Create Prompt in Collection
        </button>
    );
}

/**
 * Example Component: Update Prompt Visibility (Admin)
 * Endpoint: PUT /api/v1/admin/prompt/{promptId}/visibility
 */
function ExampleUpdatePromptVisibility() {
    const updateVisibilityMutation = useAdminUpdatePromptVisibility();

    const handleUpdateVisibility = async (promptId: string) => {
        const result = await updateVisibilityMutation.mutateAsync({
            promptId,
            payload: {
                visibility: "school",
                collectionId: "collection-456", // Optional, for group/school visibility
            },
        });

        if (result.error) {
            console.error('Error:', result.error.messages);
        } else {
            console.log('Visibility updated:', result.data);
        }
    };

    return (
        <button onClick={() => handleUpdateVisibility('prompt-123')}>
            Update Prompt Visibility
        </button>
    );
}

/**
 * Example Component: Update Prompt Metadata (Admin)
 * Endpoint: PUT /api/v1/admin/prompt/{promptId}/metadata
 */
function ExampleUpdatePromptMetadata() {
    const updateMetadataMutation = useAdminUpdatePromptMetadata();

    const handleUpdateMetadata = async (promptId: string) => {
        const result = await updateMetadataMutation.mutateAsync({
            promptId,
            payload: {
                title: "Updated Title",
                description: "Updated description",
                instruction: "Updated instruction",
                context: "Updated context",
                inputExample: "Updated example",
                outputFormat: "Updated format",
                constraints: "Updated constraints",
                tagIds: ["new-tag-1", "new-tag-2"],
            },
        });

        if (result.error) {
            console.error('Error:', result.error.messages);
        } else {
            console.log('Metadata updated:', result.data);
        }
    };

    return (
        <button onClick={() => handleUpdateMetadata('prompt-123')}>
            Update Prompt Metadata
        </button>
    );
}

/**
 * Example Component: Create School Admin Account
 * Endpoint: POST /api/v1/admin/school-admin-acc
 */
function ExampleCreateSchoolAdminAccount() {
    const createAdminMutation = useAdminCreateSchoolAdminAccount();

    const handleCreateAdmin = async () => {
        const result = await createAdminMutation.mutateAsync({
            payload: {
                email: "admin@school.edu",
                password: "SecurePassword123!",
                fullName: "John Doe",
                schoolId: 1,
            },
        });

        if (result.error) {
            console.error('Error:', result.error.messages);
        } else {
            console.log('School admin account created:', result.data);
        }
    };

    return (
        <button onClick={handleCreateAdmin}>
            Create School Admin Account
        </button>
    );
}

/**
 * Example Component: Create School Subscription
 * Endpoint: POST /api/v1/admin/schools/{schoolId}/subscription
 */
function ExampleCreateSchoolSubscription() {
    const createSubscriptionMutation = useAdminCreateSchoolSubscription();

    const handleCreateSubscription = async (schoolId: number) => {
        const result = await createSubscriptionMutation.mutateAsync({
            schoolId,
            payload: {
                tier: "PREMIUM",
                startDate: "2024-01-01T00:00:00Z",
                endDate: "2024-12-31T23:59:59Z",
                maxTokens: 1000000,
            },
        });

        if (result.error) {
            console.error('Error:', result.error.messages);
        } else {
            console.log('Subscription created:', result.data);
        }
    };

    return (
        <button onClick={() => handleCreateSubscription(1)}>
            Create School Subscription
        </button>
    );
}

/**
 * Example: Direct Service Usage (without hooks)
 * This is useful for server-side operations or one-off calls
 */
import { promptsService } from '@/services/resources/prompts';
import { adminService } from '@/services/resources/admin';

async function directServiceExample() {
    // Create standalone prompt
    const promptResult = await promptsService.createPromptStandaloneAdmin({
        title: "Example Prompt",
        instruction: "Example instruction",
        visibility: "private",
    });

    // Create school subscription
    const subscriptionResult = await adminService.createSchoolSubscription(1, {
        tier: "BASIC",
        startDate: "2024-01-01T00:00:00Z",
        endDate: "2024-12-31T23:59:59Z",
    });

    // Update prompt visibility
    const visibilityResult = await promptsService.updatePromptVisibilityAdmin(
        'prompt-123',
        {
            visibility: 'public',
        }
    );

    // Update prompt metadata
    const metadataResult = await promptsService.updatePromptMetadataAdmin(
        'prompt-123',
        {
            title: "New Title",
            description: "New Description",
        }
    );

    return {
        promptResult,
        subscriptionResult,
        visibilityResult,
        metadataResult,
    };
}

export {
    ExampleCreateStandalonePrompt,
    ExampleCreatePromptInCollection,
    ExampleUpdatePromptVisibility,
    ExampleUpdatePromptMetadata,
    ExampleCreateSchoolAdminAccount,
    ExampleCreateSchoolSubscription,
    directServiceExample,
};
