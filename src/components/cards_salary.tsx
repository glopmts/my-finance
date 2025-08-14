import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Frequency } from "@prisma/client";
import { CalendarDays, DollarSign, Repeat } from "lucide-react";
import { formatCurrency } from "../lib/formatS";
import { Progress } from "./ui/progress";

type SalaryData = {
  userId: string;
  description?: string | null;
  id: string;
  createdAt: string;
  updatedAt: string;
  amount: number;
  isRecurring: boolean;
  paymentDate: string;
  frequency: Frequency;
};

interface SalaryCardProps {
  salary: SalaryData;
}

export function SalaryCard({ salary }: SalaryCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getFrequencyLabel = (frequency: string) => {
    const labels = {
      MONTHLY: "Mensal",
      WEEKLY: "Semanal",
      YEARLY: "Anual",
      DAILY: "Diário",
    };
    return labels[frequency as keyof typeof labels] || frequency;
  };

  return (
    <Card className="group relative overflow-hidden border-zinc-200/50 bg-zinc-50/30 backdrop-blur-sm transition-all duration-200 hover:border-zinc-300/60 hover:bg-zinc-50/50 hover:shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900/30 dark:hover:border-zinc-700/60 dark:hover:bg-zinc-900/50">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-50/20 to-transparent dark:from-zinc-800/20" />

      <div className="relative p-4">
        {/* Header */}
        <div className="mb-3 flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
              <DollarSign className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {salary.description || "Salário"}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                ID: {salary.id.slice(0, 8)}...
              </p>
            </div>
          </div>

          {salary.isRecurring && (
            <Badge
              variant="secondary"
              className="h-5 border-zinc-200/50 bg-zinc-100/50 text-xs text-zinc-600 dark:border-zinc-700/50 dark:bg-zinc-800/50 dark:text-zinc-300"
            >
              <Repeat className="mr-1 h-3 w-3" />
              {getFrequencyLabel(salary.frequency)}
            </Badge>
          )}
        </div>

        {/* Amount */}
        <div className="mb-3">
          <p className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            {formatCurrency(salary.amount)}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center gap-1">
            <CalendarDays className="h-3 w-3" />
            <span>Pagamento: {formatDate(salary.paymentDate)}</span>
          </div>
          <div className="text-right">
            <p>Atualizado em</p>
            <p>{formatDate(salary.updatedAt)}</p>
          </div>
        </div>
        <div className="w-full mt-3">
          <div className="pb-2">
            <h3>Progresso de Gastos</h3>
          </div>
          <Progress value={80} />
        </div>
      </div>
    </Card>
  );
}
