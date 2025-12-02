import { boolean, number, object, string } from "zod";

export const createCreditCardSchema = object({
  userId: string().cuid(),
  name: string().min(1, "Nome é obrigatório"),
  lastDigits: string().length(4, "Últimos 4 dígitos são obrigatórios"),
  creditLimit: number().min(0, "Limite deve ser maior ou igual a 0"),
  availableLimit: number().min(
    0,
    "Limite disponível deve ser maior ou igual a 0"
  ),
  closingDay: number()
    .min(1)
    .max(31, "Dia de fechamento deve ser entre 1 e 31"),
  dueDay: number().min(1).max(31, "Dia de vencimento deve ser entre 1 e 31"),
  isActive: boolean().default(true),
});

export const updateCreditCardSchema = object({
  id: string().cuid(),
  name: string().min(1, "Nome é obrigatório").optional(),
  lastDigits: string()
    .length(4, "Últimos 4 dígitos são obrigatórios")
    .optional(),
  creditLimit: number().min(0, "Limite deve ser maior ou igual a 0").optional(),
  availableLimit: number()
    .min(0, "Limite disponível deve ser maior ou igual a 0")
    .optional(),
  closingDay: number()
    .min(1)
    .max(31, "Dia de fechamento deve ser entre 1 e 31")
    .optional(),
  dueDay: number()
    .min(1)
    .max(31, "Dia de vencimento deve ser entre 1 e 31")
    .optional(),
  isActive: boolean().optional(),
  userId: string(),
});

export const deleteCreditCardSchema = object({
  id: string(),
  userId: string(),
});

export const getUserCreditCardsSchema = object({
  userId: string(),
});
