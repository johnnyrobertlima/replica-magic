
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
  collaborators = [],
  isLoading,
  value = [],
  onValueChange
}: CreatorsMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Ensure values are valid
  useEffect(() => {
    // If value is undefined or not an array, initialize with empty array
    if (!Array.isArray(value)) {
      console.warn("CreatorsMultiSelect received invalid value prop:", value);
      onValueChange([]);
    }
  }, [value, onValueChange]);
  
  // Make sure collaborators is always an array with valid entries
  const safeCollaborators = Array.isArray(collaborators) 
    ? collaborators.filter(c => c && typeof c === 'object' && c.id && typeof c.id === 'string' && c.name)
    : [];
  
  // Ensure value is always a valid array
  const safeValue = Array.isArray(value) ? value : [];
  
  // Find selected collaborators with safeguards against undefined values
  const selectedCollaborators = safeCollaborators.filter(c => 
    safeValue.includes(c.id)
  );

  const handleSelect = (collaboratorId: string) => {
    if (!collaboratorId) return;
    
    let newValue;
    if (safeValue.includes(collaboratorId)) {
      newValue = safeValue.filter(id => id !== collaboratorId);
    } else {
      newValue = [...safeValue, collaboratorId];
    }
    onValueChange(newValue);
  };

  const handleRemove = (collaboratorId: string) => {
    if (!collaboratorId) return;
    onValueChange(safeValue.filter(id => id !== collaboratorId));
  };

  // Filter collaborators based on search query
  const filteredCollaborators = searchQuery
    ? safeCollaborators.filter(c => 
        c.name && c.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : safeCollaborators;

  // Render different UI based on loading or empty state
  if (isLoading) {
    return (
      <div className="grid gap-2">
        <Label htmlFor="creators">Creators</Label>
        <Button variant="outline" disabled className="w-full justify-start">
          <span className="text-muted-foreground">Carregando colaboradores...</span>
        </Button>
      </div>
    );
  }

  // Show message if no collaborators available
  if (safeCollaborators.length === 0) {
    return (
      <div className="grid gap-2">
        <Label htmlFor="creators">Creators</Label>
        <div className="text-sm text-muted-foreground border rounded p-2">
          Nenhum colaborador disponível.
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      <Label htmlFor="creators">Creators</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="justify-between w-full"
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
        <PopoverContent className="w-[300px] p-0" align="start">
          <Command>
            <CommandInput 
              placeholder="Buscar creators..." 
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandEmpty>Nenhum creator encontrado.</CommandEmpty>
            <CommandGroup>
              <ScrollArea className="h-64">
                {filteredCollaborators?.map(collaborator => (
                  <CommandItem
                    key={collaborator.id}
                    value={collaborator.name || ""}
                    onSelect={() => handleSelect(collaborator.id)}
                  >
                    <div className="flex items-center gap-2 w-full">
                      <div className={cn(
                        "h-4 w-4 flex items-center justify-center rounded-sm border",
                        safeValue.includes(collaborator.id) ? "bg-primary border-primary text-primary-foreground" : "border-primary"
                      )}>
                        {safeValue.includes(collaborator.id) && (
                          <Check className="h-3 w-3" />
                        )}
                      </div>
                      <span>{collaborator.name}</span>
                    </div>
                  </CommandItem>
                ))}
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
