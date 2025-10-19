import { Hono } from 'hono';
import { errorBoundary } from '@/backend/middleware/error';
import { withAppContext } from '@/backend/middleware/context';
import { withSupabase } from '@/backend/middleware/supabase';
import { withAuth } from '@/backend/middleware/auth';
import { registerExampleRoutes } from '@/features/example/backend/route';
import { registerRoomRoutes } from '@/features/rooms/backend/route';
import { registerRoomRoutes as registerCreateRoomRoutes } from '@/features/room/backend/route';
import { registerChatRoomRoutes } from '@/features/chat-room/backend/route';
import { registerProfileRoutes } from '@/features/profile/backend/route';
import { registerAuthRoutes } from '@/features/auth/backend/route';
import type { AppEnv } from '@/backend/hono/context';

let singletonApp: Hono<AppEnv> | null = null;

export const createHonoApp = () => {
  if (singletonApp) {
    return singletonApp;
  }

  const app = new Hono<AppEnv>();

  app.use('*', errorBoundary());
  app.use('*', withAppContext());
  app.use('*', withSupabase());
  app.use('*', withAuth());

  registerExampleRoutes(app);
  registerRoomRoutes(app);
  registerCreateRoomRoutes(app);
  registerChatRoomRoutes(app);
  registerProfileRoutes(app);
  registerAuthRoutes(app);

  singletonApp = app;

  return app;
};
