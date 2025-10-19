'use client';

import { useChatRoomState } from '../hooks/use-chat-room-state';
import { useChatRoomActions } from '../hooks/use-chat-room-actions';
import { ReplyBar } from './reply-bar';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function MessageInput() {
  const {
    messageInput,
    canSendMessage,
    loadingStates,
    authState,
    replyMode,
  } = useChatRoomState();
  const { setMessageInput, sendMessage } = useChatRoomActions();
  const router = useRouter();

  const handleSend = () => {
    if (!canSendMessage) return;
    sendMessage(messageInput, replyMode.targetMessage?.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClick = () => {
    if (!authState.isAuthenticated) {
      router.push('/login');
    }
  };

  return (
    <div className="border-t bg-white">
      <ReplyBar />
      <div className="px-4 py-3 flex gap-2">
        <Textarea
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onClick={handleClick}
          placeholder={
            authState.isAuthenticated
              ? '메시지를 입력하세요...'
              : '로그인이 필요합니다'
          }
          disabled={loadingStates.isSendingMessage || !authState.isAuthenticated}
          className="flex-1 resize-none"
          rows={3}
        />
        <Button
          onClick={handleSend}
          disabled={!canSendMessage}
          className="self-end"
          aria-label="전송"
        >
          {loadingStates.isSendingMessage ? (
            <span className="text-xs">전송 중...</span>
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
