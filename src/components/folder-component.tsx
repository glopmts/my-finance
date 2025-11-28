"use client";

import { cn } from "@/lib/utils";
import { Check, Folder } from "lucide-react";
import { useMemo } from "react";

interface FolderCardProps {
  id: string;
  name: string;
  color: string | null;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export function FolderCard({
  id,
  name,
  color,
  isSelected,
  onSelect,
}: FolderCardProps) {
  const isLightColor = useMemo(() => {
    if (!color) return false; // No dark mode, cor padrão será escura

    const hex = color.replace("#", "");

    // Converte hex para RGB
    let r, g, b;

    if (hex.length === 3) {
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
    } else if (hex.length === 6) {
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
    } else {
      return false;
    }

    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    return luminance > 0.6;
  }, [color]);

  // Função para determinar a classe de texto baseada no tema e cor
  const getTextColorClass = useMemo(() => {
    if (!color) return "text-white dark:text-white";

    const colorLower = color.toLowerCase();

    // Cores claras específicas
    const lightColors = [
      "white",
      "#ffffff",
      "fff",
      "#f8fafc",
      "#f1f5f9",
      "#e2e8f0",
      "#cbd5e1",
      "#f9fafb",
      "#f3f4f6",
      "#e5e7eb",
      "#d1d5db",
      "#fafafa",
      "#f4f4f5",
      "#e4e4e7",
      "#d4d4d8",
    ];

    const tailwindLightColors = [
      "zinc-50",
      "zinc-100",
      "zinc-200",
      "zinc-300",
      "gray-50",
      "gray-100",
      "gray-200",
      "gray-300",
      "slate-50",
      "slate-100",
      "slate-200",
      "slate-300",
      "stone-50",
      "stone-100",
      "stone-200",
      "stone-300",
      "neutral-50",
      "neutral-100",
      "neutral-200",
      "neutral-300",
    ];

    const isKnownLightColor =
      lightColors.some((lightColor) => colorLower.includes(lightColor)) ||
      tailwindLightColors.some((tailwindColor) =>
        colorLower.includes(tailwindColor)
      );

    if (isLightColor || isKnownLightColor) {
      return "text-gray-900 dark:text-gray-900";
    }

    return "text-white dark:text-white";
  }, [color, isLightColor]);

  // Cor de fundo com fallback para o tema
  const getBackgroundColor = useMemo(() => {
    if (color) return color;

    return "#27272a";
  }, [color]);

  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      className={cn(
        "w-36 h-28 relative cursor-pointer border hover:opacity-75 transition-all rounded-lg p-3",
        "dark:border-gray-600",
        isSelected &&
          "ring-2 ring-cyan-500 dark:ring-cyan-400 shadow-lg scale-105"
      )}
      style={{
        backgroundColor: getBackgroundColor,
      }}
    >
      {/* Checkbox indicator */}
      {isSelected && (
        <div className="absolute -top-2 -right-2 bg-cyan-500 dark:bg-cyan-600 rounded-full p-1 shadow-md z-10">
          <Check className="w-4 h-4 text-white" strokeWidth={3} />
        </div>
      )}

      <div className="relative w-full h-full">
        <div className="w-full h-full flex items-center justify-center">
          <Folder size={48} className={cn(getTextColorClass, "opacity-80")} />
        </div>
        <div className="absolute bottom-0 left-0 right-0 text-center">
          <span
            className={cn(
              "font-medium text-sm truncate block px-1",
              getTextColorClass
            )}
          >
            {name}
          </span>
        </div>
      </div>

      {/* Folder tab effect */}
      <div className="absolute left-10 -top-1">
        <div
          className={cn(
            "p-1.5 rounded-t-md w-16 shadow-sm border-t border-x h-3",
            "dark:border-gray-600"
          )}
          style={{
            backgroundColor: getBackgroundColor,
          }}
        />
      </div>
    </button>
  );
}
