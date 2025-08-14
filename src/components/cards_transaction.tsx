"use client";

import {
  CalendarDays,
  HardDriveUploadIcon,
  Pen,
  Repeat,
  Trash2,
} from "lucide-react";
import { fnDateLong } from "../lib/formatDate";
import { formatCurrency } from "../lib/formatS";
import type { TransactionProps } from "../types/interfaces";
import AutoTransactionModal from "./modals/auto-transaction-modal";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

type DataProps = {
  transaction?: TransactionProps;
  userId: string | null;
  refetch: () => void;
  handleDelete?: (id: string) => void;
  handleEdite: (transaction: TransactionProps) => void;
};

const CardTransaction = ({
  transaction,
  userId,
  refetch,
  handleDelete,
  handleEdite,
}: DataProps) => {
  if (!transaction) {
    return (
      <Card className="border-zinc-200/50 bg-zinc-50/30 dark:border-zinc-800/50 dark:bg-zinc-900/30 p-4">
        <div className="flex flex-col items-center justify-center gap-4">
          <p className="text-center text-zinc-500 dark:text-zinc-400">
            Nenhuma transação disponível
          </p>
          {userId && (
            <AutoTransactionModal
              refetch={refetch}
              type="create"
              userId={userId}
            />
          )}
        </div>
      </Card>
    );
  }

  const getTypeLabel = (frequency: string) => {
    const labels = {
      INCOME: "RECEITA",
      EXPENSE: "DESPESA",
      TRANSFER: "TRANSFERIR",
    };
    return labels[frequency as keyof typeof labels] || frequency;
  };

  return (
    <Card className="group relative overflow-hidden border-zinc-200/50 bg-zinc-50/30 backdrop-blur-sm transition-all duration-200 hover:border-zinc-300/60 hover:bg-zinc-50/50 hover:shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900/30 dark:hover:border-zinc-700/60 dark:hover:bg-zinc-900/50">
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-50/20 to-transparent dark:from-zinc-800/20" />

      <div className="relative p-4">
        <div className="absolute -top-5 p-2 right-0">
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => handleEdite(transaction)}>
              <Pen size={20} />
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleDelete?.(transaction.id)}
            >
              <Trash2 size={20} />
            </Button>
          </div>
        </div>
        <div className="flex justify-between items-center w-full mb-3">
          <div className="flex items-center gap-1.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
              <HardDriveUploadIcon className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="line-clamp-1 truncate font-semibold">
                {transaction.description || "Transaction"}
              </span>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                ID: {transaction.id.slice(0, 8)}...
              </p>
            </div>
          </div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400">
            <div className="flex items-center gap-1.5">
              <CalendarDays className="h-3 w-3" />
              <span> Pagamento: {fnDateLong(new Date(transaction.date))}</span>
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <p className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            {formatCurrency(transaction.amount)}
          </p>
          {transaction.isRecurring ? (
            <Badge
              variant="secondary"
              className="h-5 border-zinc-200/50 bg-zinc-100/50 text-xs text-zinc-600 dark:border-zinc-700/50 dark:bg-zinc-800/50 dark:text-zinc-300"
            >
              <Repeat className="mr-1 h-3 w-3" />
              {getTypeLabel(transaction.type)}
            </Badge>
          ) : (
            <Badge
              variant="secondary"
              className="h-5 border-zinc-200/50 bg-zinc-100/50 text-xs text-zinc-600 dark:border-zinc-700/50 dark:bg-zinc-800/50 dark:text-zinc-300"
            >
              {getTypeLabel(transaction.type)}
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
};

export default CardTransaction;
