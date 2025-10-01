"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircleIcon } from "lucide-react";

type PropsAlert = {
  title?: string;
  message: string;
  className?: string;
};

const ErrorMessage = ({ title, message, className }: PropsAlert) => {
  return (
    <div className={`w-full max-w-7xl mx-auto h-auto ${className}`}>
      <Alert variant="destructive">
        <AlertCircleIcon size={2} />
        <AlertTitle>{title || "Error"}</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
      </Alert>
    </div>
  );
};

export default ErrorMessage;
