import { z } from 'zod';

/**
 * 프로필 조회 응답 스키마
 */
export const ProfileResponseSchema = z.object({
  userId: z.string().uuid(),
  email: z.string().email(),
  nickname: z.string(),
  createdAt: z.string(),
});

/**
 * 닉네임 변경 요청 스키마
 */
export const UpdateNicknameRequestSchema = z.object({
  nickname: z.string().trim().min(1, '닉네임을 입력해주세요'),
});

/**
 * 데이터베이스 row 스키마
 */
export const ProfileRowSchema = z.object({
  user_id: z.string().uuid(),
  email: z.string(),
  nickname: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type ProfileResponse = z.infer<typeof ProfileResponseSchema>;
export type UpdateNicknameRequest = z.infer<typeof UpdateNicknameRequestSchema>;
export type ProfileRow = z.infer<typeof ProfileRowSchema>;
