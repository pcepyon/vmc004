'use client';

import { useChatRoomState } from '../hooks/use-chat-room-state';
import { useChatRoomActions } from '../hooks/use-chat-room-actions';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ReplyBar() {
  const { replyMode } = useChatRoomState();
  const { cancelReply } = useChatRoomActions();

  if (!replyMode.isReplying || !replyMode.targetMessage) {
    return null;
  }

  return (
    <div className="bg-blue-50 px-4 py-2 flex items-center gap-2 border-l-2 border-blue-400">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-blue-900">
          {replyMode.targetMessage.sender.nickname}에게 답장
        </p>
        <p className="text-xs text-blue-700 truncate">
          {replyMode.targetMessage.content}
        </p>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={cancelReply}
        className="text-xs flex-shrink-0"
        aria-label="답장 취소"
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
}
