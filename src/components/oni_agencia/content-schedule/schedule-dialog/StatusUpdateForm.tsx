
import React from "react";
import { SelectStatus } from "./SelectStatus";
import { SelectCollaborator } from "./SelectCollaborator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CalendarEvent } from "@/types/oni-agencia";

export interface StatusUpdateFormProps {
  event?: CalendarEvent; // Tornando opcional para resolver o erro
  statuses: any[];
  collaborators: any[];
  isLoadingStatuses: boolean;
  isLoadingCollaborators: boolean;
  selectedStatus: string;
  selectedCollaborator: string;
  note: string;
  onStatusChange: (value: string) => void;
  onCollaboratorChange: (value: string) => void;
  onNoteChange: (value: string) => void;
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
  onStatusChange,
  onCollaboratorChange,
  onNoteChange
}: StatusUpdateFormProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SelectStatus
          statuses={statuses}
          value={selectedStatus}
          isLoading={isLoadingStatuses}
          onChange={onStatusChange}
        />
        
        <SelectCollaborator
          collaborators={collaborators}
          value={selectedCollaborator}
          isLoading={isLoadingCollaborators}
          onChange={onCollaboratorChange}
        />
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="note">Observações</Label>
        <Textarea
          id="note"
          rows={5}
          placeholder="Digite suas observações aqui"
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
          className="resize-none"
        />
      </div>
    </div>
  );
}
