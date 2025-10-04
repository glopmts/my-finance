"use client";

import { CategoryEnum } from "@prisma/client";
import { LucideIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { trpc } from "../server/trpc/client";
import { CATEGORY_CONFIG } from "../utils/transactions-utils/category_config";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Progress } from "./ui/progress";

interface CategorySummary {
  name: string;
  amount: number;
  percentage: number;
  icon: LucideIcon;
  color: string;
  originalCategory: CategoryEnum;
}

const CategoryTransactions = ({ userId }: { userId: string }) => {
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());

  const {
    data: allTransactions,
    isLoading: loader,
    error: errorTransaction,
  } = trpc.transaction.getTransactions.useQuery({
    userId,
  });

  const getTransactionsByMonth = useMemo(() => {
    if (!allTransactions) return [];

    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();

    return allTransactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date);
      return (
        transactionDate.getFullYear() === year &&
        transactionDate.getMonth() === month
      );
    });
  }, [allTransactions, selectedMonth]);

  const changeMonth = (direction: "prev" | "next") => {
    setSelectedMonth((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const calculateCategories = (): CategorySummary[] => {
    const monthlyTransactions = getTransactionsByMonth;

    if (!monthlyTransactions || monthlyTransactions.length === 0) {
      return [];
    }

    const expenses = monthlyTransactions.filter(
      (transaction) => transaction.type === "EXPENSE"
    );

    if (expenses.length === 0) {
      return [];
    }

    const totalExpenses = expenses.reduce(
      (sum, transaction) => sum + transaction.amount,
      0
    );

    const categoryMap = new Map<CategoryEnum, number>();

    expenses.forEach((transaction) => {
      const currentAmount = categoryMap.get(transaction.category) || 0;
      categoryMap.set(transaction.category, currentAmount + transaction.amount);
    });

    const categoriesSummary: CategorySummary[] = Array.from(
      categoryMap.entries()
    )
      .map(([category, amount]) => {
        const config = CATEGORY_CONFIG[category];
        const percentage =
          totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;

        return {
          name: config.name,
          amount,
          percentage: Math.round(percentage * 100) / 100,
          icon: config.icon,
          color: config.color,
          originalCategory: category,
        };
      })
      .sort((a, b) => b.amount - a.amount);

    return categoriesSummary;
  };

  const categories = calculateCategories();
  const monthName = selectedMonth.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  const monthlyStats = useMemo(() => {
    const monthlyTransactions = getTransactionsByMonth;

    if (!monthlyTransactions || monthlyTransactions.length === 0) {
      return { totalIncome: 0, totalExpenses: 0, balance: 0 };
    }

    const totalIncome = monthlyTransactions
      .filter((t) => t.type === "INCOME")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = monthlyTransactions
      .filter((t) => t.type === "EXPENSE")
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
    };
  }, [getTransactionsByMonth]);

  if (loader) {
    return (
      <Card className="group relative overflow-hidden border from-zinc-50/20 bg-gradient-to-br shadow-sm ring-1 ring-zinc-100 dark:ring-zinc-900 transition-all duration-200 hover:shadow-md hover:ring-zinc-200 dark:hover:ring-zinc-800 dark:from-zinc-800/60">
        <CardHeader>
          <CardTitle>Gastos por Categoria</CardTitle>
          <CardDescription>Carregando...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-muted animate-pulse" />
                    <div>
                      <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                      <div className="h-3 w-16 bg-muted rounded animate-pulse mt-1" />
                    </div>
                  </div>
                  <div className="h-4 w-12 bg-muted rounded animate-pulse" />
                </div>
                <Progress value={0} className="h-2 bg-muted" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (errorTransaction) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gastos por Categoria</CardTitle>
          <CardDescription>Erro ao carregar dados</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="group relative overflow-hidden border from-zinc-50/20 bg-gradient-to-br shadow-sm ring-1 ring-zinc-100 dark:ring-zinc-900 transition-all duration-200 hover:shadow-md hover:ring-zinc-200 dark:hover:ring-zinc-800 dark:from-zinc-800/60">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Gastos por Categoria</CardTitle>
            <CardDescription>
              {monthName} - Total: R$ {monthlyStats.totalExpenses.toFixed(2)}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => changeMonth("prev")}
              className="p-2 hover:bg-muted rounded-md transition-colors"
            >
              ←
            </button>
            <span className="text-sm font-medium min-w-[120px] text-center">
              {monthName}
            </span>
            <button
              onClick={() => changeMonth("next")}
              className="p-2 hover:bg-muted rounded-md transition-colors"
            >
              →
            </button>
          </div>
        </div>

        {/* Estatísticas rápidas */}
        <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
          <div className="text-center">
            <p className="text-green-600 font-semibold">
              R$ {monthlyStats.totalIncome.toFixed(2)}
            </p>
            <p className="text-muted-foreground text-xs">Receitas</p>
          </div>
          <div className="text-center">
            <p className="text-red-600 font-semibold">
              R$ {monthlyStats.totalExpenses.toFixed(2)}
            </p>
            <p className="text-muted-foreground text-xs">Despesas</p>
          </div>
          <div className="text-center">
            <p
              className={`font-semibold ${
                monthlyStats.balance >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              R$ {monthlyStats.balance.toFixed(2)}
            </p>
            <p className="text-muted-foreground text-xs">Saldo</p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {categories.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhuma despesa encontrada para {monthName}
          </div>
        ) : (
          <div className="space-y-4">
            {categories.map((category) => {
              return (
                <div key={category.originalCategory} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${category.color}`}
                      >
                        <category.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-foreground">
                          {category.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {category.percentage}% do total
                        </p>
                      </div>
                    </div>
                    <p className="font-semibold text-foreground">
                      R$ {category.amount.toFixed(2)}
                    </p>
                  </div>
                  <Progress value={category.percentage} className="h-2" />
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CategoryTransactions;
