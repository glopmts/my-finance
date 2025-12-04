"use client";

import { FolderMonthFilter } from "@/components/FolderMonthFilter";
import Header from "@/components/Header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useRecurringFolders } from "@/hooks/useRecurringFolders";
import { formatCurrency } from "@/lib/formatS";
import { formatDate } from "@/utils/formatDate";
import {
  Calendar,
  ChevronRight,
  DollarSign,
  Filter,
  Folder,
  RefreshCw,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useRouter } from "next/navigation";

const RecurringFolders = () => {
  const router = useRouter();
  const {
    userId,
    recurringFolders,
    isLoading,
    refetch,
    stats,
    selectedMonth,
    setSelectedMonth,
    availableMonths,
    currentMonth,
    formatMonth,
    totalFolders,
  } = useRecurringFolders();

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

  if (isLoading) {
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
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Pastas Recorrentes
            </h1>
            <p className="text-muted-foreground">
              Transações recorrentes filtradas por mês
            </p>
          </div>

          <div className="flex items-center gap-2">
            <FolderMonthFilter
              selectedMonth={selectedMonth}
              setSelectedMonth={setSelectedMonth}
              availableMonths={availableMonths}
              currentMonth={currentMonth}
              formatMonth={formatMonth}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="h-9 gap-2"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Stats com badge do filtro ativo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">
                Total de Pastas
              </CardTitle>
              <div className="flex items-center gap-2">
                <Folder className="h-4 w-4 text-muted-foreground" />
                {selectedMonth !== "current" && selectedMonth !== "all" && (
                  <Badge variant="outline" className="h-5 px-1.5">
                    <Filter className="h-3 w-3" />
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">
                {stats.totalFolders}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.activeCount} ativas • {totalFolders} total
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">
                Transações ({selectedMonth === "all" ? "Total" : "Filtradas"})
              </CardTitle>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                {selectedMonth !== "current" && selectedMonth !== "all" && (
                  <Badge variant="outline" className="h-5 px-1.5 text-xs">
                    {formatMonth(selectedMonth)}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">
                {stats.totalTransactions}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {selectedMonth === "current"
                  ? "Este mês"
                  : selectedMonth === "all"
                  ? "Todos os meses"
                  : formatMonth(selectedMonth)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">
                Valor ({selectedMonth === "all" ? "Total" : "Filtrado"})
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">
                {formatCurrency(stats.totalAmount)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {selectedMonth === "current"
                  ? "Este mês"
                  : selectedMonth === "all"
                  ? "Acumulado"
                  : formatMonth(selectedMonth)}
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
                {selectedMonth === "current"
                  ? "Mês atual"
                  : "Período selecionado"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Indicador de filtro ativo */}
        {selectedMonth !== "current" && (
          <div className="mb-6 p-3 bg-muted/50 rounded-lg border">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Mostrando transações do período:{" "}
                <span className="font-medium text-foreground">
                  {formatMonth(selectedMonth)}
                </span>
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedMonth("current")}
                className="ml-auto h-7 px-2"
              >
                Limpar filtro
              </Button>
            </div>
          </div>
        )}

        {/* Lista de pastas */}
        {recurringFolders && recurringFolders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recurringFolders.map((folder) => {
              const isPositive = folder.filteredAmount >= 0;
              const hasFilteredTransactions =
                folder.filteredTransactions.length > 0;

              return (
                <Card
                  key={folder.id}
                  className={`bg-card border-border hover:border-primary/50 transition-all duration-200 cursor-pointer group ${
                    !hasFilteredTransactions ? "opacity-60" : ""
                  }`}
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
                            {!hasFilteredTransactions &&
                              selectedMonth !== "all" && (
                                <span className="ml-2 text-amber-600">
                                  • Sem transações neste período
                                </span>
                              )}
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
                      {selectedMonth !== "current" &&
                        selectedMonth !== "all" && (
                          <Badge variant="outline" className="text-xs">
                            {folder.filteredTransactions.length} transações
                          </Badge>
                        )}
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
                          {folder.filteredTransactions.length} transações
                          {selectedMonth !== "all" && (
                            <span className="ml-1">
                              ({folder.transactions.length} total)
                            </span>
                          )}
                        </span>
                      </div>
                      <div className="text-right">
                        <span
                          className={`text-lg font-bold ${
                            isPositive ? "text-green-500" : "text-red-500"
                          }`}
                        >
                          {formatCurrency(folder.filteredAmount)}
                        </span>
                        {selectedMonth !== "all" &&
                          folder.filteredAmount !==
                            folder.transactions.reduce(
                              (sum, t) => sum + t.amount,
                              0
                            ) && (
                            <p className="text-xs text-muted-foreground">
                              Total:{" "}
                              {formatCurrency(
                                folder.transactions.reduce(
                                  (sum, t) => sum + t.amount,
                                  0
                                )
                              )}
                            </p>
                          )}
                      </div>
                    </div>

                    {/* Last transaction date */}
                    {folder.filteredTransactions.length > 0 && (
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Última neste período:{" "}
                        {formatDate(
                          folder.filteredTransactions[
                            folder.filteredTransactions.length - 1
                          ].date
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
                {selectedMonth !== "current" && selectedMonth !== "all"
                  ? "Nenhuma transação neste período"
                  : "Nenhuma pasta encontrada"}
              </h3>
              <p className="text-muted-foreground text-center max-w-md mb-4">
                {selectedMonth !== "current" && selectedMonth !== "all"
                  ? `Não há transações nas pastas para o período ${formatMonth(
                      selectedMonth
                    )}.`
                  : "Você ainda não criou nenhuma pasta recorrente. Comece criando sua primeira pasta para organizar suas transações."}
              </p>
              {selectedMonth !== "current" && selectedMonth !== "all" && (
                <Button
                  variant="outline"
                  onClick={() => setSelectedMonth("all")}
                  className="mt-2"
                >
                  Ver todas as transações
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default RecurringFolders;
