"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Transaction } from "@prisma/client";
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Info,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { URL_API } from "../utils/api-url";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface UploadResult {
  message: string;
  transactions: Transaction[];
  totalCount: number;
  savedCount: number;
  fileType: string;
  count: number;
}

interface UploadFileProps {
  onUploadSuccess: (data: UploadResult) => void;
  userId: string;
  refetch: () => void;
}

export default function UploadFile({
  userId,
  onUploadSuccess,
  refetch,
}: UploadFileProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];

    if (file.size > 10 * 1024 * 1024) {
      setError("Arquivo muito grande. Tamanho máximo: 10MB");
      setSuccess(null);
      return;
    }

    setSelectedFile(file);
    setError(null);
    setSuccess(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("userId", userId);

    setIsUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`${URL_API}/upload/creater`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || "Erro no upload");
      }

      setSuccess(
        `Upload realizado com sucesso! ${
          data.savedCount || 0
        } transações processadas.`
      );
      onUploadSuccess(data);
      refetch();
      setTimeout(() => {
        setIsOpen(false);
        setSelectedFile(null);
        setSuccess(null);
      }, 2000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao fazer upload do arquivo"
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    setSelectedFile(null);
    setError(null);
    setSuccess(null);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "text/csv": [".csv"],
      "application/vnd.ms-excel": [".csv"],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className="relative overflow-hidden rounded-xl border-2 border-dashed transition-all duration-200 border-zinc-300 dark:border-zinc-600 hover:border-zinc-400 dark:hover:border-zinc-500 cursor-pointer hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 bg-white dark:bg-zinc-900/90 backdrop-blur-sm">
          <div className="p-8 text-center">
            <div className="space-y-4">
              <div className="relative">
                <Upload className="w-12 h-12 mx-auto text-slate-400 dark:text-slate-500" />
              </div>

              <div>
                <p className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Clique para fazer upload de arquivo
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Formatos suportados: PDF ou CSV (máx. 10MB)
                </p>
              </div>

              {/* Info Box */}
              <div className="bg-slate-50 dark:bg-zinc-800 rounded-lg p-4 border border-zinc-200 dark:border-zinc-600">
                <div className="flex items-start space-x-3">
                  <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Formato CSV esperado:
                    </p>
                    <code className="text-xs bg-slate-200 dark:bg-slate-600 px-2 py-1 rounded text-slate-600 dark:text-slate-300">
                      Data, Valor, Descrição
                    </code>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md md:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload de Arquivo
          </DialogTitle>
          <DialogDescription>
            Selecione um arquivo CSV ou PDF para fazer upload das suas
            transações.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 w-full">
          {/* Dropzone dentro do modal */}
          <div
            {...getRootProps()}
            className={`
                    relative overflow-hidden rounded-lg border-2 border-dashed transition-all duration-200
                    ${
                      isDragActive
                        ? "border-blue-400 bg-blue-50/50 dark:bg-blue-950/20"
                        : "border-slate-300 dark:border-slate-600"
                    }
                    ${
                      isUploading
                        ? "opacity-60 cursor-not-allowed"
                        : "cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/50"
                    }
                    bg-white dark:bg-slate-800/50
                  `}
          >
            <input {...getInputProps()} disabled={isUploading} />

            <div className="p-6 text-center w-full">
              {selectedFile ? (
                <div className="flex items-center space-x-3 w-full">
                  <FileText className="w-8 h-8 text-blue-500" />
                  <div className="text-left truncate w-full">
                    <p className="font-medium text-slate-700 dark:text-slate-300">
                      {selectedFile.name}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                      setError(null);
                    }}
                    disabled={isUploading}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Upload className="w-8 h-8 mx-auto text-slate-400 dark:text-slate-500" />
                  <div>
                    <p className="font-medium text-slate-700 dark:text-slate-300">
                      {isDragActive
                        ? "Solte o arquivo aqui!"
                        : "Clique ou arraste o arquivo aqui"}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      PDF ou CSV (máx. 10MB)
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Alerts */}
          {error && (
            <Alert className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <AlertDescription className="text-red-700 dark:text-red-300">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-700 dark:text-green-300">
                {success}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isUploading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="min-w-[100px]"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Enviar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
