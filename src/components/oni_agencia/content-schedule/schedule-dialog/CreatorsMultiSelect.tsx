
import React, { useState, useEffect } from "react";
import { OniAgenciaCollaborator } from "@/types/oni-agencia";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, ChevronsUpDown, Check } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

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
  const [localCollaborators, setLocalCollaborators] = useState<OniAgenciaCollaborator[]>([]);
  const [localValues, setLocalValues] = useState<string[]>([]);
  
  // Initialize safely with array values
  useEffect(() => {
    try {
      // Ensure collaborators is an array
      if (Array.isArray(collaborators)) {
        const validCollabs = collaborators.filter(
          c => c && typeof c === 'object' && c.id && c.name
        );
        setLocalCollaborators(validCollabs);
      } else {
        console.warn("Collaborators prop is not an array:", collaborators);
        setLocalCollaborators([]);
      }
      
      // Ensure value is an array
      if (Array.isArray(value)) {
        setLocalValues([...value]);
      } else {
        console.warn("Value prop is not an array:", value);
        setLocalValues([]);
        // If parent provided non-array, fix it
        if (value !== undefined) {
          onValueChange([]);
        }
      }
    } catch (error) {
      console.error("Error in CreatorsMultiSelect useEffect:", error);
      setLocalCollaborators([]);
      setLocalValues([]);
    }
  }, [collaborators, value, onValueChange]);
  
  // Handle toggling selection
  const handleToggleSelection = (id: string) => {
    if (!id) return;
    
    try {
      const newValues = localValues.includes(id)
        ? localValues.filter(v => v !== id)
        : [...localValues, id];
        
      setLocalValues(newValues);
      onValueChange(newValues);
    } catch (error) {
      console.error("Error toggling selection:", error);
    }
  };
  
  // Get selected collaborator objects
  const selectedCollaborators = localCollaborators.filter(c => 
    localValues.includes(c.id)
  );

  // If loading, show loading state
  if (isLoading) {
    return (
      <div className="grid gap-2">
        <Label htmlFor="creators">Creators</Label>
        <Button variant="outline" disabled className="w-full justify-start">
          <span className="text-muted-foreground">Carregando...</span>
        </Button>
      </div>
    );
  }

  // If no collaborators, show empty state
  if (localCollaborators.length === 0) {
    return (
      <div className="grid gap-2">
        <Label htmlFor="creators">Creators</Label>
        <div className="text-sm text-muted-foreground border rounded p-2">
          Nenhum colaborador disponível
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
              {localValues.length === 0
                ? "Selecione os creators..."
                : `${localValues.length} creator${localValues.length === 1 ? "" : "s"} selecionado${localValues.length === 1 ? "" : "s"}`}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <ScrollArea className="h-72 overflow-auto p-1">
            {localCollaborators.map(collaborator => (
              <div 
                key={collaborator.id}
                className={cn(
                  "flex items-center justify-between px-2 py-2 rounded-sm cursor-pointer",
                  localValues.includes(collaborator.id) ? "bg-muted" : "hover:bg-muted/50"
                )}
                onClick={() => handleToggleSelection(collaborator.id)}
              >
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "h-4 w-4 flex items-center justify-center rounded-sm border",
                    localValues.includes(collaborator.id) ? "bg-primary border-primary text-primary-foreground" : "border-primary"
                  )}>
                    {localValues.includes(collaborator.id) && (
                      <Check className="h-3 w-3" />
                    )}
                  </div>
                  <span>{collaborator.name}</span>
                </div>
              </div>
            ))}
          </ScrollArea>
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
                onClick={() => handleToggleSelection(collaborator.id)}
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
