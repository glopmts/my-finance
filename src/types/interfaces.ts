import { $Enums, CategoryEnum, Transaction } from "@prisma/client";

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
