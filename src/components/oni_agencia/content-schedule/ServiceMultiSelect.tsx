
import { useServices } from "@/hooks/useOniAgenciaContentSchedules";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ServiceMultiSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
}

export function ServiceMultiSelect({ 
  value = [], 
  onChange, 
  placeholder = "Selecione os tipos de conteúdo..." 
}: ServiceMultiSelectProps) {
  const { data: services = [], isLoading } = useServices();
  const [open, setOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>(value);
  
  // Sincronizar o estado interno com o valor prop
  useEffect(() => {
    setSelectedItems(value);
  }, [value]);

  const handleSelect = (serviceId: string) => {
    const newSelection = selectedItems.includes(serviceId)
      ? selectedItems.filter(id => id !== serviceId)
      : [...selectedItems, serviceId];
    
    setSelectedItems(newSelection);
    onChange(newSelection);
  };

  const clearAll = () => {
    setSelectedItems([]);
    onChange([]);
  };

  const selectedCount = selectedItems.length;
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-10"
          onClick={() => setOpen(!open)}
          disabled={isLoading}
        >
          {selectedCount > 0 
            ? `${selectedCount} tipo${selectedCount > 1 ? 's' : ''} selecionado${selectedCount > 1 ? 's' : ''}`
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" style={{ width: "var(--radix-popover-trigger-width)" }}>
        <Command>
          <CommandInput placeholder="Buscar tipo de conteúdo..." />
          <CommandList>
            <CommandEmpty>Nenhum tipo encontrado.</CommandEmpty>
            <CommandGroup>
              <ScrollArea className="h-60">
                {services.map((service) => {
                  const isSelected = selectedItems.includes(service.id);
                  return (
                    <CommandItem
                      key={service.id}
                      value={service.name}
                      onSelect={() => handleSelect(service.id)}
                    >
                      <div 
                        className={cn(
                          "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border",
                          isSelected ? "bg-primary border-primary" : "opacity-50"
                        )}
                      >
                        {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                      </div>
                      <span className="flex-1">{service.name}</span>
                      {service.color && (
                        <span 
                          className="ml-2 h-3 w-3 rounded-full"
                          style={{ backgroundColor: service.color }}
                        />
                      )}
                    </CommandItem>
                  );
                })}
              </ScrollArea>
            </CommandGroup>
          </CommandList>
          {selectedCount > 0 && (
            <div className="flex items-center justify-between p-2 border-t">
              <div className="flex flex-wrap gap-1 max-w-[80%]">
                {selectedItems.map(id => {
                  const service = services.find(s => s.id === id);
                  if (!service) return null;
                  return (
                    <Badge 
                      key={id} 
                      variant="secondary"
                      className="flex items-center gap-1 max-w-[150px] overflow-hidden text-ellipsis"
                    >
                      <span className="truncate">{service.name}</span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelect(id);
                        }}
                        className="h-3.5 w-3.5 rounded-full hover:bg-muted"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  );
                })}
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 px-2" 
                onClick={clearAll}
              >
                Limpar
              </Button>
            </div>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}
