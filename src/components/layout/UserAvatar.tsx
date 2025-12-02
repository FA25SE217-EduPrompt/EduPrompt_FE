"use client";

import {useAuth} from "@/hooks/useAuth";
import React from "react";

interface UserAvatarProps {
    className?: string;
    textClassName?: string;
}

/**
 * A reusable component to display the user's avatar (initials)
 * based on the authenticated user's context.
 */
export const UserAvatar: React.FC<UserAvatarProps> = ({
                                                          className = "w-8 h-8",
                                                          textClassName = "text-sm",
                                                      }) => {
    const {user} = useAuth();

    const getInitials = () => {
        const first = user?.firstName?.charAt(0) || "";
        const last = user?.lastName?.charAt(0) || "";
        if (first && last) {
            return `${first}${last}`;
        }
        return user?.email?.charAt(0) || "U";
    };

    return (
        <div
            className={`gradient-bg rounded-full flex items-center justify-center ${className}`}
            title={user?.email || "User"}
        >
      <span
          className={`font-semibold text-text-on-brand ${textClassName}`}
      >
        {getInitials().toUpperCase()}
      </span>
        </div>
    );
};