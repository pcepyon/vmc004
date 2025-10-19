'use client';

import { useChatRoomState } from '../hooks/use-chat-room-state';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function ChatRoomHeader() {
  const { roomInfo } = useChatRoomState();
  const router = useRouter();

  return (
    <header className="border-b px-4 py-3 flex items-center gap-3 bg-white">
      <button
        onClick={() => router.back()}
        className="hover:bg-gray-100 rounded-full p-1 transition-colors"
        aria-label="뒤로가기"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>
      <h1 className="text-lg font-semibold">
        {roomInfo?.name || '채팅방'}
      </h1>
    </header>
  );
}
