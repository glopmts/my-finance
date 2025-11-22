"use client";

import { useSignIn } from "@clerk/nextjs";
import { useState } from "react";
import { toast } from "sonner";

export const useLogin = () => {
  const {
    isLoaded: signInLoaded,
    signIn,
    setActive: signInActive,
  } = useSignIn();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleEmailSignIn = async (emailAddress: string) => {
    setLoading(true);
    setError("");

    try {
      if (!signIn) throw new Error("SignIn instance not ready");

      const { supportedFirstFactors } = await signIn.create({
        identifier: emailAddress,
      });

      const magicLinkFactor = supportedFirstFactors?.find(
        (factor) => factor.strategy === "email_code"
      );

      if (!magicLinkFactor) {
        throw new Error("Código por email não disponível.");
      }

      const { emailAddressId } = magicLinkFactor;
      const res = await signIn.prepareFirstFactor({
        strategy: "email_code",
        emailAddressId,
      });

      if (res.status === "needs_first_factor") {
        return { success: true, needsVerification: true };
      }

      if (res.status === "complete") {
        await signInActive({ session: res.createdSessionId });
        return { success: true, needsVerification: false };
      }

      return { success: false, needsVerification: false };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro no login";
      setError(errorMessage);
      return { success: false, needsVerification: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (code: string) => {
    setLoading(true);
    setError("");

    try {
      if (!signIn) throw new Error("SignIn instance not ready");

      const result = await signIn.attemptFirstFactor({
        strategy: "email_code",
        code,
      });

      if (result.status === "complete") {
        await signInActive({ session: result.createdSessionId });
        return { success: true };
      }

      throw new Error("Verificação incompleta");
    } catch (err) {
      toast.error("Ocorreu um erro durante a verificação. Tente novamente.");
      const errorMessage =
        err instanceof Error ? err.message : "Erro na verificação";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const resetError = () => setError("");

  return {
    handleEmailSignIn,
    handleVerify, // Added handleVerify to exports
    loading,
    error,
    resetError,
    isLoaded: signInLoaded,
  };
};
