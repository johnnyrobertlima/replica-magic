import React from 'react';
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface CreatorsMultiSelectProps {
  value: string[];
  onValueChange: (creators: string[]) => void; // Updated prop name to match usage in NewEventForm
  collaborators: any[];
  isLoading: boolean;
  disabled?: boolean;
}

export function CreatorsMultiSelect({
  value = [],
  onValueChange,
  collaborators = [],
  isLoading,
  disabled = false
}: CreatorsMultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  
  // Ensure value is always an array
  const selectedValues = Array.isArray(value) ? value : (value ? [value] : []);
  
  const handleSelect = (currentValue: string) => {
    setOpen(true);
    
    // If already selected, remove it
    if (selectedValues.includes(currentValue)) {
      const newValues = selectedValues.filter(val => val !== currentValue);
      onValueChange(newValues);
    } else {
      // Otherwise add to selection
      onValueChange([...selectedValues, currentValue]);
    }
  };
  
  const selectedLabels = selectedValues
    .map(id => {
      const collaborator = collaborators.find(c => c.id === id);
      return collaborator ? collaborator.name : id;
    })
    .filter(Boolean);
  
  const handleRemove = (valueToRemove: string) => {
    onValueChange(selectedValues.filter(val => {
      const collaborator = collaborators.find(c => c.name === valueToRemove);
      return collaborator ? val !== collaborator.id : true;
    }));
  };
  
  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between",
              !selectedValues.length && "text-muted-foreground"
            )}
            disabled={disabled}
          >
            <span className="truncate">
              {selectedLabels.length > 0
                ? `${selectedLabels.length} selecionados`
                : "Selecione os creators..."}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Procurar creators..." />
            <CommandEmpty>Nenhum creator encontrado.</CommandEmpty>
            <ScrollArea className="h-72">
              <CommandGroup>
                {isLoading ? (
                  <CommandItem>Carregando...</CommandItem>
                ) : (
                  collaborators.map((collaborator) => (
                    <CommandItem
                      key={collaborator.id}
                      value={collaborator.name}
                      onSelect={() => handleSelect(collaborator.id)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedValues.includes(collaborator.id)
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      {collaborator.name}
                    </CommandItem>
                  ))
                )}
              </CommandGroup>
            </ScrollArea>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedLabels.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {selectedLabels.map((label) => (
            <Badge key={label} variant="secondary">
              {label}
              <button
                type="button"
                className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                onClick={() => handleRemove(label)}
              >
                ×
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
