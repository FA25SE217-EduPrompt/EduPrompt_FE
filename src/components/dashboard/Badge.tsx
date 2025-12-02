import React from "react";

interface BadgeProps {
    color: string;
    text: string;
    size?: "md" | "sm";
}

export const Badge: React.FC<BadgeProps> = ({
                                                color,
                                                text,
                                                size = "md",
                                            }) => {
    const sizeClasses =
        size === "sm"
            ? "px-2 py-0.5 text-xs"
            : "px-2.5 py-0.5 text-sm"; // Default size

    return (
        <span
            className={`font-medium rounded-full ${sizeClasses} ${color}`}
        >
      {text}
    </span>
    );
};