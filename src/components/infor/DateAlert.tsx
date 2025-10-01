import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";

export function DataAlert({
  message,
  className,
}: {
  message: string;
  className?: string;
}) {
  return (
    <div
      className={`w-full h-42 mx-auto max-w-7xl p-2 flex items-center justify-center ${className}`}
    >
      <Alert className="w-[400px] h-full" variant="destructive">
        <ExclamationTriangleIcon className="h-4 w-4" />
        <AlertTitle>Aviso</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
      </Alert>
    </div>
  );
}
