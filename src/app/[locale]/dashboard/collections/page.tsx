"use client";

import React, { useState } from "react";
import { PlusCircleIcon } from "@heroicons/react/24/outline";
import { CollectionCard } from "@/components/dashboard/CollectionCard";
import { useGetMyCollections, useCreateCollection } from "@/hooks/queries/collection";
import { CollectionModal } from "@/components/collections/CollectionModal";
import { CreateCollectionRequest } from "@/types/collection.api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const CollectionsPage: React.FC = () => {
    const { data: collectionsResponse, isLoading } = useGetMyCollections(0, 50); // Fetch all for now
    const { mutate: createCollection, isPending: isCreating } = useCreateCollection();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const collections = collectionsResponse?.data?.content || [];

    const handleCreate = (data: CreateCollectionRequest) => {
        createCollection(
            { payload: data },
            {
                onSuccess: () => {
                    toast.success("Collection created successfully");
                    setIsModalOpen(false);
                },
                onError: (error) => {
                    toast.error("Failed to create collection");
                    console.error(error);
                },
            }
        );
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
            </div>
        );
    }

    return (
        <main className="flex-1 overflow-y-auto p-6 space-y-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Collections</h1>
                    <p className="text-gray-600 mt-1">Organize and manage your teaching prompts</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg shadow-sm bg-brand-primary text-white hover:bg-brand-primary/90 transition-colors"
                >
                    <PlusCircleIcon className="h-5 w-5" />
                    <span>New Collection</span>
                </button>
            </div>

            {collections.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                    <div className="mx-auto h-12 w-12 text-gray-400">
                        <PlusCircleIcon />
                    </div>
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">No collections</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by creating a new collection.</p>
                    <div className="mt-6">
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="inline-flex items-center rounded-md bg-brand-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
                        >
                            <PlusCircleIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                            New Collection
                        </button>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {collections.map((collection) => (
                        <CollectionCard
                            key={collection.id}
                            id={collection.id}
                            name={collection.name}
                            description={collection.description || ''}
                            promptCount={0} // TODO: API response should ideally include prompt count, currently missing in verified schema
                            isShared={collection.visibility !== 'PRIVATE'}
                            updatedAt={collection.createdAt} // Fallback to createdAt if updatedAt is missing
                            color="bg-blue-500" // Randomize or map color if needed
                        />
                    ))}
                </div>
            )}

            <CollectionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCreate}
                isLoading={isCreating}
            />
        </main>
    );
};

export default CollectionsPage;
