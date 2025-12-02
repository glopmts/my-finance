"use client";

import { formatCurrency } from "@/lib/formatS";
import { trpc } from "@/server/trpc/context/client";
import { getFrequencyLabel } from "@/utils/infor-cards";
import { DollarSign, Pin, Repeat, TrendingUp } from "lucide-react";
import { useState } from "react";
import { formatDate } from "../../utils/formatDate";
import { DataAlert } from "../infor/DateAlert";
import ErrorMessage from "../infor/ErrorMessage";
import LoaderTypes from "../infor/LoaderTypes";
import MenuDropdwonCard from "../MenuDropdwonCards";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Checkbox } from "../ui/checkbox";

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

  const [selected, setSelected] = useState<string[]>([]);

  const deleteFixedMutation = trpc.fixed.deleteFixeds.useMutation({
    onSuccess: () => refetch(),
    onError: (error) => console.error("Erro ao deletar fixado:", error),
  });

  const deleteMultipleTransactions = (ids: string[]) => {
    if (confirm("Tem certeza que deseja deletar os fixados selecionados?")) {
      ids.forEach((id) => {
        deleteFixedMutation.mutate({ fixedId: id, userId });
      });
      refetch();
      setSelected([]);
    }
  };

  const isSelected = (id: string) => selected.includes(id);

  const handleCheckboxClick = (id: string) => {
    if (isSelected(id)) {
      setSelected(selected.filter((selectedId) => selectedId !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja deletar este fixado?")) {
      deleteFixedMutation.mutate({ fixedId: id, userId });
    }
  };

  const totalFixedAmount = fixeds?.reduce((sum, c) => sum + c.amount, 0) ?? 0;

  if (isLoading) {
    return (
      <div className="w-full h-65 mt-8">
        <LoaderTypes types="cards" count={3} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-4">
        <ErrorMessage message={error.message} title="Error fixeds" />
      </div>
    );
  }

  if (!fixeds || fixeds.length === 0) {
    return (
      <div className="w-full h-full mt-6">
        <div className="pb-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-900 ring-1 ring-zinc-200 dark:ring-zinc-800">
              <Pin className="h-6 w-6 text-zinc-700 dark:text-zinc-300" />
            </div>
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-semibold">Transações fixadas</h1>
              <span className="text-sm text-zinc-300">Total fixados: 0</span>
            </div>
          </div>
        </div>
        <DataAlert message="Nenhum fixado encontrado!" />
      </div>
    );
  }

  return (
    <div className="w-full h-full mt-6">
      <div className="pb-6 flex items-center justify-between w-full">
        <div className="flex items-center gap-2.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-900 ring-1 ring-zinc-200 dark:ring-zinc-800">
            <Pin className="h-6 w-6 text-zinc-700 dark:text-zinc-300" />
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold">Transações fixadas</h1>
            <span className="text-sm text-zinc-300">
              Total fixados: {fixeds.length}
            </span>
            <span className="text-sm text-zinc-300">
              Total fixado:{" "}
              {totalFixedAmount.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </span>
          </div>
        </div>
        {selected.length > 0 && (
          <Button
            variant="destructive"
            onClick={() => deleteMultipleTransactions(selected)}
          >
            Deletar selecionados ({selected.length})
          </Button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {fixeds.map((c) => (
          <Card
            key={c.id}
            className={`group relative overflow-hidden border from-zinc-50/20 bg-linear-to-br shadow-sm ring-1 ring-zinc-100 dark:ring-zinc-900 transition-all duration-200 hover:shadow-md hover:ring-zinc-200 dark:hover:ring-zinc-800 dark:from-zinc-800/60 ${
              isSelected(c.id) ? "ring-2 ring-blue-500 border-blue-500" : ""
            }`}
            onClick={() => handleCheckboxClick(c.id)}
          >
            <div className="p-6">
              <div className="flex items-start justify-between relative">
                <div className="absolute -top-12 p-2 -right-3">
                  <div className="flex gap-2.5 items-center">
                    <div className="">
                      <Checkbox
                        checked={selected.includes(c.id)}
                        onClick={() => handleCheckboxClick(c.id)}
                        onCheckedChange={() => handleCheckboxClick(c.id)}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <MenuDropdwonCard
                        handleDelete={handleDelete}
                        fixedId={c.id}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 p-3 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-900 ring-1 ring-zinc-200 dark:ring-zinc-800">
                    <DollarSign className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                  </div>
                  <div className="space-y-1">
                    <h3
                      className="font-medium text-zinc-900 dark:text-white line-clamp-1"
                      title={c.description || "Salário"}
                    >
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
                <div className="mt-2">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    Criado hein: <strong>{formatDate(c.createdAt)}</strong>
                  </span>
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
