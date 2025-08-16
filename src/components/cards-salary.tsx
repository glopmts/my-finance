import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Frequency } from "@prisma/client";
import { CalendarDays, DollarSign, Repeat, TrendingUp } from "lucide-react";
import { formatCurrency } from "../lib/formatS";
import { getFrequencyLabel } from "../utils/infor-cards";

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
  progressValue?: number;
  isOverLimit?: boolean;
}

export function SalaryCard({
  salary,
  progressValue,
  isOverLimit,
}: SalaryCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <Card className="group relative overflow-hidden border-0 bg-white dark:bg-black shadow-sm ring-1 ring-zinc-100 dark:ring-zinc-900 transition-all duration-200 hover:shadow-md hover:ring-zinc-200 dark:hover:ring-zinc-800">
      <div className="p-6">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-900 ring-1 ring-zinc-200 dark:ring-zinc-800">
              <DollarSign className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
            </div>
            <div className="space-y-1">
              <h3 className="font-medium text-zinc-900 dark:text-white">
                {salary.description || "Salário"}
              </h3>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 font-mono">
                {salary.id.slice(0, 8)}
              </p>
            </div>
          </div>

          {salary.isRecurring && (
            <Badge
              variant="secondary"
              className="h-6 px-2 border-0 bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 text-xs font-normal"
            >
              <Repeat className="mr-1.5 h-3 w-3" />
              {getFrequencyLabel(salary.frequency)}
            </Badge>
          )}
        </div>

        {/* Amount Section */}
        <div className="mb-6">
          <p className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white mb-1">
            {formatCurrency(salary.amount)}
          </p>
          <div className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
            <TrendingUp className="h-3 w-3" />
            <span>Valor base mensal</span>
          </div>
        </div>

        {/* Progress Section */}
        <div className="mb-6 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-zinc-900 dark:text-white">
              Progresso de Gastos
            </h4>
            <p
              className={`text-sm font-semibold ${
                isOverLimit
                  ? "text-red-600 dark:text-red-400"
                  : "text-green-600 dark:text-green-400"
              }`}
            >
              {progressValue?.toFixed(2)}%
            </p>
          </div>
          <Progress
            value={progressValue}
            className={`h-3 ${
              isOverLimit ? "bg-red-100 dark:bg-red-900/20" : ""
            }`}
          />
        </div>

        {/* Footer Section */}
        <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-900">
          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <CalendarDays className="h-3 w-3" />
            <span>Pagamento: {formatDate(salary.paymentDate)}</span>
          </div>
          <div className="text-right text-xs text-zinc-400 dark:text-zinc-500">
            <p>Atualizado</p>
            <p className="font-mono">{formatDate(salary.updatedAt)}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
