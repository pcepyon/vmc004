import { apiClient } from '@/lib/remote/api-client';
import type {
  RoomResponse,
  MessageItem,
  MessagesResponse,
  CreateMessageBody,
  ToggleLikeResponse,
} from '../backend/schema';

export const chatRoomApi = {
  /**
   * 채팅방 정보 조회
   */
  getRoomInfo: (roomId: string) =>
    apiClient.get<RoomResponse>(`/api/rooms/${roomId}`),

  /**
   * 메시지 목록 조회
   */
  getMessages: (roomId: string) =>
    apiClient.get<MessagesResponse>(`/api/rooms/${roomId}/messages`),

  /**
   * 메시지 전송
   */
  sendMessage: (roomId: string, body: CreateMessageBody) =>
    apiClient.post<MessageItem>(`/api/rooms/${roomId}/messages`, body),

  /**
   * 메시지 삭제
   */
  deleteMessage: (messageId: string) =>
    apiClient.delete<void>(`/api/messages/${messageId}`),

  /**
   * 좋아요 토글
   */
  toggleLike: (messageId: string) =>
    apiClient.post<ToggleLikeResponse>(`/api/messages/${messageId}/like`),
};
