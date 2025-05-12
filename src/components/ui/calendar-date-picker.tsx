
import * as React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface CalendarDatePickerProps {
  value?: Date | null;
  onChange: (date: Date | null) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function CalendarDatePicker({
  value,
  onChange,
  className,
  placeholder = "Selecione uma data",
  disabled = false,
}: CalendarDatePickerProps) {
  // Garantir que o valor seja um objeto Date válido
  const dateValue = value instanceof Date && !isNaN(value.getTime()) 
    ? value 
    : null;
  
  // Presets para facilitar a seleção de datas comuns
  const presets = [
    {
      name: "Hoje",
      date: new Date(),
    },
    {
      name: "Ontem",
      date: (() => {
        const date = new Date();
        date.setDate(date.getDate() - 1);
        return date;
      })(),
    },
    {
      name: "Início do mês",
      date: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    },
    {
      name: "Fim do mês",
      date: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
    },
  ];
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !dateValue && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {dateValue ? format(dateValue, "dd/MM/yyyy", { locale: ptBR }) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-white">
        <div className="p-3 border-b">
          <div className="grid grid-cols-2 gap-2">
            {presets.map((preset) => (
              <Button
                key={preset.name}
                variant="outline"
                size="sm"
                className="text-xs h-8"
                onClick={() => onChange(preset.date)}
              >
                {preset.name}
              </Button>
            ))}
          </div>
        </div>
        <Calendar
          mode="single"
          selected={dateValue}
          onSelect={onChange}
          initialFocus
          locale={ptBR}
          className="pointer-events-auto bg-white p-3"
        />
      </PopoverContent>
    </Popover>
  );
}
