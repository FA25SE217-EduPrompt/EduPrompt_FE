import React from "react";

interface StatCardProps {
    title: string;
    value: React.ReactNode;
    icon: React.ReactElement<{ className?: string }>;
    gradientClass: string;
    progress?: {
        current: number;
        max: number;
        label?: string; // Optional label e.g. "1.2k / 5k" if value is different
    };
}

export const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    icon,
    gradientClass,
    progress,
}) => (
    <div
        className="group bg-white border border-gray-200 p-5 rounded-xl shadow-sm
                transition-all duration-300 ease-in-out hover:shadow-md hover:-translate-y-1 active:scale-[0.98] cursor-pointer"
    >
        <div className="flex justify-between items-start mb-2">
            <div className="flex flex-col flex-1 min-w-0 mr-4">
                <div className="text-sm font-medium text-slate-500 truncate">{title}</div>
                <div className="text-2xl font-bold tracking-tight text-slate-900 mt-1 font-mono truncate">
                    {value}
                </div>
            </div>
            {/* Icon with gradient background */}
            <div className={`flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br ${gradientClass} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                {React.cloneElement(icon, {
                    className: "h-5 w-5 text-white",
                })}
            </div>
        </div>

        {progress && (
            <div className="mt-2">
                <div className="flex justify-between text-xs text-slate-500 mb-1.5 font-mono">
                    <span>{progress.current.toLocaleString()}</span>
                    <span>{progress.max.toLocaleString()}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${gradientClass}`}
                        style={{ width: `${progress.max > 0 ? Math.min((progress.current / progress.max) * 100, 100) : 0}%` }}
                    />
                </div>
            </div>
        )}
    </div>
);