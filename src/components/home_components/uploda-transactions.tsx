"use client";

import UploadFile from "@/components/modals/uploda-file-transactions";
import { trpc } from "@/server/trpc/client";
import { UploadResponse } from "@/types/interfaces";
import React, { useState } from "react";

export const UploadPage: React.FC = () => {
  const { data: userData, isLoading } = trpc.auth.me.useQuery();
  const userId = userData?.id;
  const { refetch } = trpc.transaction.getTransactions.useQuery({
    userId: userId as string,
  });
  const [uploadResult, setUploadResult] = useState<UploadResponse | null>(null);

  if (isLoading) {
    return (
      <div className="w-full h-screen">
        <div className="w-full h-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  const handleUploadSuccess = (data: UploadResponse) => {
    setUploadResult(data);
  };

  return (
    <div className="w-auto h-auto">
      <div className="w-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold  mb-2">
            Upload de Extrato Bancário
          </h1>
          <p className="text-gray-300">
            Faça upload do seu extrato em PDF ou CSV para processamento
            automático
          </p>
        </div>

        <UploadFile
          userId={userId!}
          onUploadSuccess={handleUploadSuccess}
          refetch={refetch}
        />

        {uploadResult && (
          <div className="mt-8 rounded-lg shadow-md p-6 md:max-w-lg">
            <h2 className="text-xl font-semibold text-green-600 mb-4">
              Upload realizado com sucesso!
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-gray-300">Transações processadas:</span>
                <span className="font-semibold ml-2">{uploadResult.count}</span>
              </div>

              <div>
                <span className="text-gray-300">Tipo de arquivo:</span>
                <span className="font-semibold ml-2">
                  {uploadResult.transactions[0]?.typeFile}
                </span>
              </div>
            </div>

            {/* <div className="mt-6">
              <h3 className="text-lg font-medium  mb-3">Últimas transações:</h3>

              <div className="space-y-2">
                {uploadResult.transactions
                  .slice(0, 5)
                  .map((transaction: Transaction) => (
                    <div
                      key={transaction.id}
                      className="flex justify-between items-center p-3  rounded"
                    >
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm dark:text-gray-300">
                          {new Date(transaction.date).toLocaleDateString()}
                        </p>
                      </div>
                      <span
                        className={`font-bold ${
                          transaction.type === "INCOME"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {transaction.amount.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </span>
                    </div>
                  ))}
              </div>
            </div> */}
          </div>
        )}
      </div>
    </div>
  );
};
