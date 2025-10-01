"use client";

import { trpc } from "@/server/trpc/client";
import {
  addMonths,
  endOfMonth,
  isWithinInterval,
  parseISO,
  startOfMonth,
} from "date-fns";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { TransactionProps } from "../../types/interfaces";
import ErrorMessage from "../ErrorMessage";

import { Loader2 } from "lucide-react";
import HtmlTransaction from "../transaction-compoents/html-transaction";

type PropsUser = {
  userId: string;
};

const TransactionsHome = ({ userId }: PropsUser) => {
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

  if (loader || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-3">
          <Loader2
            size={24}
            className="animate-spin text-zinc-600 dark:text-zinc-400"
          />
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Carregando transações...
          </p>
        </div>
      </div>
    );
  }

  if (errorTransaction) {
    return (
      <ErrorMessage
        message={errorTransaction.message}
        title="Erro ao carregar transações"
      />
    );
  }

  if (error) {
    return (
      <ErrorMessage message={error.message} title="Erro ao carregar salário" />
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <HtmlTransaction
        filteredTransactions={filteredTransactions}
        handleCloseEditModal={handleCloseEditModal}
        handleDateChange={handleDateChange}
        handleDelete={handleDelete}
        handleEdit={handleEdit}
        handleLoadMore={handleLoadMore}
        handleSelectTransaction={handleSelectTransaction}
        hasMore={hasMore}
        isEditModalOpen={isEditModalOpen}
        mockSalaryData={mockSalaryData}
        paginatedTransactions={paginatedTransactions}
        refetch={refetch}
        refetchTypes={refetchTypes}
        selectedDate={selectedDate}
        selectedTransactions={selectedTransactions}
        setIsEditModalOpen={setIsEditModalOpen}
        setSelectedDate={setSelectedDate}
        transactionToEdit={transactionToEdit}
        userId={userId}
        deleteMultipleTransactions={deleteMultipleTransactions}
        handleDeleteSelected={handleDeleteSelected}
        handleSelect10Transactions={handleSelect10Transactions}
        isSelecting10={isSelecting10}
        resetToCurrentMonth={resetToCurrentMonth}
      />
    </div>
  );
};

export default TransactionsHome;
