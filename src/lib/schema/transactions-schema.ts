import { CategoryEnum, PaymentSource, TransactionType } from "@prisma/client";
import z from "zod";

export const createTransactionSchema = z.object({
  userId: z.string(),
  amount: z.number(),
  date: z.union([z.date(), z.string().datetime()]),
  description: z.string().optional(),
  type: z.nativeEnum(TransactionType),
  isRecurring: z.boolean().default(false),
  recurringId: z.string().optional(),
  category: z.nativeEnum(CategoryEnum).optional(),
  paymentSource: z.nativeEnum(PaymentSource).default(PaymentSource.CREDIT_CARD),
  creditCardId: z.string().optional(),
});
