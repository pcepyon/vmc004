'use client';

import { useMutation } from '@tanstack/react-query';
import { apiClient, extractApiErrorMessage } from '@/lib/remote/api-client';
import {
  CreateRoomRequestSchema,
  RoomResponseSchema,
  type RoomResponse,
} from '@/features/room/lib/dto';

const createRoom = async (name: string): Promise<RoomResponse> => {
  try {
    const body = CreateRoomRequestSchema.parse({ name });
    const { data } = await apiClient.post('/api/rooms', body);
    return RoomResponseSchema.parse(data);
  } catch (error) {
    const message = extractApiErrorMessage(error, '채팅방 생성에 실패했습니다');
    throw new Error(message);
  }
};

export const useCreateRoom = () =>
  useMutation({
    mutationFn: createRoom,
  });
