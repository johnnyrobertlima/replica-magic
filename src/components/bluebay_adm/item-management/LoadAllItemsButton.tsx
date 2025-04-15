
import { Button } from "@/components/ui/button";
import { Database } from "lucide-react";

interface LoadAllItemsButtonProps {
  onLoadAll: () => void;
  isLoading: boolean;
}

export const LoadAllItemsButton = ({ onLoadAll, isLoading }: LoadAllItemsButtonProps) => {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onLoadAll}
      disabled={isLoading}
      className="flex items-center gap-1"
    >
      <Database className="h-4 w-4" />
      {isLoading ? "Carregando..." : "Carregar Todos os Itens"}
    </Button>
  );
};
