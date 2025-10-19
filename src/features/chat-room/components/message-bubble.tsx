'use client';

interface MessageBubbleProps {
  content: string;
  isMine: boolean;
}

export function MessageBubble({ content, isMine }: MessageBubbleProps) {
  return (
    <div
      className={`px-3 py-2 rounded-lg max-w-xs ${
        isMine
          ? 'bg-blue-500 text-white rounded-br-none'
          : 'bg-gray-200 text-black rounded-bl-none'
      }`}
    >
      <p className="break-words text-sm">{content}</p>
    </div>
  );
}
