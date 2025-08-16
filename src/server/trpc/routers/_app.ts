import { initTRPC } from "@trpc/server";
import { authRouter } from "../routers/auth";
import { fixedRouter } from "./fixed";
import { salaryRouter } from "./salary";
import { transactionRouter } from "./transaction";

const t = initTRPC.create();

export const appRouter = t.router({
  auth: authRouter,
  salary: salaryRouter,
  transaction: transactionRouter,
  fixed: fixedRouter,
});

export type AppRouter = typeof appRouter;
