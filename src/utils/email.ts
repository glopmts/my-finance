import { endOfMonth, format, startOfMonth, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

export interface MonthlyStats {
  total: number;
  highestExpense: number;
  lowestExpense: number;
  averageExpense: number;
  totalTransactions: number;
  month: string;
  year: number;
}

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

export const getMonthRange = (
  month?: number,
  year?: number,
  usePreviousMonth: boolean = true
) => {
  const now = new Date();
  let targetMonth = month;
  let targetYear = year;

  if (!month && !year && usePreviousMonth) {
    const lastMonth = subMonths(now, 1);
    targetMonth = lastMonth.getMonth() + 1;
    targetYear = lastMonth.getFullYear();
  } else {
    targetMonth = month || now.getMonth() + 1;
    targetYear = year || now.getFullYear();
  }

  return {
    start: startOfMonth(new Date(targetYear, targetMonth - 1)),
    end: endOfMonth(new Date(targetYear, targetMonth - 1)),
    month: targetMonth,
    year: targetYear,
  };
};

export const generateEmailTemplate = (
  stats: MonthlyStats,
  userName: string
): string => {
  const monthName = format(
    new Date(stats.year, parseInt(stats.month) - 1),
    "MMMM",
    { locale: ptBR }
  );

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: #0070f3;
          color: white;
          padding: 20px;
          text-align: center;
          border-radius: 5px 5px 0 0;
        }
        .content {
          background: #f9f9f9;
          padding: 20px;
          border-radius: 0 0 5px 5px;
        }
        .stat {
          margin: 15px 0;
          padding: 15px;
          background: white;
          border-radius: 5px;
          border-left: 4px solid #0070f3;
        }
        .highlight {
          color: #0070f3;
          font-weight: bold;
          font-size: 1.2em;
        }
        .footer {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          text-align: center;
          color: #777;
          font-size: 0.9em;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>💰 Relatório Mensal de Gastos</h1>
        <p>${monthName.charAt(0).toUpperCase() + monthName.slice(1)} de ${
    stats.year
  }</p>
      </div>
      <div class="content">
        <p>Olá, ${userName}! Segue o resumo dos seus gastos do mês:</p>
        
        <div class="stat">
          <strong>Total Gasto:</strong> <span class="highlight">${formatCurrency(
            stats.total
          )}</span>
        </div>
        
        <div class="stat">
          <strong>Maior Gasto:</strong> <span class="highlight">${formatCurrency(
            stats.highestExpense
          )}</span>
        </div>
        
        <div class="stat">
          <strong>Menor Gasto:</strong> <span class="highlight">${formatCurrency(
            stats.lowestExpense
          )}</span>
        </div>
        
        <div class="stat">
          <strong>Média de Gastos:</strong> <span class="highlight">${formatCurrency(
            stats.averageExpense
          )}</span>
        </div>
        
        <div class="stat">
          <strong>Total de Transações:</strong> <span class="highlight">${
            stats.totalTransactions
          }</span>
        </div>

        <div class="footer">
          <p>Este é um relatório automático gerado pelo seu sistema de finanças.</p>
          <p>💡 Dica: Analise seus gastos e identifique oportunidades de economia!</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
