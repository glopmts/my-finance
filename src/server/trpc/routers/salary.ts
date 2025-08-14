import { db } from "@/lib/prisma";
import { Frequency } from "@prisma/client";
import { initTRPC, TRPCError } from "@trpc/server";
import { z } from "zod";

const t = initTRPC.create();

export const router = t.router;
export const publicProcedure = t.procedure;

export const salaryRouter = router({
  getSalary: publicProcedure
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
            message: "Necessario User_id para buscar Salary!",
          });
        }

        const salary = await db.salary.findMany({
          where: {
            userId: input.userId,
          },
        });

        return salary;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao buscar salary" + error,
        });
      }
    }),
  createrSalary: publicProcedure
    .input(
      z.object({
        amount: z.number(),
        description: z.string().optional(),
        paymentDate: z.union([z.date(), z.string().datetime()]),
        isRecurring: z.boolean(),
        frequency: z.nativeEnum(Frequency),
        userId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const {
          amount,
          frequency,
          isRecurring,
          paymentDate,
          userId,
          description,
        } = input;

        if (!amount || !userId || !frequency) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Necessario todos os campos para criar o Salary!",
          });
        }

        const creater = await db.salary.create({
          data: {
            amount,
            frequency,
            isRecurring,
            paymentDate,
            userId,
            description,
          },
        });

        return {
          status: 201,
          creater,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao criar salary" + error,
        });
      }
    }),

  updaterSalary: publicProcedure
    .input(
      z.object({
        id: z.string(),
        amount: z.number(),
        description: z.string().optional(),
        paymentDate: z.union([z.date(), z.string().datetime()]),
        isRecurring: z.boolean(),
        frequency: z.nativeEnum(Frequency),
        userId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const {
          id,
          amount,
          frequency,
          isRecurring,
          paymentDate,
          userId,
          description,
        } = input;

        if (!amount || !userId || !frequency || !id) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Necessario todos os campos para atualizar o Salary!",
          });
        }

        const updater = await db.salary.update({
          where: {
            id,
          },
          data: {
            amount,
            frequency,
            isRecurring,
            paymentDate,
            userId,
            description,
          },
        });

        return {
          status: 200,
          updater,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao atualizar salary" + error,
        });
      }
    }),
  deleteSalary: publicProcedure
    .input(
      z.object({
        id: z.string(),
        userId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const { id, userId } = input;

        if (!id || !userId) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Necessario todos os campos para atualizar o Salary!",
          });
        }

        const uniq = await db.salary.findUnique({
          where: {
            id,
            userId,
          },
        });

        if (!uniq) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Salary não encontrado delete!",
          });
        }

        if (uniq.userId != userId) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "User_id não corresponde com o user_id do salary Delete!",
          });
        }

        const delet = await db.salary.delete({
          where: {
            id,
          },
        });

        return {
          status: 200,
          delet,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao deletar salary" + error,
        });
      }
    }),
});
