// components/modal-folder.tsx
"use client";

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
import { useFolders } from "@/hooks/use-folders";
import { RecurringFolderProps } from "@/types/interfaces";
import { CategoryEnum, Frequency } from "@prisma/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CATEGORY_TRANSLATIONS } from "../../types/transaction-modal-types";
import { Spinner } from "../ui/spinner";

type ModalFolderProps = {
  type: "create" | "edit";
  userId: string;
  folder?: RecurringFolderProps;
  category?: CategoryEnum;
  onSuccess?: () => void;
};

const ModalFolder = ({
  type,
  userId,
  folder,
  category,
  onSuccess,
}: ModalFolderProps) => {
  const { createFolder, updateRecurringFolder, error, isCreating, isUpdating } =
    useFolders({
      userId,
      category,
    });

  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isActive: true,
    frequency: "MONTHLY" as Frequency,
    color: "",
    category: category || CategoryEnum.OTHER,
  });

  // Preencher formulário quando for edição
  useEffect(() => {
    if (type === "edit" && folder) {
      setFormData({
        name: folder.name || "",
        description: folder.description || "",
        isActive: folder.isActive,
        color: folder.color || "",
        frequency: folder.frequency,
        category: folder.category || category || CategoryEnum.OTHER,
      });
    }
  }, [folder, type, category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (type === "create") {
        await createFolder(
          formData.name,
          formData.isActive,
          formData.frequency,
          formData.description,
          formData.category,
          formData.color
        );
      } else if (folder) {
        await updateRecurringFolder(folder.id, {
          name: formData.name,
          description: formData.description,
          isActive: formData.isActive,
          frequency: formData.frequency,
          category: formData.category,
          color: formData.color,
        });
      }

      setOpen(false);
      onSuccess?.();

      // Reset form após criação
      if (type === "create") {
        setFormData({
          name: "",
          description: "",
          isActive: true,
          frequency: "MONTHLY",
          color: "",
          category: category || CategoryEnum.OTHER,
        });
      }
    } catch (err) {
      console.error("Erro ao processar pasta:", err);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const frequencies = [
    { value: "WEEKLY", label: "Semanal" },
    { value: "BIWEEKLY", label: "Quinzenal" },
    { value: "MONTHLY", label: "Mensal" },
    { value: "QUARTERLY", label: "Trimestral" },
    { value: "YEARLY", label: "Anual" },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={type === "create" ? "cyan" : "outline"}
          onClick={() => setOpen(true)}
        >
          {type === "create" ? "+ Adicionar Pasta" : "Editar Pasta"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          {error && toast.error(`Erro: ${error}`)}
          <DialogTitle>
            {type === "create"
              ? "Adicionar Pasta Recorrente"
              : "Editar Pasta Recorrente"}
          </DialogTitle>
          <DialogDescription>
            {type === "create"
              ? "Crie uma nova pasta para organizar suas transações recorrentes."
              : "Edite as informações da pasta recorrente."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Pasta *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Ex: Contas Mensais, Assinaturas..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Descrição opcional da pasta..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="frequency">Frequência *</Label>
              <Select
                value={formData.frequency}
                onValueChange={(value: Frequency) =>
                  handleInputChange("frequency", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a frequência" />
                </SelectTrigger>
                <SelectContent>
                  {frequencies.map((freq) => (
                    <SelectItem key={freq.value} value={freq.value}>
                      {freq.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoria *</Label>
              <Select
                value={formData.category}
                onValueChange={(value: CategoryEnum) =>
                  handleInputChange("category", value)
                }
                disabled={!!category}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORY_TRANSLATIONS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) =>
                handleInputChange("isActive", checked)
              }
            />
            <Label htmlFor="isActive">Pasta ativa</Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isCreating || isUpdating}>
              {isCreating || isUpdating ? (
                <span>
                  <Spinner />
                  Salvando...
                </span>
              ) : type === "create" ? (
                "Criar Pasta"
              ) : (
                "Atualizar Pasta"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ModalFolder;
