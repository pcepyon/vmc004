'use client';

import type { Message } from '../types/state';

interface ReplyPreviewProps {
  replyTo: Message['reply_to'];
}

export function ReplyPreview({ replyTo }: ReplyPreviewProps) {
  if (!replyTo) return null;

  return (
    <div className="bg-gray-100 px-2 py-1 rounded text-xs mb-1 border-l-2 border-blue-400">
      <p className="text-gray-600 font-medium">
        {replyTo.sender.nickname}에게 답장
      </p>
      <p className="text-gray-700 truncate">
        {replyTo.content}
      </p>
    </div>
  );
}
