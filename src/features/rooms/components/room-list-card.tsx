'use client';

import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import type { RoomItem } from '@/features/rooms/lib/dto';
import { MessageCircle, User } from 'lucide-react';

type RoomListCardProps = {
  room: RoomItem;
};

export const RoomListCard = ({ room }: RoomListCardProps) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/room/${room.id}`);
  };

  const relativeTime = formatDistanceToNow(new Date(room.updatedAt), {
    addSuffix: true,
    locale: ko,
  });

  return (
    <article
      onClick={handleClick}
      className="cursor-pointer rounded-xl border border-slate-800 bg-slate-950/60 p-4 transition-all hover:border-slate-700 hover:bg-slate-900/60"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-slate-100">{room.name}</h3>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <User className="h-4 w-4" />
            <span>{room.creatorNickname}</span>
          </div>
        </div>
        <time className="text-xs text-slate-500">{relativeTime}</time>
      </div>
    </article>
  );
};
