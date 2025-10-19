'use client';

import { useRouter } from 'next/navigation';
import { useRoomListQuery } from '@/features/rooms/hooks/useRoomListQuery';
import { RoomListCard } from './room-list-card';
import { Button } from '@/components/ui/button';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import { Plus, Loader2, AlertCircle } from 'lucide-react';

export const RoomListContainer = () => {
  const router = useRouter();
  const { isAuthenticated } = useCurrentUser();
  const { data, status, error } = useRoomListQuery();

  const handleCreateRoom = () => {
    router.push('/create-room');
  };

  if (status === 'pending') {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-slate-400" />
          <p className="mt-4 text-sm text-slate-400">
            채팅방 목록을 불러오는 중...
          </p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-rose-400" />
          <p className="mt-4 text-sm text-rose-300">
            {error instanceof Error
              ? error.message
              : '채팅방 목록을 불러올 수 없습니다.'}
          </p>
        </div>
      </div>
    );
  }

  const rooms = data ?? [];

  return (
    <div className="flex flex-col gap-6">
      {rooms.length === 0 ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
          <p className="text-sm text-slate-400">
            아직 채팅방이 없습니다.
          </p>
          {isAuthenticated && (
            <Button
              onClick={handleCreateRoom}
              variant="default"
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              첫 채팅방 만들기
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => (
              <RoomListCard key={room.id} room={room} />
            ))}
          </div>
          {isAuthenticated && (
            <div className="flex justify-center">
              <Button
                onClick={handleCreateRoom}
                variant="default"
                size="lg"
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                <Plus className="mr-2 h-5 w-5" />
                채팅방 추가하기
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
