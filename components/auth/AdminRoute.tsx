'use client';

import { useAuth } from '@/lib/contexts/AuthContext';
import useCurrentUserDocument from '@/lib/hooks/useCurrentUserDocument';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading: authLoading } = useAuth();
  const userData = useCurrentUserDocument();
  const router = useRouter();

  // We need to wait for both auth and user document
  const isLoading = authLoading || userData === null;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/logowanie');
      return;
    }

    if (!authLoading && user && userData) {
      if (userData.isAdmin !== true) {
        router.push('/');
      }
    }
  }, [user, authLoading, userData, router]);

  if (isLoading || !user || userData?.isAdmin !== true) {
    return <div className="flex h-screen items-center justify-center">Loading Admin...</div>;
  }

  return <>{children}</>;
}
