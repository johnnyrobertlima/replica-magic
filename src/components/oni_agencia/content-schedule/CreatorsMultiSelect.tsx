
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
  const [internalCollaborators, setInternalCollaborators] = useState<OniAgenciaCollaborator[]>([]);
  const [internalValue, setInternalValue] = useState<string[]>([]);
  
  // Initialize with safe values on mount and when props change
  useEffect(() => {
    // Safely set collaborators
    if (Array.isArray(collaborators)) {
      setInternalCollaborators(
        collaborators.filter(c => c && typeof c === 'object' && c.id && typeof c.id === 'string' && c.name)
      );
    } else {
      console.warn("CreatorsMultiSelect received non-array collaborators:", collaborators);
      setInternalCollaborators([]);
    }
    
    // Safely set value
    if (Array.isArray(value)) {
      setInternalValue(value);
    } else {
      console.warn("CreatorsMultiSelect received non-array value:", value);
      setInternalValue([]);
      // Update parent component if needed
      if (value !== undefined) {
        onValueChange([]);
      }
    }
  }, [collaborators, value, onValueChange]);
  
  // Find selected collaborators with safeguards
  const selectedCollaborators = internalCollaborators.filter(c => 
    internalValue.includes(c.id)
  );

  const handleSelect = (collaboratorId: string) => {
    if (!collaboratorId) return;
    
    let newValue;
    if (internalValue.includes(collaboratorId)) {
      newValue = internalValue.filter(id => id !== collaboratorId);
    } else {
      newValue = [...internalValue, collaboratorId];
    }
    setInternalValue(newValue);
    onValueChange(newValue);
  };

  const handleRemove = (collaboratorId: string) => {
    if (!collaboratorId) return;
    const newValue = internalValue.filter(id => id !== collaboratorId);
    setInternalValue(newValue);
    onValueChange(newValue);
  };

  // Filter collaborators based on search query
  const filteredCollaborators = searchQuery && internalCollaborators.length > 0
    ? internalCollaborators.filter(c => 
        c.name && c.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : internalCollaborators;

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
  if (internalCollaborators.length === 0) {
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
              {internalValue.length === 0
                ? "Selecione os creators..."
                : `${internalValue.length} creator${internalValue.length === 1 ? "" : "s"} selecionado${internalValue.length === 1 ? "" : "s"}`}
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
                {filteredCollaborators.map((collaborator) => (
                  <CommandItem
                    key={collaborator.id}
                    value={collaborator.name || ""}
                    onSelect={() => handleSelect(collaborator.id)}
                  >
                    <div className="flex items-center gap-2 w-full">
                      <div className={cn(
                        "h-4 w-4 flex items-center justify-center rounded-sm border",
                        internalValue.includes(collaborator.id) ? "bg-primary border-primary text-primary-foreground" : "border-primary"
                      )}>
                        {internalValue.includes(collaborator.id) && (
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
