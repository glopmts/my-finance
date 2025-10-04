"use client";

import {
  addMonths,
  endOfMonth,
  isWithinInterval,
  parseISO,
  startOfMonth,
} from "date-fns";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { trpc } from "../../server/trpc/client";
import { TransactionProps } from "../../types/interfaces";

export function useTransactionHook(userId: string) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [transactionsToShow, setTransactionsToShow] = useState<number>(12);
  const [transactionToEdit, setTransactionToEdit] =
    useState<TransactionProps | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>(
    []
  );
  const [isSelecting10, setIsSelecting10] = useState(false);

  const {
    data: allTransactions,
    isLoading: loader,
    error: errorTransaction,
    refetch,
  } = trpc.transaction.getTransactions.useQuery({
    userId,
  });

  const { refetch: refetchTypes } =
    trpc.transaction.getTransactionsType.useQuery({
      userId,
    });

  const {
    data: mockSalaryData,
    isLoading,
    error,
  } = trpc.salary.getSalary.useQuery({
    userId,
  });

  const deleteMultipleTransactions =
    trpc.transaction.deleteTransactionMultiplos.useMutation();

  const deleteTransactionMutation =
    trpc.transaction.deleteTransaction.useMutation({
      onSuccess: () => refetch(),
      onError: (error) => console.error("Erro ao deletar transação:", error),
    });

  const filterTransactionsByMonth = (
    transactions: TransactionProps[],
    date: Date
  ) => {
    const start = startOfMonth(date);
    const end = endOfMonth(date);

    return transactions.filter((transaction) => {
      const transactionDate = parseISO(transaction.date);
      return isWithinInterval(transactionDate, { start, end });
    });
  };

  const filteredTransactions = allTransactions
    ? filterTransactionsByMonth(allTransactions, selectedDate)
    : [];

  const paginatedTransactions = filteredTransactions.slice(
    0,
    transactionsToShow
  );

  const hasMore = filteredTransactions.length > transactionsToShow;

  useEffect(() => {
    const checkMonthChange = () => {
      const now = new Date();
      if (
        now.getMonth() !== selectedDate.getMonth() ||
        now.getFullYear() !== selectedDate.getFullYear()
      ) {
        setSelectedDate(now);
      }
    };

    const interval = setInterval(checkMonthChange, 3600000);
    return () => clearInterval(interval);
  }, [selectedDate]);

  // functions
  const handleEdit = (transaction: TransactionProps) => {
    setTransactionToEdit(transaction);
    setIsEditModalOpen(true);
  };
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setTransactionToEdit(null);
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja deletar esta transação?")) {
      deleteTransactionMutation.mutate({ transactionId: id, userId });
    }
  };

  const handleLoadMore = () => {
    setTransactionsToShow((prev) => prev + 12);
  };

  const handleDateChange = (months: number) => {
    setSelectedDate(addMonths(selectedDate, months));
    setTransactionsToShow(12);
  };

  const handleSelect10Transactions = () => {
    if (isSelecting10) {
      setSelectedTransactions([]);
      setIsSelecting10(false);
    } else {
      const first10Ids = paginatedTransactions
        .slice(0, 10)
        .map((transaction) => transaction.id);

      setSelectedTransactions(first10Ids);
      setIsSelecting10(true);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedTransactions.length > 0) {
      handleDeleteMultiple(selectedTransactions);
    }
  };

  const handleDeleteMultiple = async (selectedIds: string[]) => {
    try {
      const result = await deleteMultipleTransactions.mutateAsync({
        transactionIds: selectedIds,
        userId: userId,
      });

      if (result.status === 200) {
        toast.success(
          `${selectedIds.length} transações deletadas com sucesso!`
        );
        await refetch();
        setSelectedTransactions([]);
        setIsSelecting10(false);
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Erro ao deletar transações: ${error.message}`);
      } else {
        toast.error("Erro desconhecido ao deletar transações");
      }
    }
  };
  const handleSelectTransaction = (id: string) => {
    setSelectedTransactions((prev) =>
      prev.includes(id)
        ? prev.filter((transactionId) => transactionId !== id)
        : [...prev, id]
    );
    setIsSelecting10(false);
  };

  const resetToCurrentMonth = () => {
    setSelectedDate(new Date());
    setTransactionsToShow(12);
  };

  return {
    resetToCurrentMonth,
    handleSelectTransaction,
    handleDeleteSelected,
    handleSelect10Transactions,
    handleDateChange,
    handleLoadMore,
    handleDelete,
    handleCloseEditModal,
    handleEdit,
    refetchTypes,
    refetch,
    deleteMultipleTransactions,
    setIsEditModalOpen,
    setSelectedDate,
    selectedDate,
    isSelecting10,
    selectedTransactions,
    hasMore,
    mockSalaryData,
    error,
    isLoading,
    errorTransaction,
    loader,
    isEditModalOpen,
    transactionToEdit,
    filteredTransactions,
    paginatedTransactions,
  };
}
