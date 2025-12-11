"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGetCollection, useUpdateCollection, useDeleteCollection } from "@/hooks/queries/collection";
import { useGetPromptsByCollection } from "@/hooks/queries/prompt";
import { CollectionHeader } from "@/components/collections/CollectionHeader";
import { CollectionModal } from "@/components/collections/CollectionModal";
import { PromptCard } from "@/components/dashboard/PromptCard";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { CreateCollectionRequest } from "@/types/collection.api";
import { PromptResponse } from "@/types/prompt.api";
import { TagResponse } from "@/types/tag.api";

const CollectionDetailPage: React.FC = () => {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;

    const { data: collectionResponse, isLoading: isCollectionLoading } = useGetCollection(id);
    const { data: promptsResponse, isLoading: isPromptsLoading } = useGetPromptsByCollection(id);

    const { mutate: updateCollection, isPending: isUpdating } = useUpdateCollection();
    const { mutate: deleteCollection, isPending: isDeleting } = useDeleteCollection();

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const collection = collectionResponse?.data;
    const prompts = promptsResponse?.data?.content || [];

    if (isCollectionLoading || isPromptsLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
            </div>
        );
    }

    if (!collection) {
        return <div className="p-6">Collection not found</div>;
    }

    const handleUpdate = (data: CreateCollectionRequest) => {
        updateCollection(
            { id, payload: data },
            {
                onSuccess: () => {
                    toast.success("Collection updated successfully");
                    setIsEditModalOpen(false);
                },
                onError: (error) => {
                    toast.error("Failed to update collection");
                    console.error(error);
                },
            }
        );
    };

    const handleDelete = () => {
        if (confirm("Are you sure you want to delete this collection? This action cannot be undone.")) {
            deleteCollection(
                { id },
                {
                    onSuccess: () => {
                        toast.success("Collection deleted successfully");
                        router.push("/dashboard/collections");
                    },
                    onError: (error) => {
                        toast.error("Failed to delete collection");
                        console.error(error);
                    },
                }
            );
        }
    };

    return (
        <div className="flex flex-col h-full bg-gray-50/50">
            <CollectionHeader
                title={collection.name}
                description={collection.description}
                onEdit={() => setIsEditModalOpen(true)}
                onDelete={handleDelete}
                isDeleting={isDeleting}
            />

            <main className="flex-1 p-6 overflow-y-auto">
                {prompts.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No prompts in this collection yet.</p>
                        <p className="text-sm text-gray-400 mt-1">Add existing prompts or create new ones in this collection.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {prompts.map((prompt: PromptResponse) => {
                            const subject = prompt.tags?.find(t => t.type === 'Subject' || t.type === 'Môn')?.value || 'General';
                            const grade = prompt.tags?.find(t => t.type === 'Grade' || t.type === 'Khối')?.value || 'All Levels';

                            return (
                                <PromptCard
                                    key={prompt.id}
                                    id={prompt.id}
                                    title={prompt.title}
                                    description={prompt.description || ''}
                                    author={prompt.fullName || "Unknown"} // PromptResponse has fullName, check type definition
                                    subject={subject}
                                    grade={grade}
                                    type="Prompt"
                                    rating={prompt.averageRating || 0}
                                    createdAt={prompt.createdAt}
                                    lastUpdated={prompt.updatedAt || prompt.createdAt}
                                />
                            );
                        })}
                    </div>
                )}
            </main>

            <CollectionModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSubmit={handleUpdate}
                isLoading={isUpdating}
                // initialData={collection} // Schema mismatch might require mapping
                initialData={{
                    name: collection.name,
                    description: collection.description,
                    visibility: collection.visibility?.toLowerCase() as 'private' | 'public' | 'group',
                    tags: collection.tags?.map((t: TagResponse) => t.id) || []
                }}
                title="Edit Collection"
                submitLabel="Save Changes"
            />
        </div>
    );
};

export default CollectionDetailPage;
