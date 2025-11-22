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
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { $Enums, Frequency } from "@prisma/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import { trpc } from "../../server/trpc/context/client";

type SalaryData = {
  userId: string;
  description: string | null;
  id: string;
  createdAt: string;
  updatedAt: string;
  amount: number;
  isRecurring: boolean;
  paymentDate: string;
  frequency: $Enums.Frequency;
};

type PropsUser = {
  userId: string;
  type: "update" | "create";
  salaryData?: SalaryData;
  onSuccess?: () => void;
  refetch: () => void;
};

const AutoSalaryModal = ({
  type,
  userId,
  salaryData,
  onSuccess,
  refetch,
}: PropsUser) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const mutationCreater = trpc.salary.createrSalary.useMutation();
  const mutationUpdate = trpc.salary.updaterSalary.useMutation();

  const [amount, setAmount] = useState(salaryData?.amount || 0);
  const [description, setDescription] = useState(salaryData?.description || "");
  const [paymentDate, setPaymentDate] = useState<Date>(
    salaryData?.paymentDate ? new Date(salaryData.paymentDate) : new Date()
  );
  const [isRecurring, setIsRecurring] = useState(
    salaryData?.isRecurring || false
  );
  const [frequency, setFrequency] = useState<Frequency>(
    salaryData?.frequency || "MONTHLY"
  );

  const resetForm = () => {
    if (type === "create") {
      setAmount(0);
      setDescription("");
      setPaymentDate(new Date());
      setIsRecurring(false);
      setFrequency("MONTHLY");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        amount,
        description: description || undefined,
        paymentDate,
        isRecurring,
        frequency,
        userId,
      };

      if (type === "create") {
        await mutationCreater.mutateAsync(payload);
      } else {
        await mutationUpdate.mutateAsync({
          id: salaryData?.id as string,
          ...payload,
        });
      }

      setOpen(false);
      resetForm();
      onSuccess?.();
      refetch();
    } catch (error) {
      console.error("Erro ao processar salary:", error);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = amount > 0 && userId && frequency;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="bg-cyan-500/35 text-white hover:bg-cyan-500/50 border rounded-3xl"
          onClick={() => setOpen(true)}
        >
          {type === "create" ? "+ Adicionar Salário" : "Editar Salário"}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {type === "create" ? "Adicionar Novo Salário" : "Editar Salário"}
          </DialogTitle>
          <DialogDescription>
            {type === "create"
              ? "Preencha os dados para adicionar um novo salário."
              : "Atualize as informações do salário."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount Field */}
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

          {/* Description Field */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição opcional do salário..."
              rows={3}
            />
          </div>

          {/* Payment Date Field */}
          <div className="space-y-2">
            <Label>Data de Pagamento *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !paymentDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {paymentDate ? (
                    format(paymentDate, "PPP", { locale: ptBR })
                  ) : (
                    <span>Selecione uma data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={paymentDate}
                  onSelect={(date) => date && setPaymentDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Frequency Field */}
          <div className="space-y-2">
            <Label htmlFor="frequency">Frequência *</Label>
            <Select
              value={frequency}
              onValueChange={(value: Frequency) => setFrequency(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a frequência" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="WEEKLY">Semanal</SelectItem>
                <SelectItem value="MONTHLY">Mensal</SelectItem>
                <SelectItem value="YEARLY">Anual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Recurring Switch */}
          <div className="flex items-center space-x-2">
            <Switch
              id="recurring"
              checked={isRecurring}
              onCheckedChange={setIsRecurring}
            />
            <Label htmlFor="recurring">Salário recorrente</Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false);
                resetForm();
              }}
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
                ? "Criar Salário"
                : "Atualizar Salário"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AutoSalaryModal;
