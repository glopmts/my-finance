"use client";

import { trpc } from "@/server/trpc/client";
import { HardDriveUploadIcon, Loader } from "lucide-react";
import { useState } from "react";
import type { TransactionProps } from "../../types/interfaces";
import CardTransaction from "../cards_transaction";
import ErrorMessage from "../ErrorMessage";
import AutoTransactionModal from "../modals/auto-transaction-modal";

type PropsUser = {
  userId: string;
};

const TransactionsHome = ({ userId }: PropsUser) => {
  const {
    data: transaction,
    isLoading: loader,
    error: errorTransaction,
    refetch,
  } = trpc.transaction.getTransactions.useQuery({
    userId,
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] =
    useState<TransactionProps | null>(null);

  const handleEdit = (transaction: TransactionProps) => {
    setTransactionToEdit(transaction);
    setIsEditModalOpen(true); // Sempre abre o modal quando chamada
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setTransactionToEdit(null);
  };

  const { mutate: deleteTransaction } =
    trpc.transaction.deleteTransaction.useMutation({
      onSuccess: () => {
        refetch();
      },
      onError: (error) => {
        console.error("Erro ao deletar transação:", error);
      },
    });

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja deletar esta transação?")) {
      deleteTransaction({ transactionId: id, userId });
    }
  };

  if (loader) {
    return (
      <div className="w-full h-screen">
        <div className="w-full h-full flex items-center justify-center">
          <Loader size={20} className="animate-spin" />
        </div>
      </div>
    );
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
    <div className="w-full h-full mt-8">
      <div className="w-full h-full">
        <div className="pb-4 flex justify-between items-center">
          <div className="flex items-center gap-1.5 w-full">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
              <HardDriveUploadIcon className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
            </div>
            <h2 className="font-semibold text-2xl">Gerenciar Transferências</h2>
          </div>
          <AutoTransactionModal
            refetch={refetch}
            type="create"
            userId={userId!}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {transaction?.map((c) => (
            <CardTransaction
              key={c.id}
              transaction={c}
              refetch={refetch}
              userId={userId}
              handleDelete={handleDelete}
              handleEdite={handleEdit}
            />
          ))}
        </div>
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
