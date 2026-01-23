"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { useGetCollection, useUpdateCollection, useDeleteCollection } from "@/hooks/queries/collection";
import { useGetPromptsByCollection } from "@/hooks/queries/prompt";
import { CollectionHeader } from "@/components/collections/CollectionHeader";
import { CollectionModal } from "@/components/collections/CollectionModal";
import { AddPromptToCollectionModal } from "@/components/collections/AddPromptToCollectionModal";
import { PromptCard } from "@/components/dashboard/PromptCard";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { CreateCollectionRequest } from "@/types/collection.api";
import { PromptResponse } from "@/types/prompt.api";
import { TagResponse } from "@/types/tag.api";
import { SkeletonLoader as Skeleton } from "@/components/ui/SkeletonLoader";
import Button from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";

const CollectionDetailPage: React.FC = () => {
    const t = useTranslations("Dashboard.Collections.Detail");
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;
    const { user } = useAuth();

    const { data: collectionResponse, isLoading: isCollectionLoading } = useGetCollection(id);
    const { data: promptsResponse, isLoading: isPromptsLoading } = useGetPromptsByCollection(id);

    const { mutate: updateCollection, isPending: isUpdating } = useUpdateCollection();
    const { mutate: deleteCollection, isPending: isDeleting } = useDeleteCollection();

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddPromptModalOpen, setIsAddPromptModalOpen] = useState(false);

    const collection = collectionResponse?.data;
    const prompts = promptsResponse?.data?.content || [];

    if (isCollectionLoading) {
        return (
            <div className="flex flex-col h-full bg-gray-50/50">
                {/* Header Skeleton */}
                <div className="bg-white border-b px-6 py-5">
                    <div className="h-4 w-40 mb-4 bg-gray-200 rounded animate-pulse" />
                    <div className="h-7 w-56 bg-gray-200 rounded animate-pulse" />
                </div>
                {/* Card Grid Skeleton */}
                <main className="flex-1 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-40 bg-gray-200 rounded-xl animate-pulse" />
                        ))}
                    </div>
                </main>
            </div>
        );
    }

    if (!collection) {
        return <div className="p-6">{t('notFound')}</div>;
    }

    const handleUpdate = (data: CreateCollectionRequest) => {
        updateCollection(
            { id, payload: data },
            {
                onSuccess: () => {
                    toast.success(t('updateSuccess'));
                    setIsEditModalOpen(false);
                },
                onError: (error) => {
                    toast.error(t('updateError'));
                    console.error(error);
                },
            }
        );
    };

    const handleDelete = () => {
        if (confirm(t('deleteConfirm'))) {
            deleteCollection(
                { id },
                {
                    onSuccess: () => {
                        toast.success(t('deleteSuccess'));
                        router.push("/dashboard/collections");
                    },
                    onError: (error) => {
                        toast.error(t('deleteError'));
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
            >
                <Button
                    onClick={() => setIsAddPromptModalOpen(true)}
                    className="bg-brand-primary text-white hover:bg-brand-primary/90 px-3 py-2 text-sm h-9"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    {t('addPrompt')}
                </Button>
            </CollectionHeader>

            <main className="flex-1 p-6 overflow-y-auto">
                {isPromptsLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <Skeleton key={i} className="h-[280px] rounded-xl" />
                        ))}
                    </div>
                ) : prompts.length === 0 ? (
                    <div className="text-center py-12 flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <Plus className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">{t('noPrompts')}</h3>
                        <p className="text-gray-500 max-w-sm mt-1 mb-6">
                            {t('emptyDescription')}
                        </p>
                        <Button
                            onClick={() => setIsAddPromptModalOpen(true)}
                            variant="outline"
                            className="border-dashed"
                        >
                            {t('addPromptToCollection')}
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {prompts.map((prompt: PromptResponse) => {
                            const tags = prompt.tags || [];
                            const subject = tags.find(t => t.type === 'Subject' || t.type === 'Môn')?.value || 'General';
                            const grade = tags.find(t => t.type === 'Grade' || t.type === 'Khối')?.value || 'All Levels';

                            const otherTags = tags.filter(t =>
                                t.type !== 'Subject' && t.type !== 'Môn' &&
                                t.type !== 'Grade' && t.type !== 'Khối'
                            ).map(t => `${t.type}: ${t.value}`);

                            return (
                                <PromptCard
                                    key={prompt.id}
                                    id={prompt.id}
                                    title={prompt.title}
                                    description={prompt.description || ''}
                                    author={prompt.fullName || "Unknown"}
                                    subject={subject}
                                    grade={grade}
                                    type="Prompt"
                                    rating={prompt.averageRating || 0}
                                    createdAt={prompt.createdAt}
                                    lastUpdated={prompt.updatedAt || prompt.createdAt}
                                    isOwner={prompt.ownerId === user?.id}
                                    tags={otherTags}
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
                initialData={{
                    name: collection.name,
                    description: collection.description,
                    visibility: collection.visibility?.toLowerCase() as 'private' | 'public' | 'group',
                    tags: collection.tags?.map((t: TagResponse) => t.id) || []
                }}
                title="Edit Collection"
                submitLabel="Save Changes"
            />

            <AddPromptToCollectionModal
                isOpen={isAddPromptModalOpen}
                onClose={() => setIsAddPromptModalOpen(false)}
                collectionId={id}
            />
        </div>
    );
};

export default CollectionDetailPage;
