'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { apiClient, extractApiErrorMessage } from '@/lib/remote/api-client';
import { useCurrentUserContext } from '../context/current-user-context';

const logout = async () => {
  try {
    await apiClient.post('/api/auth/logout');
  } catch (error) {
    const message = extractApiErrorMessage(error, 'Failed to logout.');
    throw new Error(message);
  }
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { refresh } = useCurrentUserContext();

  return useMutation({
    mutationFn: logout,
    onSuccess: async () => {
      // 모든 쿼리 캐시 초기화
      queryClient.clear();

      // CurrentUser 컨텍스트 갱신
      await refresh();

      // 로그인 페이지로 리다이렉트
      router.push('/login');
    },
  });
};
