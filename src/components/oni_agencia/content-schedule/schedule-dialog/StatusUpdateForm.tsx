
import React from "react";
import { CalendarEvent, ContentScheduleFormData } from "@/types/oni-agencia";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CollaboratorSelect } from "./CollaboratorSelect";
import { StatusSelect } from "./StatusSelect";

interface StatusUpdateFormProps {
  event?: CalendarEvent;
  statuses: any[];
  collaborators?: any[];
  isLoadingStatuses: boolean;
  isLoadingCollaborators?: boolean;
  selectedStatus?: string | null;
  selectedCollaborator?: string | null;
  note?: string;
  formData?: ContentScheduleFormData;
  onStatusChange: (value: string) => void;
  onCollaboratorChange?: (value: string) => void;
  onNoteChange?: (value: string) => void;
  onSubmit?: (e: React.FormEvent) => Promise<void>;
  onInputChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSelectChange?: (name: string, value: string) => void;
  isSubmitting?: boolean;
  onCancel?: () => void;
}

export function StatusUpdateForm({
  event,
  statuses,
  collaborators = [],
  isLoadingStatuses,
  isLoadingCollaborators = false,
  selectedStatus,
  selectedCollaborator,
  note,
  formData,
  onStatusChange,
  onCollaboratorChange,
  onNoteChange,
  onSubmit,
  onInputChange,
  onSelectChange,
  isSubmitting,
  onCancel
}: StatusUpdateFormProps) {
  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (onNoteChange) {
      onNoteChange(e.target.value);
    }
    
    if (onInputChange) {
      onInputChange(e);
    }
  };
  
  const handleStatusFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(e);
    }
  };
  
  const effectiveSelectedStatus = formData?.status_id || selectedStatus;
  const effectiveSelectedCollaborator = formData?.collaborator_id || selectedCollaborator;
  const effectiveNote = formData?.description || note;
  
  return (
    <div className="space-y-4">
      {onSubmit ? (
        <form onSubmit={handleStatusFormSubmit}>
          <div className="space-y-4">
            <StatusSelect 
              statuses={statuses}
              value={effectiveSelectedStatus || ""}
              isLoading={isLoadingStatuses}
              onValueChange={value => {
                if (onSelectChange) {
                  onSelectChange("status_id", value);
                } else {
                  onStatusChange(value);
                }
              }}
              required={true}
            />
            
            {collaborators.length > 0 && (
              <CollaboratorSelect
                collaborators={collaborators}
                value={effectiveSelectedCollaborator || "null"}
                isLoading={isLoadingCollaborators}
                onValueChange={value => {
                  if (onSelectChange) {
                    onSelectChange("collaborator_id", value);
                  } else if (onCollaboratorChange) {
                    onCollaboratorChange(value);
                  }
                }}
              />
            )}
            
            <div>
              <Label htmlFor="description">Observações</Label>
              <Textarea
                id="description"
                name="description"
                value={effectiveNote || ""}
                onChange={handleNoteChange}
                rows={5}
                placeholder="Adicione informações adicionais sobre esta atualização de status"
                className="min-h-[120px]"
              />
            </div>
            
            {onCancel && (
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  type="button" 
                  className="px-4 py-2 border rounded-md hover:bg-gray-100"
                  onClick={onCancel}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Atualizando..." : "Atualizar Status"}
                </button>
              </div>
            )}
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <StatusSelect 
            statuses={statuses}
            value={effectiveSelectedStatus || ""}
            isLoading={isLoadingStatuses}
            onValueChange={value => {
              if (onSelectChange) {
                onSelectChange("status_id", value);
              } else {
                onStatusChange(value);
              }
            }}
            required={true}
          />
          
          {collaborators.length > 0 && (
            <CollaboratorSelect
              collaborators={collaborators}
              value={effectiveSelectedCollaborator || "null"}
              isLoading={isLoadingCollaborators}
              onValueChange={value => {
                if (onSelectChange) {
                  onSelectChange("collaborator_id", value);
                } else if (onCollaboratorChange) {
                  onCollaboratorChange(value);
                }
              }}
            />
          )}
          
          <div>
            <Label htmlFor="description">Observações</Label>
            <Textarea
              id="description"
              name="description"
              value={effectiveNote || ""}
              onChange={handleNoteChange}
              rows={5}
              placeholder="Adicione informações adicionais sobre esta atualização de status"
              className="min-h-[120px]"
            />
          </div>
        </div>
      )}
    </div>
  );
}
