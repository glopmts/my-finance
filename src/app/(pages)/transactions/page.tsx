"use client";

import CardTransaction from "@/components/cards/cards-transaction";
import Header from "@/components/Header";
import AutoTransactionModal from "@/components/modals/auto-transaction-modal";
import { Button } from "@/components/ui/button";
import { useTransactionHook } from "@/hooks/transaction-hooks/transaction";
import { trpc } from "@/server/trpc/context/client";
import {
  ChevronDown,
  DollarSign,
  Loader2,
  Trash2,
  TrendingUp,
} from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";

type TransactionType = "INCOME" | "EXPENSE" | "TRANSFER" | "ALL";

type CategoryEnum =
  | "TRANSPORTATION"
  | "FOOD"
  | "ACCOMMODATION"
  | "ENTERTAINMENT"
  | "HEALTHCARE"
  | "EDUCATION"
  | "UTILITIES"
  | "INVESTMENTS"
  | "SHOPPING"
  | "OTHER"
  | "ALL";

const TransactionPage = () => {
  const { data: userData, isLoading: loader } = trpc.auth.me.useQuery();
  const userId = userData?.id;
  const router = useRouter();

  const {
    handleSelectTransaction,
    handleDeleteSelected,
    handleSelect10Transactions,
    handleLoadMore,
    handleDelete,
    handleCloseEditModal,
    handleEdit,
    refetchTypes,
    refetch,
    deleteMultipleTransactions,
    setIsEditModalOpen,
    isSelecting10,
    selectedTransactions,
    hasMore,
    isLoading,
    isEditModalOpen,
    transactionToEdit,
    paginatedTransactions,
    selectType,
    setTypeSelect,
    selectCategory,
    allTransactions,
    setCategory,
  } = useTransactionHook(userId as string);

  if (isLoading || loader) {
    return (
      <div className="w-full h-screen">
        <div className="w-full h-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  if (!userId) {
    return router.push("/unauthenticated");
  }

  const transactionTypeOptions: { value: TransactionType; label: string }[] = [
    { value: "ALL", label: "Todos os Tipos" },
    { value: "INCOME", label: "Receita" },
    { value: "EXPENSE", label: "Despesa" },
    { value: "TRANSFER", label: "Transferência" },
  ];

  const categoryOptions: { value: CategoryEnum; label: string }[] = [
    { value: "ALL", label: "Todas as Categorias" },
    { value: "TRANSPORTATION", label: "Transporte" },
    { value: "FOOD", label: "Alimentação" },
    { value: "ACCOMMODATION", label: "Hospedagem" },
    { value: "ENTERTAINMENT", label: "Entretenimento" },
    { value: "HEALTHCARE", label: "Saúde" },
    { value: "EDUCATION", label: "Educação" },
    { value: "UTILITIES", label: "Utilidades" },
    { value: "INVESTMENTS", label: "Investimentos" },
    { value: "SHOPPING", label: "Compras" },
    { value: "OTHER", label: "Outros" },
  ];

  return (
    <div className="w-full flex min-h-screen h-full">
      <Header />
      <div className="w-auto flex-1 h-full mt-4 p-4 md:p-0 mb-8 md:mr-4">
        <div className="pb-6">
          <h1 className="text-2xl font-semibold">Gerencia transações</h1>
          <span className="text-sm text-zinc-300">
            Total transação: {allTransactions?.length || 0}
          </span>
        </div>
        <div className="w-full h-full">
          <div className="pb-6">
            <div className="pb-4 flex items-center gap-2">
              <div className="border rounded-full bg-gray-300 dark:bg-zinc-900 p-2">
                <DollarSign size={20} />
              </div>
              <h2 className="text-2xl font-semibold">Transações</h2>
            </div>

            {/* Filtros - Selects de Tipo e Categoria */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="w-full sm:w-64">
                <Select
                  value={selectType}
                  onValueChange={(value: TransactionType) =>
                    setTypeSelect(value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {transactionTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full sm:w-64">
                <Select
                  value={selectCategory}
                  onValueChange={(value: CategoryEnum) => setCategory(value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Botões de ação */}
            <div className="pb-4 flex flex-wrap gap-2.5">
              {handleSelect10Transactions && (
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
              )}

              {selectedTransactions.length > 0 && handleDeleteSelected && (
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

            {/* Grid de transações */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
              {paginatedTransactions.map((transaction) => {
                return (
                  <CardTransaction
                    key={transaction.id}
                    transaction={transaction}
                    refetch={refetch}
                    userId={userId}
                    refetchTypes={refetchTypes}
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
                userId={userId}
                refetchTypes={refetchTypes}
              />
            </div>
          )}
        </div>

        {transactionToEdit && (
          <AutoTransactionModal
            key={`edit-${transactionToEdit.id}`}
            refetch={refetch}
            refetchTypes={refetchTypes}
            type="update"
            userId={userId}
            isOpen={isEditModalOpen}
            onOpenChange={setIsEditModalOpen}
            transactionData={transactionToEdit}
            onSuccess={handleCloseEditModal}
          />
        )}
      </div>
    </div>
  );
};

export default TransactionPage;
