import { CategoryEnum, TransactionType } from "@prisma/client";

export const CATEGORY_TRANSLATIONS = {
  TRANSPORTATION: "Transporte",
  FOOD: "Alimentação",
  ACCOMMODATION: "Hospedagem",
  ENTERTAINMENT: "Entretenimento",
  HEALTHCARE: "Saúde",
  EDUCATION: "Educação",
  UTILITIES: "Utilidades",
  INVESTMENTS: "Investimentos",
  SHOPPING: "Compras",
  OTHER: "Outro",
} as const;

export type TransactionData = {
  userId: string;
  amount: number;
  date: string | Date;
  description?: string | null;
  type: TransactionType;
  isRecurring: boolean;
  recurringId?: string | null;
  id?: string;
  createdAt?: string;
  updatedAt?: string;
  category: CategoryEnum;
  financialGoalsId?: string | null;
};

export type PropsUser = {
  userId: string;
  type: "update" | "create";
  transactionData?: TransactionData;
  onSuccess?: () => void;
  refetch: () => void;
  refetchTypes: () => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};
