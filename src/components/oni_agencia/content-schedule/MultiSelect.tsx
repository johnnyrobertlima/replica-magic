
import { useState, useRef, useEffect } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
import { Loader2 } from "lucide-react";

interface Option {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  isLoading?: boolean;
  className?: string;
}

export function MultiSelect({
  options,
  value = [],
  onChange,
  placeholder = "Selecionar itens...",
  isLoading = false,
  className
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  
  // Update selected labels when value or options change
  useEffect(() => {
    const labels = value.map(v => {
      const option = options.find(opt => opt.value === v);
      return option ? option.label : v;
    });
    setSelectedLabels(labels);
  }, [value, options]);
  
  const handleSelect = (selectedValue: string) => {
    if (value.includes(selectedValue)) {
      onChange(value.filter(v => v !== selectedValue));
    } else {
      onChange([...value, selectedValue]);
    }
  };
  
  const handleRemove = (selectedValue: string) => {
    onChange(value.filter(v => v !== selectedValue));
  };
  
  const handleClearAll = () => {
    onChange([]);
    setOpen(false);
  };
  
  return (
    <div className={cn("relative", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={buttonRef}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between text-left bg-white",
              value.length > 0 ? "h-auto min-h-9 py-1" : "h-9",
              !value.length && "text-muted-foreground"
            )}
            onClick={() => setOpen(!open)}
          >
            <div className="flex flex-wrap gap-1">
              {value.length > 0 ? (
                value.length > 2 ? (
                  <Badge variant="secondary" className="rounded-sm bg-gray-100">
                    {value.length} selecionados
                  </Badge>
                ) : (
                  selectedLabels.map((label, i) => (
                    <Badge
                      key={i}
                      variant="secondary"
                      className="rounded-sm bg-gray-100 flex items-center gap-1 px-1"
                    >
                      {label}
                      <X
                        className="h-3 w-3 cursor-pointer text-muted-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemove(value[i]);
                        }}
                      />
                    </Badge>
                  ))
                )
              ) : (
                <span className="text-muted-foreground">{placeholder}</span>
              )}
            </div>
            <div>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              )}
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-full min-w-[200px] p-0 bg-white"
          style={{ width: buttonRef.current?.offsetWidth }}
          align="start"
        >
          <Command className="bg-white">
            <CommandInput 
              placeholder="Buscar..." 
              onValueChange={setSearch}
              className="bg-white"
            />
            
            {value.length > 0 && (
              <div className="flex items-center p-2 border-b">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-7 bg-white"
                  onClick={handleClearAll}
                >
                  Limpar todos
                  <X className="ml-1 h-3 w-3" />
                </Button>
              </div>
            )}
            
            <CommandEmpty className="py-2 px-4 text-sm text-center text-muted-foreground">
              {isLoading 
                ? "Carregando..." 
                : search.length > 0 
                  ? "Nenhum item encontrado." 
                  : "Nenhuma opção disponível."}
            </CommandEmpty>
            
            <CommandGroup className="max-h-64 overflow-auto bg-white">
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => handleSelect(option.value)}
                  className="flex items-center cursor-pointer bg-white hover:bg-gray-100"
                >
                  <div
                    className={cn(
                      "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border",
                      value.includes(option.value)
                        ? "border-primary bg-primary text-white"
                        : "border-muted opacity-50"
                    )}
                  >
                    {value.includes(option.value) && <Check className="h-3 w-3" />}
                  </div>
                  <span>{option.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
