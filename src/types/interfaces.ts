import { $Enums, CategoryEnum, Transaction } from "@prisma/client";
import z from "zod";
import {
  createCreditCardSchema,
  updateCreditCardSchema,
} from "../lib/schema/credit-card-schema";

export interface TransactionProps {
  userId: string;
  description?: string | null;
  type: $Enums.TransactionType;
  id: string;
  createdAt: string;
  updatedAt: string;
  amount: number;
  date: string;
  isRecurring: boolean;
  recurringId?: string | null;
  category: CategoryEnum;
  financialGoalsId?: string | null;
  paymentSource: $Enums.PaymentSource;
}

export interface UploadResponse {
  message: string;
  transactions: Transaction[];
  count: number;
  fileType: string;
}

export const TransactionType = {
  INCOME: "INCOME",
  EXPENSE: "EXPENSE",
  TRANSFER: "TRANSFER",
} as const;

export type TransactionType =
  (typeof TransactionType)[keyof typeof TransactionType];

export type CreateCreditCardInput = z.infer<typeof createCreditCardSchema>;
export type UpdateCreditCardInput = z.infer<typeof updateCreditCardSchema>;
export type CreditCard = {
  id: string;
  userId: string;
  name: string;
  lastDigits: string;
  creditLimit: number;
  availableLimit: number;
  closingDay: number;
  dueDay: number;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
};
