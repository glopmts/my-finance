import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

export function DataAlert({ message }: { message: string }) {
  return (
    <div className="w-full h-screen mx-auto max-w-7xl p-2 flex items-center justify-center">
      <Alert className="w-[400px]">
        <ExclamationTriangleIcon className="h-4 w-4" />
        <AlertTitle>Aviso</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
      </Alert>
    </div>
  );
}
