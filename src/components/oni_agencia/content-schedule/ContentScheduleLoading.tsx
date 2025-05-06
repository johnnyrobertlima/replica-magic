
import React from 'react';
import { Loader2 } from "lucide-react";

interface ContentScheduleLoadingProps {
  isCollapsed?: boolean;
}

export function ContentScheduleLoading({ isCollapsed = false }: ContentScheduleLoadingProps) {
  return (
    <div className={`w-full flex flex-col items-center justify-center p-12 bg-white rounded-md border shadow-sm ${isCollapsed ? 'mt-0' : 'mt-4'}`}>
      <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
      <p className="text-muted-foreground">Carregando agendamentos...</p>
    </div>
  );
}
