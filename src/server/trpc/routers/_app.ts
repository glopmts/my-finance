import { initTRPC } from "@trpc/server";
import { authRouter } from "../routers/auth";

const t = initTRPC.create();

export const appRouter = t.router({
  auth: authRouter,
});

export type AppRouter = typeof appRouter;
