
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

export interface ExecutionPhaseSelectProps {
  value: string;
  onValueChange: (value: string) => void;
}

export const ExecutionPhaseSelect = ({ 
  value, 
  onValueChange
}: ExecutionPhaseSelectProps) => {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-full bg-white">
        <SelectValue placeholder="Selecione a fase de execução" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="briefing">Briefing</SelectItem>
        <SelectItem value="planejamento">Planejamento</SelectItem>
        <SelectItem value="producao">Produção</SelectItem>
        <SelectItem value="revisao">Revisão</SelectItem>
        <SelectItem value="aprovacao">Aprovação</SelectItem>
        <SelectItem value="publicacao">Publicação</SelectItem>
        <SelectItem value="analise">Análise</SelectItem>
      </SelectContent>
    </Select>
  );
};
