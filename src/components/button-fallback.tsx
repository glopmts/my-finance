"use client";

import { useState } from "react";
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
  isFormValid?: boolean;
  onClick?: () => Promise<void> | void;
};

export function ButtonFallback({
  size = "medium",
  className = "",
  disabled,
  isFormValid,
  variant = "default",
  text = "Carregando...",
  type = "button",
  onClick,
}: ButtonFallbackProps) {
  const [loading, setLoading] = useState(false);

  let paddingClass = "py-2 px-4 text-base";
  if (size === "small") {
    paddingClass = "py-1 px-3 text-sm";
  } else if (size === "large") {
    paddingClass = "py-3 px-6 text-lg";
  }

  const handleClick = async () => {
    if (onClick) {
      setLoading(true);
      try {
        await onClick();
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Button
      className={`${paddingClass} ${className} ${
        disabled || loading ? "opacity-70 cursor-not-allowed" : ""
      }`}
      variant={variant}
      disabled={disabled || loading}
      onClick={handleClick}
      type={type}
    >
      <span className="flex items-center gap-2 text-sm">
        {(disabled || loading) &&
          (isFormValid || isFormValid === undefined) && <Spinner />}
        {text}
      </span>
    </Button>
  );
}
