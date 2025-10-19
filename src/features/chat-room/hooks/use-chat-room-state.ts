'use client';

import { useContext } from 'react';
import { ChatRoomStateContext, ChatRoomStateContextValue } from '../context/chat-room-state-context';

export function useChatRoomState(): ChatRoomStateContextValue {
  const context = useContext(ChatRoomStateContext);
  if (!context) {
    throw new Error('useChatRoomState must be used within ChatRoomProvider');
  }
  return context;
}
