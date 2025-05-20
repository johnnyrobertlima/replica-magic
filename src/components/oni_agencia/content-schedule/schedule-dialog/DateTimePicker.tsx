
import React from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { Label } from "@/components/ui/label";

interface DateTimePickerProps {
  label: string;
  date: Date | null;
  onDateChange: (date: Date | null) => void;
}

export function DateTimePicker({ label, date, onDateChange }: DateTimePickerProps) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={`datetime-${label}`}>{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id={`datetime-${label}`}
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : <span>Selecionar data</span>}
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
        </PopoverContent>
      </Popover>
    </div>
  );
}
