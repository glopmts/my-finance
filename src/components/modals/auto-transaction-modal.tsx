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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useTransactionForm } from "@/hooks/transaction-hooks/formReducer";
import { cn } from "@/lib/utils";
import { trpc } from "@/server/trpc/context/client";
import type { TransactionType } from "@/types/interfaces";
import { TransactionType as TransactionTypeEnum } from "@/types/interfaces";
import {
  CATEGORY_TRANSLATIONS,
  PAYMENTSOURCE_TRANSLATIONS,
  PropsUser,
} from "@/types/transaction-modal-types";
import { CategoryEnum, PaymentSource } from "@prisma/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { Kbd, KbdGroup } from "@/components/ui/kbd";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Spinner } from "../ui/spinner";

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
  refetchTypes,
  onOpenChange,
}: PropsUser) => {
  const [open, setOpen] = useState(isOpen || false);
  const [loading, setLoading] = useState(false);
  const [savedTitles, setSavedTitles] = useState<SavedTitle[]>([]);
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Usando o hook customizado
  const { formState, setField, resetForm } = useTransactionForm(
    transactionData,
    type
  );

  const mutationCreater = trpc.transaction.createTransaction.useMutation();
  const mutationUpdate = trpc.transaction.updateTransactions.useMutation();

  // Efeitos para savedTitles e open (mantidos iguais)
  useEffect(() => {
    if (isOpen !== undefined) {
      setOpen(isOpen);
    }
  }, [isOpen]);

  useEffect(() => {
    const loadSavedTitles = () => {
      try {
        const stored = localStorage.getItem("transaction_titles");
        if (stored) {
          const titles: SavedTitle[] = JSON.parse(stored);
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
      const stored = localStorage.getItem("transaction_titles");
      let titles: SavedTitle[] = stored ? JSON.parse(stored) : [];
      titles = titles.filter((t) => t.title !== newTitle.title);
      titles.unshift(newTitle);
      titles = titles.slice(0, 4);
      localStorage.setItem("transaction_titles", JSON.stringify(titles));
      setSavedTitles(titles);
    } catch (error) {
      console.error("Erro ao salvar título:", error);
    }
  };

  const handleTitleSelect = (title: string) => {
    setField("description", title);
  };

  const handleFormReset = () => {
    if (type === "create") {
      resetForm();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const normalizedDescription = formState.description
        ? formState.description.toUpperCase()
        : undefined;

      const payload = {
        userId,
        amount: formState.amount,
        date: formState.date,
        description: normalizedDescription,
        type: formState.transactionType,
        isRecurring: formState.isRecurring,
        recurringId: formState.recurringId || undefined,
        category: formState.transactionCategory,
        paymentSource: formState.transactionPaymentSource,
      };

      if (type === "create") {
        await mutationCreater.mutateAsync?.(payload);
      } else {
        await mutationUpdate.mutateAsync?.({
          id: transactionData?.id as string,
          ...payload,
        });
      }

      handleOpenChange(false);
      handleFormReset();
      onSuccess?.();
      refetch();
      refetchTypes();
      saveTitleToMemory(normalizedDescription || "");
    } catch (error) {
      console.error("Erro ao processar transação:", error);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    formState.amount > 0 &&
    userId &&
    formState.transactionType &&
    formState.date;

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    onOpenChange?.(newOpen);
    if (!newOpen) {
      handleFormReset();
      setCalendarOpen(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
        onOpenChange?.(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onOpenChange]);

  const handleOpenKbd = () => {
    handleOpenChange(true);
  };

  // Função para lidar com a seleção de data
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setField("date", date);
      // Não fechar o popover imediatamente - deixar o usuário ver a seleção
      setTimeout(() => {
        setCalendarOpen(false);
      }, 150);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {type === "create" && (
          <Button
            className="bg-cyan-500/35 text-white hover:bg-cyan-500/50 border rounded-3xl"
            onClick={handleOpenKbd}
          >
            Adicionar Transação
            <KbdGroup className="hidden md:block">
              <Kbd
                className={cn("bg-cyan-500/55 text-white hover:bg-cyan-500/50")}
              >
                Ctrl + K
              </Kbd>
            </KbdGroup>
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
              value={formState.amount || ""}
              onChange={(e) =>
                setField("amount", Number.parseFloat(e.target.value) || 0)
              }
              placeholder="0.00"
              required
            />
          </div>

          <div className="flex md:justify-between w-full flex-wrap gap-2">
            <div className="space-y-2 flex-1 min-w-[120px]">
              <Label htmlFor="type">Tipo *</Label>
              <Select
                value={formState.transactionType}
                onValueChange={(value: TransactionType) =>
                  setField("transactionType", value)
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

            <div className="space-y-2 flex-1 min-w-[120px]">
              <Label htmlFor="category">Categoria *</Label>
              <Select
                value={formState.transactionCategory}
                onValueChange={(value: CategoryEnum) =>
                  setField("transactionCategory", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORY_TRANSLATIONS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 flex-1 min-w-[120px]">
              <Label htmlFor="paymentSource">Tipo Pagamento *</Label>
              <Select
                value={formState.transactionPaymentSource}
                onValueChange={(value: PaymentSource) =>
                  setField("transactionPaymentSource", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione tipo Pagamento" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PAYMENTSOURCE_TRANSLATIONS).map(
                    ([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">Título</Label>
              <Input
                id="description"
                value={formState.description}
                onChange={(e) => setField("description", e.target.value)}
                placeholder="Título breve e simples da transação..."
                maxLength={10}
              />
              <span className="text-sm text-zinc-300">10 Caracteres</span>

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

          {/* CORREÇÃO DO DATE PICKER - Versão melhorada */}
          <div className="space-y-2 w-full">
            <Label htmlFor="date">Data *</Label>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formState.date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formState.date ? (
                    format(formState.date, "PPP", { locale: ptBR })
                  ) : (
                    <span>Selecione uma data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto p-0"
                align="start"
                onInteractOutside={(e) => {
                  // Prevenir que o popover feche imediatamente ao interagir com o calendário
                  e.preventDefault();
                }}
              >
                <Calendar
                  mode="single"
                  selected={formState.date}
                  onSelect={handleDateSelect}
                  locale={ptBR}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="recurring"
              checked={formState.isRecurring}
              onCheckedChange={(checked) => setField("isRecurring", checked)}
            />
            <Label htmlFor="recurring">Transação recorrente</Label>
          </div>

          {formState.isRecurring && (
            <div className="space-y-2">
              <Label htmlFor="recurringId">ID de Recorrência</Label>
              <Input
                id="recurringId"
                value={formState.recurringId}
                onChange={(e) => setField("recurringId", e.target.value)}
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
              {loading ? (
                <span className="flex items-center gap-2">
                  <Spinner /> Processando...
                </span>
              ) : type === "create" ? (
                "Criar Transação"
              ) : (
                "Atualizar Transação"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AutoTransactionModal;
