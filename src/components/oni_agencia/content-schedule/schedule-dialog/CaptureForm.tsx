
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { ChangeEvent } from "react";

export interface CaptureFormProps {
  captureDate: Date | null;
  captureEndDate: Date | null;
  isAllDay: boolean;
  location: string | null;
  onCaptureChange: (name: string, value: Date | null) => void;
  onLocationChange: (e: ChangeEvent<HTMLInputElement>) => void;
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
  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-1 gap-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="is_all_day" className="flex-grow">Dia inteiro</Label>
          <Switch
            id="is_all_day"
            checked={isAllDay}
            onCheckedChange={onAllDayChange}
          />
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="capture_date">Data de captura</Label>
          <DateTimePicker 
            id="capture_date"
            date={captureDate}
            setDate={(date) => onCaptureChange("capture_date", date)}
            showTimePicker={!isAllDay}
          />
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="capture_end_date">Data final de captura</Label>
          <DateTimePicker 
            id="capture_end_date"
            date={captureEndDate}
            setDate={(date) => onCaptureChange("capture_end_date", date)}
            showTimePicker={!isAllDay}
          />
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="location">Local</Label>
          <Input
            id="location"
            name="location"
            value={location || ""}
            onChange={onLocationChange}
            placeholder="Local de captura"
          />
        </div>
      </div>
    </div>
  );
}
