import { useAuth as useAuthContext } from '@/contexts/AuthContext';

// Re-export the useAuth hook from context for convenience
export { useAuth } from '@/contexts/AuthContext';

// Additional auth-related hooks
export const useAuthGuard = () => {
  const { isAuthenticated, isLoading } = useAuthContext();
  
  return {
    isAuthenticated,
    isLoading,
    isReady: !isLoading,
  };
};

export const useRequireAuth = () => {
  const { isAuthenticated, isLoading, user } = useAuthContext();
  
  return {
    isAuthenticated,
    isLoading,
    user,
    canAccess: isAuthenticated && !isLoading,
  };
};
