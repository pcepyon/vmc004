import type { Hono } from 'hono';
import { respond, type ErrorResult } from '@/backend/http/response';
import {
  getLogger,
  getSupabase,
  type AppEnv,
} from '@/backend/hono/context';
import { getRoomList } from './service';
import {
  roomErrorCodes,
  type RoomServiceError,
} from './error';

export const registerRoomRoutes = (app: Hono<AppEnv>) => {
  app.get('/rooms', async (c) => {
    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const result = await getRoomList(supabase);

    if (!result.ok) {
      const errorResult = result as ErrorResult<RoomServiceError, unknown>;

      if (errorResult.error.code === roomErrorCodes.fetchError) {
        logger.error('Failed to fetch room list', errorResult.error.message);
      }

      return respond(c, result);
    }

    return respond(c, result);
  });
};
