
import { Button } from "@/components/ui/button";
import { Power, Pencil, Trash2 } from "lucide-react";

interface ActionButtonsProps {
  isActive?: boolean;
  onToggle?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showEdit?: boolean;
}

export const ActionButtons = ({
  isActive,
  onToggle,
  onEdit,
  onDelete,
  showEdit = true,
}: ActionButtonsProps) => {
  return (
    <div className="flex gap-2">
      {onToggle && (
        <Button
          variant="outline"
          size="icon"
          onClick={onToggle}
          title={isActive ? "Desativar" : "Ativar"}
        >
          <Power className="h-4 w-4" />
        </Button>
      )}
      {showEdit && onEdit && (
        <Button
          variant="outline"
          size="icon"
          onClick={onEdit}
          title="Editar"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      )}
      {onDelete && (
        <Button
          variant="destructive"
          size="icon"
          onClick={onDelete}
          title="Excluir"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};
