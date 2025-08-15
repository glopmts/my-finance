"use client";

import { Edit, MoreVertical, Trash2 } from "lucide-react";
import type { TransactionProps } from "../types/interfaces";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface MenuDropdownCardProps {
  transaction: TransactionProps;
  handleEdite: (transaction: TransactionProps) => void;
  handleDelete?: (id: string) => void;
}

export default function MenuDropdwonCard({
  transaction,
  handleEdite: handleEdit,
  handleDelete,
}: MenuDropdownCardProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem onClick={() => handleEdit(transaction)}>
          <Edit className="mr-2 h-4 w-4" />
          Editar
        </DropdownMenuItem>
        {handleDelete && (
          <DropdownMenuItem
            onClick={() => handleDelete(transaction.id)}
            className="text-red-600 dark:text-red-400"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
