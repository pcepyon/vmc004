'use client';

import { useChatRoomState } from './use-chat-room-state';
import { useChatRoomActions } from './use-chat-room-actions';

export function useChatRoom() {
  const state = useChatRoomState();
  const actions = useChatRoomActions();
  return [state, actions] as const;
}
