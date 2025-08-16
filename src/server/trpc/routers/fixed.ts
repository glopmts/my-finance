import { db } from "@/lib/prisma";
import { initTRPC, TRPCError } from "@trpc/server";
import { z } from "zod";

const t = initTRPC.create();

export const router = t.router;
export const publicProcedure = t.procedure;

const FixedInputSchema = z.object({
  userId: z.string().min(1, "ID do usuário é obrigatório"),
  originId: z.string().min(1, "ID da transação é obrigatório"),
});

async function validateTransaction(originId: string) {
  const transaction = await db.transaction.findUnique({
    where: { id: originId },
  });

  if (!transaction) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Transação não encontrada",
    });
  }

  return transaction;
}

async function toggleFixedStatus(
  userId: string,
  transaction: { id: string; description: string | null; amount: number }
) {
  const existingFixed = await db.fixed.findUnique({
    where: { originId: transaction.id },
  });

  if (existingFixed) {
    await db.fixed.delete({ where: { originId: transaction.id } });
    return { action: "removed" as const };
  }

  const newFixed = await db.fixed.create({
    data: {
      name: transaction.description || "Transação fixada",
      description: transaction.description,
      amount: transaction.amount,
      userId,
      originId: transaction.id,
      nextDueDate: new Date(),
      isActive: true,
    },
  });

  return { action: "created" as const, data: newFixed };
}

export const fixedRouter = router({
  createFixed: publicProcedure
    .input(FixedInputSchema)
    .mutation(
      async ({
        input,
      }): Promise<{ status: number; action: "created" | "removed" }> => {
        try {
          const { userId, originId } = input;

          const transaction = await validateTransaction(originId);
          const result = await toggleFixedStatus(userId, transaction);

          return {
            status: 201,
            action: result.action,
          };
        } catch (error) {
          if (error instanceof TRPCError) {
            throw error;
          }
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Ocorreu um erro ao processar a transação fixa",
          });
        }
      }
    ),
  isFixed: publicProcedure
    .input(
      z.object({
        originId: z.string(),
      })
    )
    .query(async ({ input }) => {
      try {
        if (!input.originId) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Necessario id transação",
          });
        }

        const existingFixed = await db.fixed.findUnique({
          where: {
            originId: input.originId,
          },
        });

        return {
          existingFixed: !!existingFixed,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Ocorreu um erro ao processar a transação fixa",
        });
      }
    }),
  getFixeds: publicProcedure
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
            message: "Necessario id usuário",
          });
        }

        const fixeds = await db.fixed.findMany({
          where: {
            userId: input.userId,
          },
        });
        return fixeds;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Ocorreu um erro ao buscar as transação fixa",
        });
      }
    }),
});
