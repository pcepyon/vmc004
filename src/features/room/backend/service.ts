import type { SupabaseClient } from '@supabase/supabase-js';
import {
  failure,
  success,
  type HandlerResult,
} from '@/backend/http/response';
import {
  RoomResponseSchema,
  RoomTableRowSchema,
  type RoomResponse,
  type RoomRow,
} from '@/features/room/backend/schema';
import {
  roomErrorCodes,
  type RoomServiceError,
} from '@/features/room/backend/error';

const ROOMS_TABLE = 'rooms';

export const createRoom = async (
  client: SupabaseClient,
  creatorId: string,
  name: string,
): Promise<HandlerResult<RoomResponse, RoomServiceError, unknown>> => {
  const { data, error } = await client
    .from(ROOMS_TABLE)
    .insert({
      name,
      creator_id: creatorId,
    })
    .select('id, name, creator_id, created_at, updated_at')
    .single<RoomRow>();

  if (error) {
    return failure(500, roomErrorCodes.createFailed, error.message);
  }

  if (!data) {
    return failure(
      500,
      roomErrorCodes.createFailed,
      'Room creation failed: no data returned',
    );
  }

  const rowParse = RoomTableRowSchema.safeParse(data);

  if (!rowParse.success) {
    return failure(
      500,
      roomErrorCodes.validationError,
      'Room row failed validation.',
      rowParse.error.format(),
    );
  }

  const mapped = {
    id: rowParse.data.id,
    name: rowParse.data.name,
    creatorId: rowParse.data.creator_id,
    createdAt: rowParse.data.created_at,
    updatedAt: rowParse.data.updated_at,
  } satisfies RoomResponse;

  const parsed = RoomResponseSchema.safeParse(mapped);

  if (!parsed.success) {
    return failure(
      500,
      roomErrorCodes.validationError,
      'Room payload failed validation.',
      parsed.error.format(),
    );
  }

  return success(parsed.data, 201);
};
