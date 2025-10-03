"use client";

import Header from "@/components/Header";
import UnauthenticatedHome from "@/components/home_components/UnauthenticatedHome";
import { trpc } from "@/server/trpc/client";

const TransactionPage = () => {
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
      <div className="max-w-7xl w-full mx-auto  p-2">
        <div className="pb-6">
          <h1 className="text-2xl font-semibold">Gerencia transações</h1>
        </div>
        <div className="w-full h-full"></div>
      </div>
    </div>
  );
};

export default TransactionPage;
