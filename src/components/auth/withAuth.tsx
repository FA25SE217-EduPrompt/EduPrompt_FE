'use client';

import { ComponentType } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';

interface WithAuthOptions {
  redirectTo?: string;
  requireAuth?: boolean;
  adminOnly?: boolean;
}

export function withAuth<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: WithAuthOptions = {}
) {
  const {
    redirectTo = '/login',
    requireAuth = true,
    adminOnly = false,
  } = options;

  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading, user } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading) {
        if (requireAuth && !isAuthenticated) {
          router.replace(redirectTo);
          return;
        }

        if (adminOnly && (!isAuthenticated || !user?.isSystemAdmin)) {
          router.replace('/unauthorized');
          return;
        }
      }
    }, [isAuthenticated, isLoading, requireAuth, adminOnly, user, router, redirectTo]);

    // Show loading state
    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    // Don't render if not authenticated and auth is required
    if (requireAuth && !isAuthenticated) {
      return null;
    }

    // Don't render if admin is required but user is not admin
    if (adminOnly && (!isAuthenticated || !user?.isSystemAdmin)) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}
