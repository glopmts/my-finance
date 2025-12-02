"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { $Enums } from "@prisma/client";
import { useState } from "react";
import { trpc } from "../../server/trpc/context/client";
import { ButtonFallback } from "../button-fallback";

type BankTypes = {
  userId: string;
  name: string;
  id: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  isActive: boolean;
  balance: number;
  bankName: string;
  finalBalance: number;
  accountNumber: string | null;
  accountType: $Enums.AccountType;
};

type PropsUser = {
  userId: string;
  type: "update" | "create";
  bankData?: BankTypes;
  onSuccess?: () => void;
  refetch: () => void;
};

const AutoBankAccountModal = ({
  type,
  userId,
  bankData,
  onSuccess,
  refetch,
}: PropsUser) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const mutationCreater = trpc.bankAccount.createrBank.useMutation();
  const mutationUpdate = trpc.bankAccount.updaterBank.useMutation();

  const [name, setName] = useState(bankData?.name || "");
  const [balance, setBalance] = useState(bankData?.balance || 0);
  const [finalBalance, setFinalBalance] = useState(bankData?.finalBalance || 0);
  const [bankName, setBankName] = useState(bankData?.bankName || "");
  const [accountNumber, setAccountNumber] = useState(
    bankData?.accountNumber || ""
  );
  const [accountType, setAccountType] = useState<$Enums.AccountType>(
    bankData?.accountType || "CHECKING"
  );
  const [isActive, setIsActive] = useState(bankData?.isActive ?? true);

  const resetForm = () => {
    if (type === "create") {
      setName("");
      setBalance(0);
      setBankName("");
      setAccountNumber("");
      setAccountType("CHECKING");
      setIsActive(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        name,
        balance,
        bankName,
        accountNumber: accountNumber || undefined,
        accountType,
        isActive,
        finalBalance,
        userId,
      };

      if (type === "create") {
        await mutationCreater.mutateAsync(payload);
      } else {
        await mutationUpdate.mutateAsync({
          id: bankData?.id as string,
          ...payload,
        });
      }

      setOpen(false);
      resetForm();
      onSuccess?.();
      refetch();
    } catch (error) {
      console.error("Erro ao processar conta bancária:", error);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = name.trim() !== "" && bankName.trim() !== "" && userId;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="cyan" onClick={() => setOpen(true)}>
          {type === "create"
            ? "+ Adicionar Conta Bancária"
            : "Editar Conta Bancária"}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {type === "create"
              ? "Adicionar Nova Conta Bancária"
              : "Editar Conta Bancária"}
          </DialogTitle>
          <DialogDescription>
            {type === "create"
              ? "Preencha os dados para adicionar uma nova conta bancária."
              : "Atualize as informações da conta bancária."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Conta *</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Conta Principal, Poupança..."
              required
            />
          </div>

          {/* Bank Name Field */}
          <div className="space-y-2">
            <Label htmlFor="bankName">Nome do Banco *</Label>
            <Input
              id="bankName"
              type="text"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="Ex: Banco do Brasil, Nubank..."
              required
            />
          </div>

          {/* Account Number Field */}
          <div className="space-y-2">
            <Label htmlFor="accountNumber">Número da Conta</Label>
            <Input
              id="accountNumber"
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="Número da conta (opcional)"
            />
          </div>

          {/* Balance Field */}
          <div className="flex w-full flex-wrap md:flex-nowrap space-x-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="balance">Saldo Inicial</Label>
              <Input
                id="balance"
                type="number"
                step="0.01"
                value={balance || ""}
                onChange={(e) =>
                  setBalance(Number.parseFloat(e.target.value) || 0)
                }
                placeholder="0.00"
              />
            </div>
            <div className="flex-1 space-y-2">
              <Label htmlFor="finalBalance">Saldo Final</Label>
              <Input
                id="finalBalance"
                type="number"
                step="0.01"
                value={finalBalance || ""}
                onChange={(e) =>
                  setFinalBalance(Number.parseFloat(e.target.value) || 0)
                }
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Account Type Field */}
          <div className="space-y-2 w-full flex flex-col">
            <Label htmlFor="accountType">Tipo de Conta *</Label>
            <Select
              value={accountType}
              onValueChange={(value: $Enums.AccountType) =>
                setAccountType(value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo de conta" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CHECKING">Conta Corrente</SelectItem>
                <SelectItem value="SAVINGS">Conta Poupança</SelectItem>
                <SelectItem value="CREDIT_CARD">Cartão de Crédito</SelectItem>
                <SelectItem value="INVESTMENT">Investimento</SelectItem>
                <SelectItem value="CASH">Dinheiro</SelectItem>
                <SelectItem value="OTHER">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Active Switch */}
          <div className="flex items-center space-x-2">
            <Switch
              id="active"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
            <Label htmlFor="active">Conta ativa</Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false);
                resetForm();
              }}
              disabled={loading}
            >
              Cancelar
            </Button>
            <ButtonFallback
              type="submit"
              disabled={!isFormValid || loading}
              variant="cyan"
              text={type === "create" ? "Adicionar Conta" : "Salvar Alterações"}
            />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AutoBankAccountModal;
