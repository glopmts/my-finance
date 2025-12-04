"use client";

import { useUser } from "@clerk/nextjs";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { trpc } from "../../../../server/trpc/context/client";

const CompleteAuth = () => {
  const { user, isLoaded } = useUser();
  const { mutateAsync } = trpc.auth.createUser.useMutation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && user?.id) {
      router.push("/");
    }
  }, [isLoaded, user, router]);

  const createUserInBackend = useCallback(async () => {
    if (!user?.id) {
      router.push("/");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const response = await mutateAsync({
        clerkId: user.id,
        email: user.primaryEmailAddress?.emailAddress || "",
        name: user.firstName || "user",
      });

      if (response.success === true) {
        router.push("/");
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const errorMessage =
          err.response?.data?.message || "Erro ao processar autenticação";
        setError(errorMessage);
      } else {
        setError("Erro inesperado. Tente novamente.");
      }
    } finally {
      setIsProcessing(false);
    }
  }, [user, mutateAsync, router]);

  useEffect(() => {
    if (!isLoaded) return;
    createUserInBackend();
  }, [isLoaded, createUserInBackend]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user?.id) {
    return null;
  }

  if (isProcessing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm text-muted-foreground">
            Finalizando sua conta...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4 max-w-md text-center">
          <div className="p-4 bg-destructive/10 rounded-lg">
            <p className="text-sm text-destructive">{error}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default CompleteAuth;
