import { useMemo } from "react";
import { TransactionProps } from "../types/interfaces";
import { calculateTotalExpenses } from "../utils/dateUtils";

type UseMonthlyProgressParams = {
  monthlyTransactions: TransactionProps[];
  maxValue: number;
};

type UseMonthlyProgressResult = {
  totalExpenses: number;
  progressValue: number;
  isOverLimit: boolean;
  remainingBudget: number;
};

export const useMonthlyProgress = ({
  monthlyTransactions,
  maxValue,
}: UseMonthlyProgressParams): UseMonthlyProgressResult => {
  return useMemo(() => {
    const totalExpenses = calculateTotalExpenses(monthlyTransactions);
    const progressValue = Math.min((totalExpenses / maxValue) * 100, 100);
    const isOverLimit = totalExpenses > maxValue;
    const remainingBudget = maxValue - totalExpenses;

    return {
      totalExpenses,
      progressValue,
      isOverLimit,
      remainingBudget,
    };
  }, [monthlyTransactions, maxValue]);
};
