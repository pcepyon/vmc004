import { createMiddleware } from 'hono/factory';
import type { AppEnv } from '@/backend/hono/context';

/**
 * 현재 사용자 정보를 context에 주입하는 미들웨어
 * Authorization 헤더에서 Bearer 토큰을 추출하여 Supabase에 검증
 */
export const withAuth = () =>
  createMiddleware<AppEnv>(async (c, next) => {
    try {
      const supabase = c.get('supabase');
      const authHeader = c.req.header('Authorization');

      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.slice(7);

        // 토큰으로 사용자 정보 조회
        const {
          data: { user },
        } = await supabase.auth.getUser(token);

        if (user) {
          c.set('user', {
            id: user.id,
            email: user.email,
          });
        }
      }
    } catch (error) {
      // 인증 실패는 무시 - user는 null로 유지
    }

    await next();
  });
