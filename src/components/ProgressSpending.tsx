"use client";

import { trpc } from "@/server/trpc/client";
import {
  addMonths,
  calculateTotalExpenses,
  filterTransactionsByMonth,
  formatMonthName,
} from "@/utils/dateUtils";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
} from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";

type PropsProgress = {
  userId: string;
  maxValue?: number;
  expenseTypes?: string[];
};

const ProgressSpending = ({ userId, maxValue = 10000 }: PropsProgress) => {
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const { data: transactions, isLoading } =
    trpc.transaction.getTransactionsType.useQuery({ userId });

  const handleMonthChange = (increment: number) => {
    const newDate = addMonths(selectedMonth, increment);
    setSelectedMonth(newDate);
  };

  const resetToCurrentMonth = () => {
    setSelectedMonth(new Date());
  };

  const isCurrentMonth = () => {
    const now = new Date();
    return (
      selectedMonth.getMonth() === now.getMonth() &&
      selectedMonth.getFullYear() === now.getFullYear()
    );
  };

  if (isLoading) {
    return (
      <div className="w-full p-6 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-3/4"></div>
          <div className="h-2 bg-zinc-200 dark:bg-zinc-700 rounded"></div>
          <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!transactions) {
    return (
      <div className="w-full p-6 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 text-center">
        <p className="text-zinc-500 dark:text-zinc-400">
          Nenhuma transação encontrada.
        </p>
      </div>
    );
  }

  const monthlyTransactions = filterTransactionsByMonth(
    transactions,
    selectedMonth
  );
  const totalExpenses = calculateTotalExpenses(monthlyTransactions);
  const progressValue = Math.min((totalExpenses / maxValue) * 100, 100);
  const isOverLimit = totalExpenses > maxValue;
  const remainingBudget = maxValue - totalExpenses;

  return (
    <div className="w-full bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
              <TrendingDown className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                Controle de Gastos
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {formatMonthName(selectedMonth)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-zinc-50 dark:bg-zinc-900 rounded-lg p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleMonthChange(-1)}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleMonthChange(1)}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {!isCurrentMonth() && (
          <Button
            variant="outline"
            size="sm"
            onClick={resetToCurrentMonth}
            className="text-xs bg-transparent"
          >
            Voltar ao mês atual
          </Button>
        )}
      </div>

      {/* Progress Content */}
      <div className="p-6 space-y-6">
        {/* Amount Display */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">
              Total gasto
            </p>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {totalExpenses.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">
              {isOverLimit ? "Excedido" : "Restante"}
            </p>
            <p
              className={`text-lg font-semibold ${
                isOverLimit
                  ? "text-red-600 dark:text-red-400"
                  : "text-green-600 dark:text-green-400"
              }`}
            >
              {Math.abs(remainingBudget).toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-3">
          <Progress
            value={progressValue}
            className={`h-3 ${
              isOverLimit ? "bg-red-100 dark:bg-red-900/20" : ""
            }`}
          />

          <div className="flex justify-between text-sm text-zinc-500 dark:text-zinc-400">
            <span>R$ 0</span>
            <span>
              {maxValue.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </span>
          </div>
        </div>

        {/* Status Alert */}
        {isOverLimit && (
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <p className="text-sm text-red-700 dark:text-red-300 font-medium">
              Limite mensal excedido em{" "}
              {Math.abs(remainingBudget).toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </p>
          </div>
        )}

        {/* Progress Percentage */}
        <div className="text-center">
          <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            {progressValue.toFixed(1)}% do limite utilizado
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProgressSpending;
