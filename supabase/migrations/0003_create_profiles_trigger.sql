-- Migration: create profiles trigger for new users
-- Description: auth.users INSERT 시 자동으로 profiles 레코드 생성 (프로필 자동 생성 트리거)

-- ============================================================
-- 프로필 자동 생성 함수
-- ============================================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (user_id, email, nickname, created_at, updated_at)
  values (
    new.id,
    new.email,
    split_part(new.email, '@', 1),
    now(),
    now()
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- ============================================================
-- auth.users INSERT 트리거
-- ============================================================

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
