"use client";

import { DollarSign, Pin, Repeat, TrendingUp } from "lucide-react";
import { formatCurrency } from "../../lib/formatS";
import { trpc } from "../../server/trpc/client";
import { getFrequencyLabel } from "../../utils/infor-cards";
import { DataAlert } from "../DateAlert";
import ErrorMessage from "../ErrorMessage";
import LoaderTypes from "../LoaderTypes";
import { Badge } from "../ui/badge";
import { Card } from "../ui/card";

type Props = {
  userId: string;
};

const FixedHome = ({ userId }: Props) => {
  const {
    data: fixeds,
    refetch,
    error,
    isLoading,
  } = trpc.fixed.getFixeds.useQuery({
    userId,
  });

  if (isLoading) {
    return (
      <div className="w-full h-48">
        <LoaderTypes types="cards" count={3} />
      </div>
    );
  }

  if (!fixeds) {
    return <DataAlert message="Nenhum fixado encontrado!" />;
  }

  if (error) {
    return <ErrorMessage message={error.message} title="Error fixeds" />;
  }

  return (
    <div className="w-full h-full mt-6">
      <div className="pb-6">
        <div className="flex items-center gap-1.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-900 ring-1 ring-zinc-200 dark:ring-zinc-800">
            {" "}
            <Pin className="h-6 w-6 text-zinc-700 dark:text-zinc-300" />
          </div>

          <h1 className="text-2xl font-semibold">Transações fixadas</h1>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {fixeds?.map((c) => (
          <Card
            key={c.id}
            className="group relative overflow-hidden border-0 bg-white dark:bg-black shadow-sm ring-1 ring-zinc-100 dark:ring-zinc-900 transition-all duration-200 hover:shadow-md hover:ring-zinc-200 dark:hover:ring-zinc-800"
          >
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-900 ring-1 ring-zinc-200 dark:ring-zinc-800">
                    <DollarSign className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-medium text-zinc-900 dark:text-white">
                      {c.description || "Salário"}
                    </h3>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500 font-mono">
                      {c.id.slice(0, 8)}
                    </p>
                  </div>
                </div>

                {c.frequency && (
                  <Badge
                    variant="secondary"
                    className="h-6 px-2 border-0 bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 text-xs font-normal"
                  >
                    <Repeat className="mr-1.5 h-3 w-3" />
                    {getFrequencyLabel(c.frequency)}
                  </Badge>
                )}
              </div>
              <div className="mb-6 mt-6">
                <p className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white mb-1">
                  {formatCurrency(c.amount)}
                </p>
                <div className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                  <TrendingUp className="h-3 w-3" />
                  <span>Valor base comprar ou transferência</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FixedHome;
