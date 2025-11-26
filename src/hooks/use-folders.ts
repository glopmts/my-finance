import { trpc } from "@/server/trpc/context/client";
import { CategoryEnum, Frequency } from "@prisma/client";
import { useState } from "react";
import { toast } from "sonner";

type UseFoldersProps = {
  userId: string;
  category?: CategoryEnum;
};

export function useFolders({ userId, category }: UseFoldersProps) {
  const [error, setError] = useState<string | null>(null);

  // Query para buscar pastas
  const {
    data: foldersTypes,
    isLoading: isLoadingFolders,
    error: errorFolders,
    refetch: refetchFolders,
  } = trpc.folders.getFoldersByAccountType.useQuery({
    userId,
    category: category || undefined,
  });

  // Mutations
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

  const mutationUpdateRecurringFolder =
    trpc.folders.updateRecurringFolder.useMutation({
      onError: (error) => {
        setError("Erro ao atualizar pasta: " + error.message);
        toast.error("Erro ao atualizar pasta: " + error.message);
      },
      onSuccess: () => {
        setError(null);
        toast.success("Pasta atualizada com sucesso!");
        refetchFolders();
      },
    });

  const mutationRemoveTransactionFromFolder =
    trpc.folders.removeTransactionFromFolder.useMutation({
      onError: (error) => {
        setError("Erro ao remover transação: " + error.message);
        toast.error("Erro ao remover transação: " + error.message);
      },
      onSuccess: () => {
        setError(null);
        toast.success("Transação removida com sucesso!");
        refetchFolders();
      },
    });

  const mutationAddTransactionToFolder =
    trpc.folders.addTransactionToFolder.useMutation({
      onError: (error) => {
        setError("Erro ao adicionar transação: " + error.message);
        toast.error("Erro ao adicionar transação: " + error.message);
      },
      onSuccess: () => {
        setError(null);
        toast.success("Transação adicionada com sucesso!");
        refetchFolders();
      },
    });

  // Funções de ação
  const createFolder = async (
    name: string,
    isActive: boolean,
    frequency: Frequency,
    description?: string,
    category?: CategoryEnum,
    color?: string
  ) => {
    return mutationCreateFolder.mutateAsync({
      userId,
      name,
      description,
      isActive,
      frequency,
      category: category || undefined,
      color: color || undefined,
    });
  };

  const updateRecurringFolder = async (
    folderId: string,
    data: {
      name?: string;
      description?: string;
      isActive?: boolean;
      frequency?: Frequency;
      color?: string;
      category?: CategoryEnum;
    }
  ) => {
    return mutationUpdateRecurringFolder.mutateAsync({
      userId,
      folderId,
      ...data,
    });
  };

  const addTransactionToFolder = async (
    folderId: string,
    transactionId: string
  ) => {
    return mutationAddTransactionToFolder.mutateAsync({
      userId,
      folderId,
      transactionId,
    });
  };

  const removeTransactionFromFolder = async (
    folderId: string,
    transactionId: string
  ) => {
    return mutationRemoveTransactionFromFolder.mutateAsync({
      userId,
      folderId,
      transactionId,
    });
  };

  return {
    // Data
    foldersTypes,
    isLoadingFolders,

    // Errors
    errorFolders,
    error,

    // Actions
    createFolder,
    updateRecurringFolder,
    addTransactionToFolder,
    removeTransactionFromFolder,

    // Utils
    refetchFolders,
    isCreating: mutationCreateFolder.isPending,
    isUpdating: mutationUpdateRecurringFolder.isPending,
  };
}
