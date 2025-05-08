
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { TimePickerDemo } from "@/components/ui/time-picker";

interface CaptureFormProps {
  captureDate: Date | null;
  captureEndDate: Date | null;
  location: string;
  isAllDay: boolean;
  onDateChange?: (field: string, date: Date | null) => void;
  onLocationChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAllDayChange?: (checked: boolean) => void;
}

export function CaptureForm({
  captureDate,
  captureEndDate,
  location,
  isAllDay,
  onDateChange,
  onLocationChange,
  onAllDayChange
}: CaptureFormProps) {
  const [date, setDate] = useState<Date | null>(captureDate);
  const [endDate, setEndDate] = useState<Date | null>(captureEndDate);

  const handleDateChange = (newDate: Date | null) => {
    setDate(newDate);
    if (onDateChange) {
      onDateChange("capture_date", newDate);
    }
  };

  const handleEndDateChange = (newDate: Date | null) => {
    setEndDate(newDate);
    if (onDateChange) {
      onDateChange("capture_end_date", newDate);
    }
  };

  const handleAllDayChange = (checked: boolean) => {
    if (onAllDayChange) {
      onAllDayChange(checked);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Informações da Captura</h3>
      
      <div className="flex items-center space-x-2">
        <Switch
          id="all-day-switch"
          checked={isAllDay}
          onCheckedChange={handleAllDayChange}
        />
        <Label htmlFor="all-day-switch">Dia Inteiro</Label>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col space-y-2">
          <Label htmlFor="capture-date">Data de Captura</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="capture-date"
                variant={"outline"}
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
                onSelect={handleDateChange}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        
        {!isAllDay && (
          <div className="flex flex-col space-y-2">
            <Label htmlFor="capture-time">Horário</Label>
            <TimePickerDemo date={date} setDate={handleDateChange} />
          </div>
        )}
      </div>
      
      {!isAllDay && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col space-y-2">
            <Label htmlFor="capture-end-date">Data de Término</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="capture-end-date"
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP") : <span>Selecionar data</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate || undefined}
                  onSelect={handleEndDateChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="flex flex-col space-y-2">
            <Label htmlFor="end-time">Horário de Término</Label>
            <TimePickerDemo date={endDate} setDate={handleEndDateChange} />
          </div>
        </div>
      )}
      
      <div>
        <Label htmlFor="location">Local</Label>
        <Input
          id="location"
          name="location"
          placeholder="Local da captura"
          value={location}
          onChange={onLocationChange}
        />
      </div>
    </div>
  );
}
