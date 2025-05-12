
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StatusSelect } from "./StatusSelect";
import { CollaboratorSelect } from "./CollaboratorSelect";
import { CalendarEvent } from "@/types/oni-agencia";
import { linkifyText } from "@/utils/linkUtils";
import { AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface StatusUpdateFormProps {
  event: CalendarEvent;
  statuses: any[];
  collaborators: any[];
  isLoadingStatuses: boolean;
  isLoadingCollaborators: boolean;
  selectedStatus: string;
  selectedCollaborator: string;
  note: string;
  isSubmitting?: boolean;
  onStatusChange: (value: string) => void;
  onCollaboratorChange: (value: string) => void;
  onNoteChange: (value: string) => void;
  onRetryLoadResources?: () => void;
}

export function StatusUpdateForm({
  event,
  statuses,
  collaborators,
  isLoadingStatuses,
  isLoadingCollaborators,
  selectedStatus,
  selectedCollaborator,
  note,
  isSubmitting = false,
  onStatusChange,
  onCollaboratorChange,
  onNoteChange,
  onRetryLoadResources
}: StatusUpdateFormProps) {
  // Process links in the note
  const noteWithLinks = linkifyText(note);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Clear validation error when isSubmitting changes to false
  useEffect(() => {
    if (!isSubmitting) {
      setValidationError(null);
    }
  }, [isSubmitting]);

  // Determine if there was an error loading resources
  const hasResourcesError = (!isLoadingCollaborators && collaborators.length === 0) || 
                          (!isLoadingStatuses && statuses.length === 0);

  // Validate status selection
  const handleStatusChangeWithValidation = (value: string) => {
    if (value === "null" || !value) {
      setValidationError("Por favor, selecione um status válido.");
    } else {
      setValidationError(null);
    }
    onStatusChange(value);
  };

  return (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="event-title">Título</Label>
        <div className="p-2 bg-muted rounded-md">
          {event.title || "Sem título"}
        </div>
      </div>
      
      {validationError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{validationError}</AlertDescription>
        </Alert>
      )}
      
      {hasResourcesError && (
        <Alert variant="destructive" className="mb-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex flex-col gap-2">
            <p>Não foi possível carregar alguns recursos necessários.</p>
            {onRetryLoadResources && (
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={onRetryLoadResources}
                className="w-full flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Tentar novamente
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}
      
      <StatusSelect
        statuses={statuses}
        isLoading={isLoadingStatuses || isSubmitting}
        value={selectedStatus}
        onValueChange={handleStatusChangeWithValidation}
        errorMessage={!isLoadingStatuses && statuses.length === 0 ? "Não foi possível carregar os status" : undefined}
      />
      
      <CollaboratorSelect
        collaborators={collaborators}
        isLoading={isLoadingCollaborators || isSubmitting}
        value={selectedCollaborator}
        onValueChange={onCollaboratorChange}
        errorMessage={!isLoadingCollaborators && collaborators.length === 0 ? "Não foi possível carregar os colaboradores" : undefined}
      />
      
      <div className="grid gap-2">
        <Label htmlFor="status-note">Observação</Label>
        <Textarea
          id="status-note"
          placeholder="Adicione uma observação sobre esta atualização de status (opcional)"
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
          rows={4}
          disabled={isSubmitting}
        />
        
        {/* Render clickable links if there are any in the note */}
        {note && note.match(/(https?:\/\/[^\s]+)/g) && (
          <div className="mt-2 text-sm">
            <p className="font-medium mb-1">Links detectados:</p>
            <div 
              className="p-2 bg-muted rounded-md"
              dangerouslySetInnerHTML={{ __html: noteWithLinks }}
            />
          </div>
        )}
      </div>
      
      {isSubmitting && (
        <div className="flex items-center justify-center py-2">
          <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
          <span>Atualizando...</span>
        </div>
      )}
    </div>
  );
}
