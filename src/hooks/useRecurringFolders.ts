"use client";

import { trpc } from "@/server/trpc/context/client";
import { useMemo, useState } from "react";

export const useRecurringFolders = () => {
  const { data: userData, isLoading: loader } = trpc.auth.me.useQuery();
  const userId = userData?.id || "";

  const {
    data: recurringFolders,
    isLoading,
    refetch,
  } = trpc.folders.getFoldersByAccountType.useQuery(
    {
      userId,
    },
    {
      enabled: !!userId,
    }
  );

  const [selectedMonth, setSelectedMonth] = useState<string>("current");

  // Obter o mês atual no formato YYYY-MM
  const currentMonth = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
  }, []);

  // Filtrar transações por mês dentro de cada pasta
  const filteredFolders = useMemo(() => {
    if (!recurringFolders) return [];

    return recurringFolders.map((folder) => {
      const filteredTransactions = folder.transactions.filter((transaction) => {
        if (selectedMonth === "current" || selectedMonth === "all") {
          return true;
        }

        const transactionDate = new Date(transaction.date);
        const transactionMonth = `${transactionDate.getFullYear()}-${String(
          transactionDate.getMonth() + 1
        ).padStart(2, "0")}`;

        return transactionMonth === selectedMonth;
      });

      return {
        ...folder,
        filteredTransactions,
        filteredAmount: filteredTransactions.reduce(
          (sum, t) => sum + t.amount,
          0
        ),
      };
    });
  }, [recurringFolders, selectedMonth]);

  // Obter meses disponíveis nas transações
  const availableMonths = useMemo(() => {
    if (!recurringFolders) return [];

    const monthsSet = new Set<string>();
    recurringFolders.forEach((folder) => {
      folder.transactions.forEach((transaction) => {
        const date = new Date(transaction.date);
        const month = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`;
        monthsSet.add(month);
      });
    });

    const months = Array.from(monthsSet);

    // Ordenar do mais recente para o mais antigo
    return months.sort((a, b) => {
      const [yearA, monthA] = a.split("-").map(Number);
      const [yearB, monthB] = b.split("-").map(Number);

      if (yearA !== yearB) return yearB - yearA;
      return monthB - monthA;
    });
  }, [recurringFolders]);

  // Calcular estatísticas com base no mês selecionado
  const stats = useMemo(() => {
    if (!filteredFolders)
      return {
        totalFolders: 0,
        activeCount: 0,
        totalTransactions: 0,
        totalAmount: 0,
      };

    const totalFolders = filteredFolders.length;
    const activeCount = filteredFolders.filter((f) => f.isActive).length;
    const totalTransactions = filteredFolders.reduce(
      (sum, folder) => sum + folder.filteredTransactions.length,
      0
    );
    const totalAmount = filteredFolders.reduce(
      (sum, folder) => sum + folder.filteredAmount,
      0
    );

    return { totalFolders, activeCount, totalTransactions, totalAmount };
  }, [filteredFolders]);

  const formatMonth = (monthKey: string) => {
    if (monthKey === "current") return "Mês Atual";
    if (monthKey === "all") return "Todos os Meses";

    const [year, month] = monthKey.split("-");
    const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1);
    return date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  };

  return {
    userId,
    recurringFolders: filteredFolders,
    isLoading: isLoading || loader,
    refetch,
    stats,
    selectedMonth,
    setSelectedMonth,
    availableMonths,
    currentMonth,
    formatMonth,
    totalFolders: recurringFolders?.length || 0,
  };
};
