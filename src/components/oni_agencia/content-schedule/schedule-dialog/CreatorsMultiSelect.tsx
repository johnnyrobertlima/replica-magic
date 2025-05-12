
import React, { useState, useEffect } from "react";
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

export function CreatorsMultiSelect({ 
  collaborators,
  isLoading,
  value = [],
  onValueChange
}: CreatorsMultiSelectProps) {
  const [open, setOpen] = useState(false);
  
  // Ensure value is always an array
  const safeValue = Array.isArray(value) ? value : [];
  
  // Ensure collaborators is always an array
  const safeCollaborators = Array.isArray(collaborators) ? collaborators : [];
  
  // Add a check to ensure collaborators objects are valid
  const validCollaborators = safeCollaborators.filter(c => c && c.id && typeof c.id === 'string' && c.name);
  
  // Find selected collaborators with safety checks
  const selectedCollaborators = validCollaborators.filter(c => 
    safeValue.includes(c.id)
  );

  const handleSelect = (collaboratorId: string) => {
    if (!collaboratorId) return;
    
    const newValue = safeValue.includes(collaboratorId)
      ? safeValue.filter(id => id !== collaboratorId)
      : [...safeValue, collaboratorId];
    
    onValueChange(newValue);
  };

  const handleRemove = (collaboratorId: string) => {
    if (!collaboratorId) return;
    onValueChange(safeValue.filter(id => id !== collaboratorId));
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
                {validCollaborators.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground">
                    Nenhum colaborador disponível.
                  </div>
                ) : (
                  validCollaborators.map(collaborator => (
                    <CommandItem
                      key={collaborator.id}
                      value={collaborator.name}
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
                  ))
                )}
              </ScrollArea>
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
      
      {selectedCollaborators.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {selectedCollaborators.map(collaborator => (
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
          ))}
        </div>
      )}
    </div>
  );
}
