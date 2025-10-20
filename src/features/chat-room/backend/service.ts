import { SupabaseClient } from '@supabase/supabase-js';
import { failure, success, HandlerResult } from '@/backend/http/response';
import {
  RoomResponse,
  RoomResponseSchema,
  MessageItem,
  MessageItemSchema,
  MessagesResponseSchema,
  CreateMessageBody,
} from './schema';
import { chatRoomErrorCodes } from './error';

export type ChatRoomServiceError = typeof chatRoomErrorCodes[keyof typeof chatRoomErrorCodes];

export const chatRoomService = {
  /**
   * 채팅방 정보 조회
   */
  async getRoomById(
    client: SupabaseClient,
    roomId: string
  ): Promise<HandlerResult<RoomResponse, ChatRoomServiceError>> {
    try {
      const { data, error } = await client
        .from('rooms')
        .select('*')
        .eq('id', roomId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // 레코드 없음
          return failure(404, chatRoomErrorCodes.roomNotFound, '채팅방을 찾을 수 없습니다');
        }
        return failure(500, chatRoomErrorCodes.roomFetchError, '채팅방 정보를 불러올 수 없습니다');
      }

      // Supabase가 반환하는 데이터를 그대로 사용 (검증 제거)
      return success(data as RoomResponse);
    } catch (error) {
      return failure(500, chatRoomErrorCodes.roomFetchError, "채팅방 정보를 불러올 수 없습니다");
    }
  },

  /**
   * 메시지 목록 조회 (발신자 정보, 답장 대상, 좋아요 포함)
   */
  async getMessagesByRoomId(
    client: SupabaseClient,
    roomId: string,
    userId: string | null
  ): Promise<HandlerResult<MessageItem[], ChatRoomServiceError>> {
    try {
      // 메시지 조회
      const { data: messages, error: messagesError } = await client
        .from('messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });

      if (messagesError) {
        return failure(500, chatRoomErrorCodes.messageFetchError, "메시지를 불러올 수 없습니다");
      }

      if (!messages || messages.length === 0) {
        return success([]);
      }

      // 발신자 정보 조회
      const senderIds = [...new Set(messages.map((m) => m.sender_id))];
      const { data: senders, error: sendersError } = await client
        .from('profiles')
        .select('user_id, nickname')
        .in('user_id', senderIds);

      if (sendersError) {
        return failure(500, chatRoomErrorCodes.messageFetchError, "메시지를 불러올 수 없습니다");
      }

      const senderMap = new Map(
        (senders || []).map((s) => [s.user_id, { id: s.user_id, nickname: s.nickname }])
      );

      // 답장 대상 메시지 ID 추출
      const replyToIds = [...new Set(messages.map((m) => m.reply_to_id).filter(Boolean))];

      let replyMessages: any[] = [];
      if (replyToIds.length > 0) {
        const { data: replies, error: repliesError } = await client
          .from('messages')
          .select('id, content, sender_id')
          .in('id', replyToIds);

        if (!repliesError && replies) {
          replyMessages = replies;
        }
      }

      // 좋아요 수 집계
      const messageIds = messages.map((m) => m.id);
      const { data: likes, error: likesError } = await client
        .from('likes')
        .select('message_id, user_id')
        .in('message_id', messageIds);

      if (likesError) {
        return failure(500, chatRoomErrorCodes.messageFetchError, "메시지를 불러올 수 없습니다");
      }

      const likeMap = new Map<string, number>();
      const userLikedMap = new Map<string, boolean>();

      (likes || []).forEach((like) => {
        likeMap.set(like.message_id, (likeMap.get(like.message_id) || 0) + 1);
        if (userId && like.user_id === userId) {
          userLikedMap.set(like.message_id, true);
        }
      });

      // 응답 구성
      const result: MessageItem[] = messages.map((msg) => {
        const sender = senderMap.get(msg.sender_id);
        let replyTo = null;

        if (msg.reply_to_id) {
          const replyMessage = replyMessages.find((r) => r.id === msg.reply_to_id);
          if (replyMessage) {
            const replySender = senderMap.get(replyMessage.sender_id);
            replyTo = {
              id: replyMessage.id,
              content: replyMessage.content,
              sender: replySender || { id: replyMessage.sender_id, nickname: 'Unknown' },
            };
          }
        }

        return {
          id: msg.id,
          room_id: msg.room_id,
          sender_id: msg.sender_id,
          content: msg.content,
          reply_to_id: msg.reply_to_id,
          created_at: msg.created_at,
          sender: sender || { id: msg.sender_id, nickname: 'Unknown' },
          reply_to: replyTo,
          likes_count: likeMap.get(msg.id) || 0,
          is_liked_by_current_user: userId ? userLikedMap.has(msg.id) : false,
        };
      });

      // Supabase가 반환하는 데이터를 그대로 사용 (검증 제거)
      return success(result);
    } catch (error) {
      return failure(500, chatRoomErrorCodes.messageFetchError, "메시지를 불러올 수 없습니다");
    }
  },

  /**
   * 메시지 생성
   */
  async createMessage(
    client: SupabaseClient,
    roomId: string,
    senderId: string,
    body: CreateMessageBody
  ): Promise<HandlerResult<MessageItem, ChatRoomServiceError>> {
    try {
      // 메시지 삽입
      const { data: message, error: messageError } = await client
        .from('messages')
        .insert({
          room_id: roomId,
          sender_id: senderId,
          content: body.content,
          reply_to_id: body.reply_to_id || null,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (messageError) {
        return failure(500, chatRoomErrorCodes.messageCreateError, "메시지 전송에 실패했습니다");
      }

      // 채팅방의 updated_at 갱신
      const { error: roomError } = await client
        .from('rooms')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', roomId);

      if (roomError) {
        return failure(500, chatRoomErrorCodes.messageCreateError, "메시지 전송에 실패했습니다");
      }

      // 발신자 정보 조회
      const { data: sender, error: senderError } = await client
        .from('profiles')
        .select('user_id, nickname')
        .eq('user_id', senderId)
        .single();

      if (senderError) {
        return failure(500, chatRoomErrorCodes.messageCreateError, "메시지 전송에 실패했습니다");
      }

      // 답장 대상 정보 조회 (있는 경우)
      let replyTo = null;
      if (message.reply_to_id) {
        const { data: replyMessage } = await client
          .from('messages')
          .select('id, content, sender_id')
          .eq('id', message.reply_to_id)
          .single();

        if (replyMessage) {
          const { data: replySender } = await client
            .from('profiles')
            .select('user_id, nickname')
            .eq('user_id', replyMessage.sender_id)
            .single();

          replyTo = {
            id: replyMessage.id,
            content: replyMessage.content,
            sender: {
              id: replyMessage.sender_id,
              nickname: replySender?.nickname || 'Unknown',
            },
          };
        }
      }

      const result: MessageItem = {
        id: message.id,
        room_id: message.room_id,
        sender_id: message.sender_id,
        content: message.content,
        reply_to_id: message.reply_to_id,
        created_at: message.created_at,
        sender: {
          id: sender.user_id,
          nickname: sender.nickname,
        },
        reply_to: replyTo,
        likes_count: 0,
        is_liked_by_current_user: false,
      };

      // Supabase가 반환하는 데이터를 그대로 사용 (검증 제거)
      return success(result);
    } catch (error) {
      return failure(500, chatRoomErrorCodes.messageCreateError, "메시지 전송에 실패했습니다");
    }
  },

  /**
   * 메시지 삭제 (작성자만)
   */
  async deleteMessage(
    client: SupabaseClient,
    messageId: string,
    userId: string
  ): Promise<HandlerResult<void, ChatRoomServiceError>> {
    try {
      // 메시지 존재 여부 및 작성자 확인
      const { data: message, error: fetchError } = await client
        .from('messages')
        .select('sender_id')
        .eq('id', messageId)
        .single();

      if (fetchError) {
        return failure(404, chatRoomErrorCodes.messageNotFound, "메시지를 찾을 수 없습니다");
      }

      if (message.sender_id !== userId) {
        return failure(403, chatRoomErrorCodes.unauthorizedDelete, "본인이 작성한 메시지만 삭제할 수 있습니다");
      }

      // 메시지 삭제 (CASCADE로 likes도 삭제됨)
      const { error: deleteError } = await client
        .from('messages')
        .delete()
        .eq('id', messageId);

      if (deleteError) {
        return failure(500, chatRoomErrorCodes.messageDeleteError, "메시지 삭제에 실패했습니다");
      }

      return success(undefined);
    } catch (error) {
      return failure(500, chatRoomErrorCodes.messageDeleteError, "메시지 삭제에 실패했습니다");
    }
  },

  /**
   * 좋아요 토글 (추가/취소)
   */
  async toggleLike(
    client: SupabaseClient,
    messageId: string,
    userId: string
  ): Promise<HandlerResult<{ liked: boolean }, ChatRoomServiceError>> {
    try {
      // 기존 좋아요 확인
      const { data: existingLike, error: fetchError } = await client
        .from('likes')
        .select('id')
        .eq('message_id', messageId)
        .eq('user_id', userId)
        .single();

      if (!fetchError && existingLike) {
        // 좋아요 취소
        const { error: deleteError } = await client
          .from('likes')
          .delete()
          .eq('message_id', messageId)
          .eq('user_id', userId);

        if (deleteError) {
          return failure(500, chatRoomErrorCodes.likeToggleError, "좋아요 처리에 실패했습니다");
        }

        return success({ liked: false });
      }

      // 좋아요 추가
      const { error: insertError } = await client
        .from('likes')
        .insert({
          message_id: messageId,
          user_id: userId,
          created_at: new Date().toISOString(),
        });

      if (insertError) {
        // UNIQUE 제약 위반 (이미 좋아요 함)
        if (insertError.code === '23505') {
          return success({ liked: true });
        }
        return failure(500, chatRoomErrorCodes.likeToggleError, "좋아요 처리에 실패했습니다");
      }

      return success({ liked: true });
    } catch (error) {
      return failure(500, chatRoomErrorCodes.likeToggleError, "좋아요 처리에 실패했습니다");
    }
  },
};
