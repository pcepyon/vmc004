import type { SupabaseClient } from '@supabase/supabase-js';
import {
  failure,
  success,
  type HandlerResult,
} from '@/backend/http/response';
import {
  RoomTableRowSchema,
  RoomListResponseSchema,
  type RoomListResponse,
} from './schema';
import {
  roomErrorCodes,
  type RoomServiceError,
} from './error';

const ROOMS_TABLE = 'rooms';
const PROFILES_TABLE = 'profiles';

export const getRoomList = async (
  client: SupabaseClient,
): Promise<HandlerResult<RoomListResponse, RoomServiceError, unknown>> => {
  const { data, error } = await client
    .from(ROOMS_TABLE)
    .select(`
      id,
      name,
      creator_id,
      created_at,
      updated_at,
      ${PROFILES_TABLE}:creator_id (
        nickname
      )
    `)
    .order('updated_at', { ascending: false });

  if (error) {
    return failure(500, roomErrorCodes.fetchError, error.message);
  }

  if (!data) {
    return success([]);
  }

  const mapped = data.map((row: any) => ({
    id: row.id,
    name: row.name,
    creator_id: row.creator_id,
    creator_nickname: row[PROFILES_TABLE]?.nickname ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }));

  const parsedRows = mapped.map(row => RoomTableRowSchema.safeParse(row));

  const invalidRow = parsedRows.find(p => !p.success);
  if (invalidRow && !invalidRow.success) {
    return failure(
      500,
      roomErrorCodes.validationError,
      'Room row validation failed.',
      invalidRow.error.format(),
    );
  }

  const rooms = mapped.map(row => ({
    id: row.id,
    name: row.name,
    creatorNickname: row.creator_nickname ?? 'Unknown',
    updatedAt: row.updated_at,
  }));

  const parsed = RoomListResponseSchema.safeParse(rooms);

  if (!parsed.success) {
    return failure(
      500,
      roomErrorCodes.validationError,
      'Room list validation failed.',
      parsed.error.format(),
    );
  }

  return success(parsed.data);
};
