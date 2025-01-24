import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CampaignStatus } from "@/types/campaign";

interface CampaignStatusSelectProps {
  status: CampaignStatus;
  onStatusChange: (value: CampaignStatus) => void;
}

export function CampaignStatusSelect({ status, onStatusChange }: CampaignStatusSelectProps) {
  return (
    <Select value={status || "Pausado"} onValueChange={onStatusChange}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="Pausado">Pausado</SelectItem>
        <SelectItem value="Em Andamento">Em Andamento</SelectItem>
        <SelectItem value="Finalizado">Finalizado</SelectItem>
        <SelectItem value="Erro">Erro</SelectItem>
      </SelectContent>
    </Select>
  );
}