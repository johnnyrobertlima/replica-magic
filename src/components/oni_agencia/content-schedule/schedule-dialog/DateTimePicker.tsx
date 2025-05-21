
import React from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CalendarIcon, Clock } from "lucide-react";
import { Label } from "@/components/ui/label";

interface DateTimePickerProps {
  label?: string;
  date: Date | null;
  onDateChange: (date: Date | null) => void;
  showTimePicker?: boolean;
  className?: string;
}

export function DateTimePicker({
  label,
  date,
  onDateChange,
  showTimePicker = false,
  className
}: DateTimePickerProps) {
  return (
    <div className="grid gap-2">
      {label && <Label htmlFor={`datetime-${label}`}>{label}</Label>}
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            id={`datetime-${label || "picker"}`} 
            variant="outline" 
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground",
              className
            )}
          >
            {showTimePicker && <Clock className="mr-2 h-4 w-4" />}
            {!showTimePicker && <CalendarIcon className="mr-2 h-4 w-4" />}
            {date ? format(date, showTimePicker ? "PPP HH:mm" : "PPP") : <span>Selecionar data</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar 
            mode="single" 
            selected={date || undefined} 
            onSelect={onDateChange} 
            initialFocus 
            className="pointer-events-auto p-3"
          />
          {showTimePicker && date && (
            <div className="p-3 border-t">
              <div className="flex items-center justify-between space-x-2">
                <select 
                  value={date.getHours()}
                  onChange={e => {
                    const newDate = new Date(date);
                    newDate.setHours(parseInt(e.target.value));
                    onDateChange(newDate);
                  }}
                  className="p-2 border rounded"
                >
                  {Array.from({ length: 24 }).map((_, i) => (
                    <option key={i} value={i}>{i.toString().padStart(2, '0')}</option>
                  ))}
                </select>
                <span>:</span>
                <select 
                  value={date.getMinutes()}
                  onChange={e => {
                    const newDate = new Date(date);
                    newDate.setMinutes(parseInt(e.target.value));
                    onDateChange(newDate);
                  }}
                  className="p-2 border rounded"
                >
                  {Array.from({ length: 60 }).map((_, i) => (
                    <option key={i} value={i}>{i.toString().padStart(2, '0')}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
