'use client';

import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ProfileResponse } from '@/features/profile/lib/dto';

type ProfileHeaderProps = {
  profile: ProfileResponse;
};

export const ProfileHeader = ({ profile }: ProfileHeaderProps) => {
  const formattedDate = format(new Date(profile.createdAt), 'PPP', { locale: ko });

  return (
    <Card>
      <CardHeader>
        <CardTitle>프로필 정보</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">이메일</p>
          <p className="text-base font-medium">{profile.email}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">현재 닉네임</p>
          <p className="text-base font-medium">{profile.nickname}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">가입일</p>
          <p className="text-base font-medium">{formattedDate}</p>
        </div>
      </CardContent>
    </Card>
  );
};
