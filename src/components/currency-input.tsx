import React from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface CurrencyInputProps {
  id: string;
  label?: string;
  value: string;
  onChange: (value: string, numericValue: number) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder = "0,00",
  required = false,
  disabled = false,
  className = "",
}) => {
  // Funções auxiliares
  const formatCurrency = (value: number): string => {
    return value.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const parseCurrency = (value: string): number => {
    if (!value) return 0;
    // Remove pontos de milhar e substitui vírgula por ponto
    const cleanValue = value.replace(/\./g, "").replace(",", ".");
    return parseFloat(cleanValue) || 0;
  };

  const unformatCurrency = (value: string): string => {
    if (!value) return "";
    const numericValue = parseCurrency(value);
    return numericValue.toFixed(2).replace(".", ",");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value.replace(/[^0-9,.]/g, "");

    const parts = inputValue.split(",");
    if (parts.length > 2) {
      inputValue = parts[0] + "," + parts.slice(1).join("");
    }

    const dotParts = inputValue.split(".");
    if (dotParts.length > 2) {
      inputValue = dotParts.slice(0, -1).join("") + "." + dotParts.slice(-1);
    }

    inputValue = inputValue.replace(".", ",");

    const decimalParts = inputValue.split(",");
    if (decimalParts[1] && decimalParts[1].length > 3) {
      inputValue = decimalParts[0] + "," + decimalParts[1].substring(0, 3);
    }

    const numericValue = parseCurrency(inputValue);
    onChange(inputValue, numericValue);
  };

  const handleBlur = () => {
    if (value) {
      const numericValue = parseCurrency(value);
      const formatted = formatCurrency(numericValue);
      onChange(formatted, numericValue);
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (value) {
      const unformatted = unformatCurrency(value);
      onChange(unformatted, parseCurrency(unformatted));
    }
    e.target.select();
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <Label htmlFor={id}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      <Input
        id={id}
        type="text"
        inputMode="decimal"
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className="w-full"
      />
    </div>
  );
};

// Hook para usar com estados
export const useCurrencyInput = (initialValue: number = 0) => {
  const [displayValue, setDisplayValue] = React.useState(
    initialValue
      ? initialValue.toLocaleString("pt-BR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : ""
  );
  const [numericValue, setNumericValue] = React.useState(initialValue);

  const formatCurrency = (value: number): string => {
    return value.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const parseCurrency = (value: string): number => {
    if (!value) return 0;
    const cleanValue = value.replace(/\./g, "").replace(",", ".");
    return parseFloat(cleanValue) || 0;
  };

  const handleChange = (display: string, numeric: number) => {
    setDisplayValue(display);
    setNumericValue(numeric);
  };

  const setValue = (value: number) => {
    setNumericValue(value);
    setDisplayValue(value ? formatCurrency(value) : "");
  };

  return {
    displayValue,
    numericValue,
    handleChange,
    setValue,
    formatCurrency,
    parseCurrency,
  };
};
