
import { Loader2 } from "lucide-react";

export const FinanceiroLoading = () => {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-4">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="text-muted-foreground animate-pulse">Carregando informações financeiras...</p>
    </div>
  );
};
