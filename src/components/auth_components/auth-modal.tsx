"use client";

import type React from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSignIn, useSignUp } from "@clerk/nextjs";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Loader2,
  Mail,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { trpc } from "../../server/trpc/client";

type AuthModalProps = {
  children?: React.ReactNode;
  defaultType?: "login" | "register";
};

const AuthModal = ({ children, defaultType = "login" }: AuthModalProps) => {
  const { isLoaded: signInLoaded, signIn } = useSignIn();
  const { isLoaded: signUpLoaded, signUp, setActive } = useSignUp();

  const mutation = trpc.auth.createUser.useMutation();

  const [open, setOpen] = useState(false);
  const [authType, setAuthType] = useState<"login" | "register">(defaultType);
  const [emailAddress, setEmailAddress] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"auth" | "verify">("auth");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();

  const resetForm = () => {
    setEmailAddress("");
    setCode("");
    setError("");
    setStep("auth");
    setLoading(false);
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(resetForm, 200); // Reset after animation
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInLoaded || !signIn) return;

    setLoading(true);
    setError("");

    try {
      const result = await signIn.create({
        identifier: emailAddress,
      });

      if (result.status === "complete") {
        handleClose();
        router.refresh();
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || "Erro ao fazer login. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUpLoaded || !signUp) return;

    setLoading(true);
    setError("");

    try {
      await signUp.create({
        emailAddress,
      });

      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });

      setStep("verify");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || "Erro ao criar conta. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    // Verifica se todas as dependências estão carregadas
    if (!signUpLoaded || !signUp || !setActive) {
      console.error("Dependências de autenticação não carregadas");
      return;
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
        handleClose();
      } else {
        setError("Processo de verificação não foi concluído. Tente novamente.");
      }
    } catch (err) {
      if (err instanceof Error) {
        const errorMessage =
          err.message ||
          "Ocorreu um erro durante a verificação. Tente novamente.";
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };
  const switchAuthType = () => {
    setAuthType(authType === "login" ? "register" : "login");
    setError("");
  };

  const goBackToAuth = () => {
    setStep("auth");
    setCode("");
    setError("");
  };

  if (!signInLoaded || !signUpLoaded) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {children || <Button>Entrar</Button>}
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || <Button>Entrar</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-center text-2xl font-bold">
            {step === "verify"
              ? "Verificar Email"
              : authType === "login"
              ? "Bem-vindo de volta"
              : "Criar conta"}
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            {step === "verify"
              ? "Digite o código de verificação enviado para seu email"
              : authType === "login"
              ? "Entre com sua conta para continuar"
              : "Crie sua conta para começar"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {step === "verify" ? (
            <Card>
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Mail className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Código enviado!</CardTitle>
                <CardDescription>
                  Enviamos um código de 6 dígitos para{" "}
                  <strong>{emailAddress}</strong>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleVerify} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">Código de verificação</Label>
                    <Input
                      id="code"
                      type="text"
                      placeholder="000000"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="text-center text-lg tracking-widest"
                      maxLength={6}
                      required
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={goBackToAuth}
                      className="flex-1 bg-transparent"
                      disabled={loading}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Voltar
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={loading || code.length !== 6}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Verificando...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Verificar
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            <form
              onSubmit={authType === "login" ? handleSignIn : handleSignUp}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  required
                />
              </div>
              {authType === "register" && (
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Seu nome.."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              )}
              <div id="clerk-captcha"></div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {authType === "login" ? "Entrando..." : "Criando conta..."}
                  </>
                ) : authType === "login" ? (
                  "Entrar"
                ) : (
                  "Criar conta"
                )}
              </Button>
            </form>
          )}

          {step === "auth" && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {authType === "login"
                  ? "Não tem uma conta?"
                  : "Já tem uma conta?"}{" "}
                <button
                  type="button"
                  onClick={switchAuthType}
                  className="font-medium text-primary hover:underline"
                  disabled={loading}
                >
                  {authType === "login" ? "Criar conta" : "Fazer login"}
                </button>
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
