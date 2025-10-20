import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { env } from "@/constants/env";
import type { Database } from "./types";

/**
 * Server Component용 Supabase 클라이언트 생성 (읽기 전용)
 *
 * Server Component에서는 쿠키를 읽을 수만 있고 설정할 수 없습니다.
 * 세션 갱신이나 쿠키 수정이 필요한 경우:
 * - Middleware에서 세션 갱신
 * - Route Handler나 Server Action에서 쿠키 설정
 *
 * @see https://supabase.com/docs/guides/auth/server-side/nextjs
 */
export const createSupabaseServerClient = async (): Promise<
  SupabaseClient<Database>
> => {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          // Server Component에서는 쿠키 설정을 무시
          // Next.js App Router에서 Server Component는 읽기 전용 쿠키만 지원
          // 쿠키 설정이 필요한 경우 Route Handler나 Server Action 사용 필요
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              // cookieStore.set은 Route Handler/Server Action에서만 동작
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server Component에서 쿠키 설정 시도 시 에러 무시
            // 이는 정상적인 동작이며, 세션은 middleware에서 갱신됨
          }
        },
      },
    }
  );
};
