'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';

type AuthGuardProps = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

export const AuthGuard = ({ children, fallback }: AuthGuardProps) => {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useCurrentUser();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return fallback ?? <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};
