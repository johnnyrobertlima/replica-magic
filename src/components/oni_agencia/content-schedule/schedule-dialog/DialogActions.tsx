
import { Button } from "@/components/ui/button";
import { Loader2, Trash } from "lucide-react";
import { useUserGroups } from "@/hooks/useUserGroups";

interface DialogActionsProps {
  isSubmitting: boolean;
  isDeleting: boolean;
  onCancel: () => void;
  onDelete?: () => Promise<void>;
  isEditing: boolean;
  saveLabel?: string;
}

export function DialogActions({
  isSubmitting,
  isDeleting,
  onCancel,
  onDelete,
  isEditing,
  saveLabel = "Salvar"
}: DialogActionsProps) {
  const isStatusUpdate = saveLabel === "Atualizar Status";
  const { isInGroups: isAdmin } = useUserGroups(["admin", "Oni_admin"]);
  
  return (
    <div className="flex items-center justify-end space-x-2 pt-2">
      {isEditing && onDelete && isAdmin && (
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={onDelete}
          disabled={isSubmitting || isDeleting}
        >
          {isDeleting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Trash className="mr-2 h-4 w-4" />
          )}
          Excluir
        </Button>
      )}
      <div className="flex-1" />
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onCancel}
        disabled={isSubmitting || isDeleting}
      >
        Cancelar
      </Button>
      <Button
        type="submit"
        variant={isStatusUpdate ? "success" : "default"}
        size="sm"
        disabled={isSubmitting || isDeleting}
      >
        {isSubmitting ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : null}
        {saveLabel}
      </Button>
    </div>
  );
}
