import { CategoryEnum } from "@prisma/client";
import {
  BookOpen,
  Car,
  Film,
  Heart,
  Home,
  MoreHorizontal,
  ShoppingCart,
  TrendingUp,
  Utensils,
  Zap,
} from "lucide-react";

export const CATEGORY_CONFIG = {
  [CategoryEnum.TRANSPORTATION]: {
    name: "Transporte",
    icon: Car,
    color: "bg-blue-100 text-blue-600",
  },
  [CategoryEnum.FOOD]: {
    name: "Alimentação",
    icon: Utensils,
    color: "bg-green-100 text-green-600",
  },
  [CategoryEnum.ACCOMMODATION]: {
    name: "Moradia",
    icon: Home,
    color: "bg-purple-100 text-purple-600",
  },
  [CategoryEnum.ENTERTAINMENT]: {
    name: "Entretenimento",
    icon: Film,
    color: "bg-pink-100 text-pink-600",
  },
  [CategoryEnum.HEALTHCARE]: {
    name: "Saúde",
    icon: Heart,
    color: "bg-red-100 text-red-600",
  },
  [CategoryEnum.EDUCATION]: {
    name: "Educação",
    icon: BookOpen,
    color: "bg-yellow-100 text-yellow-600",
  },
  [CategoryEnum.UTILITIES]: {
    name: "Utilidades",
    icon: Zap,
    color: "bg-orange-100 text-orange-600",
  },
  [CategoryEnum.INVESTMENTS]: {
    name: "Investimentos",
    icon: TrendingUp,
    color: "bg-emerald-100 text-emerald-600",
  },
  [CategoryEnum.SHOPPING]: {
    name: "Compras",
    icon: ShoppingCart,
    color: "bg-cyan-100 text-cyan-600",
  },
  [CategoryEnum.OTHER]: {
    name: "Outros",
    icon: MoreHorizontal,
    color: "bg-gray-100 text-gray-600",
  },
};
