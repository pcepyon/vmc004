'use client';

import { useChatRoomState } from '../hooks/use-chat-room-state';
import { useChatRoomActions } from '../hooks/use-chat-room-actions';
import { LikeButton } from './like-button';
import { DeleteConfirmDialog } from './delete-confirm-dialog';
import { Button } from '@/components/ui/button';
import { MessageSquare, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Message } from '../types/state';

interface MessageActionsProps {
  message: Message;
}

export function MessageActions({ message }: MessageActionsProps) {
  const { authState, myMessageIds } = useChatRoomState();
  const { startReply, deleteMessage } = useChatRoomActions();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const router = useRouter();

  const isMine = myMessageIds.has(message.id);

  // 로그인 확인 핸들러
  const handleActionWithAuth = (action: () => void) => {
    if (!authState.isAuthenticated) {
      if (confirm('로그인이 필요한 기능입니다. 로그인 페이지로 이동하시겠습니까?')) {
        router.push('/login');
      }
      return;
    }
    action();
  };

  return (
    <>
      <div className="flex items-center gap-2 mt-1">
        {/* 좋아요 버튼 - 항상 표시, 클릭 시 로그인 체크 */}
        <LikeButton message={message} />

        {/* 답장 버튼 - 항상 표시, 클릭 시 로그인 체크 */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleActionWithAuth(() => startReply(message.id))}
          className="text-xs"
          aria-label="답장"
        >
          <MessageSquare className="w-4 h-4" />
        </Button>

        {/* 삭제 버튼 - 로그인 상태이고 본인 메시지일 때만 표시 */}
        {authState.isAuthenticated && isMine && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
            className="text-xs text-red-600 hover:text-red-700"
            aria-label="삭제"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* 삭제 확인 다이얼로그 */}
      {authState.isAuthenticated && isMine && (
        <DeleteConfirmDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          onConfirm={() => deleteMessage(message.id)}
        />
      )}
    </>
  );
}
