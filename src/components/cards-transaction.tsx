"use client";

import { CalendarDays, HardDriveUploadIcon, Repeat } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { formatCurrency } from "../lib/formatS";
import { trpc } from "../server/trpc/context/client";
import type { TransactionProps } from "../types/interfaces";
import { fnDateLong } from "../utils/dateUtils";
import MenuDropdwonCard from "./MenuDropdwonCards";
import AutoTransactionModal from "./modals/auto-transaction-modal";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { Checkbox } from "./ui/checkbox";

type DataProps = {
  transaction?: TransactionProps;
  userId: string | null;
  refetch: () => void;
  refetchTypes: () => void;
  handleDelete?: (id: string) => void;
  handleFixed?: (id: string) => void;
  handleEdite: (transaction: TransactionProps) => void;
  isSelected?: boolean;
  onSelect?: () => void;
  onDeselect?: () => void;
};

const CardTransaction = ({
  transaction,
  userId,
  isSelected = false,
  onSelect,
  onDeselect,
  refetch,
  refetchTypes,
  handleDelete,
  handleEdite,
}: DataProps) => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (!transaction && isSelected) {
      onDeselect?.();
    }
  }, [transaction, isSelected, onDeselect]);

  const handleDeleteWithDeselect = (id: string) => {
    if (isSelected) {
      onDeselect?.();
    }
    handleDelete?.(id);
  };

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect?.();
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (!(e.target instanceof HTMLElement)) return;

    const interactiveElements = ["BUTTON", "A", "INPUT", "SELECT", "TEXTAREA"];

    if (!interactiveElements.includes(e.target.tagName) && !isMenuOpen) {
      onSelect?.();
    }
  };

  const handleMenuOpen = (open: boolean) => {
    setIsMenuOpen(open);
  };

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
              refetchTypes={refetchTypes}
            />
          )}
        </div>
      </Card>
    );
  }

  const { data: isFixedDate, refetch: refetchFixed } =
    trpc.fixed.isFixed.useQuery(
      {
        originId: transaction.id,
      },
      {
        enabled: !!transaction.id,
      }
    );

  const isFixed = isFixedDate?.existingFixed;

  const fixedTransactionMutation = trpc.fixed.createFixed.useMutation({
    onSuccess: () => {
      refetchFixed();
      router.refresh();
    },
    onError: (error) => console.error("Erro ao fixa transação:", error),
  });

  const handleFixed = async (id: string) => {
    fixedTransactionMutation.mutateAsync({
      originId: id,
      userId: userId as string,
    });
    await refetchFixed();
  };

  const getTypeLabel = (frequency: string) => {
    const labels = {
      INCOME: "RECEITA",
      EXPENSE: "DESPESA",
      TRANSFER: "TRANSFERIR",
    };
    return labels[frequency as keyof typeof labels] || frequency;
  };

  return (
    <Card
      className={`group relative overflow-hidden border-zinc-200/50 bg-zinc-50/30 backdrop-blur-sm transition-all duration-200 hover:border-zinc-300/60 hover:bg-zinc-50/50 hover:shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900/30 dark:hover:border-zinc-700/60 dark:hover:bg-zinc-900/50 ${
        isSelected ? "ring-2 ring-blue-500 border-blue-500" : ""
      }`}
      onClick={handleCardClick}
    >
      <div className="absolute inset-0 bg-linear-to-br from-zinc-50/20 to-transparent dark:from-zinc-800/20" />

      <div className="relative p-4 w-full">
        <div className="absolute -top-5 p-2 px-6 right-0 w-full">
          <div className="flex items-center justify-between gap-2">
            <div className="">
              <Checkbox
                checked={isSelected}
                onClick={handleCheckboxClick}
                onCheckedChange={() => onSelect?.()}
              />
            </div>
            <div className="z-10">
              <MenuDropdwonCard
                handleDelete={handleDeleteWithDeselect}
                handleEdite={handleEdite}
                transaction={transaction}
                handleFixed={handleFixed}
                isFixed={isFixed}
                onMenuOpenChange={handleMenuOpen}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center w-full mb-3">
          <div className="flex items-center gap-1.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
              <HardDriveUploadIcon className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
            </div>
            <div className="flex flex-col gap-0.5 w-30">
              <span
                className="line-clamp-1 truncate font-semibold"
                title={transaction.description || "Transaction"}
              >
                {transaction.description || "Transaction"}
              </span>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                ID: {transaction.id.slice(0, 8)}...
              </p>
            </div>
          </div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400 ml-4">
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
