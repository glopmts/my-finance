"use client";

import { Edit, MoreVertical, Pin, Trash2 } from "lucide-react";
import type { TransactionProps } from "../types/interfaces";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface MenuDropdownCardProps {
  transaction?: TransactionProps;
  fixedId?: string;
  handleEdite?: (transaction: TransactionProps) => void;
  handleDelete?: (id: string) => void;
  handleFixed?: (id: string) => void;
  isFixed?: boolean;
}

export default function MenuDropdwonCard({
  transaction,
  isFixed,
  fixedId,
  handleEdite: handleEdit,
  handleDelete,
  handleFixed,
}: MenuDropdownCardProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {handleEdit && (
          <DropdownMenuItem onClick={() => handleEdit?.(transaction!)}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
        )}
        {handleFixed && (
          <DropdownMenuItem onClick={() => handleFixed?.(transaction!.id)}>
            <Pin className={isFixed ? "fill-green-500" : ""} />
            {isFixed ? "Fixado" : "Fixa"}
          </DropdownMenuItem>
        )}
        {handleDelete &&
          (fixedId ? (
            <DropdownMenuItem
              onClick={() => handleDelete(fixedId || "")}
              className="text-red-600 dark:text-red-400"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir Fixado
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              onClick={() => handleDelete(transaction!.id)}
              className="text-red-600 dark:text-red-400"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
            </DropdownMenuItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
