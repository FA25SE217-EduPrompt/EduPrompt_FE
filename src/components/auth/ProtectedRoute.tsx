"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
  requireAuth?: boolean;
  adminOnly?: boolean;
}

export default function ProtectedRoute({
  children,
  fallback,
  redirectTo = '/login',
  requireAuth = true,
  adminOnly = false,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (requireAuth && !isAuthenticated) {
        router.push(redirectTo);
        return;
      }

      if (adminOnly && (!isAuthenticated || !user?.isSystemAdmin)) {
        router.push('/unauthorized');
        return;
      }
    }
  }, [isAuthenticated, isLoading, requireAuth, adminOnly, user, router, redirectTo]);

  // Show loading state
  if (isLoading) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      )
    );
  }

  // Show nothing if not authenticated and auth is required
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  // Show nothing if admin is required but user is not admin
  if (adminOnly && (!isAuthenticated || !user?.isSystemAdmin)) {
    return null;
  }

  return <>{children}</>;
}
