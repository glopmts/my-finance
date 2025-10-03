"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { trpc } from "../server/trpc/client";

export function useMonthlyBalance(userId: string) {
  const queryClient = useQueryClient();
  const utils = trpc.useContext();
  const hasCheckedRef = useRef(false);

  const {
    data: currentBalance,
    isLoading,
    refetch: refetchCurrentBalance,
  } = trpc.monthlyBalance.getCurrentMonthlyBalance.useQuery(
    { userId },
    {
      enabled: !!userId,
      staleTime: 1000 * 60 * 5,
      retry: false,
    }
  );

  const closeMonthMutation = trpc.monthlyBalance.closeCurrentMonth.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["monthlyBalance"] });
      utils.monthlyBalance.getCurrentMonthlyBalance.invalidate();
    },
  });

  const checkNewMonthMutation =
    trpc.monthlyBalance.checkAndCreateNewMonth.useMutation();

  const { data: history } =
    trpc.monthlyBalance.getMonthlyBalanceHistory.useQuery(
      { userId, limit: 6 },
      { enabled: !!userId }
    );

  useEffect(() => {
    if (userId && !hasCheckedRef.current) {
      hasCheckedRef.current = true;

      checkNewMonthMutation.mutate(
        { userId },
        {
          onSuccess: () => {
            refetchCurrentBalance();
          },
        }
      );
    }
  }, [userId]);

  return {
    currentBalance: currentBalance?.monthlyBalance,
    transactionsCount: currentBalance?.transactionsCount,
    history,
    isLoading: isLoading || checkNewMonthMutation.isPending,
    closeCurrentMonth: () => closeMonthMutation.mutate({ userId }),
    isClosing: closeMonthMutation.isPending,
  };
}
