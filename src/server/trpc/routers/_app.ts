import { initTRPC } from "@trpc/server";
import { authRouter } from "../routers/auth";
import { bankAccountRouter } from "./bank-account";
import { cardCreditRouter } from "./credit-card";
import { fixedRouter } from "./fixed";
import { foldersRouter } from "./folders";
import { monthlyBalanceRouter } from "./monthly-balance";
import { salaryRouter } from "./salary";
import { transactionRouter } from "./transaction";

const t = initTRPC.create();

export const appRouter = t.router({
  auth: authRouter,
  salary: salaryRouter,
  transaction: transactionRouter,
  fixed: fixedRouter,
  monthlyBalance: monthlyBalanceRouter,
  creditCard: cardCreditRouter,
  bankAccount: bankAccountRouter,
  folders: foldersRouter,
});

export type AppRouter = typeof appRouter;
