
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { CalendarEvent } from "@/types/oni-agencia";
import { StatusSelect } from "./StatusSelect";
import { CollaboratorSelect } from "./CollaboratorSelect";
import { OniAgenciaCollaborator } from "@/types/oni-agencia";
import { Status } from "@/pages/admin/sub-themes/types";

interface StatusUpdateFormProps {
  event: CalendarEvent;
  statuses: Status[];
  collaborators: OniAgenciaCollaborator[];
  isLoadingStatuses: boolean;
  isLoadingCollaborators: boolean;
  onStatusChange: (value: string) => void;
  onCollaboratorChange: (value: string) => void;
  onNoteChange: (value: string) => void;
  note: string;
  selectedStatus: string | null;
  selectedCollaborator: string | null;
}

export function StatusUpdateForm({
  event,
  statuses,
  collaborators,
  isLoadingStatuses,
  isLoadingCollaborators,
  onStatusChange,
  onCollaboratorChange,
  onNoteChange,
  note,
  selectedStatus,
  selectedCollaborator
}: StatusUpdateFormProps) {
  return (
    <div className="space-y-4 py-2">
      <div className="grid grid-cols-1 gap-4">
        <StatusSelect
          statuses={statuses}
          isLoading={isLoadingStatuses}
          value={selectedStatus}
          onValueChange={onStatusChange}
        />
        
        <CollaboratorSelect
          collaborators={collaborators}
          isLoading={isLoadingCollaborators}
          value={selectedCollaborator}
          onValueChange={onCollaboratorChange}
        />
        
        <div className="grid gap-2">
          <Label htmlFor="note">Anotação</Label>
          <Textarea
            id="note"
            placeholder="Adicione uma anotação (opcional)"
            value={note}
            onChange={(e) => onNoteChange(e.target.value)}
            className="resize-none"
            rows={3}
          />
        </div>
      </div>
    </div>
  );
}
