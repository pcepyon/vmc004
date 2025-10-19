'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useUpdateNickname } from '@/features/profile/hooks/useUpdateNickname';
import {
  UpdateNicknameRequestSchema,
  type UpdateNicknameRequest,
} from '@/features/profile/lib/dto';

export const NicknameForm = () => {
  const { toast } = useToast();
  const { mutate, isPending } = useUpdateNickname();

  const form = useForm<UpdateNicknameRequest>({
    resolver: zodResolver(UpdateNicknameRequestSchema),
    defaultValues: {
      nickname: '',
    },
  });

  const onSubmit = (data: UpdateNicknameRequest) => {
    mutate(data, {
      onSuccess: () => {
        toast({
          title: '닉네임이 변경되었습니다',
          description: `새 닉네임: ${data.nickname}`,
        });
        form.reset();
      },
      onError: (error) => {
        toast({
          variant: 'destructive',
          title: '닉네임 변경 실패',
          description: error.message,
        });
      },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>닉네임 변경</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nickname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>새 닉네임</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="새 닉네임을 입력하세요"
                      {...field}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              변경 사항 저장
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
