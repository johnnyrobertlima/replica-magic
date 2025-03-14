
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useDataCleanup } from "@/utils/cleanupUtils";

export const CleanupButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { handleCleanupData } = useDataCleanup();
  
  const handleClick = async () => {
    if (confirm("Esta ação irá limpar todos os dados de teste. Deseja continuar?")) {
      setIsLoading(true);
      await handleCleanupData();
      setIsLoading(false);
    }
  };
  
  return (
    <Button 
      variant="destructive" 
      size="sm" 
      onClick={handleClick} 
      disabled={isLoading}
      className="gap-1"
    >
      <Trash2 className="h-4 w-4" />
      {isLoading ? "Limpando..." : "Limpar dados de teste"}
    </Button>
  );
};
