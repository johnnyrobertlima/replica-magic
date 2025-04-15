
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";

interface ItemGroupManagementHeaderProps {
  onNewGroup: () => void;
  onRefresh?: () => void;
}

export const ItemGroupManagementHeader = ({
  onNewGroup,
  onRefresh
}: ItemGroupManagementHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Gerenciamento de Grupos</h1>
        <p className="text-muted-foreground">
          Gerencie os grupos de itens e suas configurações.
        </p>
      </div>
      <div className="flex gap-2">
        {onRefresh && (
          <Button variant="outline" onClick={onRefresh} title="Atualizar lista">
            <RefreshCw className="h-4 w-4" />
          </Button>
        )}
        <Button onClick={onNewGroup} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Novo Grupo
        </Button>
      </div>
    </div>
  );
};
