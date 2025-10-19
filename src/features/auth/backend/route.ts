import type { Hono } from 'hono';
import type { AppEnv } from '@/backend/hono/context';
import { getSupabase, getLogger } from '@/backend/hono/context';
import { respond, success, failure } from '@/backend/http/response';

export function registerAuthRoutes(app: Hono<AppEnv>) {
  // POST /auth/logout - 로그아웃
  app.post('/auth/logout', async (c) => {
    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const { error } = await supabase.auth.signOut();

    if (error) {
      logger.error('Logout failed', error.message);
      return respond(
        c,
        failure(500, 'LOGOUT_FAILED', 'Failed to logout', error.message),
      );
    }

    return respond(c, success({ message: 'Logged out successfully' }));
  });
}
