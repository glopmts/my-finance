import { db } from "@/lib/prisma";
import { initTRPC, TRPCError } from "@trpc/server";
import { z } from "zod";

const t = initTRPC.create();
export const router = t.router;
export const publicProcedure = t.procedure;

export const monthlyBalanceRouter = router({
  getCurrentMonthlyBalance: publicProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .query(async ({ input }) => {
      try {
        const { userId } = input;
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();

        let monthlyBalance = await db.monthlyBalance.findUnique({
          where: {
            userId_month_year: {
              userId,
              month: currentMonth,
              year: currentYear,
            },
          },
        });

        if (!monthlyBalance) {
          monthlyBalance = await db.monthlyBalance.create({
            data: {
              userId,
              month: currentMonth,
              year: currentYear,
              balance: 0,
              totalIncome: 0,
              totalExpenses: 0,
              isClosed: false,
            },
          });
        }

        const transactions = await db.transaction.findMany({
          where: {
            userId,
            date: {
              gte: new Date(currentYear, currentMonth - 1, 1),
              lt: new Date(currentYear, currentMonth, 1),
            },
          },
        });

        const totalIncome = transactions
          .filter((t) => t.type === "INCOME")
          .reduce((sum, t) => sum + t.amount, 0);

        const totalTRANSFER = transactions
          .filter((t) => t.type === "TRANSFER")
          .reduce((sum, t) => sum + t.amount, 0);

        const totalExpenses = transactions
          .filter((t) => t.type === "EXPENSE")
          .reduce((sum, t) => sum + t.amount, 0);

        const currentBalance = totalIncome - totalExpenses - totalTRANSFER;

        monthlyBalance = await db.monthlyBalance.update({
          where: {
            id: monthlyBalance.id,
          },
          data: {
            balance: currentBalance,
            totalIncome,
            totalExpenses,
          },
        });

        return {
          monthlyBalance,
          transactionsCount: transactions.length,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao buscar saldo mensal: " + error,
        });
      }
    }),

  // Fechar mês atual e criar novo mês
  closeCurrentMonth: publicProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const { userId } = input;
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();

        const closedBalance = await db.monthlyBalance.updateMany({
          where: {
            userId,
            month: currentMonth,
            year: currentYear,
            isClosed: false,
          },
          data: {
            isClosed: true,
          },
        });

        let nextMonth = currentMonth + 1;
        let nextYear = currentYear;

        if (nextMonth > 12) {
          nextMonth = 1;
          nextYear = currentYear + 1;
        }

        const newMonthlyBalance = await db.monthlyBalance.create({
          data: {
            userId,
            month: nextMonth,
            year: nextYear,
            balance: 0,
            totalIncome: 0,
            totalExpenses: 0,
            isClosed: false,
          },
        });

        return {
          closedBalance,
          newMonthlyBalance,
          message: `Mês ${currentMonth}/${currentYear} fechado com sucesso!`,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao fechar mês: " + error,
        });
      }
    }),

  getMonthlyBalanceHistory: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        limit: z.number().optional().default(12),
      })
    )
    .query(async ({ input }) => {
      try {
        const { userId, limit } = input;

        const balances = await db.monthlyBalance.findMany({
          where: {
            userId,
          },
          orderBy: [{ year: "desc" }, { month: "desc" }],
          take: limit,
        });

        return balances;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao buscar histórico: " + error,
        });
      }
    }),

  // Verificar e criar novo mês automaticamente
  checkAndCreateNewMonth: publicProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const { userId } = input;
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();

        const existingBalance = await db.monthlyBalance.findUnique({
          where: {
            userId_month_year: {
              userId,
              month: currentMonth,
              year: currentYear,
            },
          },
        });

        if (!existingBalance) {
          await db.monthlyBalance.updateMany({
            where: {
              userId,
              isClosed: false,
            },
            data: {
              isClosed: true,
            },
          });

          const newBalance = await db.monthlyBalance.create({
            data: {
              userId,
              month: currentMonth,
              year: currentYear,
              balance: 0,
              totalIncome: 0,
              totalExpenses: 0,
              isClosed: false,
            },
          });

          return {
            created: true,
            monthlyBalance: newBalance,
            message: "Novo mês criado automaticamente!",
          };
        }

        return {
          created: false,
          monthlyBalance: existingBalance,
          message: "Mês atual já existe!",
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao verificar mês: " + error,
        });
      }
    }),
});
