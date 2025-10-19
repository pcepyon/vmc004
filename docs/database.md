# VMC Chat - 데이터베이스 스키마 및 데이터플로우

## 데이터플로우 개요

### 1. 회원가입 및 프로필 생성 플로우
```
사용자 입력 (이메일/비밀번호)
  → Supabase Auth 회원가입
  → auth.users 테이블에 사용자 생성
  → public.profiles 테이블에 프로필 생성
    - user_id: auth.users.id
    - email: 입력된 이메일
    - nickname: 이메일 @ 앞부분
    - created_at: 현재 시각
```

### 2. 채팅방 생성 및 조회 플로우
```
채팅방 생성:
  사용자 입력 (채팅방 이름)
  → public.rooms 테이블에 레코드 생성
    - name: 입력된 채팅방 이름
    - creator_id: 현재 로그인 사용자 UUID
    - created_at, updated_at: 현재 시각

채팅방 목록 조회:
  public.rooms 테이블에서 전체 조회
  → LEFT JOIN public.profiles ON rooms.creator_id = profiles.user_id
  → ORDER BY rooms.updated_at DESC
  → 반환: 채팅방 ID, 이름, 생성자 닉네임, 최종 수정일시
```

### 3. 메시지 송수신 플로우
```
메시지 전송:
  사용자 입력 (메시지 내용, 답장 대상 ID - 선택)
  → public.messages 테이블에 레코드 생성
    - room_id: 현재 채팅방 ID
    - sender_id: 현재 로그인 사용자 UUID
    - content: 입력된 메시지 내용
    - reply_to_id: 답장 대상 메시지 ID (선택)
    - created_at: 현재 시각
  → public.rooms 테이블의 updated_at 갱신

메시지 조회 (Polling):
  public.messages 테이블에서 room_id로 필터링
  → LEFT JOIN public.profiles ON messages.sender_id = profiles.user_id
  → LEFT JOIN public.messages AS reply_msg ON messages.reply_to_id = reply_msg.id
  → LEFT JOIN public.profiles AS reply_sender ON reply_msg.sender_id = reply_sender.user_id
  → LEFT JOIN (
      SELECT message_id, COUNT(*) as like_count
      FROM public.likes
      GROUP BY message_id
    ) AS like_counts ON messages.id = like_counts.message_id
  → ORDER BY messages.created_at ASC
  → 반환: 메시지 ID, 내용, 발신자 닉네임, 전송 시간, 답장 대상 정보, 좋아요 수
```

### 4. 좋아요 토글 플로우
```
좋아요 추가:
  public.likes 테이블 조회 (message_id, user_id로 필터)
  → 좋아요 없음: public.likes 테이블에 레코드 생성
    - message_id: 대상 메시지 ID
    - user_id: 현재 로그인 사용자 UUID
    - created_at: 현재 시각
  → 좋아요 있음: public.likes 테이블에서 레코드 삭제

좋아요 수 조회:
  public.likes 테이블에서 message_id로 그룹화
  → COUNT(*) 집계
  → 반환: 메시지별 좋아요 수
```

### 5. 프로필 관리 플로우
```
프로필 조회:
  public.profiles 테이블에서 user_id로 조회
  → 반환: 이메일, 닉네임, 가입일

닉네임 변경:
  사용자 입력 (새 닉네임)
  → public.profiles 테이블의 nickname 필드 업데이트
  → updated_at 자동 갱신 (트리거)
```

---

## 데이터베이스 스키마

### ERD 개념도
```
auth.users (Supabase Auth 관리)
    ↓ 1:1
public.profiles
    ↓ 1:N
    ├─ public.rooms (생성자)
    ├─ public.messages (발신자)
    └─ public.likes (좋아요 누른 사용자)

public.rooms
    ↓ 1:N
public.messages
    ↓ 1:N (self-reference)
    ├─ public.messages (답장 대상)
    └─ public.likes
```

---

## 테이블 정의

### 1. public.profiles
사용자 프로필 정보를 저장합니다.

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| user_id | UUID | PRIMARY KEY, REFERENCES auth.users(id) ON DELETE CASCADE | Supabase Auth 사용자 ID |
| email | TEXT | NOT NULL | 사용자 이메일 |
| nickname | TEXT | NOT NULL | 사용자 닉네임 |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 가입일시 |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 최종 수정일시 |

**인덱스:**
- PRIMARY KEY: user_id

---

### 2. public.rooms
채팅방 정보를 저장합니다.

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | 채팅방 고유 ID |
| name | TEXT | NOT NULL, CHECK (LENGTH(name) <= 100) | 채팅방 이름 (최대 100자) |
| creator_id | UUID | NOT NULL, REFERENCES public.profiles(user_id) ON DELETE CASCADE | 채팅방 생성자 ID |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 생성일시 |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 최종 수정일시 |

**인덱스:**
- PRIMARY KEY: id
- INDEX: creator_id
- INDEX: updated_at (채팅방 목록 정렬용)

---

### 3. public.messages
채팅 메시지를 저장합니다.

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | 메시지 고유 ID |
| room_id | UUID | NOT NULL, REFERENCES public.rooms(id) ON DELETE CASCADE | 소속 채팅방 ID |
| sender_id | UUID | NOT NULL, REFERENCES public.profiles(user_id) ON DELETE CASCADE | 발신자 ID |
| content | TEXT | NOT NULL | 메시지 내용 |
| reply_to_id | UUID | NULL, REFERENCES public.messages(id) ON DELETE SET NULL | 답장 대상 메시지 ID (선택) |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 전송일시 |

**인덱스:**
- PRIMARY KEY: id
- INDEX: room_id, created_at (채팅방별 메시지 조회 및 정렬용)
- INDEX: sender_id
- INDEX: reply_to_id

---

### 4. public.likes
메시지 좋아요 정보를 저장합니다.

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | 좋아요 고유 ID |
| message_id | UUID | NOT NULL, REFERENCES public.messages(id) ON DELETE CASCADE | 대상 메시지 ID |
| user_id | UUID | NOT NULL, REFERENCES public.profiles(user_id) ON DELETE CASCADE | 좋아요 누른 사용자 ID |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 좋아요 생성일시 |

**제약조건:**
- UNIQUE(message_id, user_id): 동일 사용자의 동일 메시지 중복 좋아요 방지

**인덱스:**
- PRIMARY KEY: id
- UNIQUE INDEX: message_id, user_id
- INDEX: message_id (좋아요 수 집계용)

---

## 트리거 및 함수

### 1. updated_at 자동 갱신 트리거
profiles와 rooms 테이블의 updated_at 컬럼을 자동으로 갱신합니다.

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- profiles 테이블 트리거
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- rooms 테이블 트리거
CREATE TRIGGER update_rooms_updated_at
  BEFORE UPDATE ON public.rooms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

## 보안 정책

### RLS (Row Level Security) 비활성화
모든 테이블에서 RLS를 비활성화합니다. 접근 제어는 백엔드 레이어(Hono)에서 service-role 키로 처리합니다.

```sql
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes DISABLE ROW LEVEL SECURITY;
```

---

## 주요 쿼리 패턴

### 채팅방 목록 조회 (최신 수정일순)
```sql
SELECT
  r.id,
  r.name,
  r.created_at,
  r.updated_at,
  p.nickname AS creator_nickname
FROM public.rooms r
LEFT JOIN public.profiles p ON r.creator_id = p.user_id
ORDER BY r.updated_at DESC;
```

### 채팅방 메시지 조회 (시간순)
```sql
SELECT
  m.id,
  m.content,
  m.created_at,
  p.nickname AS sender_nickname,
  m.sender_id,
  m.reply_to_id,
  reply_msg.content AS reply_content,
  reply_sender.nickname AS reply_sender_nickname,
  COALESCE(like_counts.like_count, 0) AS like_count
FROM public.messages m
LEFT JOIN public.profiles p ON m.sender_id = p.user_id
LEFT JOIN public.messages reply_msg ON m.reply_to_id = reply_msg.id
LEFT JOIN public.profiles reply_sender ON reply_msg.sender_id = reply_sender.user_id
LEFT JOIN (
  SELECT message_id, COUNT(*) as like_count
  FROM public.likes
  GROUP BY message_id
) like_counts ON m.id = like_counts.message_id
WHERE m.room_id = $1
ORDER BY m.created_at ASC;
```

### 사용자의 특정 메시지 좋아요 여부 확인
```sql
SELECT EXISTS(
  SELECT 1 FROM public.likes
  WHERE message_id = $1 AND user_id = $2
) AS has_liked;
```

### 메시지 전송 시 채팅방 updated_at 갱신
```sql
UPDATE public.rooms
SET updated_at = NOW()
WHERE id = $1;
```

---

## 데이터 볼륨 추정

- **Profiles**: 사용자 수 (예: 1만명 = 1만 레코드)
- **Rooms**: 채팅방 수 (예: 1천개 = 1천 레코드)
- **Messages**: 채팅방당 평균 1만 메시지 × 1천 채팅방 = 1천만 레코드
- **Likes**: 메시지당 평균 5개 좋아요 × 1천만 메시지 = 5천만 레코드

### 인덱스 최적화 포인트
- `messages` 테이블의 `(room_id, created_at)` 복합 인덱스로 채팅방별 메시지 조회 성능 향상
- `likes` 테이블의 `(message_id, user_id)` UNIQUE 복합 인덱스로 중복 좋아요 방지 및 조회 성능 향상

---

## 마이그레이션 전략

1. **0002_create_vmc_chat_schema.sql**: 전체 스키마 생성
   - pgcrypto 확장 활성화
   - 테이블 생성 (profiles, rooms, messages, likes)
   - 인덱스 생성
   - 트리거 및 함수 생성
   - RLS 비활성화

2. **향후 마이그레이션**:
   - 필요 시 컬럼 추가/삭제
   - 인덱스 최적화
   - 제약조건 변경
