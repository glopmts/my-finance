"use client";

import { Loader } from "lucide-react";
import { useState } from "react";
import { trpc } from "../../server/trpc/client";
import { TransactionProps } from "../../types/interfaces";
import { SalaryCard } from "../cards_salary";
import CardTransaction from "../cards_transaction";
import ErrorMessage from "../ErrorMessage";
import AutoTransactionModal from "../modals/auto-transaction-modal";
import AutoSalaryModal from "../modals/CreaterSalary";

type PropsUser = {
  userId: string;
};

const CardsStatistics = ({ userId }: PropsUser) => {
  const {
    data: existingSalaryData,
    isLoading,
    error,
    refetch,
  } = trpc.salary.getSalary.useQuery({
    userId,
  });

  const {
    data: transaction,
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

  return (
    <div className="w-full h-auto">
      <div className="flex justify-between w-full items-center pb-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            Gestão de Salários
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Visualize e gerencie seus dados salariais
          </p>
        </div>
        <div className="">
          {isLoading ? (
            <div className="w-full h-46">
              <Loader size={20} className="animate-spin" />
            </div>
          ) : existingSalaryData ? (
            <div className="">
              <AutoSalaryModal
                type="update"
                userId={userId}
                refetch={refetch}
                salaryData={existingSalaryData[0]}
              />
            </div>
          ) : (
            <AutoSalaryModal type="create" userId={userId} refetch={refetch} />
          )}
        </div>
      </div>
      <div className="mt-0 flex flex-col gap-2 md:flex-row md:gap-0 w-full">
        <div className="flex-1">
          {existingSalaryData?.map((card) => (
            <SalaryCard key={card.id} salary={card} />
          ))}
        </div>
        <div className="md:ml-4 w-full md:w-md">
          <div className="pb-2">
            <h2 className="font-semibold text-2xl">Ultima transferência</h2>
          </div>
          {loader ? (
            <div className="w-full h-46">
              <Loader size={20} className="animate-spin" />
            </div>
          ) : (
            transaction && (
              <CardTransaction
                transaction={transaction[0]}
                refetch={refetchTransaction}
                userId={userId}
                handleEdite={(transaction) => {
                  handleEdit(transaction);
                }}
              />
            )
          )}
          <div className="mt-2">
            <div className="border-l-2 border-blue-500 bg-zinc-900 rounded-r-md p-2">
              <span className="ml-2">
                <strong>Nota</strong>: Ultima transferência feita
              </span>
            </div>
          </div>
        </div>
      </div>
      <AutoTransactionModal
        key={transactionToEdit?.id}
        refetch={refetch}
        type="update"
        userId={userId!}
        isOpen={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        transactionData={transactionToEdit!}
        onSuccess={() => {
          setIsEditModalOpen(false);
          setTransactionToEdit(null);
        }}
      />
    </div>
  );
};

export default CardsStatistics;
