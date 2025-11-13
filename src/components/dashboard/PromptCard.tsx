"use client";

import React, {useState} from "react";
import {BoltIcon, ChevronDownIcon, StarIcon,} from "@heroicons/react/24/outline";
import {Badge} from "./Badge";

interface PromptCardProps {
    title: string;
    description: string;
    author: string;
    subject: string;
    grade: string;
    type: string;
    rating: number;
    isTrending?: boolean;
    createdAt: string;
    lastUpdated: string; // ISO 8601 date string
}

const isNew = (createdAt: string): boolean => {
    try {
        const createdDate = new Date(createdAt);
        const now = new Date();
        const threeDaysAgo = now.setDate(now.getDate() - 3);
        return createdDate.getTime() > threeDaysAgo;
    } catch (e) {
        console.error("Invalid date format for createdAt:", createdAt, e);
        return false;
    }
};

const formatDate = (dateString: string): string => {
    try {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    } catch (e) {
        return "Invalid date";
    }
};

export const PromptCard: React.FC<PromptCardProps> = (props) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const showNewBadge = isNew(props.createdAt);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsExpanded(!isExpanded);
        }
    };

    return (
        <div
            className={`bg-bg-primary rounded-xl shadow-sm transition-all duration-300 border ${
                isExpanded
                    ? "border-brand-secondary shadow-md"
                    : "border-gray-100 hover:shadow-lg hover:-translate-y-1 hover:border-gray-200"
            }`}
        >
            {/* --- CLICKABLE HEADER --- */}
            <div
                role="button"
                tabIndex={0}
                onKeyDown={handleKeyDown}
                className="flex justify-between items-start w-full p-4 text-left cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
                aria-expanded={isExpanded}
                aria-controls={`prompt-details-${props.title.replace(/\s/g, "-")}`}
            >
                <div className="flex-1 pr-4">
                    {/* Status Badges */}
                    <div className="flex flex-wrap gap-2 mb-2">
                        {showNewBadge && (
                            <Badge
                                color="bg-accent-new-subtle text-accent-new"
                                text="New"
                                size="sm"
                            />
                        )}
                        {props.isTrending && (
                            <Badge
                                color="bg-accent-trending-subtle text-accent-trending"
                                text="Trending"
                                size="sm"
                            />
                        )}
                    </div>

                    {/* Title */}
                    <h3 className="font-semibold text-text-primary text-base">
                        {props.title}
                    </h3>
                </div>

                {/* Optimize Button */}
                <div className="flex-shrink-0 flex flex-col items-end gap-2">
                    <button
                        aria-label={`Optimize prompt ${props.title}`}
                        className="btn-optimize z-10"
                        onClick={(e) => {
                            e.stopPropagation(); // Prevent card from expanding when clicking optimize
                        }}
                    >
                        <BoltIcon className="h-4 w-4"/>
                        <span>Optimize</span>
                    </button>

                    {/* Chevron Icon for expand/collapse */}
                    <ChevronDownIcon
                        className={`h-5 w-5 text-text-secondary transition-transform duration-300 ${
                            isExpanded ? "rotate-180" : "rotate-0"
                        }`}
                    />
                </div>
            </div>

            {/* --- EXPANDABLE CONTENT --- */}
            <div
                id={`prompt-details-${props.title.replace(/\s/g, "-")}`}
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                }`}
            >
                <div className="px-4 pb-4 border-t border-gray-100">
                    {/* Description */}
                    <p className="text-sm text-text-secondary mt-3">
                        {props.description || "No description provided."}
                    </p>

                    {/* Metadata */}
                    <div className="mt-4 space-y-2 text-xs text-text-secondary">
                        <div className="flex">
                            <span className="font-medium w-20">Author:</span>
                            <span className="truncate">{props.author}</span>
                        </div>
                        <div className="flex">
                            <span className="font-medium w-20">Updated:</span>
                            <span>{formatDate(props.lastUpdated)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- STATIC FOOTER (Tags & Rating) --- */}
            <div className="p-4 border-t border-gray-100">
                <div className="flex flex-wrap gap-2">
                    <Badge
                        color="bg-accent-subject-subtle text-accent-subject"
                        text={props.subject}
                    />
                    <Badge
                        color="bg-accent-grade-subtle text-accent-grade"
                        text={`Grade ${props.grade}`}
                    />
                    <Badge
                        color="bg-accent-type-subtle text-accent-type"
                        text={props.type}
                    />
                </div>

                <div className="flex items-center mt-3 text-accent-star">
                    <StarIcon className="h-4 w-4 fill-current text-accent-star"/>
                    <span className="ml-1 text-sm font-semibold text-accent-star">
            {props.rating.toFixed(1)}
          </span>
                </div>
            </div>
        </div>
    );
};