import { initTRPC } from '@trpc/server';
import { z } from 'zod';

const t = initTRPC.create();

export const router = t.router;
export const publicProcedure = t.procedure;

export const appRouter = router({
 health: publicProcedure.query(() => ({ status: 'ok' })),
});

export type AppRouter = typeof appRouter;
