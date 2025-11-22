import { Frequency, TransactionType } from "@prisma/client";
import React from "react";
import { toast } from "sonner";
import { trpc } from "./context/client";

type PropsFolders = {
  userId: string;
  transactionType: TransactionType;
};

// Hook para gerenciar pastas recorrentes

export function useFolders({ userId, transactionType }: PropsFolders) {
  const {
    data: foldersTypes,
    isLoading: isLoadingFolders,
    error: errorFolders,
    refetch: refetchFolders,
  } = trpc.folders.getFoldersByAccountType.useQuery({
    userId,
    transactionType,
  });

  const [error, setError] = React.useState<string | null>(null);

  const mutationCreateFolder = trpc.folders.createFolder.useMutation({
    onError: (error) => {
      setError("Erro ao criar pasta: " + error.message);
      toast.error("Erro ao criar pasta: " + error.message);
    },
    onSuccess: () => {
      setError(null);
      toast.success("Pasta criada com sucesso!");
      refetchFolders();
    },
  });

  const mutationRemoveTransactionFromFolder =
    trpc.folders.removeTransactionFromFolder.useMutation({
      onError: (error) => {
        setError("Erro ao remover transação da pasta: " + error.message);
        toast.error("Erro ao remover transação da pasta: " + error.message);
      },
      onSuccess: () => {
        setError(null);
        toast.success("Transação removida da pasta com sucesso!");
        refetchFolders();
      },
    });

  const mutationAddTransactionToFolder =
    trpc.folders.addTransactionToFolder.useMutation({
      onError: (error) => {
        setError("Erro ao adicionar transação à pasta: " + error.message);
        toast.error("Erro ao adicionar transação à pasta: " + error.message);
      },
      onSuccess: () => {
        setError(null);
        toast.success("Transação adicionada à pasta com sucesso!");
        refetchFolders();
      },
    });

  const mutationupdateRecurringFolder =
    trpc.folders.updateRecurringFolder.useMutation({
      onError: (error) => {
        setError("Erro ao atualizar a pasta recorrente: " + error.message);
        toast.error("Erro ao atualizar a pasta recorrente: " + error.message);
      },
      onSuccess: () => {
        setError(null);
        toast.success("Pasta recorrente atualizada com sucesso!");
        refetchFolders();
      },
    });

  async function createFolder(
    name: string,
    isActive: boolean,
    frequency: Frequency,
    description?: string
  ) {
    return mutationCreateFolder.mutateAsync({
      userId,
      name,
      description,
      isActive,
      frequency: frequency,
    });
  }

  async function addTransactionToFolder(
    folderId: string,
    transactionId: string
  ) {
    return mutationAddTransactionToFolder.mutateAsync({
      userId,
      folderId,
      transactionId,
    });
  }

  async function removeTransactionFromFolder(
    folderId: string,
    transactionId: string
  ) {
    return mutationRemoveTransactionFromFolder.mutateAsync({
      userId,
      folderId,
      transactionId,
    });
  }

  async function updateRecurringFolder(
    folderId: string,
    name?: string,
    description?: string,
    isActive?: boolean,
    frequency?: Frequency
  ) {
    return mutationupdateRecurringFolder.mutateAsync({
      userId,
      folderId,
      name,
      description,
      isActive,
      frequency,
    });
  }

  return {
    foldersTypes,
    isLoadingFolders,
    errorFolders,
    error,
    createFolder,
    addTransactionToFolder,
    removeTransactionFromFolder,
    updateRecurringFolder,
  };
}
