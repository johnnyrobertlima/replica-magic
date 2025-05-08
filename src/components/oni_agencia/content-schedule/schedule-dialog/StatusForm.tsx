
import { ContentScheduleFormData } from "@/types/oni-agencia";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

interface StatusFormProps {
  collaborators: any[];
  statuses: any[];
  isLoadingCollaborators: boolean;
  isLoadingStatuses: boolean;
  formData: ContentScheduleFormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSelectChange: (name: string, value: string) => void;
}

export function StatusForm({
  collaborators,
  statuses,
  isLoadingCollaborators,
  isLoadingStatuses,
  formData,
  onInputChange,
  onSelectChange
}: StatusFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Responsável</label>
        {isLoadingCollaborators ? (
          <Skeleton className="w-full h-10" />
        ) : (
          <Select
            value={formData.collaborator_id || ""}
            onValueChange={(value) => onSelectChange("collaborator_id", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um responsável" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Nenhum</SelectItem>
              {collaborators.map((collaborator) => (
                <SelectItem key={collaborator.id} value={collaborator.id}>
                  {collaborator.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Status</label>
        {isLoadingStatuses ? (
          <Skeleton className="w-full h-10" />
        ) : (
          <Select
            value={formData.status_id || ""}
            onValueChange={(value) => onSelectChange("status_id", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Pendente</SelectItem>
              {statuses.map((status) => (
                <SelectItem 
                  key={status.id} 
                  value={status.id}
                  className="flex items-center gap-2"
                >
                  {status.color && (
                    <span 
                      className="w-3 h-3 rounded-full inline-block mr-2" 
                      style={{ backgroundColor: status.color }}
                    />
                  )}
                  {status.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Observações de execução</label>
        <Textarea
          name="execution_phase"
          value={formData.execution_phase || ""}
          onChange={onInputChange}
          placeholder="Adicione observações sobre a execução"
          rows={4}
        />
      </div>
    </div>
  );
}
