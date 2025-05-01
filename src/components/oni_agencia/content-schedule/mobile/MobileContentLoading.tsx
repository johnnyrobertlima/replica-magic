
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader } from "lucide-react";

export function MobileContentLoading() {
  return (
    <div className="bg-white rounded-md border shadow-sm w-full p-6">
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Loader className="h-8 w-8 animate-spin text-primary" />
        <p className="text-lg font-medium text-muted-foreground">Carregando agendamentos...</p>
        <div className="w-full max-w-md space-y-3">
          <Skeleton className="h-16 w-full rounded-md" />
          <Skeleton className="h-16 w-full rounded-md" />
          <Skeleton className="h-16 w-full rounded-md" />
        </div>
      </div>
    </div>
  );
}
