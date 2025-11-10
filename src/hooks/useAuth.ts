import {useAuth as useAuthContext, User} from '@/contexts/AuthContext';
import {useMemo} from 'react';

type AuthGuardResult = {
    isAuthenticated: boolean;
    isLoading: boolean;
    isReady: boolean;
};

// Re-export the useAuth hook from context for convenience
export {useAuth} from '@/contexts/AuthContext';

// Custom hook for auth guard functionality
export const useAuthGuard = (): AuthGuardResult => {
    const {isAuthenticated, isLoading} = useAuthContext();
    return useMemo(() => ({isAuthenticated, isLoading, isReady: !isLoading}), [isAuthenticated, isLoading]);
};

type RequireAuthResult = {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: User | null;
    canAccess: boolean;
};

// Custom hook for require auth functionality
export const useRequireAuth = (): RequireAuthResult => {
    const {isAuthenticated, isLoading, user} = useAuthContext();

    return useMemo(() => ({
        isAuthenticated,
        isLoading,
        user,
        canAccess: isAuthenticated && !isLoading
    }), [isAuthenticated, isLoading, user]);
};
