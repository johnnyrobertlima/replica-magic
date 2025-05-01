
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader } from "lucide-react";

export function MobileContentLoading() {
  return (
    <div className="bg-white rounded-lg border shadow-sm w-full p-6">
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader className="h-8 w-8 text-white" />
          </div>
          <div className="h-16 w-16 rounded-full bg-primary animate-pulse flex items-center justify-center">
            <Loader className="h-8 w-8 animate-spin text-white" />
          </div>
        </div>
        <p className="text-lg font-medium text-gray-700">Carregando agendamentos...</p>
        <div className="w-full max-w-md space-y-3">
          <Skeleton className="h-16 w-full rounded-md" />
          <Skeleton className="h-16 w-full rounded-md opacity-70" />
          <Skeleton className="h-16 w-full rounded-md opacity-50" />
        </div>
      </div>
    </div>
  );
}
