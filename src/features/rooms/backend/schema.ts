import { z } from 'zod';

// 데이터베이스 테이블 row 스키마
export const RoomTableRowSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  creator_id: z.string().uuid(),
  creator_nickname: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type RoomTableRow = z.infer<typeof RoomTableRowSchema>;

// API 응답 스키마 (camelCase로 변환)
export const RoomItemSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  creatorNickname: z.string(),
  updatedAt: z.string(),
});

export type RoomItem = z.infer<typeof RoomItemSchema>;

export const RoomListResponseSchema = z.array(RoomItemSchema);

export type RoomListResponse = z.infer<typeof RoomListResponseSchema>;
