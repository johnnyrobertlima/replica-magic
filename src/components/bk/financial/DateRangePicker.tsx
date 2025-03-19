import React from "react";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DateRangePickerProps {
  startDate: Date | null;
  endDate: Date | null;
  onUpdate: (dateRange: { startDate: Date | null; endDate: Date | null }) => void;
  label?: string;
}

export const DateRangePicker = ({ 
  startDate, 
  endDate, 
  onUpdate, 
  label = "Selecione um período" 
}: DateRangePickerProps) => {
  // Only update the start date, keeping the end date the same
  const handleStartDateChange = (date: Date | undefined) => {
    if (date) {
      onUpdate({ startDate: date, endDate });
    }
  };
  
  // Only update the end date, keeping the start date the same
  const handleEndDateChange = (date: Date | undefined) => {
    if (date) {
      onUpdate({ startDate, endDate: date });
    }
  };

  const presets = [
    {
      name: "Últimos 7 dias",
      handler: () => {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 7);
        onUpdate({ startDate: start, endDate: end });
      },
    },
    {
      name: "Últimos 30 dias",
      handler: () => {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 30);
        onUpdate({ startDate: start, endDate: end });
      },
    },
    {
      name: "Este mês",
      handler: () => {
        const end = new Date();
        const start = new Date(end.getFullYear(), end.getMonth(), 1);
        onUpdate({ startDate: start, endDate: end });
      },
    },
    {
      name: "Mês passado",
      handler: () => {
        const now = new Date();
        const end = new Date(now.getFullYear(), now.getMonth(), 0);
        const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        onUpdate({ startDate: start, endDate: end });
      },
    },
  ];

  return (
    <div className="flex flex-col space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <div className="flex items-center space-x-2">
        <div className="grid gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                id="date" 
                variant={"outline"} 
                className="w-[300px] justify-start text-left font-normal bg-white"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate && endDate ? (
                  <span>
                    {format(startDate, "dd/MM/yyyy", { locale: ptBR })} - {format(endDate, "dd/MM/yyyy", { locale: ptBR })}
                  </span>
                ) : (
                  <span>Selecione um período</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-white" align="end">
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <div className="flex items-center">
                      <p className="text-sm font-medium">Data inicial</p>
                    </div>
                    <Calendar
                      mode="single"
                      selected={startDate || undefined}
                      onSelect={handleStartDateChange}
                      initialFocus
                      disabled={(date) => date > new Date() || (endDate ? date > endDate : false)}
                      className="p-3 pointer-events-auto bg-white"
                    />
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center">
                      <p className="text-sm font-medium">Data final</p>
                    </div>
                    <Calendar
                      mode="single"
                      selected={endDate || undefined}
                      onSelect={handleEndDateChange}
                      initialFocus
                      disabled={(date) => date > new Date() || (startDate ? date < startDate : false)}
                      className="p-3 pointer-events-auto bg-white"
                    />
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
};
