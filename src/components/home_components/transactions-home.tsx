"use client";

import { trpc } from "@/server/trpc/client";
import {
  addMonths,
  endOfMonth,
  format,
  isWithinInterval,
  parseISO,
  startOfMonth,
  subMonths,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  ChevronDown,
  DollarSign,
  Loader2,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { TransactionProps } from "../../types/interfaces";
import CardTransaction from "../cards-transaction";
import ErrorMessage from "../ErrorMessage";
import AutoTransactionModal from "../modals/auto-transaction-modal";
import ProgressSpending from "../ProgressSpending";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { UploadPage } from "./uploda-transactions";

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

  const isCurrentMonth = () => {
    const now = new Date();
    return (
      selectedDate.getMonth() === now.getMonth() &&
      selectedDate.getFullYear() === now.getFullYear()
    );
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
      <div className="border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-1 sm:px-6 lg:px-0">
          <div className="py-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              {/* Title Section */}
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                  <TrendingUp className="h-6 w-6 text-zinc-700 dark:text-zinc-300" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
                    Gerenciar Finanças
                  </h1>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                    {paginatedTransactions.length} de{" "}
                    {filteredTransactions.length} transações
                  </p>
                </div>
              </div>

              {/* Controls Section */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {/* Date Navigation */}
                <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-900 rounded-lg p-1 border border-zinc-200 dark:border-zinc-800">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDateChange(-1)}
                    className="h-8 w-8 p-0 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>

                  <Select
                    value={selectedDate.toISOString()}
                    onValueChange={(value) => setSelectedDate(new Date(value))}
                  >
                    <SelectTrigger className="w-[160px] h-8 border-0 bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800">
                      <Calendar className="h-4 w-4 mr-2" />
                      <SelectValue>
                        {format(selectedDate, "MMM yyyy", { locale: ptBR })}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Selecionar mês</SelectLabel>
                        {[...Array(12)].map((_, i) => {
                          const date = subMonths(new Date(), i);
                          return (
                            <SelectItem
                              key={date.toISOString()}
                              value={date.toISOString()}
                            >
                              {format(date, "MMMM yyyy", { locale: ptBR })}
                            </SelectItem>
                          );
                        })}
                      </SelectGroup>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDateChange(1)}
                    className="h-8 w-8 p-0 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>

                {!isCurrentMonth() && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetToCurrentMonth}
                    className="text-xs bg-transparent"
                  >
                    Mês atual
                  </Button>
                )}

                <AutoTransactionModal
                  refetch={refetch}
                  type="create"
                  userId={userId!}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-1 sm:px-6 lg:px-0 py-8">
        <div className="mb-8 flex flex-col md:flex-row gap-3 justify-between w-full">
          <div className="max-w-md">
            {mockSalaryData?.map((item) => (
              <ProgressSpending
                key={item.id}
                userId={userId}
                maxValue={item.amount}
              />
            ))}
          </div>
          <UploadPage />
        </div>

        <div className="pb-6">
          <div className="pb-4 flex items-center gap-2">
            <div className="border rounded-full bg-gray-300 dark:bg-zinc-900 p-2">
              <DollarSign size={20} />
            </div>
            <h2 className="text-2xl font-semibold">Transações</h2>
          </div>
          <div className="pb-4 flex gap-2.5">
            <Button
              variant={isSelecting10 ? "default" : "outline"}
              onClick={handleSelect10Transactions}
              className={
                isSelecting10
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-transparent"
              }
            >
              {isSelecting10 ? "Desmarcar 10" : "Selecionar 10 Transações"}
            </Button>

            {selectedTransactions.length > 0 && (
              <Button
                variant="destructive"
                onClick={handleDeleteSelected}
                disabled={deleteMultipleTransactions.isPending}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {deleteMultipleTransactions.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
                <div className="flex items-center gap-2">
                  <Trash2 size={20} />
                  Deletar ({selectedTransactions.length})
                </div>
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {paginatedTransactions.map((transaction) => {
              return (
                <CardTransaction
                  key={transaction.id}
                  transaction={transaction}
                  refetch={refetch}
                  userId={userId}
                  handleDelete={handleDelete}
                  handleEdite={handleEdit}
                  isSelected={selectedTransactions.includes(transaction.id)}
                  onSelect={() => handleSelectTransaction(transaction.id)}
                />
              );
            })}
          </div>
        </div>

        {hasMore && (
          <div className="flex justify-center mt-8">
            <Button
              variant="outline"
              onClick={handleLoadMore}
              className="flex items-center gap-2 px-6 py-2 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 bg-transparent"
            >
              Carregar mais transações
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Empty State */}
        {paginatedTransactions.length === 0 && (
          <div className="text-center py-12">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 mx-auto mb-4">
              <TrendingUp className="h-8 w-8 text-zinc-400" />
            </div>
            <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">
              Nenhuma transação encontrada
            </h3>
            <p className="text-zinc-500 dark:text-zinc-400 mb-6">
              Comece adicionando sua primeira transação para este mês.
            </p>
            <AutoTransactionModal
              refetch={refetch}
              type="create"
              userId={userId!}
            />
          </div>
        )}
      </div>

      {transactionToEdit && (
        <AutoTransactionModal
          key={`edit-${transactionToEdit.id}`}
          refetch={refetch}
          type="update"
          userId={userId!}
          isOpen={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          transactionData={transactionToEdit}
          onSuccess={handleCloseEditModal}
        />
      )}
    </div>
  );
};

export default TransactionsHome;
