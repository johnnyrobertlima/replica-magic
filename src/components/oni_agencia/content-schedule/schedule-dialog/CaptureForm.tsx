
import { useState } from "react";
import { format, parse } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CalendarIcon, Clock } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { TimePickerDemo } from "../../../TimePickerDemo";

interface CaptureFormProps {
  captureDate: string | null;
  captureEndDate: string | null;
  isAllDay: boolean;
  location: string | null;
  onCaptureChange: (name: string, value: Date | null) => void;
  onLocationChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAllDayChange: (value: boolean) => void;
}

export function CaptureForm({
  captureDate,
  captureEndDate,
  isAllDay,
  location,
  onCaptureChange,
  onLocationChange,
  onAllDayChange
}: CaptureFormProps) {
  const [date, setDate] = useState<Date | undefined>(
    captureDate ? new Date(captureDate) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    captureEndDate ? new Date(captureEndDate) : undefined
  );

  const handleCaptureStartDate = (date: Date | null) => {
    setDate(date || undefined);
    onCaptureChange("capture_date", date);
  };

  const handleCaptureEndDate = (date: Date | null) => {
    setEndDate(date || undefined);
    onCaptureChange("capture_end_date", date);
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return "";
    return format(date, "PPP");
  };

  const formatTime = (date: Date | undefined) => {
    if (!date) return "";
    return format(date, "HH:mm");
  };

  const handleAllDayChange = (checked: boolean) => {
    onAllDayChange(checked);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6">
        <div className="grid gap-2">
          <h3 className="text-lg font-medium">Informações de Captura</h3>
          <p className="text-sm text-muted-foreground">
            Informe a data, horário e local da captura
          </p>
        </div>
        
        <div className="grid gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="isAllDay" 
              checked={isAllDay} 
              onCheckedChange={handleAllDayChange} 
            />
            <label 
              htmlFor="isAllDay"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Dia inteiro
            </label>
          </div>
          
          <div className="grid gap-3">
            <Label>Data de captura</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? formatDate(date) : "Selecione a data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={handleCaptureStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          {!isAllDay && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Horário de início</Label>
                  <div className="flex items-center mt-2">
                    <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                    <TimePickerDemo 
                      setDate={(newDate) => {
                        if (date && newDate) {
                          const combined = new Date(date);
                          combined.setHours(newDate.getHours());
                          combined.setMinutes(newDate.getMinutes());
                          handleCaptureStartDate(combined);
                        }
                      }}
                      date={date}
                    />
                  </div>
                </div>
                
                <div>
                  <Label>Horário de término</Label>
                  <div className="flex items-center mt-2">
                    <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                    <TimePickerDemo 
                      setDate={(newDate) => {
                        if (date && newDate) {
                          const combined = new Date(date);
                          combined.setHours(newDate.getHours());
                          combined.setMinutes(newDate.getMinutes());
                          handleCaptureEndDate(combined);
                        }
                      }}
                      date={endDate || date}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
          
          <div>
            <Label htmlFor="location">Local da captura</Label>
            <Input 
              id="location" 
              name="location" 
              placeholder="Digite o local da captura" 
              value={location || ""}
              onChange={onLocationChange}
              className="mt-2" 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
