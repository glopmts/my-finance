import { EmailOptions, sendEmail } from "@/lib/mailer";
import { db } from "@/lib/prisma";
import {
  generateEmailTemplate,
  getMonthRange,
  MonthlyStats,
} from "@/utils/email";
import { auth } from "@clerk/nextjs/server";
import { format } from "date-fns";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Não autorizado. Faça login para continuar." },
        { status: 401 }
      );
    }

    const {
      month,
      year,
      email,
      reportType = "previous",
    } = await request.json();

    const userEmail = email || sessionClaims?.email;

    if (!userEmail) {
      return NextResponse.json(
        { error: "Email do usuário não encontrado" },
        { status: 400 }
      );
    }

    const usePreviousMonth = reportType === "previous";

    const {
      start,
      end,
      month: calculatedMonth,
      year: calculatedYear,
    } = getMonthRange(month, year, usePreviousMonth);

    const user = await db.user.findUnique({
      where: {
        clerkId: userId,
      },
    });

    if (!user?.id) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 400 }
      );
    }

    const transactions = await db.transaction.findMany({
      where: {
        userId: user.id,
        date: {
          gte: start,
          lte: end,
        },
      },
      orderBy: {
        amount: "desc",
      },
    });

    if (transactions.length === 0) {
      return NextResponse.json(
        {
          message: "Nenhuma transação encontrada para o período",
          period: {
            start: format(start, "dd/MM/yyyy"),
            end: format(end, "dd/MM/yyyy"),
            month: calculatedMonth,
            year: calculatedYear,
          },
        },
        { status: 200 }
      );
    }
    // Calcular estatísticas
    const total = transactions.reduce(
      (sum, transaction) => sum + transaction.amount,
      0
    );
    const highestExpense = transactions[0]?.amount || 0;
    const lowestExpense = transactions[transactions.length - 1]?.amount || 0;
    const averageExpense = total / transactions.length;

    const stats: MonthlyStats = {
      total,
      highestExpense,
      lowestExpense,
      averageExpense,
      totalTransactions: transactions.length,
      month: (month || new Date().getMonth() + 1).toString(),
      year: year || new Date().getFullYear(),
    };

    let userName = user.name || "User";

    if (sessionClaims?.firstName || sessionClaims?.lastName) {
      userName = `${sessionClaims.firstName || ""} ${
        sessionClaims.lastName || ""
      }`.trim();
    } else {
      const userInfor = await db.user.findUnique({
        where: { id: user?.id },
        select: { name: true },
      });

      if (userInfor?.name) {
        userName = userInfor.name;
      }
    }

    const emailHtml = generateEmailTemplate(stats, userName);
    const emailOptions: EmailOptions = {
      to: userEmail,
      subject: `📋 Relatório de Gastos - ${stats.month}/${stats.year}`,
      html: emailHtml,
    };

    const emailResult = await sendEmail(emailOptions);

    return NextResponse.json({
      message: "Relatório enviado com sucesso",
      stats,
      email: emailResult,
    });
  } catch (error) {
    console.error("Erro ao gerar relatório:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
