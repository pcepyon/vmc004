import { ChatRoomState, initialChatRoomState } from '../types/state';
import { ChatRoomAction, ChatRoomActionTypes } from '../types/actions';

/**
 * 메시지 배열의 변경사항 확인
 */
function hasMessagesChanged(oldMessages: typeof initialChatRoomState.messages, newMessages: typeof initialChatRoomState.messages): boolean {
  if (oldMessages.length !== newMessages.length) {
    return true;
  }

  const oldIds = new Set(oldMessages.map((m) => m.id));
  const newIds = new Set(newMessages.map((m) => m.id));

  // ID 변경 확인
  for (const id of oldIds) {
    if (!newIds.has(id)) {
      return true;
    }
  }

  for (const id of newIds) {
    if (!oldIds.has(id)) {
      return true;
    }
  }

  // 각 메시지의 좋아요 수 변경 확인
  for (const newMsg of newMessages) {
    const oldMsg = oldMessages.find((m) => m.id === newMsg.id);
    if (oldMsg) {
      if (oldMsg.likes_count !== newMsg.likes_count) {
        return true;
      }
      if (oldMsg.is_liked_by_current_user !== newMsg.is_liked_by_current_user) {
        return true;
      }
    }
  }

  return false;
}

/**
 * 채팅방 Reducer
 */
export function chatRoomReducer(state: ChatRoomState, action: ChatRoomAction): ChatRoomState {
  switch (action.type) {
    case ChatRoomActionTypes.SET_AUTH_STATE:
      return {
        ...state,
        authState: {
          isAuthenticated: action.payload.isAuthenticated,
          userId: action.payload.userId,
        },
      };

    case ChatRoomActionTypes.SET_ROOM_INFO:
      return {
        ...state,
        roomInfo: action.payload,
      };

    case ChatRoomActionTypes.LOAD_MESSAGES_START:
      return {
        ...state,
        loadingStates: {
          ...state.loadingStates,
          isInitialLoading: true,
        },
      };

    case ChatRoomActionTypes.LOAD_MESSAGES_SUCCESS:
      return {
        ...state,
        messages: action.payload,
        loadingStates: {
          ...state.loadingStates,
          isInitialLoading: false,
        },
        errorState: {
          type: 'none',
          message: '',
        },
      };

    case ChatRoomActionTypes.LOAD_MESSAGES_FAILURE:
      return {
        ...state,
        loadingStates: {
          ...state.loadingStates,
          isInitialLoading: false,
        },
        errorState: {
          type: 'message_fetch_error',
          message: action.payload,
        },
      };

    case ChatRoomActionTypes.SEND_MESSAGE_START:
      return {
        ...state,
        loadingStates: {
          ...state.loadingStates,
          isSendingMessage: true,
        },
      };

    case ChatRoomActionTypes.SEND_MESSAGE_SUCCESS:
      return {
        ...state,
        messageInput: '',
        replyMode: {
          isReplying: false,
          targetMessage: null,
        },
        loadingStates: {
          ...state.loadingStates,
          isSendingMessage: false,
        },
        errorState: {
          type: 'none',
          message: '',
        },
      };

    case ChatRoomActionTypes.SEND_MESSAGE_FAILURE:
      return {
        ...state,
        loadingStates: {
          ...state.loadingStates,
          isSendingMessage: false,
        },
        errorState: {
          type: 'send_message_error',
          message: action.payload,
        },
      };

    case ChatRoomActionTypes.DELETE_MESSAGE_START: {
      // Optimistic Update: 메시지 즉시 제거
      const filtered = state.messages.filter((m) => m.id !== action.payload);
      return {
        ...state,
        messages: filtered,
        loadingStates: {
          ...state.loadingStates,
          deletingMessageId: action.payload,
        },
      };
    }

    case ChatRoomActionTypes.DELETE_MESSAGE_SUCCESS:
      return {
        ...state,
        loadingStates: {
          ...state.loadingStates,
          deletingMessageId: null,
        },
        errorState: {
          type: 'none',
          message: '',
        },
      };

    case ChatRoomActionTypes.DELETE_MESSAGE_FAILURE: {
      // Rollback: 메시지 다시 추가
      const { messageId, message } = action.payload;
      const messages = [...state.messages];
      messages.splice(state.messages.findIndex((m) => m.id > messageId), 0, message);
      return {
        ...state,
        messages,
        loadingStates: {
          ...state.loadingStates,
          deletingMessageId: null,
        },
        errorState: {
          type: 'delete_message_error',
          message: '메시지 삭제에 실패했습니다',
        },
      };
    }

    case ChatRoomActionTypes.TOGGLE_LIKE_START: {
      // Optimistic Update: 좋아요 상태 즉시 반전
      const messageId = action.payload;
      const updatedMessages = state.messages.map((msg) => {
        if (msg.id === messageId) {
          return {
            ...msg,
            is_liked_by_current_user: !msg.is_liked_by_current_user,
            likes_count: msg.is_liked_by_current_user
              ? Math.max(0, msg.likes_count - 1)
              : msg.likes_count + 1,
          };
        }
        return msg;
      });

      return {
        ...state,
        messages: updatedMessages,
        loadingStates: {
          ...state.loadingStates,
          togglingLikeMessageId: messageId,
        },
      };
    }

    case ChatRoomActionTypes.TOGGLE_LIKE_SUCCESS:
      return {
        ...state,
        loadingStates: {
          ...state.loadingStates,
          togglingLikeMessageId: null,
        },
        errorState: {
          type: 'none',
          message: '',
        },
      };

    case ChatRoomActionTypes.TOGGLE_LIKE_FAILURE: {
      // Rollback: 좋아요 상태 원복
      const messageId = action.payload;
      const updatedMessages = state.messages.map((msg) => {
        if (msg.id === messageId) {
          return {
            ...msg,
            is_liked_by_current_user: !msg.is_liked_by_current_user,
            likes_count: msg.is_liked_by_current_user
              ? msg.likes_count + 1
              : Math.max(0, msg.likes_count - 1),
          };
        }
        return msg;
      });

      return {
        ...state,
        messages: updatedMessages,
        loadingStates: {
          ...state.loadingStates,
          togglingLikeMessageId: null,
        },
        errorState: {
          type: 'toggle_like_error',
          message: '좋아요 처리에 실패했습니다',
        },
      };
    }

    case ChatRoomActionTypes.START_REPLY: {
      const targetMessage = state.messages.find((m) => m.id === action.payload);
      return {
        ...state,
        replyMode: {
          isReplying: true,
          targetMessage: targetMessage || null,
        },
      };
    }

    case ChatRoomActionTypes.CANCEL_REPLY:
      return {
        ...state,
        replyMode: {
          isReplying: false,
          targetMessage: null,
        },
      };

    case ChatRoomActionTypes.SET_MESSAGE_INPUT:
      return {
        ...state,
        messageInput: action.payload,
      };

    case ChatRoomActionTypes.CLEAR_MESSAGE_INPUT:
      return {
        ...state,
        messageInput: '',
      };

    case ChatRoomActionTypes.START_POLLING:
      return {
        ...state,
        pollingState: {
          ...state.pollingState,
          isPolling: true,
        },
      };

    case ChatRoomActionTypes.STOP_POLLING:
      return {
        ...state,
        pollingState: {
          ...state.pollingState,
          isPolling: false,
          timerId: null,
        },
      };

    case ChatRoomActionTypes.SET_TIMER_ID:
      return {
        ...state,
        pollingState: {
          ...state.pollingState,
          timerId: action.payload,
        },
      };

    case ChatRoomActionTypes.SET_ERROR:
      return {
        ...state,
        errorState: action.payload,
      };

    case ChatRoomActionTypes.CLEAR_ERROR:
      return {
        ...state,
        errorState: {
          type: 'none',
          message: '',
        },
      };

    case ChatRoomActionTypes.POLLING_UPDATE: {
      // 변경사항이 없으면 상태 유지
      if (!hasMessagesChanged(state.messages, action.payload)) {
        return state;
      }
      return {
        ...state,
        messages: action.payload,
      };
    }

    default:
      return state;
  }
}
