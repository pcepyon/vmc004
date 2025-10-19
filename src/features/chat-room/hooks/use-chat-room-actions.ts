'use client';

import { useContext } from 'react';
import {
  ChatRoomActionsContext,
  ChatRoomActionsContextValue,
} from '../context/chat-room-actions-context';

export function useChatRoomActions(): ChatRoomActionsContextValue {
  const context = useContext(ChatRoomActionsContext);
  if (!context) {
    throw new Error('useChatRoomActions must be used within ChatRoomProvider');
  }
  return context;
}
