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
import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { trpc } from "../../server/trpc/client";
import { CreditCard } from "../../types/interfaces";

type PropsCard = {
  type: "create" | "update";
  card?: CreditCard;
  userId: string;
  onSuccess?: () => void;
};

type FormData = {
  name: string;
  lastDigits: string;
  creditLimit: number;
  availableLimit: number;
  closingDay: number;
  dueDay: number;
  isActive: boolean;
};

type FormErrors = {
  name?: string;
  lastDigits?: string;
  creditLimit?: string;
  availableLimit?: string;
  closingDay?: string;
  dueDay?: string;
};

const CreditCardModal = ({ type, card, userId, onSuccess }: PropsCard) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState<FormData>({
    name: "",
    lastDigits: "",
    creditLimit: 0,
    availableLimit: 0,
    closingDay: 1,
    dueDay: 10,
    isActive: true,
  });

  const utils = trpc.useContext();

  const createMutation = trpc.creditCard.createCreditCard.useMutation();
  const updateMutation = trpc.creditCard.updateCreditCard.useMutation();

  useEffect(() => {
    if (card && type === "update") {
      setFormData({
        name: card.name,
        lastDigits: card.lastDigits,
        creditLimit: card.creditLimit,
        availableLimit: card.availableLimit,
        closingDay: card.closingDay,
        dueDay: card.dueDay,
        isActive: card.isActive,
      });
    } else {
      setFormData({
        name: "",
        lastDigits: "",
        creditLimit: 0,
        availableLimit: 0,
        closingDay: 1,
        dueDay: 10,
        isActive: true,
      });
    }
    setErrors({});
  }, [card, type]);

  useEffect(() => {
    if (type === "create") {
      setFormData((prev) => ({
        ...prev,
        availableLimit: prev.creditLimit,
      }));
    }
  }, [formData.creditLimit, type]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nome é obrigatório";
    }

    if (!formData.lastDigits.trim()) {
      newErrors.lastDigits = "Últimos 4 dígitos são obrigatórios";
    } else if (!/^\d{4}$/.test(formData.lastDigits)) {
      newErrors.lastDigits = "Deve conter exatamente 4 dígitos";
    }

    if (formData.creditLimit < 0) {
      newErrors.creditLimit = "Limite deve ser maior ou igual a 0";
    }
    if (formData.availableLimit < 0) {
      newErrors.availableLimit =
        "Limite disponível deve ser maior ou igual a 0";
    }

    if (formData.closingDay < 1 || formData.closingDay > 31) {
      newErrors.closingDay = "Dia de fechamento deve ser entre 1 e 31";
    }

    if (formData.dueDay < 1 || formData.dueDay > 31) {
      newErrors.dueDay = "Dia de vencimento deve ser entre 1 e 31";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    field: keyof FormData,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Por favor, corrija os erros no formulário");
      return;
    }

    setLoading(true);

    try {
      if (type === "create") {
        await createMutation.mutateAsync({
          ...formData,
          userId,
        });
        toast.success("Cartão criado com sucesso!");
      } else {
        await updateMutation.mutateAsync({
          ...formData,
          id: card!.id,
        });
        toast.success("Cartão atualizado com sucesso!");
      }

      setOpen(false);

      utils.creditCard.getUserCreditCards.invalidate();

      onSuccess?.();
    } catch (error) {
      console.error("Erro ao salvar cartão:", error);
      toast.error("Erro ao salvar cartão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="bg-cyan-500/35 text-white hover:bg-cyan-500/50 border rounded-3xl"
          onClick={() => setOpen(true)}
        >
          {type === "create" ? "+ Adicionar Cartão" : "Editar Cartão"}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {type === "create" ? "Adicionar Novo Cartão" : "Editar Cartão"}
          </DialogTitle>
          <DialogDescription>
            {type === "create"
              ? "Preencha os dados para adicionar um novo cartão de crédito."
              : "Atualize as informações do cartão."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Nome do Cartão */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Nome do cartão *</Label>
            <Input
              id="name"
              placeholder="Ex: Nubank, Itaú..."
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name}</p>
            )}
          </div>

          {/* Últimos 4 dígitos */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="lastDigits">Últimos 4 dígitos *</Label>
            <Input
              id="lastDigits"
              placeholder="1234"
              maxLength={4}
              value={formData.lastDigits}
              onChange={(e) =>
                handleInputChange(
                  "lastDigits",
                  e.target.value.replace(/\D/g, "")
                )
              }
              className={errors.lastDigits ? "border-red-500" : ""}
            />
            {errors.lastDigits && (
              <p className="text-red-500 text-sm">{errors.lastDigits}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Limite Total */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="creditLimit">Limite Total *</Label>
              <Input
                id="creditLimit"
                type="number"
                step="0.01"
                placeholder="0,00"
                value={formData.creditLimit}
                onChange={(e) =>
                  handleInputChange(
                    "creditLimit",
                    parseFloat(e.target.value) || 0
                  )
                }
                className={errors.creditLimit ? "border-red-500" : ""}
              />
              {errors.creditLimit && (
                <p className="text-red-500 text-sm">{errors.creditLimit}</p>
              )}
            </div>

            {/* Limite Disponível */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="availableLimit">Limite Disponível *</Label>
              <Input
                id="availableLimit"
                type="number"
                step="0.01"
                placeholder="0,00"
                value={formData.availableLimit}
                onChange={(e) =>
                  handleInputChange(
                    "availableLimit",
                    parseFloat(e.target.value) || 0
                  )
                }
                className={errors.availableLimit ? "border-red-500" : ""}
                disabled={type === "create"}
              />
              {errors.availableLimit && (
                <p className="text-red-500 text-sm">{errors.availableLimit}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Dia de Fechamento */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="closingDay">Dia de Fechamento *</Label>
              <Input
                id="closingDay"
                type="number"
                min="1"
                max="31"
                placeholder="1-31"
                value={formData.closingDay}
                onChange={(e) =>
                  handleInputChange("closingDay", parseInt(e.target.value) || 1)
                }
                className={errors.closingDay ? "border-red-500" : ""}
              />
              {errors.closingDay && (
                <p className="text-red-500 text-sm">{errors.closingDay}</p>
              )}
            </div>

            {/* Dia de Vencimento */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="dueDay">Dia de Vencimento *</Label>
              <Input
                id="dueDay"
                type="number"
                min="1"
                max="31"
                placeholder="1-31"
                value={formData.dueDay}
                onChange={(e) =>
                  handleInputChange("dueDay", parseInt(e.target.value) || 10)
                }
                className={errors.dueDay ? "border-red-500" : ""}
              />
              {errors.dueDay && (
                <p className="text-red-500 text-sm">{errors.dueDay}</p>
              )}
            </div>
          </div>

          {/* Status Ativo */}
          <div className="flex items-center justify-between">
            <Label htmlFor="isActive" className="cursor-pointer">
              Cartão ativo
            </Label>
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) =>
                handleInputChange("isActive", checked)
              }
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? "Salvando..."
                : type === "create"
                ? "Criar Cartão"
                : "Atualizar Cartão"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreditCardModal;
