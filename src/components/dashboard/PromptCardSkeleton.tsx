import React from 'react';
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";

export const PromptCardSkeleton: React.FC = () => {
    return (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col justify-between h-auto min-h-[180px]">
            <div className="space-y-4">
                {/* Header: Badges & Actions */}
                <div className="flex justify-between items-start">
                    <div className="flex gap-2">
                        <SkeletonLoader lines={0} hasHeading={false} className="w-16 h-5" />
                        <SkeletonLoader lines={0} hasHeading={false} className="w-12 h-5" />
                    </div>
                    {/* Action button place */}
                    <SkeletonLoader lines={0} hasHeading={false} className="w-8 h-8 rounded-full" />
                </div>

                {/* Title */}
                <SkeletonLoader lines={1} hasHeading={true} className="w-3/4" />

                {/* Description hint (optional, since card is collapsed by default, but nice to have volume) */}
                <SkeletonLoader lines={2} hasHeading={false} />
            </div>

            {/* Footer: Tags & Rating */}
            <div className="mt-6 pt-4 border-t border-gray-50 flex flex-col gap-3">
                <div className="flex gap-2">
                    <SkeletonLoader lines={0} hasHeading={false} className="w-14 h-5" />
                    <SkeletonLoader lines={0} hasHeading={false} className="w-14 h-5" />
                    <SkeletonLoader lines={0} hasHeading={false} className="w-14 h-5" />
                </div>
                <div className="flex items-center gap-2">
                    <SkeletonLoader lines={0} hasHeading={false} className="w-8 h-4" />
                </div>
            </div>
        </div>
    );
};
