import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { initTRPC, TRPCError } from "@trpc/server";
import { z } from "zod";

const t = initTRPC.create();

export const router = t.router;
export const publicProcedure = t.procedure;

const isAuthed = t.middleware(async ({ next }) => {
  const { userId } = await auth();

  if (!userId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Você precisa estar logado",
    });
  }

  return next({
    ctx: {
      userId,
    },
  });
});

const optionalAuth = t.middleware(async ({ next }) => {
  const session = await auth();
  return next({
    ctx: {
      userId: session?.userId ?? null,
    },
  });
});

const protectedProcedure = t.procedure.use(isAuthed);

export const authRouter = router({
  me: t.procedure.use(optionalAuth).query(async ({ ctx }) => {
    if (!ctx.userId) return null;

    const user = await db.user.findUnique({
      where: {
        clerkId: ctx.userId,
      },
    });

    if (!user) return null;

    return user;
  }),

  createUser: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
        email: z.string().email("Email inválido"),
        clerkId: z.string().min(1, "ID do Clerk é obrigatório"),
      })
    )
    .mutation(async ({ input }) => {
      const { clerkId, email, name } = input;

      const existingUser = await db.user.findFirst({
        where: {
          OR: [{ clerkId }, { email }],
        },
      });

      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Usuário já cadastrado",
        });
      }

      try {
        const newUser = await db.user.create({
          data: {
            clerkId,
            email,
            name,
          },
        });

        return {
          success: true,
          user: newUser,
        };
      } catch (error) {
        console.error("Erro ao criar usuário:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao criar usuário",
        });
      }
    }),
});
