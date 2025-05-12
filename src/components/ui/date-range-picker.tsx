
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
            <CalendarIcon className="mr-2 h-5 w-5" />
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
        <PopoverContent className="w-auto p-0 bg-white max-w-[95vw]" align="start">
          <div className="space-y-3">
            <div className="p-4 border-b">
              <h3 className="text-sm font-medium mb-2">Selecione um filtro rápido</h3>
              <div className="grid grid-cols-2 gap-2">
                {presets.slice(0, 4).map((preset) => (
                  <Button
                    key={preset.name}
                    variant="outline"
                    size="sm"
                    onClick={preset.handler}
                    className="text-xs h-9 bg-white hover:bg-gray-100"
                  >
                    {preset.name}
                  </Button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {presets.slice(4).map((preset) => (
                  <Button
                    key={preset.name}
                    variant="outline"
                    size="sm"
                    onClick={preset.handler}
                    className="text-xs h-9 bg-white hover:bg-gray-100"
                  >
                    {preset.name}
                  </Button>
                ))}
              </div>
            </div>
            <div className="p-0 bg-white">
              <Calendar
                mode="range"
                defaultMonth={displayRange.from || undefined}
                selected={displayRange}
                onSelect={handleCalendarSelect}
                numberOfMonths={2}
                showOutsideDays={false}
                fixedWeeks
                className="p-2 rounded-md pointer-events-auto bg-white border-t"
              />
            </div>
            <div className="p-4 border-t flex justify-end">
              <Button 
                variant="default" 
                className="bg-[#F97316] hover:bg-[#F97316]/90"
                onClick={() => {
                  if (!displayRange.from || !displayRange.to) {
                    // Se não houver um intervalo completo, selecione hoje
                    const today = new Date();
                    onDateRangeChange({ from: today, to: today });
                  }
                }}
              >
                Aplicar
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
