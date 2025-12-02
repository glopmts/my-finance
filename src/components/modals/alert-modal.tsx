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
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { AlertCircle, AlertTriangle, CheckCircle, Info } from "lucide-react";

type AlertModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: "warning" | "info" | "error" | "success";
  loading?: boolean;
};

const alertConfig = {
  warning: {
    icon: AlertTriangle,
    iconClass: "text-amber-500",
    bgClass: "bg-amber-500/10",
    buttonVariant: "default" as const,
  },
  info: {
    icon: Info,
    iconClass: "text-blue-500",
    bgClass: "bg-blue-500/10",
    buttonVariant: "default" as const,
  },
  error: {
    icon: AlertCircle,
    iconClass: "text-red-500",
    bgClass: "bg-red-500/10",
    buttonVariant: "destructive" as const,
  },
  success: {
    icon: CheckCircle,
    iconClass: "text-emerald-500",
    bgClass: "bg-emerald-500/10",
    buttonVariant: "default" as const,
  },
};

const AlertModal: React.FC<AlertModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  onConfirm,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  type = "info",
  loading = false,
}) => {
  const config = alertConfig[type];
  const Icon = config.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex flex-col items-center gap-4 text-center">
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-full",
              config.bgClass
            )}
          >
            <Icon className={cn("h-6 w-6", config.iconClass)} />
          </div>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-center">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            {cancelText}
          </Button>
          <Button
            variant={config.buttonVariant}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Carregando..." : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AlertModal;
