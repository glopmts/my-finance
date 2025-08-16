"use client";

import { Skeleton } from "@/components/ui/skeleton";

type LoaderTypesProps = {
  types: "unique" | "cards" | "spine";
  count?: number;
};

const LoaderTypes = ({ types, count = 3 }: LoaderTypesProps) => {
  if (types === "unique") {
    return (
      <div className="flex flex-col space-y-3 w-full h-full p-4">
        <Skeleton className="h-[125px] w-full rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[90%]" />
          <Skeleton className="h-4 w-[80%]" />
          <Skeleton className="h-4 w-[70%]" />
        </div>
      </div>
    );
  }

  if (types === "cards") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
        {[...Array(count)].map((_, index) => (
          <div
            key={index}
            className="flex flex-col space-y-3 p-4 border rounded-lg"
          >
            <Skeleton className="h-[125px] w-full rounded-lg" />
            <Skeleton className="h-4 w-[80%]" />
            <Skeleton className="h-4 w-[60%]" />
            <Skeleton className="h-4 w-[40%]" />
          </div>
        ))}
      </div>
    );
  }

  if (types === "spine") {
    return (
      <div className="flex flex-col w-full space-y-4">
        {[...Array(count)].map((_, index) => (
          <div key={index} className="flex items-center space-x-4 p-4 border-b">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-[70%]" />
              <Skeleton className="h-4 w-[50%]" />
            </div>
            <Skeleton className="h-4 w-4" />
          </div>
        ))}
      </div>
    );
  }

  return null;
};

export default LoaderTypes;
