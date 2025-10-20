import type { Hono } from 'hono';
import { failure, respond, type ErrorResult } from '@/backend/http/response';
import {
  getLogger,
  getSupabase,
  type AppEnv,
} from '@/backend/hono/context';
import { CreateRoomRequestSchema } from '@/features/room/backend/schema';
import { createRoom } from './service';
import {
  roomErrorCodes,
  type RoomServiceError,
} from './error';

export const registerRoomRoutes = (app: Hono<AppEnv>) => {
  app.post('/rooms', async (c) => {
    const supabase = getSupabase(c);
    const logger = getLogger(c);

    // withAuth 미들웨어에서 주입한 사용자 확인
    const user = c.var.user;

    if (!user) {
      return respond(
        c,
        failure(401, roomErrorCodes.unauthorized, 'User must be authenticated'),
      );
    }

    const creatorId = user.id;

    // request body 파싱 및 검증
    let body;
    try {
      body = await c.req.json();
    } catch (error) {
      return respond(
        c,
        failure(400, 'INVALID_ROOM_REQUEST', 'Invalid request body'),
      );
    }

    const parsedBody = CreateRoomRequestSchema.safeParse(body);

    if (!parsedBody.success) {
      return respond(
        c,
        failure(
          400,
          'INVALID_ROOM_REQUEST',
          'Validation error',
          parsedBody.error.format(),
        ),
      );
    }

    // createRoom 서비스 호출
    const result = await createRoom(supabase, creatorId, parsedBody.data.name);

    if (!result.ok) {
      const errorResult = result as ErrorResult<RoomServiceError, unknown>;

      if (errorResult.error.code === roomErrorCodes.createFailed) {
        logger.error('Failed to create room', errorResult.error.message);
      }

      return respond(c, result);
    }

    return respond(c, result);
  });
};
