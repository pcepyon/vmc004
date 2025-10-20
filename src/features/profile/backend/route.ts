import type { Hono } from 'hono';
import type { AppEnv } from '@/backend/hono/context';
import { getSupabase, getLogger } from '@/backend/hono/context';
import { respond, success, failure } from '@/backend/http/response';
import { getProfile, updateNickname } from './service';
import { UpdateNicknameRequestSchema } from './schema';
import { profileErrorCodes } from './error';
import type { ErrorResult } from '@/backend/http/response';

export function registerProfileRoutes(app: Hono<AppEnv>) {
  // GET /profile - 현재 사용자 프로필 조회
  app.get('/profile', async (c) => {
    const supabase = getSupabase(c);
    const logger = getLogger(c);

    // withAuth 미들웨어에서 주입한 사용자 확인
    const user = c.var.user;

    if (!user) {
      return respond(
        c,
        failure(401, profileErrorCodes.unauthorized, 'User not authenticated'),
      );
    }

    const result = await getProfile(supabase, user.id);

    if (!result.ok) {
      const errorResult = result as ErrorResult<typeof profileErrorCodes[keyof typeof profileErrorCodes], unknown>;
      if (errorResult.error.code === profileErrorCodes.fetchError) {
        logger.error('Failed to fetch profile', errorResult.error.message);
      }
    }

    return respond(c, result);
  });

  // PATCH /profile - 닉네임 변경
  app.patch('/profile', async (c) => {
    const supabase = getSupabase(c);
    const logger = getLogger(c);

    // withAuth 미들웨어에서 주입한 사용자 확인
    const user = c.var.user;

    if (!user) {
      return respond(
        c,
        failure(401, profileErrorCodes.unauthorized, 'User not authenticated'),
      );
    }

    const body = await c.req.json();
    const parsedBody = UpdateNicknameRequestSchema.safeParse(body);

    if (!parsedBody.success) {
      return respond(
        c,
        failure(
          400,
          'INVALID_NICKNAME_REQUEST',
          'Invalid nickname request',
          parsedBody.error.format(),
        ),
      );
    }

    const result = await updateNickname(supabase, user.id, parsedBody.data.nickname);

    if (!result.ok) {
      const errorResult = result as ErrorResult<typeof profileErrorCodes[keyof typeof profileErrorCodes], unknown>;
      if (errorResult.error.code === profileErrorCodes.updateFailed) {
        logger.error('Failed to update nickname', errorResult.error.message);
      }
    }

    return respond(c, result);
  });
}
