import type { SupabaseClient } from '@supabase/supabase-js';
import type { HandlerResult } from '@/backend/http/response';
import { success, failure } from '@/backend/http/response';
import { profileErrorCodes, type ProfileServiceError } from './error';
import { ProfileResponseSchema, ProfileRowSchema, type ProfileResponse, type ProfileRow } from './schema';

const PROFILES_TABLE = 'profiles';

/**
 * 프로필 조회
 */
export const getProfile = async (
  client: SupabaseClient,
  userId: string,
): Promise<HandlerResult<ProfileResponse, ProfileServiceError, unknown>> => {
  const { data, error } = await client
    .from(PROFILES_TABLE)
    .select('user_id, email, nickname, created_at, updated_at')
    .eq('user_id', userId)
    .maybeSingle<ProfileRow>();

  if (error) {
    return failure(500, profileErrorCodes.fetchError, error.message);
  }

  if (!data) {
    return failure(404, profileErrorCodes.notFound, 'Profile not found');
  }

  const rowParse = ProfileRowSchema.safeParse(data);
  if (!rowParse.success) {
    return failure(
      500,
      profileErrorCodes.validationError,
      'Profile row validation failed',
      rowParse.error.format(),
    );
  }

  const mapped: ProfileResponse = {
    userId: rowParse.data.user_id,
    email: rowParse.data.email,
    nickname: rowParse.data.nickname,
    createdAt: rowParse.data.created_at,
  };

  const parsed = ProfileResponseSchema.safeParse(mapped);
  if (!parsed.success) {
    return failure(
      500,
      profileErrorCodes.validationError,
      'Profile response validation failed',
      parsed.error.format(),
    );
  }

  return success(parsed.data);
};

/**
 * 닉네임 변경
 */
export const updateNickname = async (
  client: SupabaseClient,
  userId: string,
  nickname: string,
): Promise<HandlerResult<ProfileResponse, ProfileServiceError, unknown>> => {
  const { error: updateError } = await client
    .from(PROFILES_TABLE)
    .update({ nickname })
    .eq('user_id', userId);

  if (updateError) {
    return failure(500, profileErrorCodes.updateFailed, updateError.message);
  }

  // 업데이트 후 최신 프로필 조회
  return getProfile(client, userId);
};
