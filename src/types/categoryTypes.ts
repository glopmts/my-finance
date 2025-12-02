import { CategoryEnum } from "@prisma/client";

export type Category =
  | "transporte"
  | "alimentacao"
  | "hospedagem"
  | "entretenimento"
  | "saude"
  | "educacao"
  | "utilidades"
  | "investimentos"
  | "compras"
  | "outro";

export const categoryIcons: Record<CategoryEnum, string> = {
  TRANSPORTATION: "🚗",
  FOOD: "🍽️",
  ACCOMMODATION: "🏨",
  ENTERTAINMENT: "🎬",
  HEALTHCARE: "🩺",
  EDUCATION: "📚",
  UTILITIES: "💡",
  INVESTMENTS: "💰",
  SHOPPING: "🛒",
  OTHER: "❓",
};
