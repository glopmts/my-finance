"use client";

import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { trpc } from "../server/trpc/client";

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
    console.log("[v0] handleVerify called with code:", code, "name:", name);

    if (!signUpLoaded || !signUp || !setActive) {
      console.error("[v0] Dependências de autenticação não carregadas");
      console.log(
        "[v0] signUpLoaded:",
        signUpLoaded,
        "signUp:",
        !!signUp,
        "setActive:",
        !!setActive
      );
      return { success: false };
    }

    setLoading(true);
    setError("");

    try {
      console.log("[v0] Attempting email verification...");
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });
      console.log("[v0] Sign up attempt result:", signUpAttempt);

      if (signUpAttempt.status === "complete") {
        console.log("[v0] Verification complete, setting active session...");
        await setActive({ session: signUpAttempt.createdSessionId });
        const clerkUser = signUpAttempt.createdUserId;
        const email = signUpAttempt.emailAddress;

        console.log("[v0] Creating user in database...");
        await mutation.mutateAsync({
          email: email!,
          name: name,
          clerkId: clerkUser as string,
        });

        router.refresh();
        console.log("[v0] User creation successful");
        return { success: true };
      } else {
        console.log(
          "[v0] Verification not complete, status:",
          signUpAttempt.status
        );
        setError("Processo de verificação não foi concluído. Tente novamente.");
        return { success: false };
      }
    } catch (err) {
      console.error("[v0] Error during verification:", err);
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
