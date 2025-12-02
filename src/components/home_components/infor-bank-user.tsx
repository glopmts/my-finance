"use client";

import { Filter, TrendingDown, TrendingUp, Wallet, X } from "lucide-react";
import { InforBankUserHook } from "../../hooks/bank-account";
import { SalaryCard } from "../cards-salary";
import { DataAlert } from "../infor/DateAlert";
import LoaderTypes from "../infor/LoaderTypes";
import AutoBankAccountModal from "../modals/auto-bankAccount-modal";
import AutoSalaryModal from "../modals/auto-salary-modal";
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

const InforBankUser = () => {
  const {
    totalBalance,
    loaderUser,
    isLoading,
    currentIndex,
    loader,
    typeInfor,
    loaderSalary,
    mockSalaryData,
    showFilters,
    filteredTransactions,
    availableCategories,
    activeFiltersCount,
    formatMonth,
    selectedMonth,
    setSelectedMonth,
    availableMonths,
    selectedType,
    setSelectedType,
    selectedCategory,
    setSelectedCategory,
    bankAccount,
    userData,
    mockTransaction,
    clearFilters,
    calculateTotalExpenses,
    refetch,
    calculateTotalIncome,
    setShowFilters,
    currentMonth,
  } = InforBankUserHook({
    typeInfor: "default",
  });

  if (isLoading || loader || loaderSalary || loaderUser) {
    return (
      <div className="w-full h-46 mt-8">
        <LoaderTypes types="spine" count={2} />
      </div>
    );
  }

  if (!mockSalaryData || mockSalaryData.length === 0) {
    return <DataAlert message="Nenhum salário encontrado!" />;
  }

  if (!mockTransaction) {
    return <DataAlert message="Nenhuma transferência encontrada!" />;
  }

  const currentSalary = mockSalaryData && mockSalaryData[currentIndex];
  const maxValue = currentSalary?.amount;
  const totalExpenses = calculateTotalExpenses(filteredTransactions);
  const totalIncome = calculateTotalIncome(filteredTransactions);
  const progressValue = Math.min((totalExpenses / maxValue) * 100, 100);
  const isOverLimit = totalExpenses > maxValue;

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
                        {month === currentMonth && " (Atual)"}
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

      <div className="flex  md:justify-between w-full flex-col-reverse gap-2.5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-linear-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
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

          <Card className="bg-linear-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
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
                {selectedMonth === "all"
                  ? "Todos os meses"
                  : selectedMonth === currentMonth
                  ? "Este mês"
                  : formatMonth(selectedMonth)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-linear-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-red-200 dark:border-red-800">
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
        <div className="flex items-end justify-end">
          {bankAccount && bankAccount.length > 0 ? (
            <AutoBankAccountModal
              refetch={refetch}
              type="update"
              bankData={bankAccount[0]}
              userId={userData?.id as string}
            />
          ) : (
            <AutoBankAccountModal
              refetch={refetch}
              type="create"
              userId={userData?.id as string}
            />
          )}
        </div>
      </div>
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            Salário{" "}
            {mockSalaryData.length > 1 &&
              `(${currentIndex + 1}/${mockSalaryData.length})`}
          </h2>
          {mockSalaryData?.length && mockSalaryData?.length > 0 ? (
            <AutoSalaryModal
              type="update"
              userId={userData?.id as string}
              refetch={refetch}
              salaryData={mockSalaryData[0]}
            />
          ) : (
            <AutoSalaryModal
              type="create"
              userId={userData?.id as string}
              refetch={refetch}
            />
          )}
        </div>

        <div className="relative overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {mockSalaryData.map((salary) => (
              <div key={salary.id} className="w-full shrink-0">
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
    </div>
  );
};

export default InforBankUser;
