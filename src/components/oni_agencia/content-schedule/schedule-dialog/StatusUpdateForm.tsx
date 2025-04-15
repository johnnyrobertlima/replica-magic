
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CalendarEvent } from "@/types/oni-agencia";
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
  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onNoteChange(e.target.value);
  };

  return (
    <div className="grid gap-4 py-4">
      <div className="bg-muted/20 p-4 rounded-md mb-2">
        <h3 className="font-semibold text-md mb-1">{event.title || "Agendamento sem título"}</h3>
        <p className="text-sm text-muted-foreground">{event.service?.name}</p>
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
        label="Responsável"
      />
      
      <div className="grid gap-2">
        <Label htmlFor="note">Observações</Label>
        <Textarea
          id="note"
          value={note || ""}
          onChange={handleNoteChange}
          rows={4}
          placeholder="Adicione observações sobre a mudança de status"
        />
      </div>
    </div>
  );
}
