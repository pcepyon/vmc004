'use client';

import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import { useLogout } from '@/features/auth/hooks/useLogout';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';

export const RoomListHeader = () => {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useCurrentUser();
  const { logout, isLoading: isLoggingOut } = useLogout();

  const handleLoginClick = () => {
    router.push('/login');
  };

  const handleMyPageClick = () => {
    router.push('/mypage');
  };

  const handleLogoutClick = async () => {
    await logout();
  };

  if (isLoading) {
    return (
      <header className="flex items-center justify-between border-b border-slate-800 bg-slate-950/60 px-6 py-4">
        <h1 className="text-2xl font-semibold text-slate-100">
          VMC Chat
        </h1>
        <div className="h-10 w-32 animate-pulse rounded-lg bg-slate-800" />
      </header>
    );
  }

  return (
    <header className="flex items-center justify-between border-b border-slate-800 bg-slate-950/60 px-6 py-4">
      <h1 className="text-2xl font-semibold text-slate-100">VMC Chat</h1>

      {isAuthenticated ? (
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-300">{user?.email}</span>
          <Button
            onClick={handleMyPageClick}
            variant="outline"
            size="sm"
            className="border-slate-600 bg-slate-800 text-slate-100 hover:bg-slate-700"
          >
            <User className="mr-2 h-4 w-4" />
            마이페이지
          </Button>
          <Button
            onClick={handleLogoutClick}
            disabled={isLoggingOut}
            variant="outline"
            size="sm"
            className="border-slate-600 bg-slate-800 text-slate-100 hover:bg-slate-700"
          >
            <LogOut className="mr-2 h-4 w-4" />
            {isLoggingOut ? '로그아웃 중...' : '로그아웃'}
          </Button>
        </div>
      ) : (
        <Button
          onClick={handleLoginClick}
          variant="default"
          size="sm"
          className="bg-blue-600 text-white hover:bg-blue-700"
        >
          로그인
        </Button>
      )}
    </header>
  );
};
