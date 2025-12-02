"use client";

import { formatCurrency } from "@/lib/formatS";
import { trpc } from "@/server/trpc/context/client";
import { Calendar, CreditCard, DollarSign, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { DataAlert } from "../infor/DateAlert";
import LoaderTypes from "../infor/LoaderTypes";
import CreditCardModal from "../modals/auto-credit-card-modal";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Spinner } from "../ui/spinner";

const CreditCardPage = () => {
  const { data: user, isLoading: loaderUser } = trpc.auth.me.useQuery();
  const {
    data: creditCards,
    isLoading,
    error,
    refetch,
  } = trpc.creditCard.getUserCreditCards.useQuery({
    userId: user?.id as string,
  });

  const [showBalance, setShowBalance] = useState(false);

  const mutationReset = trpc.creditCard.resetCreditCard.useMutation();

  const handleResetLimits = (creditId: string) => {
    if (!creditId) return;
    const confirmReset = window.confirm(
      "Tem certeza que deseja resetar os limites deste cartão?"
    );
    if (!confirmReset) return;
    mutationReset.mutate(
      {
        userId: user?.id as string,
        creditId: creditId,
      },
      {
        onSuccess: () => {
          refetch();
          toast.success("Limites do cartão resetados com sucesso!");
        },
        onError: (error) => {
          toast.error(`Erro ao resetar limites do cartão: ${error.message}`);
        },
      }
    );
  };

  if (isLoading || loaderUser) {
    return (
      <div className="w-full h-46 mt-8">
        <LoaderTypes types="spine" count={2} />
      </div>
    );
  }

  if (!creditCards || creditCards.length === 0) {
    return (
      <div className="w-full h-full p-2">
        <div className="pb-6 flex justify-between w-full">
          <h1 className="text-xl font-semibold">Cartão de crédito</h1>
          <CreditCardModal type="create" userId={user?.id as string} />
        </div>
        <DataAlert message="Nenhum cartão encontrado!" />
      </div>
    );
  }

  const getCardGradient = (cardName: string) => {
    const gradients = {
      nubank: "from-purple-600 to-pink-500",
      itau: "from-orange-500 to-red-500",
      bradesco: "from-red-600 to-red-400",
      santander: "from-red-500 to-orange-400",
      default: "from-blue-600 to-cyan-500",
    };

    const name = cardName.toLowerCase();
    if (name.includes("nubank")) return gradients.nubank;
    if (name.includes("itau") || name.includes("itáu")) return gradients.itau;
    if (name.includes("bradesco")) return gradients.bradesco;
    if (name.includes("santander")) return gradients.santander;
    return gradients.default;
  };

  return (
    <div className="w-full h-full p-2">
      <div className="pb-6 flex justify-between items-center w-full">
        <div>
          <h1 className="text-xl font-semibold">Cartão de crédito</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {creditCards.length} cartão{creditCards.length > 1 ? "s" : ""}{" "}
            cadastrado{creditCards.length > 1 ? "s" : ""}
          </p>
          <div className="flex items-center justify-center">
            {error?.message && <DataAlert message={error.message} />}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowBalance(!showBalance)}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            title={showBalance ? "Ocultar valores" : "Mostrar valores"}
          >
            {showBalance ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
          {creditCards?.length > 0 ? (
            <CreditCardModal
              type="update"
              userId={user?.id as string}
              card={creditCards[0]}
            />
          ) : (
            <CreditCardModal type="create" userId={user?.id as string} />
          )}
        </div>
      </div>

      <div className=" w-full">
        {creditCards.map((card) => (
          <Card
            key={card.id}
            className="group p-0 relative overflow-hidden border-0 bg-white dark:bg-black shadow-sm ring-1 ring-zinc-100 dark:ring-zinc-900 transition-all duration-200 hover:shadow-md hover:ring-zinc-200 dark:hover:ring-zinc-800 w-full"
          >
            {/* Header do Cartão */}
            <div className="w-full">
              <div
                className={`p-6 text-white ${getCardGradient(
                  card.name
                )} bg-linear-to-r rounded-t-lg`}
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="font-semibold text-lg">{card.name}</h3>
                    <p className="text-white/80 text-sm">
                      •••• •••• •••• {card.lastDigits}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={card.isActive ? "default" : "secondary"}
                      className="bg-white/20 text-white border-0"
                    >
                      {card.isActive ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                </div>

                {/* Chip do Cartão */}
                <div className="w-12 h-8 bg-yellow-400 rounded-lg mb-4 relative">
                  <div className="absolute inset-1 bg-yellow-300 rounded-md">
                    <div className="grid grid-cols-2 gap-1 h-full">
                      {[...Array(8)].map((_, i) => (
                        <div key={i} className="bg-yellow-500 rounded-sm"></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Informações do Cartão */}
              <div className="p-6 space-y-4">
                {/* Limite Total */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <DollarSign size={16} className="text-zinc-500" />
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">
                      Limite Total
                    </span>
                  </div>
                  <span className="font-semibold">
                    {showBalance ? formatCurrency(card.creditLimit) : "•••••"}
                  </span>
                </div>

                {/* Limite Disponível */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <CreditCard size={16} className="text-zinc-500" />
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">
                      Disponível
                    </span>
                  </div>
                  <span
                    className={`font-semibold ${
                      card.availableLimit < card.creditLimit * 0.3
                        ? "text-red-500"
                        : card.availableLimit < card.creditLimit * 0.5
                        ? "text-yellow-500"
                        : "text-green-500"
                    }`}
                  >
                    {showBalance
                      ? formatCurrency(card.availableLimit)
                      : "•••••"}
                  </span>
                </div>

                {/* Barra de Progresso do Limite */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-zinc-500">
                    <span>Utilizado</span>
                    <span>
                      {(
                        ((card.creditLimit - card.availableLimit) /
                          card.creditLimit) *
                        100
                      ).toFixed(1)}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        (card.creditLimit - card.availableLimit) /
                          card.creditLimit >
                        0.8
                          ? "bg-red-500"
                          : (card.creditLimit - card.availableLimit) /
                              card.creditLimit >
                            0.5
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                      style={{
                        width: `${
                          ((card.creditLimit - card.availableLimit) /
                            card.creditLimit) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>

                {/* Dias de Fechamento e Vencimento */}
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-zinc-500" />
                    <div>
                      <p className="text-xs text-zinc-500">Fechamento</p>
                      <p className="text-sm font-medium">
                        Dia {card.closingDay}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-zinc-500" />
                    <div>
                      <p className="text-xs text-zinc-500">Vencimento</p>
                      <p className="text-sm font-medium">Dia {card.dueDay}</p>
                    </div>
                  </div>
                </div>

                {/* Data de Criação */}
                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <div className="flex justify-between w-full items-center">
                    <p className="text-xs text-zinc-500">
                      Criado em{" "}
                      {new Date(card.createdAt).toLocaleDateString("pt-BR")}
                    </p>
                    <div className="">
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-3xl"
                        onClick={() => handleResetLimits(card.id)}
                        disabled={mutationReset.isPending}
                      >
                        {mutationReset.isPending ? (
                          <span className="flex items-center gap-2">
                            <Spinner /> Resetando
                          </span>
                        ) : (
                          "Resetar Limites"
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CreditCardPage;
