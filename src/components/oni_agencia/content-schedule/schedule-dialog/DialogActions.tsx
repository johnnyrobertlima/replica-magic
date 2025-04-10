
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";

interface DialogActionsProps {
  isSubmitting: boolean;
  isDeleting: boolean;
  onCancel: () => void;
  onDelete?: () => void;
  isEditing: boolean;
  saveLabel?: string;
}

export function DialogActions({ 
  isSubmitting, 
  isDeleting, 
  onCancel, 
  onDelete,
  isEditing,
  saveLabel
}: DialogActionsProps) {
  return (
    <div className="flex items-center justify-between pt-2">
      {isEditing && onDelete && (
        <Button
          type="button"
          variant="destructive"
          size="icon"
          onClick={onDelete}
          disabled={isDeleting || isSubmitting}
          className="mr-auto"
        >
          {isDeleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </Button>
      )}
      <div className="flex space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            saveLabel || (isEditing ? "Atualizar" : "Criar")
          )}
        </Button>
      </div>
    </div>
  );
}
