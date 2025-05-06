
import React from "react";
import { Loader2 } from "lucide-react";

interface ContentScheduleLoadingProps {
  isCollapsed?: boolean;
}

export function ContentScheduleLoading({ isCollapsed = false }: ContentScheduleLoadingProps) {
  return (
    <div className={`w-full flex flex-col items-center justify-center p-8 min-h-[400px] ${isCollapsed ? 'mt-0' : 'mt-4'}`}>
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">Carregando agendamentos</h3>
          <p className="text-muted-foreground">
            Por favor, aguarde enquanto os dados são carregados...
          </p>
        </div>
      </div>
    </div>
  );
}
