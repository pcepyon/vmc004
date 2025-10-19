'use client';

import { AuthGuard } from '@/components/guards/auth-guard';
import { ProfileHeader } from '@/features/profile/components/profile-header';
import { NicknameForm } from '@/features/profile/components/nickname-form';
import { ProfileActions } from '@/features/profile/components/profile-actions';
import { useProfileQuery } from '@/features/profile/hooks/useProfileQuery';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const MyPageContent = () => {
  const { data: profile, isLoading, error } = useProfileQuery();

  if (isLoading) {
    return (
      <div className="container max-w-2xl mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold">마이페이지</h1>
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-2xl mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>프로필 조회 실패</AlertTitle>
          <AlertDescription>
            {error.message ?? '프로필 정보를 불러올 수 없습니다'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="container max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">마이페이지</h1>
      <ProfileHeader profile={profile} />
      <NicknameForm />
      <ProfileActions />
    </div>
  );
};

export default function MyPage() {
  return (
    <AuthGuard>
      <MyPageContent />
    </AuthGuard>
  );
}
