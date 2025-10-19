'use client';

import { ChatRoomProvider } from '@/features/chat-room/context/chat-room-provider';
import { use } from 'react';

interface ChatRoomLayoutProps {
  children: React.ReactNode;
  params: Promise<{ roomId: string }>;
}

export default function ChatRoomLayout({
  children,
  params,
}: ChatRoomLayoutProps) {
  const { roomId } = use(params);

  return (
    <ChatRoomProvider roomId={roomId}>
      {children}
    </ChatRoomProvider>
  );
}
