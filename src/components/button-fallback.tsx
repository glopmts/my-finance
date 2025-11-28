"use client";

import { Button } from "./ui/button";
import { Spinner } from "./ui/spinner";

type ButtonFallbackProps = {
  size?: "small" | "medium" | "large";
  className?: string;
  text?: string;
  disabled?: boolean;
  variant?:
    | "link"
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "cyan"
    | null
    | undefined;
  type?: "reset" | "button" | "submit" | undefined;
  onchange?: (value: string) => void;
  onClick?: () => void;
};

export function ButtonFallback({
  size = "medium",
  className = "",
  disabled = false,
  variant = "default",
  text = "Carregando...",
  type = "button",
  onClick,
}: ButtonFallbackProps) {
  let paddingClass = "py-2 px-4 text-base";
  if (size === "small") {
    paddingClass = "py-1 px-3 text-sm";
  } else if (size === "large") {
    paddingClass = "py-3 px-6 text-lg";
  }

  return (
    <Button
      className={`${paddingClass} ${className} ${
        disabled ? "opacity-70 cursor-not-allowed" : ""
      }`}
      variant={variant}
      disabled={disabled}
      onClick={onClick}
      type={type}
    >
      <span className="flex items-center gap-2 text-sm">
        {disabled === true && <Spinner />}
        {text}
      </span>
    </Button>
  );
}
