-- Migration: create VMC Chat schema
-- Description: 채팅방, 메시지, 좋아요 기능을 위한 전체 데이터베이스 스키마 생성

-- ============================================================
-- 1. 확장 기능 활성화
-- ============================================================
create extension if not exists "pgcrypto";

-- ============================================================
-- 2. 테이블 생성
-- ============================================================

-- 2.1. 사용자 프로필 테이블
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  nickname text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is '사용자 프로필 정보 (Supabase Auth와 1:1 관계)';
comment on column public.profiles.user_id is 'Supabase Auth 사용자 ID';
comment on column public.profiles.email is '사용자 이메일';
comment on column public.profiles.nickname is '사용자 닉네임';
comment on column public.profiles.created_at is '가입일시';
comment on column public.profiles.updated_at is '최종 수정일시';

-- 2.2. 채팅방 테이블
create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(name) <= 100),
  creator_id uuid not null references public.profiles(user_id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.rooms is '채팅방 정보';
comment on column public.rooms.id is '채팅방 고유 ID';
comment on column public.rooms.name is '채팅방 이름 (최대 100자)';
comment on column public.rooms.creator_id is '채팅방 생성자 ID';
comment on column public.rooms.created_at is '생성일시';
comment on column public.rooms.updated_at is '최종 수정일시';

-- 2.3. 메시지 테이블
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  sender_id uuid not null references public.profiles(user_id) on delete cascade,
  content text not null,
  reply_to_id uuid references public.messages(id) on delete set null,
  created_at timestamptz not null default now()
);

comment on table public.messages is '채팅 메시지';
comment on column public.messages.id is '메시지 고유 ID';
comment on column public.messages.room_id is '소속 채팅방 ID';
comment on column public.messages.sender_id is '발신자 ID';
comment on column public.messages.content is '메시지 내용';
comment on column public.messages.reply_to_id is '답장 대상 메시지 ID (선택)';
comment on column public.messages.created_at is '전송일시';

-- 2.4. 좋아요 테이블
create table if not exists public.likes (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.messages(id) on delete cascade,
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(message_id, user_id)
);

comment on table public.likes is '메시지 좋아요';
comment on column public.likes.id is '좋아요 고유 ID';
comment on column public.likes.message_id is '대상 메시지 ID';
comment on column public.likes.user_id is '좋아요 누른 사용자 ID';
comment on column public.likes.created_at is '좋아요 생성일시';

-- ============================================================
-- 3. 인덱스 생성
-- ============================================================

-- rooms 테이블 인덱스
create index if not exists idx_rooms_creator_id on public.rooms(creator_id);
create index if not exists idx_rooms_updated_at on public.rooms(updated_at desc);

-- messages 테이블 인덱스
create index if not exists idx_messages_room_id_created_at on public.messages(room_id, created_at asc);
create index if not exists idx_messages_sender_id on public.messages(sender_id);
create index if not exists idx_messages_reply_to_id on public.messages(reply_to_id);

-- likes 테이블 인덱스
create index if not exists idx_likes_message_id on public.likes(message_id);

-- ============================================================
-- 4. 트리거 및 함수 생성
-- ============================================================

-- updated_at 자동 갱신 함수
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- profiles 테이블 트리거
drop trigger if exists update_profiles_updated_at on public.profiles;
create trigger update_profiles_updated_at
  before update on public.profiles
  for each row
  execute function update_updated_at_column();

-- rooms 테이블 트리거
drop trigger if exists update_rooms_updated_at on public.rooms;
create trigger update_rooms_updated_at
  before update on public.rooms
  for each row
  execute function update_updated_at_column();

-- ============================================================
-- 5. RLS 비활성화
-- ============================================================

alter table if exists public.profiles disable row level security;
alter table if exists public.rooms disable row level security;
alter table if exists public.messages disable row level security;
alter table if exists public.likes disable row level security;
