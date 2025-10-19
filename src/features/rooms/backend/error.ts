export const roomErrorCodes = {
  fetchError: 'ROOM_FETCH_ERROR',
  validationError: 'ROOM_VALIDATION_ERROR',
} as const;

type RoomErrorValue = (typeof roomErrorCodes)[keyof typeof roomErrorCodes];

export type RoomServiceError = RoomErrorValue;
