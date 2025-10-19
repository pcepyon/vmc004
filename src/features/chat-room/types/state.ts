import type { MessageItem } from '../backend/schema';

/**
 * 메시지 타입 (MessageItem과 동일)
 */
export type Message = MessageItem;

/**
 * 답장 모드 상태
 */
export interface ReplyMode {
  isReplying: boolean;
  targetMessage: Message | null;
}

/**
 * 로딩 상태
 */
export interface LoadingStates {
  isInitialLoading: boolean;
  isSendingMessage: boolean;
  togglingLikeMessageId: string | null;
  deletingMessageId: string | null;
}

/**
 * 에러 상태
 */
export interface ErrorState {
  type: 'none' | 'room_not_found' | 'message_fetch_error' | 'send_message_error' | 'delete_message_error' | 'toggle_like_error';
  message: string;
}

/**
 * 인증 상태
 */
export interface AuthState {
  isAuthenticated: boolean;
  userId: string | null;
}

/**
 * 채팅방 정보
 */
export interface RoomInfo {
  id: string;
  name: string;
  creator_id: string;
  created_at: string;
  updated_at: string;
}

/**
 * 폴링 상태
 */
export interface PollingState {
  isPolling: boolean;
  timerId: ReturnType<typeof setInterval> | null;
  pollInterval: number; // 밀리초 (기본값: 4000)
}

/**
 * 채팅방 전체 상태
 */
export interface ChatRoomState {
  messages: Message[];
  roomInfo: RoomInfo | null;
  replyMode: ReplyMode;
  messageInput: string;
  pollingState: PollingState;
  loadingStates: LoadingStates;
  errorState: ErrorState;
  authState: AuthState;
}

/**
 * 초기 상태
 */
export const initialChatRoomState: ChatRoomState = {
  messages: [],
  roomInfo: null,
  replyMode: {
    isReplying: false,
    targetMessage: null,
  },
  messageInput: '',
  pollingState: {
    isPolling: false,
    timerId: null,
    pollInterval: 4000,
  },
  loadingStates: {
    isInitialLoading: true,
    isSendingMessage: false,
    togglingLikeMessageId: null,
    deletingMessageId: null,
  },
  errorState: {
    type: 'none',
    message: '',
  },
  authState: {
    isAuthenticated: false,
    userId: null,
  },
};
