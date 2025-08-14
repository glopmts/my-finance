"use client";

import { Loader } from "lucide-react";
import Header from "../components/Header";
import CardsStatistics from "../components/home_components/cards_statistics";
import TransactionsHome from "../components/home_components/transaction_infor";
import { trpc } from "../server/trpc/client";

export default function Home() {
  const { data: userData, isLoading } = trpc.auth.me.useQuery();
  const userId = userData?.id;

  if (isLoading) {
    return (
      <div className="w-full h-screen">
        <div className="w-full h-full flex items-center justify-center">
          <Loader size={28} className="animate-spin" />
        </div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="w-full h-screen">
        <div className="w-full h-full flex items-center justify-center">
          <span>Faça login para ter acesso aos dados!</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen h-full">
      <Header />
      <div className="mx-auto max-w-7xl p-2 mt-4 w-full">
        <CardsStatistics userId={userId} />
        <div className="">
          <TransactionsHome userId={userId} />
        </div>
      </div>
    </div>
  );
}
