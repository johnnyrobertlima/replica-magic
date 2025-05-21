
import { Button } from "@/components/ui/button";
import { Loader2, Trash } from "lucide-react";
import { useUserGroups } from "@/hooks/useUserGroups";

interface DialogActionsProps {
  isSubmitting: boolean;
  isDeleting: boolean;
  onCancel: () => void;
  onDelete?: () => Promise<void>;
  onSubmit?: (e: React.FormEvent) => void;
  isEditing: boolean;
  saveLabel?: string;
  submitLabel?: string;
  showDelete?: boolean;
}

export function DialogActions({
  isSubmitting,
  isDeleting,
  onCancel,
  onDelete,
  onSubmit,
  isEditing,
  saveLabel = "Salvar",
  submitLabel,
  showDelete = true
}: DialogActionsProps) {
  const isStatusUpdate = submitLabel === "Atualizar Status" || saveLabel === "Atualizar Status";
  const { isInGroups: isAdmin } = useUserGroups(["admin", "Oni_admin"]);
  
  const label = submitLabel || saveLabel;
  
  return (
    <div className="flex items-center justify-end space-x-2 pt-2">
      {isEditing && onDelete && isAdmin && showDelete && (
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
        type={onSubmit ? "submit" : "button"}
        variant={isStatusUpdate ? "success" : "default"}
        size="sm"
        onClick={onSubmit}
        disabled={isSubmitting || isDeleting}
      >
        {isSubmitting ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : null}
        {label}
      </Button>
    </div>
  );
}
