// components/SkeletonLoader.tsx

import React from 'react';

type SkeletonLoaderProps = {
    /**
     * Number of skeleton lines to render.
     * @default 3
     */
    lines?: number;
    /**
     * Renders a shorter "heading" line.
     * @default true
     */
    hasHeading?: boolean;
    /**
     * Additional class names for spacing, etc.
     */
    className?: string;
};

export const SkeletonLoader = ({
                                   lines = 3,
                                   hasHeading = true,
                                   className,
                               }: SkeletonLoaderProps) => {
    const lineArray = Array.from({length: lines - (hasHeading ? 1 : 0)});

    return (
        <div
            role="status"
            className={`animate-pulse space-y-3 ${className ?? ''}`}
        >
            {hasHeading && (
                <div className="h-4 w-2/5 rounded-full bg-gray-200"></div>
            )}
            {lineArray.map((_, i) => (
                <div key={i} className="h-4 w-full rounded-full bg-gray-200"></div>
            ))}
            <div className="h-4 w-4/6 rounded-full bg-gray-200"></div>
            <span className="sr-only">Loading...</span>
        </div>
    );
};