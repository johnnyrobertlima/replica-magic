
import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface CreatorsSelectMultipleProps {
  collaborators: any[];
  isLoading: boolean;
  value: string[];
  onValueChange: (value: string[]) => void;
}

export function CreatorsSelectMultiple({
  collaborators = [],
  isLoading,
  value = [],
  onValueChange
}: CreatorsSelectMultipleProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [safeCollaborators, setSafeCollaborators] = useState<any[]>([]);
  const [safeValue, setSafeValue] = useState<string[]>([]);
  
  // Ensure values are valid on mount and when props change
  useEffect(() => {
    try {
      // Validate collaborators
      const validCollabs = Array.isArray(collaborators)
        ? collaborators.filter(c => c && typeof c === "object" && c.id)
        : [];
      
      setSafeCollaborators(validCollabs);
      
      // Validate value 
      const validValue = Array.isArray(value) ? [...value] : [];
      setSafeValue(validValue);
      
      // Update parent if we received invalid value
      if (!Array.isArray(value)) {
        onValueChange([]);
      }
    } catch (error) {
      console.error("Error in CreatorsSelectMultiple useEffect:", error);
      setSafeCollaborators([]);
      setSafeValue([]);
    }
  }, [collaborators, value, onValueChange]);
  
  // Handle toggling selection
  const handleToggleSelection = (id: string) => {
    if (!id) return;
    
    try {
      const newValues = safeValue.includes(id)
        ? safeValue.filter(v => v !== id)
        : [...safeValue, id];
        
      setSafeValue(newValues);
      onValueChange(newValues);
    } catch (error) {
      console.error("Error toggling selection:", error);
    }
  };
  
  // Filter collaborators based on search query
  const filteredCollaborators = searchQuery 
    ? safeCollaborators.filter(c => 
        c.name && typeof c.name === "string" && 
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : safeCollaborators;
  
  // Get selected collaborator objects
  const selectedCollaborators = safeCollaborators.filter(c => 
    safeValue.includes(c.id)
  );

  // If loading, show loading state
  if (isLoading) {
    return (
      <div className="grid gap-2">
        <Label>Creators</Label>
        <Button variant="outline" disabled className="w-full justify-start">
          <span className="text-muted-foreground">Carregando...</span>
        </Button>
      </div>
    );
  }

  // If no collaborators, show empty state
  if (safeCollaborators.length === 0) {
    return (
      <div className="grid gap-2">
        <Label>Creators</Label>
        <div className="text-sm text-muted-foreground border rounded p-2">
          Nenhum colaborador disponível
        </div>
      </div>
    );
  }
  
  return (
    <div className="grid gap-2">
      <Label>Creators</Label>
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
          {/* Search input */}
          <div className="border-b px-3 flex items-center">
            <input
              placeholder="Buscar creators..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex h-11 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          
          {/* Collaborator list */}
          <ScrollArea className="h-72 overflow-auto p-1">
            {filteredCollaborators.length === 0 ? (
              <div className="py-6 text-center text-sm">
                Nenhum creator encontrado.
              </div>
            ) : (
              filteredCollaborators.map(collaborator => (
                <div 
                  key={collaborator.id}
                  className={cn(
                    "flex items-center justify-between px-2 py-2 rounded-sm cursor-pointer",
                    safeValue.includes(collaborator.id) ? "bg-muted" : "hover:bg-muted/50"
                  )}
                  onClick={() => handleToggleSelection(collaborator.id)}
                >
                  <div className="flex items-center gap-2">
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
                </div>
              ))
            )}
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
