'use client';

import { LogOut, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useLogout } from '@/features/auth/hooks/useLogout';

export const ProfileActions = () => {
  const { toast } = useToast();
  const { mutate: logout, isPending } = useLogout();

  const handleLogout = () => {
    logout(undefined, {
      onError: (error) => {
        toast({
          variant: 'destructive',
          title: '로그아웃 실패',
          description: error.message,
        });
      },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>계정 관리</CardTitle>
      </CardHeader>
      <CardContent>
        <Button
          variant="destructive"
          className="w-full"
          onClick={handleLogout}
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="mr-2 h-4 w-4" />
          )}
          로그아웃
        </Button>
      </CardContent>
    </Card>
  );
};
