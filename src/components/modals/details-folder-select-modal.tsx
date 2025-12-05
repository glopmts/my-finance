"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatDateComplet } from "@/lib/formatS";
import {
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  FolderIcon,
  Info,
  PieChart,
  Repeat,
  Tag,
  Target,
  Trash2,
  User,
  XCircle,
} from "lucide-react";
import { FC, useState } from "react";
import { FolderType } from "../../types/interfaces";
import { Spinner } from "../ui/spinner";

type PropsModalFolder = {
  folder: FolderType;
  isDelete?: boolean;
  isActive?: boolean;
  isOpen: boolean;
  onClose: () => void;
  handleDelete: (folderId: string) => void;
  handleStatusFolder: (folderId: string, isActive: boolean) => void;
};

const DetailsModalFolder: FC<PropsModalFolder> = ({
  folder,
  isOpen,
  isDelete,
  isActive,
  onClose,
  handleDelete,
  handleStatusFolder,
}) => {
  const [isActiveFolder, setIsActive] = useState<boolean>(folder.isActive);

  const getCategoryLabel = (category: string) => {
    const categories: Record<string, string> = {
      TRANSPORTATION: "Transporte",
      FOOD: "Alimentação",
      ACCOMMODATION: "Acomodação",
      ENTERTAINMENT: "Entretenimento",
      HEALTHCARE: "Saúde",
      EDUCATION: "Educação",
      UTILITIES: "Utilidades",
      INVESTMENTS: "Investimentos",
      SHOPPING: "Compras",
      OTHER: "Outros",
    };
    return categories[category] || category;
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, React.ReactNode> = {
      TRANSPORTATION: "🚗",
      FOOD: "🍕",
      ACCOMMODATION: "🏠",
      ENTERTAINMENT: "🎬",
      HEALTHCARE: "🏥",
      EDUCATION: "📚",
      UTILITIES: "💡",
      INVESTMENTS: "📈",
      SHOPPING: "🛍️",
      OTHER: "📦",
    };
    return icons[category] || "📁";
  };

  const getFrequencyLabel = (frequency: string) => {
    const frequencies: Record<string, string> = {
      WEEKLY: "Semanal",
      BIWEEKLY: "Quinzenal",
      MONTHLY: "Mensal",
      QUARTERLY: "Trimestral",
      YEARLY: "Anual",
    };
    return frequencies[frequency] || frequency;
  };

  const getStatusInfo = () => {
    const isActive = folder.isActive;
    return {
      badge: isActive ? (
        <Badge className="bg-green-500 hover:bg-green-600">
          <CheckCircle className="mr-1 h-3 w-3" />
          Ativa
        </Badge>
      ) : (
        <Badge variant="outline" className="border-gray-400 text-gray-400">
          <XCircle className="mr-1 h-3 w-3" />
          Inativa
        </Badge>
      ),
      text: isActive
        ? "Esta pasta está ativa e processando transações."
        : "Esta pasta está inativa e não processa transações.",
    };
  };

  const getTotalAmount = () => {
    return folder.transactions.reduce(
      (sum, transaction) => sum + (transaction.amount || 0),
      0
    );
  };

  const getAverageTransaction = () => {
    if (folder.transactions.length === 0) return 0;
    return getTotalAmount() / folder.transactions.length;
  };

  const handleIsActiveFolder = (folderId: string) => {
    setIsActive((prev) => !prev);
    handleStatusFolder(folderId, isActiveFolder);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[650px] max-h-[89vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div
              className="p-3 rounded-lg"
              style={{
                backgroundColor: folder.color ? `${folder.color}20` : "#f3f4f6",
              }}
            >
              <span className="text-2xl">
                {getCategoryIcon(folder.category)}
              </span>
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl flex items-center gap-2">
                {folder.name}
                {getStatusInfo().badge}
              </DialogTitle>
              <DialogDescription className="mt-1">
                {folder.description || "Sem descrição"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Informações básicas */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Info className="h-4 w-4" />
                Informações da Pasta
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Categoria</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="font-normal">
                          {getCategoryLabel(folder.category)}
                        </Badge>
                        <span className="text-xl">
                          {getCategoryIcon(folder.category)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Repeat className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">
                        Frequência
                      </p>
                      <p className="font-medium">
                        {getFrequencyLabel(folder.frequency)}
                      </p>
                    </div>
                  </div>

                  {folder.color && (
                    <div className="flex items-center gap-2">
                      <div
                        className="h-4 w-4 rounded-full"
                        style={{ backgroundColor: folder.color }}
                      />
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">Cor</p>
                        <p className="font-mono text-sm">{folder.color}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Criada em</p>
                      <p className="font-medium">
                        {formatDateComplet(folder.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">
                        Atualizada em
                      </p>
                      <p className="font-medium">
                        {formatDateComplet(folder.updatedAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">
                        ID do Usuário
                      </p>
                      <p className="font-mono text-xs truncate">
                        {folder.userId}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Estatísticas Financeiras */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <PieChart className="h-4 w-4" />
                Estatísticas Financeiras
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 rounded-lg border bg-card">
                  <p className="text-sm text-muted-foreground">Total Geral</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(getTotalAmount())}
                  </p>
                </div>

                <div className="p-3 rounded-lg border bg-card">
                  <p className="text-sm text-muted-foreground">
                    Valor Filtrado
                  </p>
                  <p
                    className={`text-2xl font-bold ${
                      folder.filteredAmount >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {formatCurrency(folder.filteredAmount)}
                  </p>
                </div>

                <div className="p-3 rounded-lg border bg-card">
                  <p className="text-sm text-muted-foreground">
                    Transações Totais
                  </p>
                  <p className="text-2xl font-bold">
                    {folder.transactions.length}
                  </p>
                </div>

                <div className="p-3 rounded-lg border bg-card">
                  <p className="text-sm text-muted-foreground">
                    Média por Transação
                  </p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(getAverageTransaction())}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Transações */}
            {folder.transactions.length > 0 ? (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Transações ({folder.transactions.length})
                  </h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {folder.filteredTransactions.length} filtradas
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                  {folder.transactions.map((transaction, index) => {
                    const isFiltered = folder.filteredTransactions.some(
                      (t) => t.id === transaction.id
                    );

                    return (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border transition-colors ${
                          isFiltered
                            ? "bg-primary/5 border-primary/20"
                            : "hover:bg-accent/50"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium">
                                {transaction.description || "Sem descrição"}
                              </p>
                              {isFiltered && (
                                <Badge
                                  variant="outline"
                                  className="h-5 text-xs border-primary text-primary"
                                >
                                  Filtrada
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <span>
                                {transaction.date
                                  ? formatDateComplet(transaction.date)
                                  : "Sem data"}
                              </span>
                              {transaction.category && (
                                <>
                                  <span>•</span>
                                  <Badge variant="secondary" className="h-5">
                                    {getCategoryLabel(transaction.category)}
                                  </Badge>
                                </>
                              )}
                            </div>
                          </div>
                          <p
                            className={`font-semibold text-lg ${
                              transaction.amount >= 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {formatCurrency(transaction.amount || 0)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 border rounded-lg">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">
                  Nenhuma transação nesta pasta
                </p>
              </div>
            )}

            {/* Status da Pasta */}
            <div className="p-4 rounded-lg border bg-muted/30">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-background">
                  {folder.isActive ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">
                    Status da Pasta: {folder.isActive ? "Ativa" : "Inativa"}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {getStatusInfo().text}
                  </p>
                  {folder.isActive && (
                    <div className="mt-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Target className="h-3 w-3" />
                        <span>
                          Próxima execução:{" "}
                          {(() => {
                            const now = new Date();
                            switch (folder.frequency) {
                              case "WEEKLY":
                                now.setDate(now.getDate() + 7);
                                break;
                              case "BIWEEKLY":
                                now.setDate(now.getDate() + 14);
                                break;
                              case "MONTHLY":
                                now.setMonth(now.getMonth() + 1);
                                break;
                              case "QUARTERLY":
                                now.setMonth(now.getMonth() + 3);
                                break;
                              case "YEARLY":
                                now.setFullYear(now.getFullYear() + 1);
                                break;
                            }
                            return now.toLocaleDateString("pt-BR");
                          })()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0 pt-4 mb-8">
          <div className="text-sm text-muted-foreground flex-1">
            <div className="flex items-center gap-2">
              <FolderIcon className="h-3 w-3" />
              <span>ID da Pasta: </span>
              <span className="font-mono">{folder.id}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="destructive"
              disabled={isDelete}
              onClick={() => handleDelete(folder.id)}
            >
              {isDelete ? (
                <span className="flex items-center gap-2">
                  <Spinner /> Deletando
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Trash2 size={20} />
                  Deletar
                </span>
              )}
            </Button>
            <Button
              variant={isActiveFolder ? "outline" : "default"}
              onClick={() => handleIsActiveFolder(folder.id)}
              disabled={isActive}
            >
              {isActiveFolder ? "Desativar" : "Ativar"}
            </Button>
            <Button
              onClick={() => {
                // Função para editar
                console.log("Editar pasta:", folder.id);
                onClose();
              }}
            >
              Editar
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DetailsModalFolder;
