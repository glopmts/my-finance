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
import { Dispatch, FC, SetStateAction } from "react";

import { $Enums } from "@prisma/client";
import { format, subMonths } from "date-fns";
import { TransactionProps } from "../../types/interfaces";
import CardTransaction from "../cards-transaction";
import CreditCardPage from "../home_components/credit-cart";
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

type MockSalary = {
  userId: string;
  id: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  amount: number;
  isRecurring: boolean;
  paymentDate: string;
  frequency: $Enums.Frequency;
};

type TransactionHtml = {
  paginatedTransactions: TransactionProps[];
  filteredTransactions: TransactionProps[];
  mockSalaryData: MockSalary[] | undefined;
  transactionToEdit: TransactionProps | null;
  selectedTransactions: string[];
  isEditModalOpen: boolean;
  hasMore: boolean;
  userId: string;
  selectedDate: Date;
  handleDateChange: (direction: number) => void;
  setIsEditModalOpen: Dispatch<SetStateAction<boolean>>;
  handleLoadMore: () => void;
  refetch: () => void;
  refetchTypes: () => void;
  handleCloseEditModal: () => void;
  handleDelete: (id: string) => void;
  handleEdit: (transaction: TransactionProps) => void;
  handleSelectTransaction: (id: string) => void;
  isSelecting10?: boolean;
  handleSelect10Transactions?: () => void;
  handleDeleteSelected?: () => void;
  deleteMultipleTransactions?: {
    isPending: boolean;
  };
  resetToCurrentMonth?: () => void;
  setSelectedDate: Dispatch<SetStateAction<Date>>;
};

const HtmlTransaction: FC<TransactionHtml> = ({
  paginatedTransactions,
  filteredTransactions,
  transactionToEdit,
  userId,
  mockSalaryData,
  selectedDate,
  handleDateChange,
  handleCloseEditModal,
  isEditModalOpen,
  hasMore,
  selectedTransactions,
  refetch,
  refetchTypes,
  handleLoadMore,
  setIsEditModalOpen,
  handleDelete,
  handleEdit,
  handleSelectTransaction,
  isSelecting10 = false,
  handleSelect10Transactions,
  handleDeleteSelected,
  deleteMultipleTransactions = { isPending: false },
  resetToCurrentMonth,
  setSelectedDate,
}) => {
  const isCurrentMonth = () => {
    const now = new Date();
    return (
      selectedDate.getMonth() === now.getMonth() &&
      selectedDate.getFullYear() === now.getFullYear()
    );
  };

  return (
    <div className="">
      <div className="border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-30">
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

                {!isCurrentMonth() && resetToCurrentMonth && (
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
                  userId={userId}
                  refetchTypes={refetchTypes}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-1 sm:px-6 lg:px-0 py-8">
        <div className="mb-8 flex flex-col md:flex-row gap-3 justify-between w-full h-full">
          <div className="md:max-w-lg w-full md:mr-3 h-auto">
            {mockSalaryData?.map((item) => (
              <ProgressSpending
                key={item.id}
                userId={userId}
                maxValue={item.amount}
              />
            ))}
          </div>
          <div className="mt-0 w-full">
            <CreditCardPage />
          </div>
        </div>

        <div className="pb-6">
          <div className="pb-4 flex items-center gap-2">
            <div className="border rounded-full bg-gray-300 dark:bg-zinc-900 p-2">
              <DollarSign size={20} />
            </div>
            <h2 className="text-2xl font-semibold">Transações</h2>
          </div>
          <div className="pb-4 flex gap-2.5">
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
  );
};

export default HtmlTransaction;
