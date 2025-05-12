
import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { addDays, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerWithRangeProps {
  dateRange: DateRange;
  onDateRangeChange: (dateRange: DateRange) => void;
  className?: string;
}

export function DatePickerWithRange({
  dateRange,
  onDateRangeChange,
  className,
}: DatePickerWithRangeProps) {
  const presets = [
    {
      name: "Hoje",
      handler: () => {
        const today = new Date();
        onDateRangeChange({ from: today, to: today });
      },
    },
    {
      name: "Últimos 7 dias",
      handler: () => {
        const end = new Date();
        const start = addDays(end, -7);
        onDateRangeChange({ from: start, to: end });
      },
    },
    {
      name: "Últimos 30 dias",
      handler: () => {
        const end = new Date();
        const start = addDays(end, -30);
        onDateRangeChange({ from: start, to: end });
      },
    },
    {
      name: "Últimos 90 dias",
      handler: () => {
        const end = new Date();
        const start = addDays(end, -90);
        onDateRangeChange({ from: start, to: end });
      },
    },
    {
      name: "Este mês",
      handler: () => {
        const end = new Date();
        const start = new Date(end.getFullYear(), end.getMonth(), 1);
        onDateRangeChange({ from: start, to: end });
      },
    },
    {
      name: "Mês passado",
      handler: () => {
        const now = new Date();
        const end = new Date(now.getFullYear(), now.getMonth(), 0);
        const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        onDateRangeChange({ from: start, to: end });
      },
    },
    {
      name: "Este ano",
      handler: () => {
        const end = new Date();
        const start = new Date(end.getFullYear(), 0, 1);
        onDateRangeChange({ from: start, to: end });
      },
    },
    {
      name: "Ano anterior",
      handler: () => {
        const now = new Date();
        const start = new Date(now.getFullYear() - 1, 0, 1);
        const end = new Date(now.getFullYear() - 1, 11, 31);
        onDateRangeChange({ from: start, to: end });
      },
    },
  ];

  // Garante que sempre temos valores válidos para exibição
  const displayRange = React.useMemo(() => {
    return {
      from: dateRange?.from || null,
      to: dateRange?.to || null
    };
  }, [dateRange]);

  // Garantir que mudanças no calendário são registradas corretamente
  const handleCalendarSelect = (range: DateRange | undefined) => {
    if (range) {
      console.log("DatePickerWithRange - Calendário selecionou:", range);
      onDateRangeChange(range);
    }
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal bg-white",
              !displayRange.from && !displayRange.to && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {displayRange.from ? (
              displayRange.to ? (
                <>
                  {format(displayRange.from, "dd/MM/yyyy", { locale: ptBR })} -{" "}
                  {format(displayRange.to, "dd/MM/yyyy", { locale: ptBR })}
                </>
              ) : (
                format(displayRange.from, "dd/MM/yyyy", { locale: ptBR })
              )
            ) : (
              <span>Selecione um período</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-white" align="start">
          <div className="grid gap-2">
            <div className="grid gap-2 p-4 bg-white">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Filtros rápidos</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {presets.map((preset) => (
                  <Button
                    key={preset.name}
                    variant="outline"
                    size="sm"
                    onClick={preset.handler}
                    className="text-xs bg-white h-8"
                  >
                    {preset.name}
                  </Button>
                ))}
              </div>
            </div>
            <div className="p-3 border-t bg-white">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={displayRange.from || undefined}
                selected={displayRange}
                onSelect={handleCalendarSelect}
                numberOfMonths={2}
                className="p-0 pointer-events-auto bg-white"
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
