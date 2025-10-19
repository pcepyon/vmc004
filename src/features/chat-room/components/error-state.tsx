'use client';

import { useChatRoomState } from '../hooks/use-chat-room-state';
import { useChatRoomActions } from '../hooks/use-chat-room-actions';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export function ErrorState() {
  const { errorState } = useChatRoomState();
  const { clearError } = useChatRoomActions();
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <p className="text-lg font-semibold">오류가 발생했습니다</p>
      <p className="text-muted-foreground text-center max-w-md">{errorState.message}</p>

      {errorState.type === 'room_not_found' && (
        <Button onClick={() => router.push('/')}>
          채팅방 목록으로 돌아가기
        </Button>
      )}

      {errorState.type !== 'room_not_found' && (
        <Button onClick={clearError}>닫기</Button>
      )}
    </div>
  );
}
