import type { Message, RoomInfo, ErrorState } from './state';

/**
 * 액션 타입 상수
 */
export const ChatRoomActionTypes = {
  // 인증
  SET_AUTH_STATE: 'SET_AUTH_STATE',

  // 채팅방 정보
  SET_ROOM_INFO: 'SET_ROOM_INFO',

  // 메시지 로드
  LOAD_MESSAGES_START: 'LOAD_MESSAGES_START',
  LOAD_MESSAGES_SUCCESS: 'LOAD_MESSAGES_SUCCESS',
  LOAD_MESSAGES_FAILURE: 'LOAD_MESSAGES_FAILURE',

  // 메시지 전송
  SEND_MESSAGE_START: 'SEND_MESSAGE_START',
  SEND_MESSAGE_SUCCESS: 'SEND_MESSAGE_SUCCESS',
  SEND_MESSAGE_FAILURE: 'SEND_MESSAGE_FAILURE',

  // 메시지 삭제
  DELETE_MESSAGE_START: 'DELETE_MESSAGE_START',
  DELETE_MESSAGE_SUCCESS: 'DELETE_MESSAGE_SUCCESS',
  DELETE_MESSAGE_FAILURE: 'DELETE_MESSAGE_FAILURE',

  // 좋아요
  TOGGLE_LIKE_START: 'TOGGLE_LIKE_START',
  TOGGLE_LIKE_SUCCESS: 'TOGGLE_LIKE_SUCCESS',
  TOGGLE_LIKE_FAILURE: 'TOGGLE_LIKE_FAILURE',

  // 답장
  START_REPLY: 'START_REPLY',
  CANCEL_REPLY: 'CANCEL_REPLY',

  // 입력창
  SET_MESSAGE_INPUT: 'SET_MESSAGE_INPUT',
  CLEAR_MESSAGE_INPUT: 'CLEAR_MESSAGE_INPUT',

  // 폴링
  START_POLLING: 'START_POLLING',
  STOP_POLLING: 'STOP_POLLING',
  SET_TIMER_ID: 'SET_TIMER_ID',

  // 에러
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',

  // 폴링 업데이트
  POLLING_UPDATE: 'POLLING_UPDATE',
} as const;

/**
 * 액션 타입 정의
 */
export type ChatRoomAction =
  | {
      type: typeof ChatRoomActionTypes.SET_AUTH_STATE;
      payload: { isAuthenticated: boolean; userId: string | null };
    }
  | {
      type: typeof ChatRoomActionTypes.SET_ROOM_INFO;
      payload: RoomInfo;
    }
  | {
      type: typeof ChatRoomActionTypes.LOAD_MESSAGES_START;
    }
  | {
      type: typeof ChatRoomActionTypes.LOAD_MESSAGES_SUCCESS;
      payload: Message[];
    }
  | {
      type: typeof ChatRoomActionTypes.LOAD_MESSAGES_FAILURE;
      payload: string;
    }
  | {
      type: typeof ChatRoomActionTypes.SEND_MESSAGE_START;
    }
  | {
      type: typeof ChatRoomActionTypes.SEND_MESSAGE_SUCCESS;
    }
  | {
      type: typeof ChatRoomActionTypes.SEND_MESSAGE_FAILURE;
      payload: string;
    }
  | {
      type: typeof ChatRoomActionTypes.DELETE_MESSAGE_START;
      payload: string; // messageId
    }
  | {
      type: typeof ChatRoomActionTypes.DELETE_MESSAGE_SUCCESS;
    }
  | {
      type: typeof ChatRoomActionTypes.DELETE_MESSAGE_FAILURE;
      payload: { messageId: string; message: Message };
    }
  | {
      type: typeof ChatRoomActionTypes.TOGGLE_LIKE_START;
      payload: string; // messageId
    }
  | {
      type: typeof ChatRoomActionTypes.TOGGLE_LIKE_SUCCESS;
      payload: { messageId: string; liked: boolean };
    }
  | {
      type: typeof ChatRoomActionTypes.TOGGLE_LIKE_FAILURE;
      payload: string; // messageId
    }
  | {
      type: typeof ChatRoomActionTypes.START_REPLY;
      payload: string; // messageId
    }
  | {
      type: typeof ChatRoomActionTypes.CANCEL_REPLY;
    }
  | {
      type: typeof ChatRoomActionTypes.SET_MESSAGE_INPUT;
      payload: string;
    }
  | {
      type: typeof ChatRoomActionTypes.CLEAR_MESSAGE_INPUT;
    }
  | {
      type: typeof ChatRoomActionTypes.START_POLLING;
    }
  | {
      type: typeof ChatRoomActionTypes.STOP_POLLING;
    }
  | {
      type: typeof ChatRoomActionTypes.SET_TIMER_ID;
      payload: ReturnType<typeof setInterval> | null;
    }
  | {
      type: typeof ChatRoomActionTypes.SET_ERROR;
      payload: ErrorState;
    }
  | {
      type: typeof ChatRoomActionTypes.CLEAR_ERROR;
    }
  | {
      type: typeof ChatRoomActionTypes.POLLING_UPDATE;
      payload: Message[];
    };
