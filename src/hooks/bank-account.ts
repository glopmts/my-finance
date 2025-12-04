import { useCallback, useEffect, useMemo, useState } from "react";
import { trpc } from "../server/trpc/context/client";
import { TransactionProps } from "../types/interfaces";

type PropsInfor = {
  typeInfor?: "next" | "default";
  autoPlayInterval?: number;
};

export const InforBankUserHook = ({
  autoPlayInterval = 5000,
  typeInfor,
}: PropsInfor) => {
  const { data: userData, isLoading: loaderUser } = trpc.auth.me.useQuery();
  const userId = userData?.id as string;

  const {
    data: bankAccount,
    isLoading,
    refetch,
  } = trpc.bankAccount.getBankAcconut.useQuery({
    userId: userId,
  });

  const {
    data: mockTransaction,
    isLoading: loader,
    error: errorTransaction,
    refetch: refetchTransaction,
  } = trpc.transaction.getTransactions.useQuery({
    userId: userId,
  });

  const {
    data: mockSalaryData,
    isLoading: loaderSalary,
    error,
  } = trpc.salary.getSalary.useQuery({
    userId: userId,
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [lastResetMonth, setLastResetMonth] = useState<string>("");

  // Obter o mês atual no formato YYYY-MM
  const currentMonth = useMemo(() => {
    const currentDate = new Date();
    return `${currentDate.getFullYear()}-${String(
      currentDate.getMonth() + 1
    ).padStart(2, "0")}`;
  }, []);

  // Efeito para resetar filtros quando o mês mudar
  useEffect(() => {
    if (currentMonth !== lastResetMonth) {
      setSelectedMonth(currentMonth);
      setSelectedType("all");
      setSelectedCategory("all");
      setLastResetMonth(currentMonth);
    }
  }, [currentMonth, lastResetMonth]);

  useEffect(() => {
    if (!mockSalaryData || mockSalaryData.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % mockSalaryData.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [mockSalaryData, autoPlayInterval]);

  const filteredTransactions = useMemo(() => {
    if (!mockTransaction) return [];

    return mockTransaction.filter((transaction) => {
      const transactionDate = new Date(transaction.date);
      const transactionMonth = `${transactionDate.getFullYear()}-${String(
        transactionDate.getMonth() + 1
      ).padStart(2, "0")}`;

      const matchesMonth =
        selectedMonth === "all" || transactionMonth === selectedMonth;
      const matchesType =
        selectedType === "all" || transaction.type === selectedType;
      const matchesCategory =
        selectedCategory === "all" || transaction.category === selectedCategory;

      return matchesMonth && matchesType && matchesCategory;
    });
  }, [mockTransaction, selectedMonth, selectedType, selectedCategory]);

  const availableMonths = useMemo(() => {
    if (!mockTransaction) return [];

    const monthsWithTransactions = new Set<string>();
    mockTransaction.forEach((transaction) => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;
      monthsWithTransactions.add(monthKey);
    });

    let targetYear = new Date().getFullYear();
    if (mockTransaction.length > 0) {
      const firstTransactionDate = new Date(mockTransaction[0].date);
      targetYear = firstTransactionDate.getFullYear();
    }

    const allMonths: string[] = [];
    for (let month = 1; month <= 12; month++) {
      const monthKey = `${targetYear}-${String(month).padStart(2, "0")}`;
      allMonths.push(monthKey);
    }

    return allMonths.sort((a, b) => {
      const [yearA, monthA] = a.split("-").map(Number);
      const [yearB, monthB] = b.split("-").map(Number);

      if (yearA !== yearB) return yearB - yearA;
      return monthB - monthA;
    });
  }, [mockTransaction]);

  // Efeito para definir o mês atual como padrão quando os dados carregam
  useEffect(() => {
    if (
      mockTransaction &&
      mockTransaction.length > 0 &&
      selectedMonth === "all"
    ) {
      const monthExists = availableMonths.includes(currentMonth);
      if (monthExists) {
        setSelectedMonth(currentMonth);
      } else if (availableMonths.length > 0) {
        setSelectedMonth(availableMonths[0]);
      }
    }
  }, [mockTransaction, availableMonths, currentMonth, selectedMonth]);

  const availableCategories = useMemo(() => {
    if (!mockTransaction) return [];

    const categories = new Set<string>();
    mockTransaction.forEach((transaction) => {
      if (transaction.category) {
        categories.add(transaction.category);
      }
    });

    return Array.from(categories).sort();
  }, [mockTransaction]);

  const formatMonth = (monthKey: string) => {
    const [year, month] = monthKey.split("-");
    const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1);
    return date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  };

  const clearFilters = () => {
    setSelectedMonth(currentMonth);
    setSelectedType("all");
    setSelectedCategory("all");
  };

  const activeFiltersCount = [
    selectedMonth !== currentMonth ? selectedMonth : null,
    selectedType,
    selectedCategory,
  ].filter((f) => f !== "all" && f !== null).length;

  const calculateTotalExpenses = useCallback(
    (transactions: TransactionProps[]) => {
      if (!Array.isArray(transactions)) return 0;

      return transactions
        .filter((t) => t.type === "EXPENSE")
        .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);
    },
    []
  );

  const calculateTotalIncome = useCallback(
    (transactions: TransactionProps[]) => {
      if (!Array.isArray(transactions)) return 0;

      return transactions
        .filter((t) => t.type === "INCOME")
        .reduce((sum, transaction) => sum + transaction.amount, 0);
    },
    []
  );

  const totalBalance =
    bankAccount?.reduce((sum, account) => sum + account.balance, 0) || 0;

  const totalExpenses = useMemo(() => {
    return calculateTotalExpenses(mockTransaction || []);
  }, [mockTransaction, calculateTotalExpenses]);

  const filteredExpenses = useMemo(() => {
    return calculateTotalExpenses(filteredTransactions);
  }, [filteredTransactions, calculateTotalExpenses]);

  return {
    totalBalance,
    totalExpenses,
    filteredExpenses,
    loaderUser,
    isLoading,
    currentIndex,
    loader,
    typeInfor,
    loaderSalary,
    mockSalaryData,
    errorTransaction,
    error,
    showFilters,
    filteredTransactions,
    availableCategories,
    activeFiltersCount,
    formatMonth,
    selectedMonth,
    setSelectedMonth,
    availableMonths,
    selectedType,
    setSelectedType,
    selectedCategory,
    setSelectedCategory,
    bankAccount,
    userData,
    mockTransaction,
    clearFilters,
    calculateTotalExpenses,
    calculateTotalIncome,
    refetch,
    setShowFilters,
    refetchTransaction,
    currentMonth,
  };
};
