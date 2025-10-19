'use client';

import { RoomListHeader } from '@/features/rooms/components/room-list-header';
import { RoomListContainer } from '@/features/rooms/components/room-list-container';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <RoomListHeader />
      <main className="container mx-auto px-4 py-8">
        <RoomListContainer />
      </main>
    </div>
  );
}
