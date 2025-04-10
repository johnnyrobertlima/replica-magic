
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface ExecutionPhaseSelectProps {
  value: string | null;
  onValueChange: (value: string) => void;
}

export function ExecutionPhaseSelect({ value, onValueChange }: ExecutionPhaseSelectProps) {
  const getExecutionPhaseOptions = () => [
    { value: "planning", label: "Planejamento" },
    { value: "creation", label: "Criação" },
    { value: "review", label: "Revisão" },
    { value: "approval", label: "Aprovação" },
    { value: "scheduled", label: "Agendado" },
    { value: "published", label: "Publicado" }
  ];

  return (
    <div className="grid gap-2">
      <Label htmlFor="execution_phase">Fase de Execução</Label>
      <Select
        value={value || ""}
        onValueChange={onValueChange}
      >
        <SelectTrigger id="execution_phase" className="w-full">
          <SelectValue placeholder="Selecione a fase" />
        </SelectTrigger>
        <SelectContent>
          {getExecutionPhaseOptions().map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
