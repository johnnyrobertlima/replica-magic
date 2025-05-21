
import React from "react";
import { Label } from "@/components/ui/label";
import { DateTimePicker } from "./DateTimePicker";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

interface CaptureFormProps {
  captureDate: Date | null;
  captureEndDate: Date | null;
  isAllDay: boolean;
  location: string | null;
  onDateChange: (name: string, value: Date | null) => void;
  onLocationChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAllDayChange: (checked: boolean) => void;
}

export function CaptureForm({
  captureDate,
  captureEndDate,
  isAllDay,
  location,
  onDateChange,
  onLocationChange,
  onAllDayChange
}: CaptureFormProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Switch 
          id="is_all_day" 
          checked={isAllDay} 
          onCheckedChange={onAllDayChange}
        />
        <Label htmlFor="is_all_day">Dia inteiro</Label>
      </div>
      
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="capture_date">Data e hora da captura</Label>
          <DateTimePicker
            showTimePicker={!isAllDay}
            date={captureDate}
            onDateChange={(date) => {
              onDateChange("capture_date", date);
              // Also update scheduled_date when capture_date changes
              onDateChange("scheduled_date", date);
            }}
          />
        </div>
        
        {!isAllDay && (
          <div className="grid gap-2">
            <Label htmlFor="capture_end_date">Data e hora de término</Label>
            <DateTimePicker
              showTimePicker={!isAllDay}
              date={captureEndDate}
              onDateChange={(date) => onDateChange("capture_end_date", date)}
            />
          </div>
        )}
        
        <div className="grid gap-2">
          <Label htmlFor="location">Local</Label>
          <Input
            id="location"
            name="location"
            value={location || ""}
            onChange={onLocationChange}
            placeholder="Informe o local da captura"
          />
        </div>
      </div>
    </div>
  );
}
