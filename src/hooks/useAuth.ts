import { useAuth as useAuthContext, User } from '@/contexts/AuthContext';
import { useCallback, useMemo } from 'react';

type AuthGuardResult = {
  isAuthenticated: boolean;
  isLoading: boolean;
  isReady: boolean;
};

// Re-export the useAuth hook from context for convenience
export { useAuth } from '@/contexts/AuthContext';
export const useAuthGuard = useCallback((): AuthGuardResult => {
  const { isAuthenticated, isLoading } = useAuthContext();
  return useMemo(() => ({ isAuthenticated, isLoading, isReady: !isLoading }), [isAuthenticated, isLoading]);
}, []);

type RequireAuthResult = {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  canAccess: boolean;
};

export const useRequireAuth = useCallback((): RequireAuthResult => {
  const { isAuthenticated, isLoading, user } = useAuthContext();
  
  return useMemo(() => ({ isAuthenticated, isLoading, user, canAccess: isAuthenticated && !isLoading }), [isAuthenticated, isLoading, user]);
}, []);
