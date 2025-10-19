import { z } from 'zod';

export const CreateRoomRequestSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: '채팅방 이름을 입력해주세요' })
    .max(100, { message: '채팅방 이름은 100자 이하로 입력해주세요' }),
});

export type CreateRoomRequest = z.infer<typeof CreateRoomRequestSchema>;

export const RoomResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  creatorId: z.string().uuid(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type RoomResponse = z.infer<typeof RoomResponseSchema>;

export const RoomTableRowSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  creator_id: z.string().uuid(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type RoomRow = z.infer<typeof RoomTableRowSchema>;
