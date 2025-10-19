'use client';

import { useChatRoomState } from '../hooks/use-chat-room-state';
import { useChatRoomActions } from '../hooks/use-chat-room-actions';
import { LikeButton } from './like-button';
import { DeleteConfirmDialog } from './delete-confirm-dialog';
import { Button } from '@/components/ui/button';
import { MessageSquare, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { Message } from '../types/state';

interface MessageActionsProps {
  message: Message;
}

export function MessageActions({ message }: MessageActionsProps) {
  const { authState, myMessageIds } = useChatRoomState();
  const { startReply, deleteMessage } = useChatRoomActions();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const isMine = myMessageIds.has(message.id);

  if (!authState.isAuthenticated) {
    return null;
  }

  return (
    <>
      <div className="flex items-center gap-2 mt-1">
        <LikeButton message={message} />

        <Button
          variant="ghost"
          size="sm"
          onClick={() => startReply(message.id)}
          className="text-xs"
          aria-label="답장"
        >
          <MessageSquare className="w-4 h-4" />
        </Button>

        {isMine && (
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

      {isMine && (
        <DeleteConfirmDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          onConfirm={() => deleteMessage(message.id)}
        />
      )}
    </>
  );
}
