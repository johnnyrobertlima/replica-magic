
import { CalendarEvent } from "@/types/oni-agencia";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StatusSelect } from "./StatusSelect";
import { CollaboratorSelect } from "./CollaboratorSelect";

interface StatusUpdateFormProps {
  event: CalendarEvent;
  statuses: any[];
  collaborators: any[];
  isLoadingStatuses: boolean;
  isLoadingCollaborators: boolean;
  selectedStatus: string | null;
  selectedCollaborator: string | null;
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
    <div className="grid gap-4 py-4">
      <div className="mb-2">
        <h3 className="text-lg font-medium">Atualizar status do agendamento</h3>
        <p className="text-sm text-muted-foreground">
          Título: <span className="font-medium">{event.title}</span>
        </p>
        <p className="text-sm text-muted-foreground">
          Serviço: <span className="font-medium">{event.service.name}</span>
        </p>
      </div>
      
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
        <Label htmlFor="note">Observação</Label>
        <Textarea
          id="note"
          placeholder="Adicione uma observação sobre esta atualização de status"
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
          rows={3}
        />
      </div>
    </div>
  );
}
