'use client';

import { createContext } from 'react';

/**
 * Actions Context 값 인터페이스
 */
export interface ChatRoomActionsContextValue {
  loadMessages: () => Promise<void>;
  sendMessage: (content: string, replyToId?: string | null) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  toggleLike: (messageId: string) => Promise<void>;
  startReply: (messageId: string) => void;
  cancelReply: () => void;
  setMessageInput: (value: string) => void;
  clearMessageInput: () => void;
  startPolling: () => void;
  stopPolling: () => void;
  clearError: () => void;
}

export const ChatRoomActionsContext = createContext<ChatRoomActionsContextValue | null>(null);

ChatRoomActionsContext.displayName = 'ChatRoomActionsContext';
