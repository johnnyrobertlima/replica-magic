
import * as React from "react";
import { format, parse } from "date-fns";
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
  // Não criamos uma nova Date com new Date() para evitar conversões UTC implícitas
  const dateValue = value instanceof Date && !isNaN(value.getTime()) 
    ? value 
    : null;
  
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
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={dateValue}
          onSelect={onChange}
          initialFocus
          locale={ptBR}
          className="pointer-events-auto"
        />
      </PopoverContent>
    </Popover>
  );
}
