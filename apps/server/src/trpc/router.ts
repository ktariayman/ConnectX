import { initTRPC } from '@trpc/server';


const t = initTRPC.create();

export const router = t.router;
export const publicProcedure = t.procedure;

export const appRouter = router({
});

export type AppRouter = typeof appRouter;
