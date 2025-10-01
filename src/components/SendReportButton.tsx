"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { Label } from "./ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import LoaderTypes from "./infor/LoaderTypes";
import { Button } from "./ui/button";

export function SendReportButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoader, setLoader] = useState(true);
  const [message, setMessage] = useState("");
  const [reportType, setReportType] = useState<"previous" | "current">(
    "previous"
  );
  const { user } = useUser();

  const handleSendReport = async () => {
    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/monthly-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user?.emailAddresses[0]?.emailAddress,
          reportType,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        if (result.message?.includes("Nenhuma transação")) {
          setMessage(
            `Nenhuma transação encontrada para ${result.period.month}/${result.period.year}`
          );
        } else {
          setMessage("Relatório enviado com sucesso! Verifique seu email.");
        }
      } else {
        setMessage(`Erro: ${result.error}`);
      }
      setTimeout(() => {
        setMessage("");
      }, 4000);
    } catch (error) {
      setMessage("Erro ao enviar relatório. Tente novamente.");
      console.error("Erro:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loader = async () => {
      setTimeout(() => {
        setLoader(false);
      }, 1000);
    };
    loader();
  }, []);

  if (isLoader) {
    return (
      <div className="w-full h-65 mt-8">
        <LoaderTypes types="spine" count={1} />
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-lg  shadow-sm mt-6">
      <div className="">
        <h2 className="text-lg font-semibold mb-2">Relatório Mensal</h2>
        <p className="text-sm text-gray-300 mb-4">
          Receba um relatório completo dos seus gastos por email.
        </p>
      </div>

      <div className="mb-4">
        <Label className="block text-sm font-medium mb-2">
          Período do relatório:
        </Label>

        <Select
          onValueChange={(value) =>
            setReportType(value as "previous" | "current")
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Selecione um período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="previous">Mês Anterior</SelectItem>
            <SelectItem value="current">Mês Atual</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex w-full items-center justify-between">
        <div className=""></div>
        <Button
          onClick={handleSendReport}
          disabled={isLoading}
          className="w-auto"
        >
          {isLoading ? (
            <div className="flex items-center">
              <Loader2 size={20} className="animate-spin mr-1.5" /> Enviando...
            </div>
          ) : (
            "Enviar Relatório por Email"
          )}
        </Button>
      </div>
      {message && (
        <p
          className={`mt-3 text-sm ${
            message.includes("Erro") ? "text-red-600" : "text-green-600"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
