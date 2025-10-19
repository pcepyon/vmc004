'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient, extractApiErrorMessage } from '@/lib/remote/api-client';
import { RoomListResponseSchema } from '@/features/rooms/lib/dto';

const fetchRoomList = async () => {
  try {
    const { data } = await apiClient.get('/api/rooms');
    return RoomListResponseSchema.parse(data);
  } catch (error) {
    const message = extractApiErrorMessage(
      error,
      '채팅방 목록을 불러올 수 없습니다.'
    );
    throw new Error(message);
  }
};

export const useRoomListQuery = () =>
  useQuery({
    queryKey: ['rooms'],
    queryFn: fetchRoomList,
    refetchInterval: 10 * 1000,
    staleTime: 5 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) =>
      Math.min(1000 * 2 ** attemptIndex, 30000),
  });
