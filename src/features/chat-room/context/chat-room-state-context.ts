'use client';

import { createContext } from 'react';
import type { ChatRoomState, Message, ReplyMode, RoomInfo } from '../types/state';

/**
 * State Context 값 인터페이스
 */
export interface ChatRoomStateContextValue extends ChatRoomState {
  // 파생 데이터
  sortedMessages: Message[];
  myMessageIds: Set<string>;
  isMessageInputEmpty: boolean;
  canSendMessage: boolean;
}

export const ChatRoomStateContext = createContext<ChatRoomStateContextValue | null>(null);

ChatRoomStateContext.displayName = 'ChatRoomStateContext';
