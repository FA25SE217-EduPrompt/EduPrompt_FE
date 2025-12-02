"use client";

import React from "react";
import { PlusCircleIcon } from "@heroicons/react/24/outline";
import { GroupCard } from "@/components/dashboard/GroupCard";

// Mock Data
const groupsData = [
    {
        id: 1,
        name: "Science Department",
        description: "Collaboration group for all science teachers in the district.",
        memberCount: 24,
        promptCount: 156,
        role: "Member" as const,
        color: "bg-green-600"
    },
    {
        id: 2,
        name: "Grade 10 Team",
        description: "Cross-curricular planning for Grade 10 cohort.",
        memberCount: 8,
        promptCount: 45,
        role: "Admin" as const,
        color: "bg-blue-600"
    },
    {
        id: 3,
        name: "Math Enthusiasts",
        description: "Sharing advanced math problems and competition prep materials.",
        memberCount: 150,
        promptCount: 320,
        role: "Member" as const,
        color: "bg-indigo-600"
    },
    {
        id: 4,
        name: "Project Based Learning",
        description: "Resources and prompts for PBL implementation.",
        memberCount: 42,
        promptCount: 89,
        role: "Admin" as const,
        color: "bg-purple-600"
    },
];

const GroupsPage: React.FC = () => {
    return (
        <main className="flex-1 overflow-y-auto p-6 space-y-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Groups</h1>
                    <p className="text-gray-600 mt-1">Collaborate with other educators</p>
                </div>
                <button
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg shadow-sm btn-primary"
                >
                    <PlusCircleIcon className="h-5 w-5" />
                    <span>Create Group</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {groupsData.map((group) => (
                    <GroupCard
                        key={group.id}
                        id={group.id}
                        name={group.name}
                        description={group.description}
                        memberCount={group.memberCount}
                        promptCount={group.promptCount}
                        role={group.role}
                        color={group.color}
                    />
                ))}
            </div>
        </main>
    );
};

export default GroupsPage;
