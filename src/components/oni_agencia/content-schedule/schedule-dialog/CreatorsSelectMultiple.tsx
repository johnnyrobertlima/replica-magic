
import React, { useState, useEffect } from "react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

interface CreatorsSelectMultipleProps {
  collaborators: any[];
  isLoading: boolean;
  value: string[];
  onValueChange: (value: string[]) => void;
}

export function CreatorsSelectMultiple({
  collaborators,
  isLoading,
  value = [],
  onValueChange
}: CreatorsSelectMultipleProps) {
  const [open, setOpen] = useState(false);
  
  // Ensure value is always an array
  useEffect(() => {
    if (!Array.isArray(value)) {
      onValueChange([]);
    }
  }, [value, onValueChange]);
  
  const handleSelect = (id: string) => {
    if (value.includes(id)) {
      onValueChange(value.filter(item => item !== id));
    } else {
      onValueChange([...value, id]);
    }
  };
  
  const removeItem = (id: string) => {
    onValueChange(value.filter(item => item !== id));
  };
  
  const getCollaboratorName = (id: string) => {
    const collaborator = collaborators.find(c => c.id === id);
    return collaborator ? collaborator.name : id;
  };
  
  // Ensure value is always an array
  const creators = Array.isArray(value) ? value : [];
  
  // Ensure collaborators is always an array
  const safeCollaborators = Array.isArray(collaborators) ? collaborators : [];
  
  return (
    <div className="grid gap-2">
      <Label>Criadores</Label>
      <div className="space-y-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              role="combobox" 
              aria-expanded={open} 
              className="w-full justify-between text-left" 
              disabled={isLoading}
            >
              Selecionar criadores
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput placeholder="Buscar criador..." />
              <CommandEmpty>Nenhum criador encontrado.</CommandEmpty>
              <CommandGroup className="max-h-64 overflow-y-auto">
                {safeCollaborators.map(collaborator => (
                  <CommandItem 
                    key={collaborator.id} 
                    value={collaborator.name} 
                    onSelect={() => {
                      handleSelect(collaborator.id);
                    }}
                  >
                    <Check className={cn(
                      "mr-2 h-4 w-4", 
                      creators.includes(collaborator.id) ? "opacity-100" : "opacity-0"
                    )} />
                    {collaborator.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>

        {creators.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {creators.map(id => (
              <Badge key={id} variant="secondary" className="px-2 py-1 bg-emerald-200">
                {getCollaboratorName(id)}
                <button type="button" className="ml-1 outline-none" onClick={() => removeItem(id)}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
