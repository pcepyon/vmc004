'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabase/browser-client';
import { useCurrentUser } from './useCurrentUser';

export const useLogout = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { refresh } = useCurrentUser();

  const logout = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const supabase = getSupabaseBrowserClient();
      const { error: signOutError } = await supabase.auth.signOut();

      if (signOutError) {
        throw new Error(signOutError.message);
      }

      await refresh();
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : '로그아웃에 실패했습니다.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [refresh, router]);

  return { logout, isLoading, error };
};
