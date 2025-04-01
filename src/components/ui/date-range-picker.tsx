
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
  ];

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal bg-white",
              !dateRange && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })} -{" "}
                  {format(dateRange.to, "dd/MM/yyyy", { locale: ptBR })}
                </>
              ) : (
                format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })
              )
            ) : (
              <span>Selecione um período</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-white" align="start">
          <div className="grid gap-4 p-4">
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Filtros rápidos</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {presets.map((preset) => (
                  <Button
                    key={preset.name}
                    variant="outline"
                    size="sm"
                    onClick={preset.handler}
                    className="text-xs bg-white"
                  >
                    {preset.name}
                  </Button>
                ))}
              </div>
            </div>
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={onDateRangeChange}
              numberOfMonths={2}
              className="p-3 pointer-events-auto bg-white"
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
