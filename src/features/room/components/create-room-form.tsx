'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  CreateRoomRequestSchema,
  type CreateRoomRequest,
} from '@/features/room/lib/dto';
import { useCreateRoom } from '@/features/room/hooks/useCreateRoom';

type CreateRoomFormProps = {
  onCancel: () => void;
};

export const CreateRoomForm = ({ onCancel }: CreateRoomFormProps) => {
  const router = useRouter();
  const createRoomMutation = useCreateRoom();

  const form = useForm<CreateRoomRequest>({
    resolver: zodResolver(CreateRoomRequestSchema),
    defaultValues: { name: '' },
  });

  const onSubmit = async (data: CreateRoomRequest) => {
    try {
      const room = await createRoomMutation.mutateAsync(data.name);
      router.push(`/room/${room.id}`);
    } catch (error) {
      // 에러 메시지는 hook에서 자동으로 처리되고 폼 에러로 표시됨
      const errorMessage =
        error instanceof Error ? error.message : '채팅방 생성에 실패했습니다';
      form.setError('name', { message: errorMessage });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>채팅방 이름</FormLabel>
              <FormControl>
                <Input
                  placeholder="채팅방 이름을 입력해주세요"
                  {...field}
                  maxLength={100}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2">
          <Button
            type="submit"
            disabled={createRoomMutation.isPending}
            className="flex-1"
          >
            {createRoomMutation.isPending ? '생성 중...' : '추가'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={createRoomMutation.isPending}
            className="flex-1"
          >
            취소
          </Button>
        </div>
      </form>
    </Form>
  );
};
