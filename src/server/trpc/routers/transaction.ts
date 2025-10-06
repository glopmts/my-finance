import { db } from "@/lib/prisma";
import { CategoryEnum, PaymentSource, TransactionType } from "@prisma/client";
import { initTRPC, TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTransactionSchema } from "../../../lib/schema/transactions-schema";

const t = initTRPC.create();

export const router = t.router;
export const publicProcedure = t.procedure;

interface MonthlyStats {
  total: number;
  highestExpense: number;
  lowestExpense: number;
  averageExpense: number;
  totalTransactions: number;
  categoryBreakdown?: Record<string, number>;
}

export const transactionRouter = router({
  getTransactions: publicProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .query(async ({ input }) => {
      try {
        if (!input.userId) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Necessario User_id para buscar Transações!",
          });
        }

        const transactions = await db.transaction.findMany({
          where: {
            userId: input.userId,
          },
          orderBy: {
            createdAt: "desc",
          },
        });

        return transactions;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao buscar as transações" + error,
        });
      }
    }),
  getTransactionsType: publicProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .query(async ({ input }) => {
      try {
        if (!input.userId) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Necessario User_id para buscar Transações!",
          });
        }

        const transactions = await db.transaction.findMany({
          where: {
            userId: input.userId,
            type: {
              in: ["EXPENSE", "TRANSFER"],
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        });

        return transactions;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao buscar as transações" + error,
        });
      }
    }),
  createTransaction: publicProcedure
    .input(createTransactionSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const {
          userId,
          amount,
          date,
          isRecurring,
          type,
          description,
          recurringId,
          category,
          paymentSource,
        } = input;

        if (!userId || !amount || !date) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Necessário todos os campos para criar transações!",
          });
        }

        const creditUser = await db.creditCard.findMany({
          where: {
            userId,
            isActive: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        });

        const creditCardId = creditUser[0].id;

        if (
          paymentSource === PaymentSource.CREDIT_CARD &&
          PaymentSource.DEBIT_CARD &&
          creditCardId
        ) {
          const creditCard = await db.creditCard.findFirst({
            where: {
              id: creditCardId,
              userId: userId,
              isActive: true,
            },
          });

          if (!creditCard) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Cartão de crédito não encontrado ou inativo!",
            });
          }

          if (creditCard.availableLimit < amount) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `Limite insuficiente! Disponível: ${creditCard.availableLimit}, Necessário: ${amount}`,
            });
          }

          await db.creditCard.update({
            where: { id: creditCardId },
            data: {
              availableLimit: {
                decrement: amount,
              },
            },
          });
        }

        const bank = await db.bankAccount.findMany({
          where: {
            userId,
            isActive: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        });

        const uniqbank = bank[0].id;

        await db.bankAccount.update({
          where: {
            id: uniqbank,
          },
          data: {
            balance: {
              decrement: amount,
            },
          },
        });

        const transaction = await db.transaction.create({
          data: {
            userId,
            amount,
            type,
            date: new Date(date),
            isRecurring,
            description,
            recurringId,
            category,
            paymentSource,
            creditCardId:
              paymentSource === PaymentSource.CREDIT_CARD ? creditCardId : null,
          },
        });

        return {
          status: 201,
          message: "Transação criada com sucesso!",
          transaction,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao criar a transação: " + error,
        });
      }
    }),
  updateTransactions: publicProcedure
    .input(
      z.object({
        id: z.string(),
        userId: z.string(),
        amount: z.number(),
        date: z.union([z.date(), z.string().datetime()]),
        description: z.string().optional(),
        type: z.nativeEnum(TransactionType),
        isRecurring: z.boolean(),
        recurringId: z.string().optional(),
        category: z.nativeEnum(CategoryEnum).optional(),
        paymentSource: z
          .nativeEnum(PaymentSource)
          .default(PaymentSource.CREDIT_CARD),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const {
          id,
          userId,
          amount,
          date,
          isRecurring,
          type,
          description,
          recurringId,
          category,
          paymentSource,
        } = input;

        if (!userId || !amount || !date || !id) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Necessario Todos os campos Para atualizar transações!",
          });
        }

        const creditUser = await db.creditCard.findMany({
          where: {
            userId,
            isActive: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        });

        const creditCardId = creditUser[0].id;

        if (
          paymentSource === PaymentSource.CREDIT_CARD &&
          PaymentSource.DEBIT_CARD &&
          creditCardId
        ) {
          const creditCard = await db.creditCard.findFirst({
            where: {
              id: creditCardId,
              userId: userId,
              isActive: true,
            },
          });

          if (!creditCard) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Cartão de crédito não encontrado ou inativo!",
            });
          }

          if (creditCard.availableLimit < amount) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `Limite insuficiente! Disponível: ${creditCard.availableLimit}, Necessário: ${amount}`,
            });
          }

          await db.creditCard.update({
            where: { id: creditCardId },
            data: {
              availableLimit: {
                decrement: amount,
              },
            },
          });
        }

        const bank = await db.bankAccount.findMany({
          where: {
            userId,
            isActive: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        });

        const uniqbank = bank[0].id;

        await db.bankAccount.update({
          where: {
            id: uniqbank,
          },
          data: {
            balance: {
              decrement: amount,
            },
          },
        });

        const transactions = await db.transaction.update({
          where: {
            id,
          },
          data: {
            userId,
            amount,
            type,
            date,
            isRecurring,
            description,
            recurringId,
            category,
            paymentSource,
          },
        });

        return {
          status: 200,
          transactions,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao atualizar a transação" + error,
        });
      }
    }),
  deleteTransaction: publicProcedure
    .input(
      z.object({
        transactionId: z.string(),
        userId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const { transactionId, userId } = input;

        if (!userId || !transactionId) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Necessario IDs para deletar a transação!",
          });
        }

        const validete = await db.transaction.findUnique({
          where: {
            id: transactionId,
          },
        });

        if (!validete) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Transação não encontrada!",
          });
        }

        if (validete.userId != userId) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Sem permissão para deletar esta transação!",
          });
        }

        await db.fixed.deleteMany({
          where: {
            originId: transactionId,
          },
        });

        await db.transaction.delete({
          where: {
            id: transactionId,
            userId,
          },
        });

        return {
          status: 200,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao deletar a transação" + error,
        });
      }
    }),
  deleteTransactionMultiplos: publicProcedure
    .input(
      z.object({
        transactionIds: z.array(z.string()),
        userId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const { transactionIds, userId } = input;

        if (!userId || transactionIds.length === 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              "Necessário userId e pelo menos uma transação para deletar!",
          });
        }

        const transactions = await db.transaction.findMany({
          where: {
            id: {
              in: transactionIds,
            },
          },
          select: {
            id: true,
            userId: true,
          },
        });

        if (transactions.length !== transactionIds.length) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Uma ou mais transações não foram encontradas!",
          });
        }

        const unauthorizedTransactions = transactions.filter(
          (transaction) => transaction.userId !== userId
        );

        if (unauthorizedTransactions.length > 0) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Sem permissão para deletar uma ou mais transações!",
          });
        }

        await db.fixed.deleteMany({
          where: {
            originId: {
              in: transactionIds,
            },
            userId: userId,
          },
        });

        await db.transaction.deleteMany({
          where: {
            id: {
              in: transactionIds,
            },
            userId: userId,
          },
        });

        return {
          status: 200,
          message: `${transactionIds.length} transações deletadas com sucesso!`,
          deletedCount: transactionIds.length,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao deletar as transações: " + error,
        });
      }
    }),
  getMonthlyStats: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        month: z.number().optional(),
        year: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const { userId, month, year } = input;
        const now = new Date();
        const targetMonth = month || now.getMonth() + 1;
        const targetYear = year || now.getFullYear();

        const startDate = new Date(targetYear, targetMonth - 1, 1);
        const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);

        const transactions = await db.transaction.findMany({
          where: {
            userId,
            date: {
              gte: startDate,
              lte: endDate,
            },
            type: TransactionType.EXPENSE, // Apenas gastos
          },
          orderBy: {
            amount: "desc",
          },
        });

        if (transactions.length === 0) {
          return {
            message: "Nenhuma transação encontrada para o período",
            stats: null,
          };
        }

        const total = transactions.reduce(
          (sum, transaction) => sum + transaction.amount,
          0
        );
        const highestExpense = transactions[0]?.amount || 0;
        const lowestExpense =
          transactions[transactions.length - 1]?.amount || 0;
        const averageExpense = total / transactions.length;

        const stats: MonthlyStats = {
          total,
          highestExpense,
          lowestExpense,
          averageExpense,
          totalTransactions: transactions.length,
        };

        return {
          message: "Estatísticas geradas com sucesso",
          stats,
          transactions: transactions.slice(0, 10), // Top 10 transações
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao gerar estatísticas: " + error,
        });
      }
    }),
});
