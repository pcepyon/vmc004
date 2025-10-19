export const chatRoomErrorCodes = {
  // 채팅방
  roomNotFound: 'CHAT_ROOM_NOT_FOUND',
  roomFetchError: 'CHAT_ROOM_FETCH_ERROR',

  // 메시지
  messageFetchError: 'MESSAGE_FETCH_ERROR',
  messageCreateError: 'MESSAGE_CREATE_ERROR',
  messageDeleteError: 'MESSAGE_DELETE_ERROR',
  messageNotFound: 'MESSAGE_NOT_FOUND',

  // 좋아요
  likeFetchError: 'LIKE_FETCH_ERROR',
  likeToggleError: 'LIKE_TOGGLE_ERROR',

  // 권한
  unauthorizedDelete: 'UNAUTHORIZED_MESSAGE_DELETE',

  // 검증
  validationError: 'CHAT_ROOM_VALIDATION_ERROR',
} as const;

export type ChatRoomErrorCode = (typeof chatRoomErrorCodes)[keyof typeof chatRoomErrorCodes];
