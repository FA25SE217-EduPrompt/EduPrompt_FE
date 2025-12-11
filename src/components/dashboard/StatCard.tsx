import React from "react";

interface StatCardProps {
    title: string;
    value: React.ReactNode;
    icon: React.ReactElement<{ className?: string }>;
    gradientClass: string;
}

export const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    icon,
    gradientClass,
}) => (
    <div
        className={`bg-gradient-to-br ${gradientClass} p-5 rounded-xl shadow-sm text-text-on-brand
                transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1 cursor-pointer`}
    >
        <div className="flex justify-between items-start">
            <div className="flex flex-col">
                <div className="text-sm font-medium opacity-90">{title}</div>
                <div className="text-3xl font-bold mt-1">{value}</div>
            </div>
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                {React.cloneElement(icon, {
                    className: "h-6 w-6 text-white",
                })}
            </div>
        </div>
    </div>
);