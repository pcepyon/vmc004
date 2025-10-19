import { z } from 'zod';
import { chatRoomErrorCodes } from './error';

// 채팅방 관련 스키마
export const RoomParamsSchema = z.object({
  roomId: z.string().uuid('유효한 UUID 형식이 아닙니다'),
});

export const RoomTableRowSchema = z.object({
  id: z.string().uuid(),
  name: z.string().max(100),
  creator_id: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const RoomResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  creator_id: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

// 메시지 관련 스키마
export const MessageParamsSchema = z.object({
  messageId: z.string().uuid('유효한 UUID 형식이 아닙니다'),
});

export const SenderSchema = z.object({
  id: z.string().uuid(),
  nickname: z.string(),
});

export const ReplyToSchema = z.object({
  id: z.string().uuid(),
  content: z.string(),
  sender: SenderSchema,
});

export const MessageItemSchema = z.object({
  id: z.string().uuid(),
  room_id: z.string().uuid(),
  sender_id: z.string().uuid(),
  content: z.string(),
  reply_to_id: z.string().uuid().nullable(),
  created_at: z.string().datetime(),
  sender: SenderSchema,
  reply_to: ReplyToSchema.nullable(),
  likes_count: z.number().int().nonnegative(),
  is_liked_by_current_user: z.boolean(),
});

export const MessagesResponseSchema = z.array(MessageItemSchema);

export const MessageTableRowSchema = z.object({
  id: z.string().uuid(),
  room_id: z.string().uuid(),
  sender_id: z.string().uuid(),
  content: z.string(),
  reply_to_id: z.string().uuid().nullable(),
  created_at: z.string().datetime(),
});

export const CreateMessageSchema = z.object({
  content: z.string().min(1, '메시지는 공백일 수 없습니다'),
  reply_to_id: z.string().uuid().nullable().optional(),
});

// 좋아요 관련 스키마
export const ToggleLikeResponseSchema = z.object({
  liked: z.boolean(),
});

export const LikeTableRowSchema = z.object({
  id: z.string().uuid(),
  message_id: z.string().uuid(),
  user_id: z.string().uuid(),
  created_at: z.string().datetime(),
});

// 타입 추론
export type RoomResponse = z.infer<typeof RoomResponseSchema>;
export type MessageItem = z.infer<typeof MessageItemSchema>;
export type MessagesResponse = z.infer<typeof MessagesResponseSchema>;
export type CreateMessageBody = z.infer<typeof CreateMessageSchema>;
export type ToggleLikeResponse = z.infer<typeof ToggleLikeResponseSchema>;
export type RoomTableRow = z.infer<typeof RoomTableRowSchema>;
export type MessageTableRow = z.infer<typeof MessageTableRowSchema>;
export type LikeTableRow = z.infer<typeof LikeTableRowSchema>;

export { chatRoomErrorCodes };
