
import React, { useState } from "react";
import { OniAgenciaCollaborator } from "@/types/oni-agencia";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { X, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CreatorsMultiSelectProps {
  collaborators: OniAgenciaCollaborator[];
  isLoading: boolean;
  value: string[];
  onValueChange: (value: string[]) => void;
}

export function CreatorsSelectMultiple({ 
  collaborators,
  isLoading,
  value = [],
  onValueChange
}: CreatorsMultiSelectProps) {
  const [open, setOpen] = useState(false);
  
  // Garantir que value seja sempre um array válido
  const safeValue = Array.isArray(value) ? value : [];
  
  // Garantir que collaborators seja sempre um array
  const safeCollaborators = Array.isArray(collaborators) ? collaborators : [];
  
  // Encontrar colaboradores selecionados com proteções contra valores undefined
  const selectedCollaborators = safeCollaborators.filter(c => 
    c && c.id && safeValue.includes(c.id)
  );

  const handleSelect = (collaboratorId: string) => {
    if (!collaboratorId) return;
    
    if (safeValue.includes(collaboratorId)) {
      onValueChange(safeValue.filter(id => id !== collaboratorId));
    } else {
      onValueChange([...safeValue, collaboratorId]);
    }
  };

  const handleRemove = (collaboratorId: string) => {
    if (!collaboratorId) return;
    onValueChange(safeValue.filter(id => id !== collaboratorId));
  };

  // Componentes filhos que serão renderizados dentro do Command.Group
  const renderCollaboratorItems = () => {
    if (!safeCollaborators || safeCollaborators.length === 0) {
      return (
        <div className="p-2 text-sm text-muted-foreground">
          Nenhum colaborador disponível.
        </div>
      );
    }

    return safeCollaborators.map((collaborator) => (
      collaborator && collaborator.id ? (
        <CommandItem
          key={collaborator.id}
          value={collaborator.id}
          onSelect={() => handleSelect(collaborator.id)}
        >
          <Check
            className={cn(
              "mr-2 h-4 w-4",
              safeValue.includes(collaborator.id) 
                ? "opacity-100"
                : "opacity-0"
            )}
          />
          {collaborator.name}
        </CommandItem>
      ) : null
    ));
  };

  return (
    <div className="grid gap-2">
      <Label htmlFor="creators">Creators</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="justify-between"
            disabled={isLoading}
            data-testid="creators-select"
          >
            <span className="truncate">
              {safeValue.length === 0
                ? "Selecione os creators..."
                : `${safeValue.length} creator${safeValue.length === 1 ? "" : "s"} selecionado${safeValue.length === 1 ? "" : "s"}`}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0">
          <Command>
            <CommandInput placeholder="Buscar creators..." />
            <CommandEmpty>Nenhum creator encontrado.</CommandEmpty>
            <CommandGroup>
              <ScrollArea className="h-64">
                {renderCollaboratorItems()}
              </ScrollArea>
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
      
      {selectedCollaborators.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {selectedCollaborators.map((collaborator) => (
            collaborator && collaborator.id ? (
              <Badge
                key={collaborator.id}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {collaborator.name}
                <button
                  type="button"
                  className="rounded-full outline-none focus:outline-none"
                  onClick={() => handleRemove(collaborator.id)}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ) : null
          ))}
        </div>
      )}
    </div>
  );
}
