export const validateRoomName = (name: string): string | null => {
  if (name.trim().length === 0) {
    return '채팅방 이름을 입력해주세요';
  }
  if (name.length > 100) {
    return '채팅방 이름은 100자 이하로 입력해주세요';
  }
  return null;
};
