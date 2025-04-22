
import * as React from "react";
import { OniAgenciaCollaborator } from "@/types/oni-agencia";
import { Label } from "@/components/ui/label";
import { Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CollaboratorsMultiSelectProps {
  collaborators: OniAgenciaCollaborator[];
  isLoading: boolean;
  value: string[];
  onChange: (value: string[]) => void;
  label?: string;
}

export function CollaboratorsMultiSelect({ 
  collaborators, 
  isLoading, 
  value, 
  onChange,
  label = "Creators (Autores)"
}: CollaboratorsMultiSelectProps) {
  // Simple multi-select with checkmarks
  const handleToggle = (id: string) => {
    if (value.includes(id)) {
      onChange(value.filter(val => val !== id));
    } else {
      onChange([...value, id]);
    }
  };

  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      <div className="border rounded-md px-2 py-1 bg-white min-h-[40px]">
        {isLoading ? (
          <div className="flex items-center justify-center p-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="ml-2">Carregando colaboradores...</span>
          </div>
        ) : (
          <div className="grid gap-1">
            {collaborators.map(colab => (
              <label
                key={colab.id}
                className={cn(
                  "flex items-center gap-2 cursor-pointer px-1 py-0.5 rounded hover:bg-accent",
                  value.includes(colab.id) ? "bg-accent" : ""
                )}
              >
                <input
                  type="checkbox"
                  checked={value.includes(colab.id)}
                  onChange={() => handleToggle(colab.id)}
                  className="accent-primary"
                />
                <span>{colab.name}</span>
                {value.includes(colab.id) && <Check className="h-4 w-4 text-primary" />}
              </label>
            ))}
            {collaborators.length === 0 && <span className="text-muted-foreground text-xs">Nenhum colaborador disponível</span>}
          </div>
        )}
      </div>
      <p className="text-xs text-muted-foreground">Selecione um ou mais autores</p>
    </div>
  );
}
