"use client";

import {
  Calendar,
  ChevronRight,
  Folder,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { formatCurrency } from "../../utils/email";
import { formatDate } from "../../utils/formatDate";
import { Badge } from "../ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { FolderType } from "../../types/interfaces";
import { Spinner } from "../ui/spinner";

type FolderCardProps = {
  folder: FolderType;
  hasFilteredTransactions: boolean;
  isPositive: boolean;
  isPendentDelete: boolean;
  selectedMonth: string;
  handleOpenMenu: (folder: FolderType) => void;
  handleDeleteFolder: (folderId: string) => void;
};

const FolderCard = ({
  folder,
  hasFilteredTransactions,
  isPositive,
  isPendentDelete,
  selectedMonth,
  handleDeleteFolder,
  handleOpenMenu,
}: FolderCardProps) => {
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      INCOME: "bg-green-500/10 text-green-500 border-green-500/20",
      EXPENSE: "bg-red-500/10 text-red-500 border-red-500/20",
      INVESTMENT: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      SAVINGS: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    };
    return colors[category] || "bg-muted text-muted-foreground";
  };

  const getFrequencyLabel = (frequency: string) => {
    const labels: Record<string, string> = {
      DAILY: "Diário",
      WEEKLY: "Semanal",
      MONTHLY: "Mensal",
      YEARLY: "Anual",
    };
    return labels[frequency] || frequency;
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <Card
          key={folder.id}
          className={`bg-card border-border hover:border-primary/50 transition-all duration-200 cursor-pointer group ${
            !hasFilteredTransactions ? "opacity-60" : ""
          }`}
          onClick={() => handleOpenMenu(folder)}
          style={
            folder.color
              ? {
                  borderLeftWidth: "4px",
                  borderLeftColor: folder.color,
                }
              : {}
          }
        >
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <Folder className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <CardTitle className="text-lg text-card-foreground group-hover:text-primary transition-colors">
                    {folder.name}
                  </CardTitle>
                  <CardDescription className="text-xs mt-1">
                    {getFrequencyLabel(folder.frequency)}
                    {!hasFilteredTransactions && selectedMonth !== "all" && (
                      <span className="ml-2 text-amber-600">
                        • Sem transações neste período
                      </span>
                    )}
                  </CardDescription>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Category and Status */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant="outline"
                className={getCategoryColor(folder.category)}
              >
                {folder.category}
              </Badge>
              <Badge
                variant={folder.isActive ? "default" : "secondary"}
                className="text-xs"
              >
                {folder.isActive ? "Ativo" : "Inativo"}
              </Badge>
              {selectedMonth !== "current" && selectedMonth !== "all" && (
                <Badge variant="outline" className="text-xs">
                  {folder.filteredTransactions.length} transações
                </Badge>
              )}
            </div>

            {/* Description */}
            {folder.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {folder.description}
              </p>
            )}

            {/* Amount */}
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <div className="flex items-center gap-2">
                {isPositive ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <span className="text-xs text-muted-foreground">
                  {folder.filteredTransactions.length} transações
                  {selectedMonth !== "all" && (
                    <span className="ml-1">
                      ({folder.transactions.length} total)
                    </span>
                  )}
                </span>
              </div>
              <div className="text-right">
                <span
                  className={`text-lg font-bold ${
                    isPositive ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {formatCurrency(folder.filteredAmount)}
                </span>
                {selectedMonth !== "all" &&
                  folder.filteredAmount !==
                    folder.transactions.reduce(
                      (sum: number, t: { amount: number }) => sum + t.amount,
                      0
                    ) && (
                    <p className="text-xs text-muted-foreground">
                      Total:{" "}
                      {formatCurrency(
                        folder.transactions.reduce(
                          (sum: number, t: { amount: number }) =>
                            sum + t.amount,
                          0
                        )
                      )}
                    </p>
                  )}
              </div>
            </div>

            {/* Last transaction date */}
            {folder.filteredTransactions.length > 0 && (
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Última neste período:{" "}
                {formatDate(
                  folder.filteredTransactions[
                    folder.filteredTransactions.length - 1
                  ].date
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem>Detalhes</ContextMenuItem>
        <ContextMenuItem
          className="text-red-500"
          onClick={() => handleDeleteFolder(folder.id)}
          disabled={isPendentDelete}
        >
          <span className="flex items-center gap-2">
            {isPendentDelete && <Spinner />}
            Deletar pasta?
          </span>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default FolderCard;
