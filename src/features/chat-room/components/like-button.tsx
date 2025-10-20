'use client';

import { useChatRoomState } from '../hooks/use-chat-room-state';
import { useChatRoomActions } from '../hooks/use-chat-room-actions';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { Message } from '../types/state';

interface LikeButtonProps {
  message: Message;
}

export function LikeButton({ message }: LikeButtonProps) {
  const { authState, loadingStates } = useChatRoomState();
  const { toggleLike } = useChatRoomActions();
  const router = useRouter();

  const isLoading = loadingStates.togglingLikeMessageId === message.id;

  const handleLikeClick = () => {
    if (!authState.isAuthenticated) {
      if (confirm('로그인이 필요한 기능입니다. 로그인 페이지로 이동하시겠습니까?')) {
        router.push('/login');
      }
      return;
    }
    toggleLike(message.id);
  };

  return (
    <Button
      variant={message.is_liked_by_current_user ? 'default' : 'ghost'}
      size="sm"
      onClick={handleLikeClick}
      disabled={isLoading}
      className="text-xs"
      aria-label={message.is_liked_by_current_user ? '좋아요 취소' : '좋아요'}
    >
      <Heart
        className={`w-4 h-4 ${
          message.is_liked_by_current_user ? 'fill-current' : ''
        }`}
      />
      <span className="ml-1">{message.likes_count}</span>
    </Button>
  );
}
