import {
  endOfMonth,
  format,
  isWithinInterval,
  parseISO,
  startOfMonth,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { TransactionProps } from "../types/interfaces";

export function fnDateBasic(date: Date): string {
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

// const hoje = new Date();

export function fnDateLong(date: Date): string {
  const days = [
    "Domingo",
    "Segunda",
    "Terça",
    "Quarta",
    "Quinta",
    "Sexta",
    "Sábado",
  ];
  const months = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];

  const dayName = days[date.getDay()];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `${dayName}, ${day} de ${month} de ${year}`;
}

export function fnDateIsoWithTime(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export const getCurrentMonthRange = () => {
  const now = new Date();
  return {
    start: startOfMonth(now),
    end: endOfMonth(now),
  };
};

export const filterTransactionsByMonth = (
  transactions: TransactionProps[],
  monthDate: Date
) => {
  const { start, end } = getMonthRange(monthDate);

  return transactions.filter((transaction) => {
    const transactionDate = parseISO(transaction.date);
    return isWithinInterval(transactionDate, { start, end });
  });
};

export const getMonthRange = (date: Date) => {
  return {
    start: startOfMonth(date),
    end: endOfMonth(date),
  };
};

export const formatMonthName = (date: Date) => {
  return format(date, "MMMM yyyy", { locale: ptBR });
};

export const calculateTotalExpenses = (transactions: TransactionProps[]) => {
  return transactions
    .filter(
      (t) =>
        t.type === "EXPENSE" || t.type === "INCOME" || t.type === "TRANSFER"
    )
    .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);
};

export const addMonths = (date: Date, months: number) => {
  const newDate = new Date(date);
  newDate.setMonth(newDate.getMonth() + months);
  return newDate;
};
