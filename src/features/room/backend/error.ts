export const roomErrorCodes = {
  createFailed: 'ROOM_CREATE_FAILED',
  validationError: 'ROOM_VALIDATION_ERROR',
  unauthorized: 'ROOM_UNAUTHORIZED',
} as const;

type RoomErrorValue = (typeof roomErrorCodes)[keyof typeof roomErrorCodes];

export type RoomServiceError = RoomErrorValue;
