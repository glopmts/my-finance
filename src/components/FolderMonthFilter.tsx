"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar, Filter } from "lucide-react";

interface FolderMonthFilterProps {
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  availableMonths: string[];
  currentMonth: string;
  formatMonth: (monthKey: string) => string;
}

export function FolderMonthFilter({
  selectedMonth,
  setSelectedMonth,
  availableMonths,
  currentMonth,
  formatMonth,
}: FolderMonthFilterProps) {
  const hasFilters = selectedMonth !== "current";

  const monthOptions = [
    { value: "current", label: "Mês Atual" },
    { value: "all", label: "Todos os Meses" },
    ...availableMonths.map((month) => ({
      value: month,
      label: formatMonth(month),
    })),
  ];

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-9 gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Período:</span>
            <span className="font-medium">{formatMonth(selectedMonth)}</span>
            {hasFilters && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                <Filter className="h-3 w-3" />
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Filtrar por mês</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            {monthOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => setSelectedMonth(option.value)}
                className={`${
                  selectedMonth === option.value
                    ? "bg-accent text-accent-foreground"
                    : ""
                }`}
              >
                <span className="flex-1">{option.label}</span>
                {option.value === currentMonth &&
                  option.value !== "current" && (
                    <Badge variant="outline" className="text-xs">
                      Atual
                    </Badge>
                  )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSelectedMonth("current")}
          className="h-9"
        >
          Limpar filtro
        </Button>
      )}
    </div>
  );
}
