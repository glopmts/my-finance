import { db } from "@/lib/prisma";
import {
  createCreditCardSchema,
  deleteCreditCardSchema,
  updateCreditCardSchema,
} from "@/lib/schema/credit-card-schema";
import { initTRPC, TRPCError } from "@trpc/server";
import { object, z } from "zod";

const t = initTRPC.create();
export const router = t.router;
export const publicProcedure = t.procedure;

export const cardCreditRouter = router({
  getUserCreditCards: publicProcedure
    .input(
      object({
        userId: z.string(),
      })
    )
    .query(async ({ input }) => {
      try {
        const { userId } = input;

        if (!userId) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Necessario ID user para buscar credito cartão!",
          });
        }

        const card = await db.creditCard.findMany({
          where: {
            userId,
            isActive: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        });

        return card;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao buscar credito cartão: " + error,
        });
      }
    }),
  createCreditCard: publicProcedure
    .input(createCreditCardSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const creditCard = await db.creditCard.create({
          data: {
            userId: input.userId,
            name: input.name,
            lastDigits: input.lastDigits,
            creditLimit: input.creditLimit,
            availableLimit: input.availableLimit,
            closingDay: input.closingDay,
            dueDay: input.dueDay,
            isActive: input.isActive,
          },
        });

        return {
          success: true,
          message: "Cartão criado com sucesso",
          creditCard,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao criar cartão",
        });
      }
    }),

  updateCreditCard: publicProcedure
    .input(updateCreditCardSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, ...updateData } = input;

        const existingCard = await db.creditCard.findUnique({
          where: { id },
        });

        if (!existingCard) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Cartão não encontrado",
          });
        }

        const creditCard = await db.creditCard.update({
          where: { id },
          data: updateData,
        });

        return {
          success: true,
          message: "Cartão atualizado com sucesso",
          creditCard,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao atualizar cartão",
        });
      }
    }),

  deleteCreditCard: publicProcedure
    .input(deleteCreditCardSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const existingCard = await db.creditCard.findUnique({
          where: { id: input.id },
        });

        if (!existingCard) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Cartão não encontrado",
          });
        }

        const creditCard = await db.creditCard.update({
          where: { id: input.id },
          data: { isActive: false },
        });

        return {
          success: true,
          message: "Cartão desativado com sucesso",
          creditCard,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao desativar cartão",
        });
      }
    }),
});
