'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient, extractApiErrorMessage } from '@/lib/remote/api-client';
import { ProfileResponseSchema } from '@/features/profile/lib/dto';

const fetchProfile = async () => {
  try {
    const { data } = await apiClient.get('/api/profile');
    return ProfileResponseSchema.parse(data);
  } catch (error) {
    const message = extractApiErrorMessage(error, 'Failed to fetch profile.');
    throw new Error(message);
  }
};

export const useProfileQuery = () =>
  useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile,
    staleTime: 5 * 60 * 1000, // 5분
  });
