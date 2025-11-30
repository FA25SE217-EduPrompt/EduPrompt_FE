"use client";

import React from "react";
import { PlusCircleIcon } from "@heroicons/react/24/outline";
import { CollectionCard } from "@/components/dashboard/CollectionCard";

// Mock Data
const collectionsData = [
    {
        id: 1,
        name: "Grade 10 Biology",
        description: "Essential prompts for teaching cell structure, photosynthesis, and genetics.",
        promptCount: 12,
        isShared: true,
        updatedAt: "2025-11-15T10:00:00Z",
        color: "bg-green-500"
    },
    {
        id: 2,
        name: "Physics Mechanics",
        description: "Problems and explanations for Newton's laws, kinematics, and energy.",
        promptCount: 8,
        isShared: false,
        updatedAt: "2025-11-10T14:20:00Z",
        color: "bg-blue-500"
    },
    {
        id: 3,
        name: "Literature Analysis",
        description: "Prompts for analyzing themes, characters, and literary devices in classic texts.",
        promptCount: 15,
        isShared: true,
        updatedAt: "2025-11-12T11:00:00Z",
        color: "bg-purple-500"
    },
    {
        id: 4,
        name: "Chemistry Labs",
        description: "Safety guides, procedure outlines, and data analysis prompts for lab sessions.",
        promptCount: 6,
        isShared: false,
        updatedAt: "2025-11-05T16:45:00Z",
        color: "bg-yellow-500"
    },
];

const CollectionsPage: React.FC = () => {
    return (
        <main className="flex-1 overflow-y-auto p-6 space-y-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Collections</h1>
                    <p className="text-gray-600 mt-1">Organize and manage your teaching prompts</p>
                </div>
                <button
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg shadow-sm btn-primary"
                >
                    <PlusCircleIcon className="h-5 w-5" />
                    <span>New Collection</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {collectionsData.map((collection) => (
                    <CollectionCard
                        key={collection.id}
                        id={collection.id}
                        name={collection.name}
                        description={collection.description}
                        promptCount={collection.promptCount}
                        isShared={collection.isShared}
                        updatedAt={collection.updatedAt}
                        color={collection.color}
                    />
                ))}
            </div>
        </main>
    );
};

export default CollectionsPage;
