'use client';

import { useChatRoomState } from '../hooks/use-chat-room-state';
import { MessageBubble } from './message-bubble';
import { MessageActions } from './message-actions';
import { ReplyPreview } from './reply-preview';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import type { Message } from '../types/state';

interface MessageItemProps {
  message: Message;
}

export function MessageItem({ message }: MessageItemProps) {
  const { authState, myMessageIds } = useChatRoomState();
  const isMine = myMessageIds.has(message.id);

  const timeLabel = formatDistanceToNow(new Date(message.created_at), {
    addSuffix: true,
    locale: ko,
  });

  return (
    <div className={`flex gap-2 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* 아바타 (타인만) */}
      {!isMine && (
        <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0 flex items-center justify-center text-xs font-semibold text-white">
          {message.sender.nickname.charAt(0).toUpperCase()}
        </div>
      )}

      <div className={`flex-1 ${isMine ? 'items-end' : 'items-start'} flex flex-col`}>
        {/* 발신자 닉네임 (타인만) */}
        {!isMine && (
          <p className="text-xs font-medium mb-1 text-gray-600">
            {message.sender.nickname}
          </p>
        )}

        {/* 답장 대상 미리보기 */}
        {message.reply_to && <ReplyPreview replyTo={message.reply_to} />}

        {/* 메시지 말풍선 */}
        <MessageBubble content={message.content} isMine={isMine} />

        {/* 시간 및 액션 */}
        <div className="flex items-center gap-2 mt-1">
          <p className="text-xs text-gray-500">{timeLabel}</p>
          <MessageActions message={message} />
        </div>
      </div>
    </div>
  );
}
