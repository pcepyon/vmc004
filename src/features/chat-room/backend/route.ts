import type { Hono } from 'hono';
import type { AppEnv } from '@/backend/hono/context';
import { getSupabase } from '@/backend/hono/context';
import { respond, success, failure } from '@/backend/http/response';
import { chatRoomService } from './service';
import { RoomParamsSchema, CreateMessageSchema, MessageParamsSchema } from './schema';

export function registerChatRoomRoutes(app: Hono<AppEnv>) {
  app.get('/rooms/:roomId', async (c) => {
    const roomId = c.req.param('roomId');
    const supabase = getSupabase(c);

    const paramsResult = RoomParamsSchema.safeParse({ roomId });
    if (!paramsResult.success) {
      return respond(
        c,
        failure(400, 'INVALID_PARAMS', '유효하지 않은 채팅방 ID입니다')
      );
    }

    const result = await chatRoomService.getRoomById(supabase, roomId);

    if (result.ok) {
      return respond(c, success(result.data, 200));
    }

    const errorResult = result as any;
    if (errorResult.error === 'CHAT_ROOM_NOT_FOUND') {
      return respond(
        c,
        failure(404, 'ROOM_NOT_FOUND', '채팅방을 찾을 수 없습니다')
      );
    }

    return respond(
      c,
      failure(500, 'ROOM_FETCH_ERROR', '채팅방 정보를 불러올 수 없습니다')
    );
  });

  app.get('/rooms/:roomId/messages', async (c) => {
    const roomId = c.req.param('roomId');
    const supabase = getSupabase(c);

    const paramsResult = RoomParamsSchema.safeParse({ roomId });
    if (!paramsResult.success) {
      return respond(
        c,
        failure(400, 'INVALID_PARAMS', '유효하지 않은 채팅방 ID입니다')
      );
    }

    const userId = c.var.user?.id || null;

    const result = await chatRoomService.getMessagesByRoomId(
      supabase,
      roomId,
      userId
    );

    if (result.ok) {
      return respond(c, success(result.data, 200));
    }

    return respond(
      c,
      failure(500, 'MESSAGE_FETCH_ERROR', '메시지를 불러올 수 없습니다')
    );
  });

  app.post('/rooms/:roomId/messages', async (c) => {
    const roomId = c.req.param('roomId');
    const supabase = getSupabase(c);

    const user = c.var.user;
    if (!user) {
      return respond(
        c,
        failure(401, 'UNAUTHORIZED', '로그인이 필요합니다')
      );
    }

    const paramsResult = RoomParamsSchema.safeParse({ roomId });
    if (!paramsResult.success) {
      return respond(
        c,
        failure(400, 'INVALID_PARAMS', '유효하지 않은 채팅방 ID입니다')
      );
    }

    const body = await c.req.json();
    const bodyResult = CreateMessageSchema.safeParse(body);
    if (!bodyResult.success) {
      return respond(
        c,
        failure(400, 'INVALID_BODY', '유효하지 않은 메시지입니다')
      );
    }

    const result = await chatRoomService.createMessage(
      supabase,
      roomId,
      user.id,
      bodyResult.data
    );

    if (result.ok) {
      return respond(c, success(result.data, 201));
    }

    return respond(
      c,
      failure(500, 'MESSAGE_CREATE_ERROR', '메시지 전송에 실패했습니다')
    );
  });

  app.delete('/messages/:messageId', async (c) => {
    const messageId = c.req.param('messageId');
    const supabase = getSupabase(c);

    const user = c.var.user;
    if (!user) {
      return respond(
        c,
        failure(401, 'UNAUTHORIZED', '로그인이 필요합니다')
      );
    }

    const paramsResult = MessageParamsSchema.safeParse({ messageId });
    if (!paramsResult.success) {
      return respond(
        c,
        failure(400, 'INVALID_PARAMS', '유효하지 않은 메시지 ID입니다')
      );
    }

    const result = await chatRoomService.deleteMessage(
      supabase,
      messageId,
      user.id
    );

    if (result.ok) {
      return respond(c, success(null, 200));
    }

    const errorResult = result as any;
    if (errorResult.error === 'UNAUTHORIZED_MESSAGE_DELETE') {
      return respond(
        c,
        failure(
          403,
          'FORBIDDEN',
          '본인이 작성한 메시지만 삭제할 수 있습니다'
        )
      );
    }

    if (errorResult.error === 'MESSAGE_NOT_FOUND') {
      return respond(
        c,
        failure(404, 'NOT_FOUND', '메시지를 찾을 수 없습니다')
      );
    }

    return respond(
      c,
      failure(500, 'MESSAGE_DELETE_ERROR', '메시지 삭제에 실패했습니다')
    );
  });

  app.post('/messages/:messageId/like', async (c) => {
    const messageId = c.req.param('messageId');
    const supabase = getSupabase(c);

    const user = c.var.user;
    if (!user) {
      return respond(
        c,
        failure(401, 'UNAUTHORIZED', '로그인이 필요합니다')
      );
    }

    const paramsResult = MessageParamsSchema.safeParse({ messageId });
    if (!paramsResult.success) {
      return respond(
        c,
        failure(400, 'INVALID_PARAMS', '유효하지 않은 메시지 ID입니다')
      );
    }

    const result = await chatRoomService.toggleLike(supabase, messageId, user.id);

    if (result.ok) {
      return respond(c, success(result.data, 200));
    }

    return respond(
      c,
      failure(500, 'LIKE_TOGGLE_ERROR', '좋아요 처리에 실패했습니다')
    );
  });
}
