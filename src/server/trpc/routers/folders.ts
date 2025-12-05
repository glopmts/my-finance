import { db } from "@/lib/prisma";
import { CategoryEnum, Frequency } from "@prisma/client";
import { initTRPC, TRPCError } from "@trpc/server";
import { object, z } from "zod";

const t = initTRPC.create();
export const router = t.router;
export const publicProcedure = t.procedure;

const createFolderInput = object({
  userId: z.string().min(1),
  name: z.string().min(1).max(100),
  description: z.string().max(255).optional(),
  isActive: z.boolean().default(true),
  transactionIds: z.array(z.string()).optional(),
  frequency: z.nativeEnum(Frequency),
  color: z.string().optional(),
  category: z.nativeEnum(CategoryEnum).optional(),
});

export const foldersRouter = router({
  getFoldersByAccountType: publicProcedure
    .input(
      object({
        userId: z.string().min(1),
        category: z.nativeEnum(CategoryEnum).optional(),
        isActive: z.boolean().optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        if (!input.userId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Parâmetros inválidos para buscar pastas recorrentes",
          });
        }

        const folders = await db.recurringFolder.findMany({
          where: {
            userId: input.userId,
          },
          include: {
            transactions: {
              select: {
                id: true,
                amount: true,
                description: true,
                date: true,
                isRecurring: true,
                category: true,
                paymentSource: true,
                createdAt: true,
                updatedAt: true,
              },
            },
          },
        });

        return folders;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            "Erro ao buscar pastas recorrentes" +
            (error instanceof Error ? `: ${error.message}` : ""),
        });
      }
    }),
  getFoldersByActive: publicProcedure
    .input(
      object({
        userId: z.string().min(1),
        category: z.nativeEnum(CategoryEnum).optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        if (!input.userId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Parâmetros inválidos para buscar pastas recorrentes",
          });
        }

        const folders = await db.recurringFolder.findMany({
          where: {
            userId: input.userId,
            isActive: true,
          },
          include: {
            transactions: {
              select: {
                id: true,
                amount: true,
                description: true,
                date: true,
                isRecurring: true,
                category: true,
                paymentSource: true,
                createdAt: true,
                updatedAt: true,
              },
            },
          },
        });

        return folders;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            "Erro ao buscar pastas recorrentes ativas!" +
            (error instanceof Error ? `: ${error.message}` : ""),
        });
      }
    }),
  createFolder: publicProcedure
    .input(createFolderInput)
    .mutation(async ({ input }) => {
      try {
        const {
          userId,
          name,
          description,
          isActive,
          transactionIds,
          frequency,
          color,
          category,
        } = input;

        if (!userId || !name || !frequency) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Parâmetros inválidos para criação de pasta recorrente",
          });
        }

        const newFolder = await db.recurringFolder.create({
          data: {
            userId,
            name,
            description,
            isActive,
            frequency,
            color,
            category,
            transactions: transactionIds
              ? {
                  connect: transactionIds.map((id) => ({ id })),
                }
              : undefined,
          },
        });
        return newFolder;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            "Erro ao criar pasta recorrente" +
            (error instanceof Error ? `: ${error.message}` : ""),
        });
      }
    }),

  addTransactionToFolder: publicProcedure
    .input(
      object({
        userId: z.string().min(1),
        folderId: z.string().min(1),
        transactionId: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const { folderId, transactionId, userId } = input;

        if (!folderId || !transactionId || !userId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              "Parâmetros inválidos para adicionar transação à pasta recorrente",
          });
        }

        const validedFolder = await db.recurringFolder.findFirst({
          where: { id: folderId, userId },
        });

        if (validedFolder?.userId !== userId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Acesso negado à pasta recorrente",
          });
        }

        const updatedFolder = await db.recurringFolder.update({
          where: { id: folderId, userId },
          data: {
            transactions: {
              connect: { id: transactionId },
            },
          },
          include: {
            transactions: true,
          },
        });
        return updatedFolder;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            "Erro ao adicionar transação à pasta recorrente" +
            (error instanceof Error ? `: ${error.message}` : ""),
        });
      }
    }),

  removeTransactionFromFolder: publicProcedure
    .input(
      object({
        userId: z.string().min(1),
        folderId: z.string().min(1),
        transactionId: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const { folderId, transactionId, userId } = input;

        if (!folderId || !transactionId || !userId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              "Parâmetros inválidos para remover transação da pasta recorrente",
          });
        }

        const validedFolder = await db.recurringFolder.findFirst({
          where: { id: folderId, userId },
        });

        if (validedFolder?.userId !== userId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Acesso negado à pasta recorrente",
          });
        }

        const updatedFolder = await db.recurringFolder.update({
          where: { id: folderId, userId },
          data: { transactions: { disconnect: { id: transactionId } } },
          include: { transactions: true },
        });

        return updatedFolder;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            "Erro ao remover transação da pasta recorrente" +
            (error instanceof Error ? `: ${error.message}` : ""),
        });
      }
    }),

  deleteFolder: publicProcedure
    .input(
      object({
        userId: z.string().min(1),
        folderId: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const { folderId, userId } = input;

        if (!folderId || !userId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              "Parâmetros inválidos para remover transação da pasta recorrente",
          });
        }

        const validedFolder = await db.recurringFolder.findUnique({
          where: { id: folderId, userId },
        });

        if (validedFolder?.userId !== userId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Acesso negado à pasta recorrente",
          });
        }

        const updatedFolder = await db.recurringFolder.delete({
          where: { id: folderId, userId },
          include: { transactions: true },
        });

        return updatedFolder;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            "Erro ao deletar da pasta recorrente" +
            (error instanceof Error ? `: ${error.message}` : ""),
        });
      }
    }),

  updateRecurringFolder: publicProcedure
    .input(
      object({
        userId: z.string().min(1),
        folderId: z.string().min(1),
        name: z.string().min(1).max(100).optional(),
        description: z.string().max(255).optional(),
        isActive: z.boolean().optional(),
        frequency: z.nativeEnum(Frequency).optional(),
        color: z.string().optional(),
        category: z.nativeEnum(CategoryEnum).optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const {
          folderId,
          name,
          description,
          isActive,
          frequency,
          color,
          category,
          userId,
        } = input;

        if (!folderId || !userId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Parâmetros inválidos para atualizar a pasta recorrente",
          });
        }

        const validedFolder = await db.recurringFolder.findFirst({
          where: { id: folderId, userId },
        });

        if (validedFolder?.userId !== userId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Acesso negado à pasta recorrente",
          });
        }

        const updatedFolder = await db.recurringFolder.update({
          where: { id: folderId, userId },
          data: {
            name,
            description,
            isActive,
            frequency,
            color,
            category,
          },
          include: {
            transactions: true,
          },
        });

        return updatedFolder;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            "Erro ao atualizar a pasta recorrente" +
            (error instanceof Error ? `: ${error.message}` : ""),
        });
      }
    }),

  updateStatusFolder: publicProcedure
    .input(
      object({
        folderId: z.string(),
        userId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const { folderId, userId } = input;

        if (!folderId || !userId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Parâmetros inválidos para atualizar a pasta recorrente",
          });
        }

        const validedFolder = await db.recurringFolder.findFirst({
          where: { id: folderId, userId },
        });

        if (validedFolder?.userId !== userId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Acesso negado à pasta recorrente",
          });
        }

        const update = await db.recurringFolder.update({
          where: { id: folderId, userId },
          data: {
            isActive: !validedFolder.isActive,
          },
        });

        return {
          status: 200,
          update,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            "Erro ao atualizar isActive pasta recorrente" +
            (error instanceof Error ? `: ${error.message}` : ""),
        });
      }
    }),
});
