"use client";

import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "../server/trpc/context/client";

export const useRegister = () => {
  const { isLoaded: signUpLoaded, signUp, setActive } = useSignUp();
  const mutation = trpc.auth.createUser.useMutation();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignUp = async (emailAddress: string) => {
    if (!signUpLoaded || !signUp) return { success: false };

    setLoading(true);
    setError("");

    try {
      await signUp.create({ emailAddress });
      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });

      return { success: true };
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Erro ao criar conta. Tente novamente.";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (code: string, name: string) => {
    if (!signUpLoaded || !signUp || !setActive) {
      toast.error("Serviço de autenticação não está disponível.");
      return { success: false };
    }

    setLoading(true);
    setError("");

    try {
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (signUpAttempt.status === "complete") {
        await setActive({ session: signUpAttempt.createdSessionId });
        const clerkUser = signUpAttempt.createdUserId;
        const email = signUpAttempt.emailAddress;

        await mutation.mutateAsync({
          email: email!,
          name: name,
          clerkId: clerkUser as string,
        });

        router.refresh();
        toast.success("Usuário criado com sucesso!");
        return { success: true };
      } else {
        toast.error(
          "Processo de verificação não foi concluído. Tente novamente."
        );
        setError("Processo de verificação não foi concluído. Tente novamente.");
        return { success: false };
      }
    } catch (err) {
      toast.error("Ocorreu um erro durante a verificação. Tente novamente.");
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Ocorreu um erro durante a verificação. Tente novamente.";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const resetError = () => setError("");

  return {
    handleSignUp,
    handleVerify,
    loading,
    error,
    resetError,
    isLoaded: signUpLoaded,
  };
};
