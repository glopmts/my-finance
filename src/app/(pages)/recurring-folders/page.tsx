"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/server/trpc/context/client";
import {
  Calendar,
  ChevronRight,
  DollarSign,
  Folder,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import Header from "../../../components/Header";

const RecurringFolders = () => {
  const { data: userData, isLoading: loader } = trpc.auth.me.useQuery();
  const {
    data: recurringFolders,
    isLoading,
    refetch,
  } = trpc.folders.getFoldersByAccountType.useQuery(
    {
      userId: userData?.id || "",
    },
    {
      enabled: !!userData?.id,
    }
  );

  const userId = userData?.id;
  const router = useRouter();

  const stats = useMemo(() => {
    if (!recurringFolders)
      return {
        totalFolders: 0,
        activeCount: 0,
        totalTransactions: 0,
        totalAmount: 0,
      };

    const totalFolders = recurringFolders.length;
    const activeCount = recurringFolders.filter((f) => f.isActive).length;
    const totalTransactions = recurringFolders.reduce(
      (sum, folder) => sum + folder.transactions.length,
      0
    );
    const totalAmount = recurringFolders.reduce(
      (sum, folder) =>
        sum + folder.transactions.reduce((tSum, t) => tSum + t.amount, 0),
      0
    );

    return { totalFolders, activeCount, totalTransactions, totalAmount };
  }, [recurringFolders]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(dateString));
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      INCOME: "bg-green-500/10 text-green-500 border-green-500/20",
      EXPENSE: "bg-red-500/10 text-red-500 border-red-500/20",
      INVESTMENT: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      SAVINGS: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    };
    return colors[category] || "bg-muted text-muted-foreground";
  };

  const getFrequencyLabel = (frequency: string) => {
    const labels: Record<string, string> = {
      DAILY: "Diário",
      WEEKLY: "Semanal",
      MONTHLY: "Mensal",
      YEARLY: "Anual",
    };
    return labels[frequency] || frequency;
  };

  if (isLoading || loader) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!userId) {
    return router.push("/unauthenticated");
  }

  return (
    <div className="w-full flex min-h-screen h-full p-4 md:p-0">
      <Header />
      <div className="w-auto flex-1 h-full mt-4 md:mr-4 mb-10">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Pastas Recorrentes
          </h1>
          <p className="text-muted-foreground">
            Gerencie suas categorias e transações recorrentes
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">
                Total de Pastas
              </CardTitle>
              <Folder className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">
                {stats.totalFolders}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.activeCount} ativas
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">
                Transações
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">
                {stats.totalTransactions}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Total registradas
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">
                Valor Total
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">
                {formatCurrency(stats.totalAmount)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Todas as transações
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">
                Status
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">
                {stats.activeCount > 0 ? "Ativo" : "Inativo"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Sistema operacional
              </p>
            </CardContent>
          </Card>
        </div>

        {recurringFolders && recurringFolders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recurringFolders.map((folder) => {
              const totalAmount = folder.transactions.reduce(
                (sum, t) => sum + t.amount,
                0
              );
              const isPositive = totalAmount >= 0;

              return (
                <Card
                  key={folder.id}
                  className="bg-card border-border hover:border-primary/50 transition-all duration-200 cursor-pointer group"
                  style={
                    folder.color
                      ? {
                          borderLeftWidth: "4px",
                          borderLeftColor: folder.color,
                        }
                      : {}
                  }
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-muted">
                          <Folder className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <CardTitle className="text-lg text-card-foreground group-hover:text-primary transition-colors">
                            {folder.name}
                          </CardTitle>
                          <CardDescription className="text-xs mt-1">
                            {getFrequencyLabel(folder.frequency)}
                          </CardDescription>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Category and Status */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        variant="outline"
                        className={getCategoryColor(folder.category)}
                      >
                        {folder.category}
                      </Badge>
                      <Badge
                        variant={folder.isActive ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {folder.isActive ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>

                    {/* Description */}
                    {folder.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {folder.description}
                      </p>
                    )}

                    {/* Amount */}
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <div className="flex items-center gap-2">
                        {isPositive ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        )}
                        <span className="text-xs text-muted-foreground">
                          {folder.transactions.length} transações
                        </span>
                      </div>
                      <span
                        className={`text-lg font-bold ${
                          isPositive ? "text-green-500" : "text-red-500"
                        }`}
                      >
                        {formatCurrency(totalAmount)}
                      </span>
                    </div>

                    {/* Last transaction date */}
                    {folder.transactions.length > 0 && (
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Última:{" "}
                        {formatDate(
                          folder.transactions[folder.transactions.length - 1]
                            .date
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="bg-card border-border">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Folder className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold text-card-foreground mb-2">
                Nenhuma pasta encontrada
              </h3>
              <p className="text-muted-foreground text-center max-w-md">
                Você ainda não criou nenhuma pasta recorrente. Comece criando
                sua primeira pasta para organizar suas transações.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default RecurringFolders;
