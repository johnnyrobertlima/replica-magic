
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";

interface CaptureFormProps {
  captureDate: string | null;
  captureEndDate: string | null;
  isAllDay: boolean;
  location: string | null;
  onCaptureChange: (name: string, value: Date | null) => void;
  onLocationChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
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
  // Helper function to parse dates safely
  const parseDate = (dateStr: string | null): Date | undefined => {
    if (!dateStr) return undefined;
    
    try {
      const date = new Date(dateStr);
      return isNaN(date.getTime()) ? undefined : date;
    } catch (e) {
      console.error('Error parsing date:', e);
      return undefined;
    }
  };
  
  const captureDateTime = parseDate(captureDate);
  const captureEndDateTime = parseDate(captureEndDate);
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="all_day" className="text-base font-medium">Dia Inteiro</Label>
        <Switch 
          id="all_day"
          checked={isAllDay === true}
          onCheckedChange={onAllDayChange}
        />
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="capture_date">Data de Captura</Label>
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="capture_date"
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !captureDateTime && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {captureDateTime ? (
                  isAllDay ? 
                    format(captureDateTime, "dd/MM/yyyy") : 
                    format(captureDateTime, "dd/MM/yyyy HH:mm")
                ) : (
                  <span>Selecionar data{isAllDay ? "" : " e hora"}</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={captureDateTime}
                onSelect={(date) => onCaptureChange("capture_date", date)}
                initialFocus
                className="p-3 pointer-events-auto"
              />
              {!isAllDay && captureDateTime && (
                <div className="border-t p-3">
                  <Input
                    type="time"
                    onChange={(e) => {
                      const [hours, minutes] = e.target.value.split(':');
                      const newDate = new Date(captureDateTime);
                      newDate.setHours(parseInt(hours, 10), parseInt(minutes, 10));
                      onCaptureChange("capture_date", newDate);
                    }}
                    defaultValue={captureDateTime ? format(captureDateTime, "HH:mm") : "09:00"}
                    className="w-full"
                  />
                </div>
              )}
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      {!isAllDay && (
        <div className="grid gap-2">
          <Label htmlFor="capture_end_date">Fim da Captura</Label>
          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="capture_end_date"
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !captureEndDateTime && "text-muted-foreground"
                  )}
                >
                  <Clock className="mr-2 h-4 w-4" />
                  {captureEndDateTime ? (
                    format(captureEndDateTime, "dd/MM/yyyy HH:mm")
                  ) : (
                    <span>Selecionar fim da captura</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={captureEndDateTime}
                  onSelect={(date) => onCaptureChange("capture_end_date", date)}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
                {captureEndDateTime && (
                  <div className="border-t p-3">
                    <Input
                      type="time"
                      onChange={(e) => {
                        const [hours, minutes] = e.target.value.split(':');
                        const newDate = new Date(captureEndDateTime);
                        newDate.setHours(parseInt(hours, 10), parseInt(minutes, 10));
                        onCaptureChange("capture_end_date", newDate);
                      }}
                      defaultValue={captureEndDateTime ? format(captureEndDateTime, "HH:mm") : "18:00"}
                      className="w-full"
                    />
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>
        </div>
      )}
      
      <div className="grid gap-2">
        <Label htmlFor="location">Local</Label>
        <Input
          id="location"
          name="location"
          value={location || ""}
          onChange={onLocationChange}
          placeholder="Digite o local da captura"
          className="border-input"
        />
      </div>
    </div>
  );
}
