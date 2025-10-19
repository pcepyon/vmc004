'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, extractApiErrorMessage } from '@/lib/remote/api-client';
import { ProfileResponseSchema, type UpdateNicknameRequest } from '@/features/profile/lib/dto';

const updateNickname = async (request: UpdateNicknameRequest) => {
  try {
    const { data } = await apiClient.patch('/api/profile', request);
    return ProfileResponseSchema.parse(data);
  } catch (error) {
    const message = extractApiErrorMessage(error, 'Failed to update nickname.');
    throw new Error(message);
  }
};

export const useUpdateNickname = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateNickname,
    onSuccess: (data) => {
      // 프로필 쿼리 캐시 업데이트
      queryClient.setQueryData(['profile'], data);
    },
  });
};
