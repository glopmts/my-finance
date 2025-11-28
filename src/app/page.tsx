"use client";

import { useRouter } from "next/navigation";
import CategoryTransactions from "../components/categorys-transactions";
import Header from "../components/Header";
import FixedHome from "../components/home_components/fixed-cards";
import InforBankUser from "../components/home_components/infor-bank-user";
import TransactionsHome from "../components/home_components/transactions-home";
import { trpc } from "../server/trpc/context/client";

export default function Home() {
  const { data: userData, isLoading } = trpc.auth.me.useQuery();
  const userId = userData?.id;
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="w-full h-screen">
        <div className="w-full h-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  if (!userId || userId === undefined || userId === null) {
    return router.push("/unauthenticated");
  }

  return (
    <div className="w-full min-h-screen h-full flex">
      <Header />
      <div className="flex-1 h-full w-full mt-4 md:mr-8 p-4 md:p-0">
        <div className="w-full">
          <InforBankUser />
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
