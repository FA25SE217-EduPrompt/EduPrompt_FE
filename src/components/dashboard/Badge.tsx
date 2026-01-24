import React from "react";

interface BadgeProps {
    color: string;
    text: string;
    size?: "md" | "sm";
    icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
    color,
    text,
    size = "md",
    icon,
}) => {
    const sizeClasses =
        size === "sm"
            ? "px-2 py-0.5 text-xs inline-flex items-center"
            : "px-2.5 py-0.5 text-sm inline-flex items-center"; // Default size

    return (
        <span
            className={`font-medium rounded-full ${sizeClasses} ${color}`}
        >
            {icon && <span className="mr-1">{icon}</span>}
            {text}
        </span>
    );
};