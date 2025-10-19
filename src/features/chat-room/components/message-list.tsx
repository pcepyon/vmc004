'use client';

import { useChatRoomState } from '../hooks/use-chat-room-state';
import { MessageItem } from './message-item';
import { EmptyState } from './empty-state';
import { useEffect, useRef } from 'react';

export function MessageList() {
  const { sortedMessages, loadingStates } = useChatRoomState();
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 메시지 추가 시 스크롤 최하단 이동
    if (listRef.current) {
      setTimeout(() => {
        if (listRef.current) {
          listRef.current.scrollTop = listRef.current.scrollHeight;
        }
      }, 0);
    }
  }, [sortedMessages.length]);

  if (loadingStates.isInitialLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">메시지를 불러오는 중...</p>
      </div>
    );
  }

  if (sortedMessages.length === 0) {
    return <EmptyState />;
  }

  return (
    <div
      ref={listRef}
      className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
    >
      {sortedMessages.map((message) => (
        <MessageItem key={message.id} message={message} />
      ))}
    </div>
  );
}
