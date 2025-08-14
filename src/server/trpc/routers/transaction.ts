import { db } from "@/lib/prisma";
import { TransactionType } from "@prisma/client";
import { initTRPC, TRPCError } from "@trpc/server";
import { z } from "zod";

const t = initTRPC.create();

export const router = t.router;
export const publicProcedure = t.procedure;

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
  createrTransactions: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        amount: z.number(),
        date: z.union([z.date(), z.string().datetime()]),
        description: z.string().optional(),
        type: z.nativeEnum(TransactionType),
        isRecurring: z.boolean(),
        recurringId: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const {
          userId,
          amount,
          date,
          isRecurring,
          type,
          description,
          recurringId,
        } = input;

        if (!userId || !amount || !date) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Necessario Todos os campos Para criar transações!",
          });
        }

        const transactions = await db.transaction.create({
          data: {
            userId,
            amount,
            type,
            isRecurring,
            description,
            recurringId,
          },
        });

        return {
          status: 201,
          transactions,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao criar as transações" + error,
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
        } = input;

        if (!userId || !amount || !date || !id) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Necessario Todos os campos Para atualizar transações!",
          });
        }

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
});
