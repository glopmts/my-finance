"use client";

import { trpc } from "@/server/trpc/client";
import type { TransactionProps } from "@/types/interfaces";
import { Loader } from "lucide-react";
import { useState } from "react";
import { SalaryCard } from "../cards-salary";
import CardTransaction from "../cards-transaction";
import { DataAlert } from "../DateAlert";
import ErrorMessage from "../ErrorMessage";
import LoaderTypes from "../LoaderTypes";
import AutoSalaryModal from "../modals/auto-salary-modal";
import AutoTransactionModal from "../modals/auto-transaction-modal";

type PropsUser = {
  userId: string;
};

const CardsStatistics = ({ userId }: PropsUser) => {
  const {
    data: mockSalaryData,
    isLoading,
    error,
    refetch,
  } = trpc.salary.getSalary.useQuery({
    userId,
  });

  const {
    data: mockTransaction,
    isLoading: loader,
    error: errorTransaction,
    refetch: refetchTransaction,
  } = trpc.transaction.getTransactions.useQuery({
    userId,
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] =
    useState<TransactionProps | null>(null);

  const handleEdit = (transaction: TransactionProps) => {
    setTransactionToEdit(transaction);
    setIsEditModalOpen((prev) => !prev);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setTransactionToEdit(null);
  };

  if (error) {
    return <ErrorMessage message={error.message} />;
  }

  if (errorTransaction) {
    return (
      <ErrorMessage
        message={errorTransaction.message}
        title="Error transactions"
      />
    );
  }

  if (isLoading || loader) {
    return (
      <div className="w-full h-46 mt-8">
        <LoaderTypes types="spine" count={2} />
      </div>
    );
  }

  if (!mockSalaryData) {
    return <DataAlert message="Nenhum salário encontrado!" />;
  }

  if (!mockTransaction) {
    return <DataAlert message="Nenhuma transferência encontrada!" />;
  }

  function calculateTotalExpenses(transactions: TransactionProps[]) {
    if (!Array.isArray(transactions)) return 0;

    return transactions.reduce(
      (sum, transaction) => sum + transaction.amount,
      0
    );
  }

  const maxValueFilter = mockSalaryData.map((c) => c.amount);
  const maxValue = maxValueFilter[0];

  const totalExpenses = calculateTotalExpenses(mockTransaction);
  const progressValue = Math.min((totalExpenses / maxValue) * 100, 100);
  const isOverLimit = totalExpenses > maxValue;

  return (
    <div className="w-full h-full">
      <div className="border-b w-full">
        <div className="px-3 py-8 w-full">
          <div className="flex items-center justify-between w-full">
            <div className="space-y-1 w-full">
              <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white">
                Gestão de Salários
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Visualize e gerencie seus dados salariais
              </p>
            </div>

            <div className="flex items-center w-auto">
              {mockSalaryData.length > 0 ? (
                <AutoSalaryModal
                  type="update"
                  userId={userId}
                  refetch={refetch}
                  salaryData={mockSalaryData[0]}
                />
              ) : (
                <AutoSalaryModal
                  type="create"
                  userId={userId}
                  refetch={refetch}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="p-2">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Salary Cards Section */}
          <div className="lg:col-span-2 space-y-4">
            {mockSalaryData?.map((card) => (
              <SalaryCard
                key={card.id}
                salary={card}
                progressValue={progressValue}
                isOverLimit={isOverLimit}
              />
            ))}
          </div>

          {/* Transaction Section */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-zinc-900 dark:text-white">
                Última Transferência
              </h2>

              {loader ? (
                <div className="flex items-center justify-center h-32 rounded-lg border border-zinc-100 dark:border-zinc-900">
                  <Loader size={16} className="animate-spin text-zinc-400" />
                </div>
              ) : (
                <CardTransaction
                  transaction={mockTransaction[0]}
                  refetch={refetchTransaction}
                  userId={userId}
                  handleEdite={handleEdit}
                />
              )}
            </div>

            <div className="rounded-lg border border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-950/50 p-4">
              <div className="flex items-start gap-3">
                <div className="w-1 h-4 bg-zinc-300 dark:bg-zinc-700 rounded-full mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-zinc-900 dark:text-white">
                    Nota
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Última transferência realizada
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isEditModalOpen && (
        <AutoTransactionModal
          key={`edit-${transactionToEdit?.id}`}
          refetch={refetch}
          type="update"
          userId={userId}
          isOpen={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          transactionData={transactionToEdit!}
          onSuccess={handleCloseEditModal}
        />
      )}
    </div>
  );
};

export default CardsStatistics;
