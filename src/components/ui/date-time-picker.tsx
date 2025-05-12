
import * as React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TimePickerInput } from "./time-picker-input";

interface DateTimePickerProps {
  id?: string;
  date: Date | null;
  setDate: (date: Date | null) => void;
  showTimePicker?: boolean;
  disabled?: boolean;
}

export function DateTimePicker({
  id,
  date,
  setDate,
  showTimePicker = true,
  disabled = false
}: DateTimePickerProps) {
  // Ensure date is valid for display
  const displayDate = (date instanceof Date && !isNaN(date.getTime())) ? date : null;
  
  // Handle time selection
  const handleTimeChange = (hours: number, minutes: number) => {
    if (!displayDate) return;
    
    const newDate = new Date(displayDate);
    newDate.setHours(hours);
    newDate.setMinutes(minutes);
    setDate(newDate);
  };

  return (
    <div className="grid gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !displayDate && "text-muted-foreground"
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {displayDate ? (
              format(displayDate, showTimePicker ? "PPP 'às' HH:mm" : "PPP", { locale: ptBR })
            ) : (
              <span>Selecione uma data{showTimePicker ? " e hora" : ""}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-white" align="start">
          <div>
            <Calendar
              mode="single"
              selected={displayDate || undefined}
              onSelect={(newDate) => {
                if (newDate) {
                  // If we already have a date, preserve the time
                  if (displayDate) {
                    const newDateTime = new Date(newDate);
                    newDateTime.setHours(displayDate.getHours());
                    newDateTime.setMinutes(displayDate.getMinutes());
                    setDate(newDateTime);
                  } else {
                    // Default to current time if no previous date
                    const now = new Date();
                    newDate.setHours(now.getHours());
                    newDate.setMinutes(now.getMinutes());
                    setDate(newDate);
                  }
                } else {
                  setDate(null);
                }
              }}
              initialFocus
              locale={ptBR}
              className="border-b pointer-events-auto p-3"
            />
          </div>
          
          {showTimePicker && displayDate && (
            <div className="p-3 border-t">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <Label htmlFor="hours">Horário</Label>
                </div>
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <TimePickerInput 
                  date={displayDate} 
                  setDate={(newDate) => {
                    if (newDate) {
                      setDate(newDate);
                    }
                  }}
                />
              </div>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
