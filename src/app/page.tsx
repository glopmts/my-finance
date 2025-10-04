"use client";

import { MonthlyBalanceCard } from "../components/cards/MonthlyBalanceCard";
import CategoryTransactions from "../components/categorys-transactions";
import Header from "../components/Header";
import FixedHome from "../components/home_components/fixed-cards";
import InforBankUser from "../components/home_components/infor-bank-user";
import TransactionsHome from "../components/home_components/transactions-home";
import UnauthenticatedHome from "../components/home_components/UnauthenticatedHome";
import { trpc } from "../server/trpc/client";

export default function Home() {
  const { data: userData, isLoading } = trpc.auth.me.useQuery();
  const userId = userData?.id;

  if (isLoading) {
    return (
      <div className="w-full h-screen">
        <div className="w-full h-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  if (!userId) {
    return <UnauthenticatedHome />;
  }

  return (
    <div className="w-full min-h-screen h-full">
      <Header />
      <div className="mx-auto max-w-7xl p-2 mt-4 w-full">
        <div className="w-full">
          <InforBankUser />
        </div>
        <div className="w-full">
          {/* <CardsStatistics userId={userId} /> */}
        </div>
        {/* <div className="w-full">
          <SendReportButton />
        </div> */}
        <div className="w-full mt-6">
          <MonthlyBalanceCard userId={userId} />
        </div>
        <div className="w-full">
          <FixedHome userId={userId} />
        </div>
        <div className="w-full mt-8">
          <CategoryTransactions userId={userId} />
        </div>
        <div className="w-full">
          <TransactionsHome userId={userId} />
        </div>
      </div>
    </div>
  );
}
