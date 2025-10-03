"use client";

import ErrorMessage from "../infor/ErrorMessage";

import { Loader2 } from "lucide-react";
import { useTransactionHook } from "../../hooks/transaction";
import HtmlTransaction from "../transaction-compoents/html-transaction";

type PropsUser = {
  userId: string;
};

const TransactionsHome = ({ userId }: PropsUser) => {
  const {
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
  } = useTransactionHook(userId);

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
