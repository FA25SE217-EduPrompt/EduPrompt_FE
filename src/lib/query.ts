"use client"

import {QueryClient} from "@tanstack/query-core";
import {toast} from "sonner";

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // Data considered fresh for 5 minutes
            staleTime: 5 * 60 * 1000,
            // Cache data for 10 minutes
            gcTime: 10 * 60 * 1000,
            // Retry failed requests 3 times
            retry: 3,
            // Retry with exponential backoff
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
            // Don't refetch on reconnect by default
            refetchOnReconnect: false,
            // Network mode configuration
            networkMode: "online",
        },
        mutations: {
            // Global error handler for mutations
            onError: (error: Error) => {
                console.error("Mutation error:", error);
                toast.error("An error occurred", {
                    description: error.message || "Please try again later",
                });
            },
            // Retry mutations once
            retry: 1,
            // Network mode for mutations
            networkMode: "online",
        },
    },
});

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
    constructor(public status: number, public data: unknown, message?: string) {
        super(message || "API Error");
        this.name = "ApiError";
    }
}

/**
 * Global error handler for queries
 */
export const handleQueryError = (error: unknown) => {
    console.error("Query error:", error);

    if (error instanceof ApiError) {
        // Handle specific API errors
        switch (error.status) {
            case 401:
                toast.error("Authentication required", {
                    description: "Please log in to continue",
                });
                // Redirect to login or refresh token
                break;
            case 403:
                toast.error("Access denied", {
                    description: "You do not have permission to access this resource",
                });
                break;
            case 404:
                toast.error("Resource not found", {
                    description: "The requested resource could not be found",
                });
                break;
            case 500:
                toast.error("Server error", {
                    description: "An internal server error occurred",
                });
                break;
            default:
                toast.error("An error occurred", {
                    description: error.message || "Please try again later",
                });
        }
    } else if (error instanceof Error) {
        toast.error("An error occurred", {
            description: error.message || "Please try again later",
        });
    } else {
        toast.error("An unexpected error occurred", {
            description: "Please try again later",
        });
    }
};