"use client";

import { useMonthlyBalance } from "@/hooks/useMonthlyBalance";
import { DataAlert } from "../infor/DateAlert";
import { Button } from "../ui/button";

interface MonthlyBalanceCardProps {
  userId: string;
}

export function MonthlyBalanceCard({ userId }: MonthlyBalanceCardProps) {
  const { currentBalance, history, isLoading, closeCurrentMonth, isClosing } =
    useMonthlyBalance(userId);

  if (!currentBalance) {
    return <DataAlert message="Nenhum saldo encontrado" />;
  }

  const isPositive = currentBalance.balance >= 0;

  return (
    <div className="group relative overflow-hidden border bg-white dark:bg-zinc-900/20 shadow-sm ring-1 ring-zinc-100 dark:ring-zinc-900 transition-all duration-200 hover:shadow-md hover:ring-zinc-200 dark:hover:ring-zinc-800 p-3 rounded-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">
          Saldo de {currentBalance.month}/{currentBalance.year}
          {currentBalance.isClosed && (
            <span className="ml-2 text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
              FECHADO
            </span>
          )}
        </h2>

        {!currentBalance.isClosed && (
          <Button onClick={closeCurrentMonth} disabled={isClosing}>
            {isClosing ? "Fechando..." : "Fechar Mês"}
          </Button>
        )}
      </div>

      <div
        className={`text-2xl font-bold ${
          isPositive ? "text-green-600" : "text-red-600"
        }`}
      >
        R$ {currentBalance.balance.toFixed(2)}
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
        <div>
          <p className="text-gray-600">Total Receitas</p>
          <p className="text-green-600 font-semibold">
            R$ {currentBalance.totalIncome.toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-gray-600">Total Despesas</p>
          <p className="text-red-600 font-semibold">
            R$ {currentBalance.totalExpenses.toFixed(2)}
          </p>
        </div>
      </div>

      {history && history.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Histórico</h3>
          <div className="space-y-2">
            {history.map((balance) => (
              <div key={balance.id} className="flex justify-between text-sm">
                <span>
                  {balance.month}/{balance.year}
                </span>
                <span
                  className={
                    balance.balance >= 0 ? "text-green-600" : "text-red-600"
                  }
                >
                  R$ {balance.balance.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
