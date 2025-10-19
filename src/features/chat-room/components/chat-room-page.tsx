'use client';

import { useChatRoomState } from '../hooks/use-chat-room-state';
import { ChatRoomHeader } from './chat-room-header';
import { MessageList } from './message-list';
import { MessageInput } from './message-input';
import { ErrorState } from './error-state';

export function ChatRoomPage() {
  const { errorState, roomInfo } = useChatRoomState();

  if (errorState.type === 'room_not_found') {
    return <ErrorState />;
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      <ChatRoomHeader />
      <MessageList />
      <MessageInput />
    </div>
  );
}
