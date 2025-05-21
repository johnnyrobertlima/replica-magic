
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { CalendarDatePicker } from "@/components/ui/calendar-date-picker";
import { DateTimePicker } from "./DateTimePicker";

interface CaptureFormProps {
  captureDate: Date | null;
  captureEndDate: Date | null;
  isAllDay: boolean;
  location: string | null;
  onDateChange: (name: string, value: Date | null) => void;
  onLocationChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onAllDayChange: (value: boolean) => void;
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
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="is_all_day">Todo o dia</Label>
        <div className="flex items-center space-x-2">
          <Switch
            id="is_all_day"
            checked={isAllDay}
            onCheckedChange={onAllDayChange}
          />
          <Label htmlFor="is_all_day" className="cursor-pointer">
            {isAllDay ? "Sim" : "Não"}
          </Label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="capture_date" className="flex items-center">
            Data de Captura* 
            {!captureDate && (
              <span className="text-red-500 ml-1 text-sm">Campo obrigatório</span>
            )}
          </Label>
          {isAllDay ? (
            <CalendarDatePicker
              value={captureDate}
              onChange={(date) => onDateChange("capture_date", date)}
              placeholder="Selecione uma data"
              className={!captureDate ? "border-red-300" : ""}
            />
          ) : (
            <DateTimePicker 
              label="Data de início"
              date={captureDate}
              onDateChange={(date) => onDateChange("capture_date", date)}
              showTimePicker={true}
              className={!captureDate ? "border-red-300" : ""}
            />
          )}
        </div>

        {!isAllDay && (
          <div>
            <Label htmlFor="capture_end_date">Data de Término</Label>
            <DateTimePicker 
              label="Data de término"
              date={captureEndDate}
              onDateChange={(date) => onDateChange("capture_end_date", date)}
              showTimePicker={true}
            />
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="location">Local</Label>
        <Input
          id="location"
          name="location"
          value={location || ""}
          onChange={onLocationChange}
          placeholder="Local da captura"
        />
      </div>
    </div>
  );
}
