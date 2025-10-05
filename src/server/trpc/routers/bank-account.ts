import { AccountType } from "@prisma/client";
import { initTRPC, TRPCError } from "@trpc/server";
import { object, z } from "zod";
import { db } from "../../../lib/prisma";

const t = initTRPC.create();
export const router = t.router;
export const publicProcedure = t.procedure;

export const bankAccountRouter = router({
  getBankAcconut: publicProcedure
    .input(
      object({
        userId: z.string(),
      })
    )
    .query(async ({ input }) => {
      try {
        if (!input.userId) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Necessario ID user para buscar conta bancaria!",
          });
        }

        const bank = await db.bankAccount.findMany({
          where: {
            userId: input.userId,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        });

        return bank;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao buscar conta bancaria: " + error,
        });
      }
    }),
  createrBank: publicProcedure
    .input(
      object({
        userId: z.string(),
        name: z.string(),
        balance: z.number().optional(),
        bankName: z.string(),
        accountNumber: z.string().optional(),
        accountType: z.nativeEnum(AccountType).default(AccountType.OTHER),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const {
          userId,
          name,
          accountNumber,
          accountType,
          balance,
          isActive,
          bankName,
        } = input;
        if (!userId || !name || !accountNumber) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Necessario todos os campos para criar conta bancaria!",
          });
        }

        const createrBank = await db.bankAccount.create({
          data: {
            userId,
            name,
            accountNumber,
            accountType,
            bankName,
            balance,
            isActive,
          },
        });

        return {
          status: 201,
          createrBank,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao criar conta bancaria: " + error,
        });
      }
    }),
  updaterBank: publicProcedure
    .input(
      object({
        id: z.string(),
        userId: z.string(),
        name: z.string(),
        balance: z.number().optional(),
        bankName: z.string(),
        accountNumber: z.string().optional(),
        accountType: z.nativeEnum(AccountType).default(AccountType.OTHER),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const {
          id,
          userId,
          name,
          accountNumber,
          accountType,
          balance,
          isActive,
          bankName,
        } = input;
        if (!id || !userId || !name || !accountNumber) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message:
              "Necessario todos os campos para atualizar conta bancaria!",
          });
        }

        const updaterBank = await db.bankAccount.update({
          where: {
            id,
          },
          data: {
            userId,
            name,
            accountNumber,
            accountType,
            bankName,
            balance,
            isActive,
          },
        });

        return {
          status: 200,
          updaterBank,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao atualizar conta bancaria: " + error,
        });
      }
    }),
});
