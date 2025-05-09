
import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CaptureFormProps {
  captureDate: Date | string | null;
  captureEndDate: Date | string | null;
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
  onAllDayChange,
}: CaptureFormProps) {
  // Convert string dates to Date objects if needed
  const getDateObject = (date: Date | string | null): Date | null => {
    if (!date) return null;
    if (date instanceof Date) return date;
    return new Date(date);
  };
  
  const captureDateObj = getDateObject(captureDate);
  const captureEndDateObj = getDateObject(captureEndDate);

  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const formattedHour = hour.toString().padStart(2, "0");
        const formattedMinute = minute.toString().padStart(2, "0");
        options.push({
          value: `${formattedHour}:${formattedMinute}`,
          label: `${formattedHour}:${formattedMinute}`,
        });
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  const getTimeString = (date: Date | null) => {
    if (!date) return "00:00";
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const handleSelectTime = (field: "start" | "end", timeValue: string) => {
    const [hours, minutes] = timeValue.split(":").map(Number);
    
    if (field === "start" && captureDateObj) {
      const newDate = new Date(captureDateObj);
      newDate.setHours(hours);
      newDate.setMinutes(minutes);
      onCaptureChange("capture_date", newDate);
    } else if (field === "end" && captureEndDateObj) {
      const newDate = new Date(captureEndDateObj);
      newDate.setHours(hours);
      newDate.setMinutes(minutes);
      onCaptureChange("capture_end_date", newDate);
    }
  };

  const handleDateChange = (field: "start" | "end", date: Date | undefined) => {
    if (!date) return;
    
    if (field === "start") {
      const currentTime = captureDateObj || new Date();
      const newDate = new Date(date);
      newDate.setHours(currentTime.getHours());
      newDate.setMinutes(currentTime.getMinutes());
      onCaptureChange("capture_date", newDate);
      
      // If there's no end date, set it to the same day
      if (!captureEndDateObj) {
        onCaptureChange("capture_end_date", new Date(newDate));
      }
    } else if (field === "end") {
      const currentTime = captureEndDateObj || captureDateObj || new Date();
      const newDate = new Date(date);
      newDate.setHours(currentTime.getHours());
      newDate.setMinutes(currentTime.getMinutes());
      onCaptureChange("capture_end_date", newDate);
    }
  };

  const startTimeValue = captureDateObj ? getTimeString(captureDateObj) : "00:00";
  const endTimeValue = captureEndDateObj ? getTimeString(captureEndDateObj) : "00:30";

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="is-all-day"
          checked={isAllDay}
          onCheckedChange={() => onAllDayChange(!isAllDay)}
        />
        <Label htmlFor="is-all-day" className="text-sm font-medium cursor-pointer">
          Evento de dia inteiro
        </Label>
      </div>
      
      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium mb-1 block">Data de captura</Label>
          <div className="grid grid-cols-2 gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !captureDateObj && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {captureDateObj ? (
                    format(captureDateObj, "dd/MM/yyyy", { locale: ptBR })
                  ) : (
                    <span>Selecione a data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={captureDateObj || undefined}
                  onSelect={(date) => handleDateChange("start", date)}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            
            {!isAllDay && (
              <Select 
                value={startTimeValue} 
                onValueChange={(value) => handleSelectTime("start", value)}
                disabled={isAllDay}
              >
                <SelectTrigger className="justify-start">
                  <Clock className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Horário" />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map(option => (
                    <SelectItem key={`start-${option.value}`} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {!isAllDay && (
          <div>
            <Label className="text-sm font-medium mb-1 block">Data de finalização</Label>
            <div className="grid grid-cols-2 gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !captureEndDateObj && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {captureEndDateObj ? (
                      format(captureEndDateObj, "dd/MM/yyyy", { locale: ptBR })
                    ) : (
                      <span>Selecione a data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={captureEndDateObj || undefined}
                    onSelect={(date) => handleDateChange("end", date)}
                    disabled={(date) => captureDateObj ? date < captureDateObj : false}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              
              <Select 
                value={endTimeValue} 
                onValueChange={(value) => handleSelectTime("end", value)}
              >
                <SelectTrigger className="justify-start">
                  <Clock className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Horário" />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map(option => (
                    <SelectItem key={`end-${option.value}`} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <div>
          <Label htmlFor="location" className="text-sm font-medium mb-1 block">
            Local
          </Label>
          <Input
            id="location"
            name="location"
            value={location || ""}
            onChange={onLocationChange}
            placeholder="Local da captura"
          />
        </div>
      </div>
    </div>
  );
}
