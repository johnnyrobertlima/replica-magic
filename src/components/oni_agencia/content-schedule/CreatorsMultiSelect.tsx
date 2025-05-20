import React, { useState, useEffect } from "react";
import { OniAgenciaCollaborator } from "@/types/oni-agencia";
import { Search } from "lucide-react";
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
  
  // Initialize safely with validated data
  useEffect(() => {
    try {
      // Ensure collaborators is an array and filter out invalid entries
      const validCollaborators = Array.isArray(collaborators) 
        ? collaborators.filter(c => 
            c && typeof c === 'object' && c.id && typeof c.id === 'string' && c.name)
        : [];
      
      setInternalCollaborators(validCollaborators);
      
      // Ensure value is an array
      const validValue = Array.isArray(value) ? [...value] : [];
      setInternalValue(validValue);
      
      // If value is undefined or not an array, update parent with empty array
      if (!Array.isArray(value)) {
        onValueChange([]);
      }
    } catch (error) {
      console.error("Error in CreatorsMultiSelect useEffect:", error);
      setInternalCollaborators([]);
      setInternalValue([]);
    }
  }, [collaborators, value, onValueChange]);

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

  // Find selected collaborators - with extra safety checks
  const selectedCollaborators = internalCollaborators.filter(c => 
    internalValue.includes(c.id)
  );

  // Filter collaborators based on search query
  const filteredCollaborators = searchQuery 
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
          {/* CommandInput is now wrapped in a div to prevent direct rendering in the DOM */}
          <div className="border-b px-3 flex items-center">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <input
              className="flex h-11 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Buscar creators..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {/* Use simple div structure for filtered items instead of Command component */}
          <div className="max-h-[300px] overflow-y-auto">
            <div className="p-1">
              {filteredCollaborators.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Nenhum creator encontrado.
                </div>
              ) : (
                <ScrollArea className="h-64">
                  {filteredCollaborators.map((collaborator) => (
                    <div
                      key={collaborator.id}
                      onClick={() => handleSelect(collaborator.id)}
                      className={cn(
                        "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground",
                        internalValue.includes(collaborator.id) ? "bg-accent text-accent-foreground" : "hover:bg-accent hover:text-accent-foreground"
                      )}
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
                    </div>
                  ))}
                </ScrollArea>
              )}
            </div>
          </div>
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
