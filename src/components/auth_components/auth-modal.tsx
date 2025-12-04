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
import { useLogin } from "@/hooks/use-login";
import { useRegister } from "@/hooks/use-register";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Loader2,
  Mail,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import GoogleButton from "./GoogleButton";

type AuthModalProps = {
  children?: React.ReactNode;
  defaultType?: "login" | "register";
  onSuccess?: () => void;
};

const AuthModal = ({
  children,
  onSuccess,
  defaultType = "login",
}: AuthModalProps) => {
  const loginHook = useLogin();
  const registerHook = useRegister();

  const [open, setOpen] = useState(false);
  const [authType, setAuthType] = useState<"login" | "register">(defaultType);
  const [emailAddress, setEmailAddress] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"auth" | "verify">("auth");
  const router = useRouter();

  const loading =
    authType === "login" ? loginHook.loading : registerHook.loading;
  const error = authType === "login" ? loginHook.error : registerHook.error;

  const resetForm = () => {
    setEmailAddress("");
    setName("");
    setCode("");
    setStep("auth");
    loginHook.resetError();
    registerHook.resetError();
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(resetForm, 200);
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await loginHook.handleEmailSignIn(emailAddress);

    if (result.success && result.needsVerification) {
      setStep("verify");
      alert("Verifique seu email para o código.");
    } else if (result.success && !result.needsVerification) {
      handleClose();
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await registerHook.handleSignUp(emailAddress);

    if (result.success) {
      setStep("verify");
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    const result =
      authType === "login"
        ? await loginHook.handleVerify(code)
        : await registerHook.handleVerify(code, name);

    if (result.success) {
      handleClose();
      if (result.success) {
        handleClose();
        if (onSuccess) {
          onSuccess();
        }
        router.push("/");
      }
      toast.success(
        authType === "login"
          ? "Login realizado com sucesso!"
          : "Conta criada com sucesso!"
      );
    }
  };

  const switchAuthType = () => {
    setAuthType(authType === "login" ? "register" : "login");
    loginHook.resetError();
    registerHook.resetError();
  };

  const goBackToAuth = () => {
    setStep("auth");
    setCode("");
    loginHook.resetError();
    registerHook.resetError();
  };

  if (!loginHook.isLoaded || !registerHook.isLoaded) {
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
        {children || (
          <Button className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-lg">
            Entrar
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md dark:bg-zinc-900 border">
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
              onSubmit={authType === "login" ? handleEmailSignIn : handleSignUp}
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

          <div className="pb-3 *:mt-2 flex items-center justify-center gap-2">
            <div className="h-px w-16 bg-muted" />
            <span>ou</span>
            <div className="h-px w-16 bg-muted" />
          </div>

          <div className="space-y-2">
            <GoogleButton type={authType === "login" ? "signIn" : "signUp"} />
          </div>

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
