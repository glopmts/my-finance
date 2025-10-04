"use client";

import { Filter, TrendingDown, TrendingUp, Wallet, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { trpc } from "../../server/trpc/client";
import type { TransactionProps } from "../../types/interfaces";
import { SalaryCard } from "../cards-salary";
import { DataAlert } from "../infor/DateAlert";
import LoaderTypes from "../infor/LoaderTypes";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
type PropsInfor = {
  typeInfor?: "next" | "default";
  autoPlayInterval?: number;
};

const InforBankUser = ({
  typeInfor = "default",
  autoPlayInterval = 5000,
}: PropsInfor) => {
  const { data: userData, isLoading: loaderUser } = trpc.auth.me.useQuery();

  const {
    data: bankAccount,
    isLoading,
    refetch,
  } = trpc.bankAccount.getBankAcconut.useQuery({
    userId: userData?.id as string,
  });

  const {
    data: mockTransaction,
    isLoading: loader,
    error: errorTransaction,
    refetch: refetchTransaction,
  } = trpc.transaction.getTransactions.useQuery({
    userId: userData?.id as string,
  });

  const {
    data: mockSalaryData,
    isLoading: loaderSalary,
    error,
  } = trpc.salary.getSalary.useQuery({
    userId: userData?.id as string,
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (!isAutoPlay || !mockSalaryData || mockSalaryData.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % mockSalaryData.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [isAutoPlay, mockSalaryData, autoPlayInterval]);

  const filteredTransactions = useMemo(() => {
    if (!mockTransaction) return [];

    return mockTransaction.filter((transaction) => {
      const transactionDate = new Date(transaction.date);
      const transactionMonth = `${transactionDate.getFullYear()}-${String(
        transactionDate.getMonth() + 1
      ).padStart(2, "0")}`;

      const matchesMonth =
        selectedMonth === "all" || transactionMonth === selectedMonth;
      const matchesType =
        selectedType === "all" || transaction.type === selectedType;
      const matchesCategory =
        selectedCategory === "all" || transaction.category === selectedCategory;

      return matchesMonth && matchesType && matchesCategory;
    });
  }, [mockTransaction, selectedMonth, selectedType, selectedCategory]);

  const availableMonths = useMemo(() => {
    if (!mockTransaction) return [];

    const months = new Set<string>();
    mockTransaction.forEach((transaction) => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;
      months.add(monthKey);
    });

    return Array.from(months).sort().reverse();
  }, [mockTransaction]);

  const availableCategories = useMemo(() => {
    if (!mockTransaction) return [];

    const categories = new Set<string>();
    mockTransaction.forEach((transaction) => {
      if (transaction.category) {
        categories.add(transaction.category);
      }
    });

    return Array.from(categories).sort();
  }, [mockTransaction]);

  const formatMonth = (monthKey: string) => {
    const [year, month] = monthKey.split("-");
    const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1);
    return date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  };

  const clearFilters = () => {
    setSelectedMonth("all");
    setSelectedType("all");
    setSelectedCategory("all");
  };

  const activeFiltersCount = [
    selectedMonth,
    selectedType,
    selectedCategory,
  ].filter((f) => f !== "all").length;

  const handlePrevious = () => {
    setIsAutoPlay(false);
    setCurrentIndex((prev) =>
      prev === 0 ? (mockSalaryData?.length || 1) - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setIsAutoPlay(false);
    setCurrentIndex((prev) => (prev + 1) % (mockSalaryData?.length || 1));
  };

  if (isLoading || loader || loaderSalary || loaderUser) {
    return (
      <div className="w-full h-46 mt-8">
        <LoaderTypes types="spine" count={2} />
      </div>
    );
  }

  function calculateTotalExpenses(transactions: TransactionProps[]) {
    if (!Array.isArray(transactions)) return 0;

    return transactions
      .filter((t) => t.type === "EXPENSE")
      .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);
  }

  function calculateTotalIncome(transactions: TransactionProps[]) {
    if (!Array.isArray(transactions)) return 0;

    return transactions
      .filter((t) => t.type === "INCOME")
      .reduce((sum, transaction) => sum + transaction.amount, 0);
  }

  if (!mockSalaryData || mockSalaryData.length === 0) {
    return <DataAlert message="Nenhum salário encontrado!" />;
  }

  if (!mockTransaction) {
    return <DataAlert message="Nenhuma transferência encontrada!" />;
  }

  const currentSalary = mockSalaryData[currentIndex];
  const maxValue = currentSalary.amount;
  const totalExpenses = calculateTotalExpenses(filteredTransactions);
  const totalIncome = calculateTotalIncome(filteredTransactions);
  const progressValue = Math.min((totalExpenses / maxValue) * 100, 100);
  const isOverLimit = totalExpenses > maxValue;

  const totalBalance =
    bankAccount?.reduce((sum, account) => sum + account.balance, 0) || 0;

  return (
    <div className="w-full h-full space-y-6">
      <Card className="border-2">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              <CardTitle className="text-lg">Filtros</CardTitle>
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFiltersCount}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-8 text-xs"
                >
                  <X className="h-3 w-3 mr-1" />
                  Limpar
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="h-8 text-xs"
              >
                {showFilters ? "Ocultar" : "Mostrar"}
              </Button>
            </div>
          </div>
        </CardHeader>

        {showFilters && (
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Mês</label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os meses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os meses</SelectItem>
                    {availableMonths.map((month) => (
                      <SelectItem key={month} value={month}>
                        {formatMonth(month)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo</label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os tipos</SelectItem>
                    <SelectItem value="INCOME">Receita</SelectItem>
                    <SelectItem value="EXPENSE">Despesa</SelectItem>
                    <SelectItem value="TRANSFER">Transferência</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Categoria</label>
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as categorias" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as categorias</SelectItem>
                    {availableCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {activeFiltersCount > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-sm text-muted-foreground">
                  Filtros ativos:
                </span>
                {selectedMonth !== "all" && (
                  <Badge variant="secondary" className="gap-1">
                    {formatMonth(selectedMonth)}
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-destructive"
                      onClick={() => setSelectedMonth("all")}
                    />
                  </Badge>
                )}
                {selectedType !== "all" && (
                  <Badge variant="secondary" className="gap-1">
                    {selectedType === "INCOME"
                      ? "Receita"
                      : selectedType === "EXPENSE"
                      ? "Despesa"
                      : "Transferência"}
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-destructive"
                      onClick={() => setSelectedType("all")}
                    />
                  </Badge>
                )}
                {selectedCategory !== "all" && (
                  <Badge variant="secondary" className="gap-1">
                    {selectedCategory}
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-destructive"
                      onClick={() => setSelectedCategory("all")}
                    />
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        )}
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Saldo Total
            </CardTitle>
            <Wallet className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              R$ {totalBalance.toFixed(2)}
            </div>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
              {bankAccount?.length || 0} conta(s) ativa(s)
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-900 dark:text-green-100">
              Receitas
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">
              R$ {totalIncome.toFixed(2)}
            </div>
            <p className="text-xs text-green-700 dark:text-green-300 mt-1">
              {activeFiltersCount > 0 ? "Filtrado" : "Este mês"}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-red-200 dark:border-red-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-900 dark:text-red-100">
              Despesas
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900 dark:text-red-100">
              R$ {totalExpenses.toFixed(2)}
            </div>
            <p className="text-xs text-red-700 dark:text-red-300 mt-1">
              {isOverLimit ? "⚠️ Acima do limite" : "Dentro do orçamento"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            Salário{" "}
            {mockSalaryData.length > 1 &&
              `(${currentIndex + 1}/${mockSalaryData.length})`}
          </h2>
        </div>

        <div className="relative overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {mockSalaryData.map((salary) => (
              <div key={salary.id} className="w-full flex-shrink-0">
                <SalaryCard
                  userId={userData?.id as string}
                  salary={salary}
                  progressValue={progressValue}
                  isOverLimit={isOverLimit}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {bankAccount && bankAccount.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Contas Bancárias</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bankAccount.map((account) => (
              <Card
                key={account.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <CardTitle className="text-base flex items-center justify-between">
                    <span>{account.name}</span>
                    {account.isActive && (
                      <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 px-2 py-1 rounded-full">
                        Ativa
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {account.bankName}
                    </p>
                    {account.accountNumber && (
                      <p className="text-xs text-muted-foreground">
                        Conta: {account.accountNumber}
                      </p>
                    )}
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground">Saldo</p>
                    <p className="text-2xl font-bold">
                      R$ {account.balance.toFixed(2)}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground capitalize">
                    {account.accountType.toLowerCase().replace("_", " ")}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default InforBankUser;
