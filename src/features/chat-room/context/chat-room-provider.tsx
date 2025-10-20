'use client';

import { ReactNode, useCallback, useEffect, useMemo, useReducer } from 'react';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import { ChatRoomStateContext, ChatRoomStateContextValue } from './chat-room-state-context';
import {
  ChatRoomActionsContext,
  ChatRoomActionsContextValue,
} from './chat-room-actions-context';
import { chatRoomReducer } from '../reducer/chat-room-reducer';
import { initialChatRoomState } from '../types/state';
import { ChatRoomActionTypes } from '../types/actions';
import { chatRoomApi } from '../lib/api';
import { extractApiErrorMessage } from '@/lib/remote/api-client';

interface ChatRoomProviderProps {
  children: ReactNode;
  roomId: string;
}

export function ChatRoomProvider({ children, roomId }: ChatRoomProviderProps) {
  const [state, dispatch] = useReducer(chatRoomReducer, initialChatRoomState);
  const { user } = useCurrentUser();

  // 인증 상태 설정
  useEffect(() => {
    dispatch({
      type: ChatRoomActionTypes.SET_AUTH_STATE,
      payload: {
        isAuthenticated: !!user,
        userId: user?.id || null,
      },
    });
  }, [user]);

  // 메시지 조회
  const loadMessages = useCallback(async () => {
    dispatch({ type: ChatRoomActionTypes.LOAD_MESSAGES_START });
    try {
      const { data } = await chatRoomApi.getMessages(roomId);
      dispatch({
        type: ChatRoomActionTypes.LOAD_MESSAGES_SUCCESS,
        payload: data,
      });
    } catch (error) {
      const message = extractApiErrorMessage(error);
      dispatch({
        type: ChatRoomActionTypes.LOAD_MESSAGES_FAILURE,
        payload: message,
      });
    }
  }, [roomId]);

  // 채팅방 초기화 (roomId 변경 시)
  useEffect(() => {
    const initialize = async () => {
      try {
        const { data: roomData } = await chatRoomApi.getRoomInfo(roomId);
        dispatch({
          type: ChatRoomActionTypes.SET_ROOM_INFO,
          payload: roomData as any,
        });
      } catch (error) {
        dispatch({
          type: ChatRoomActionTypes.SET_ERROR,
          payload: {
            type: 'room_not_found',
            message: '채팅방을 찾을 수 없습니다',
          },
        });
        return;
      }

      await loadMessages();
    };

    initialize();
  }, [roomId, loadMessages]);

  // 폴링 시작/종료 관리
  useEffect(() => {
    let pollingTimer: ReturnType<typeof setInterval> | null = null;

    // 폴링 시작 (state dependency 제거하여 무한 루프 방지)
    dispatch({ type: ChatRoomActionTypes.START_POLLING });

    // 4초 간격으로 폴링 (고정값 사용)
    pollingTimer = setInterval(async () => {
      try {
        const { data } = await chatRoomApi.getMessages(roomId);
        dispatch({
          type: ChatRoomActionTypes.POLLING_UPDATE,
          payload: data,
        });
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 4000);

    dispatch({
      type: ChatRoomActionTypes.SET_TIMER_ID,
      payload: pollingTimer,
    });

    // Cleanup: 컴포넌트 언마운트 시 폴링 중지
    return () => {
      if (pollingTimer) {
        clearInterval(pollingTimer);
      }
      dispatch({ type: ChatRoomActionTypes.STOP_POLLING });
    };
  }, [roomId]); // roomId만 dependency로 설정

  // 메시지 전송
  const sendMessage = useCallback(
    async (content: string, replyToId?: string | null) => {
      const trimmedContent = content.trim();
      if (!trimmedContent) return;

      dispatch({ type: ChatRoomActionTypes.SEND_MESSAGE_START });
      try {
        await chatRoomApi.sendMessage(roomId, {
          content: trimmedContent,
          reply_to_id: replyToId || null,
        });
        dispatch({ type: ChatRoomActionTypes.SEND_MESSAGE_SUCCESS });
        // 즉시 메시지 목록 재조회
        await loadMessages();
      } catch (error) {
        const message = extractApiErrorMessage(error);
        dispatch({
          type: ChatRoomActionTypes.SEND_MESSAGE_FAILURE,
          payload: message,
        });
      }
    },
    [roomId, loadMessages]
  );

  // 메시지 삭제
  const deleteMessage = useCallback(async (messageId: string) => {
    // 삭제 시작 (로딩 상태만 설정, Optimistic update 제거)
    dispatch({
      type: ChatRoomActionTypes.DELETE_MESSAGE_START,
      payload: messageId,
    });
    try {
      await chatRoomApi.deleteMessage(messageId);
      // 성공 시 로딩 상태만 초기화
      dispatch({
        type: ChatRoomActionTypes.DELETE_MESSAGE_SUCCESS,
      });
      // 목록 재조회
      await loadMessages();
    } catch (error) {
      // 실패 시 에러 처리 (payload는 사용하지 않음)
      dispatch({
        type: ChatRoomActionTypes.DELETE_MESSAGE_FAILURE,
        payload: { messageId, message: {} as any },
      });
    }
  }, [loadMessages]); // loadMessages는 useCallback으로 안정적이므로 dependency 안전

  // 좋아요 토글
  const toggleLike = useCallback(async (messageId: string) => {
    dispatch({
      type: ChatRoomActionTypes.TOGGLE_LIKE_START,
      payload: messageId,
    });
    try {
      const { data } = await chatRoomApi.toggleLike(messageId);
      dispatch({
        type: ChatRoomActionTypes.TOGGLE_LIKE_SUCCESS,
        payload: { messageId, liked: data.liked },
      });
    } catch (error) {
      dispatch({
        type: ChatRoomActionTypes.TOGGLE_LIKE_FAILURE,
        payload: messageId,
      });
    }
  }, []);

  // 답장 시작
  const startReply = useCallback((messageId: string) => {
    dispatch({
      type: ChatRoomActionTypes.START_REPLY,
      payload: messageId,
    });
  }, []);

  // 답장 취소
  const cancelReply = useCallback(() => {
    dispatch({ type: ChatRoomActionTypes.CANCEL_REPLY });
  }, []);

  // 메시지 입력 설정
  const setMessageInput = useCallback((value: string) => {
    dispatch({
      type: ChatRoomActionTypes.SET_MESSAGE_INPUT,
      payload: value,
    });
  }, []);

  // 메시지 입력 초기화
  const clearMessageInput = useCallback(() => {
    dispatch({ type: ChatRoomActionTypes.CLEAR_MESSAGE_INPUT });
  }, []);

  // 폴링 시작/중지는 useEffect에서 관리되므로 no-op 함수만 제공
  const startPolling = useCallback(() => {}, []);
  const stopPolling = useCallback(() => {}, []);

  // 에러 초기화
  const clearError = useCallback(() => {
    dispatch({ type: ChatRoomActionTypes.CLEAR_ERROR });
  }, []);

  // State Context 값
  const stateValue: ChatRoomStateContextValue = useMemo(() => {
    const sortedMessages = [...state.messages].sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    const myMessageIds = new Set(
      state.messages
        .filter((m) => m.sender_id === state.authState.userId)
        .map((m) => m.id)
    );

    const isMessageInputEmpty = !state.messageInput.trim();

    const canSendMessage =
      state.messageInput.trim().length > 0 &&
      !state.loadingStates.isSendingMessage &&
      state.authState.isAuthenticated;

    return {
      ...state,
      sortedMessages,
      myMessageIds,
      isMessageInputEmpty,
      canSendMessage,
    };
  }, [state]);

  // Actions Context 값
  const actionsValue: ChatRoomActionsContextValue = useMemo(() => ({
    loadMessages,
    sendMessage,
    deleteMessage,
    toggleLike,
    startReply,
    cancelReply,
    setMessageInput,
    clearMessageInput,
    startPolling,
    stopPolling,
    clearError,
  }), [
    loadMessages,
    sendMessage,
    deleteMessage,
    toggleLike,
    startReply,
    cancelReply,
    setMessageInput,
    clearMessageInput,
    startPolling,
    stopPolling,
    clearError,
  ]);

  return (
    <ChatRoomStateContext.Provider value={stateValue}>
      <ChatRoomActionsContext.Provider value={actionsValue}>
        {children}
      </ChatRoomActionsContext.Provider>
    </ChatRoomStateContext.Provider>
  );
}
