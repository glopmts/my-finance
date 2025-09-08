"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { trpc } from "../../server/trpc/client";
import type { TransactionType } from "../../types/interfaces";
import { TransactionType as TransactionTypeEnum } from "../../types/interfaces";

type TransactionData = {
  userId: string;
  amount: number;
  date: string | Date;
  description?: string | null;
  type: TransactionType;
  isRecurring: boolean;
  recurringId?: string | null;
  id?: string;
  createdAt?: string;
  updatedAt?: string;
};

type PropsUser = {
  userId: string;
  type: "update" | "create";
  transactionData?: TransactionData;
  onSuccess?: () => void;
  refetch: () => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

interface SavedTitle {
  id: string;
  title: string;
  timestamp: number;
}

const AutoTransactionModal = ({
  type,
  userId,
  transactionData,
  isOpen,
  onSuccess,
  refetch,
  onOpenChange,
}: PropsUser) => {
  const [open, setOpen] = useState(isOpen || false);
  const [loading, setLoading] = useState(false);
  const [savedTitles, setSavedTitles] = useState<SavedTitle[]>([]);

  const [amount, setAmount] = useState(transactionData?.amount || 0);
  const [description, setDescription] = useState(
    transactionData?.description || ""
  );

  const [date, setDate] = useState<Date>(
    transactionData?.date ? new Date(transactionData.date) : new Date()
  );
  const [transactionType, setTransactionType] = useState<TransactionType>(
    transactionData?.type || TransactionTypeEnum.INCOME
  );
  const [isRecurring, setIsRecurring] = useState(
    transactionData?.isRecurring || false
  );
  const [recurringId, setRecurringId] = useState(
    transactionData?.recurringId || ""
  );

  const mutationCreater = trpc.transaction.createrTransactions.useMutation();
  const mutationUpdate = trpc.transaction.updateTransactions.useMutation();

  useEffect(() => {
    if (isOpen !== undefined) {
      setOpen(isOpen);
    }
  }, [isOpen]);

  useEffect(() => {
    if (transactionData && type === "update") {
      setAmount(transactionData.amount || 0);
      setDescription(transactionData.description || "");
      setDate(
        transactionData.date ? new Date(transactionData.date) : new Date()
      );
      setTransactionType(transactionData.type || TransactionTypeEnum.INCOME);
      setIsRecurring(transactionData.isRecurring || false);
      setRecurringId(transactionData.recurringId || "");
    }
  }, [transactionData, type]);

  useEffect(() => {
    const loadSavedTitles = () => {
      try {
        const stored = localStorage.getItem("transaction_titles");
        if (stored) {
          const titles: SavedTitle[] = JSON.parse(stored);
          // Ordenar por timestamp (mais recentes primeiro) e pegar até 4
          const sorted = titles
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 4);
          setSavedTitles(sorted);
        }
      } catch (error) {
        console.error("Erro ao carregar títulos salvos:", error);
      }
    };

    loadSavedTitles();
  }, []);

  const saveTitleToMemory = (title: string) => {
    if (!title.trim()) return;

    try {
      const newTitle: SavedTitle = {
        id: Date.now().toString(),
        title: title.trim(),
        timestamp: Date.now(),
      };

      // Obter títulos existentes
      const stored = localStorage.getItem("transaction_titles");
      let titles: SavedTitle[] = stored ? JSON.parse(stored) : [];

      // Remover duplicatas e limitar a 4
      titles = titles.filter((t) => t.title !== newTitle.title);
      titles.unshift(newTitle); // Adicionar no início
      titles = titles.slice(0, 4); // Manter apenas os 4 mais recentes

      // Salvar no localStorage e state
      localStorage.setItem("transaction_titles", JSON.stringify(titles));
      setSavedTitles(titles);
    } catch (error) {
      console.error("Erro ao salvar título:", error);
    }
  };

  // Handler para selecionar um título salvo
  const handleTitleSelect = (title: string) => {
    setDescription(title);
  };

  const resetForm = () => {
    if (type === "create") {
      setAmount(0);
      setDescription("");
      setDate(new Date());
      setTransactionType(TransactionTypeEnum.INCOME);
      setIsRecurring(false);
      setRecurringId("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const normalizedDescription = description
        ? description.toUpperCase()
        : undefined;

      const payload = {
        userId,
        amount,
        date,
        description: normalizedDescription,
        type: transactionType,
        isRecurring,
        recurringId: recurringId || undefined,
      };

      if (type === "create") {
        await mutationCreater.mutateAsync?.(payload);
      } else {
        await mutationUpdate.mutateAsync?.({
          userId,
          id: transactionData?.id as string,
          amount,
          date,
          isRecurring,
          type: transactionType,
          description: normalizedDescription,
          recurringId,
        });
      }

      handleOpenChange(false);
      resetForm();
      onSuccess?.();
      refetch();
      saveTitleToMemory(normalizedDescription || "");
    } catch (error) {
      console.error("Erro ao processar transação:", error);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = amount > 0 && userId && transactionType && date;

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    onOpenChange?.(newOpen);
    if (!newOpen) {
      resetForm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {type === "create" && (
          <Button
            className="bg-cyan-500/35 text-white hover:bg-cyan-500/50 border rounded-3xl"
            onClick={() => handleOpenChange(true)}
          >
            Adicionar Transação
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {type === "create"
              ? "Adicionar Nova Transação"
              : "Editar Transação"}
          </DialogTitle>
          <DialogDescription>
            {type === "create"
              ? "Preencha os dados para adicionar uma nova transação."
              : "Atualize as informações da transação."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Valor *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={amount || ""}
              onChange={(e) =>
                setAmount(Number.parseFloat(e.target.value) || 0)
              }
              placeholder="0.00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Tipo *</Label>
            <Select
              value={transactionType}
              onValueChange={(value: TransactionType) =>
                setTransactionType(value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TransactionTypeEnum.INCOME}>
                  Receita
                </SelectItem>
                <SelectItem value={TransactionTypeEnum.EXPENSE}>
                  Despesa
                </SelectItem>
                <SelectItem value={TransactionTypeEnum.TRANSFER}>
                  Transferência
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">Título</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Título brve e simples da transação..."
                maxLength={10}
              />
              <span className="text-sm text-zinc-300">10 Caracteres</span>

              {/* Exibir títulos salvos se houver */}
              {savedTitles.length > 0 && (
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-zinc-400">Títulos recentes:</p>
                  <div className="flex flex-wrap gap-2">
                    {savedTitles.map((saved) => (
                      <button
                        key={saved.id}
                        type="button"
                        onClick={() => handleTitleSelect(saved.title)}
                        className="px-3 py-1 text-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-md transition-colors cursor-pointer"
                      >
                        {saved.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Data *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? (
                    format(date, "PPP", { locale: ptBR })
                  ) : (
                    <span>Selecione uma data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(selectedDate) =>
                    selectedDate && setDate(selectedDate)
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="recurring"
              checked={isRecurring}
              onCheckedChange={setIsRecurring}
            />
            <Label htmlFor="recurring">Transação recorrente</Label>
          </div>

          {isRecurring && (
            <div className="space-y-2">
              <Label htmlFor="recurringId">ID de Recorrência</Label>
              <Input
                id="recurringId"
                value={recurringId}
                onChange={(e) => setRecurringId(e.target.value)}
                placeholder="ID opcional para agrupar transações recorrentes"
              />
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!isFormValid || loading}
              className="bg-cyan-500 hover:bg-cyan-600"
            >
              {loading
                ? "Processando..."
                : type === "create"
                ? "Criar Transação"
                : "Atualizar Transação"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AutoTransactionModal;
