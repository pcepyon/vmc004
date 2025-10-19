'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { CreateRoomForm } from '@/features/room/components/create-room-form';
import { Button } from '@/components/ui/button';

export default function CreateRoomPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push('/login');
        return;
      }

      setIsAuthenticated(true);
    };

    checkAuth();
  }, [router]);

  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>로딩 중...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => router.back()}
          >
            뒤로가기
          </Button>
          <h1 className="text-2xl font-bold">채팅방 생성</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow p-6">
          <CreateRoomForm onCancel={() => router.push('/')} />
        </div>
      </div>
    </main>
  );
}
