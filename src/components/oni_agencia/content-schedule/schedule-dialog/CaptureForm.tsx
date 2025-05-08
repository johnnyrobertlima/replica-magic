
import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { CalendarIcon, Clock } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

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
  onAllDayChange,
}: CaptureFormProps) {
  // Formato de exibição da data/hora
  const getFormattedDateTime = (dateString: string | null) => {
    if (!dateString) return "";
    
    try {
      const date = new Date(dateString);
      return isAllDay
        ? format(date, "dd/MM/yyyy", { locale: ptBR })
        : format(date, "dd/MM/yyyy HH:mm", { locale: ptBR });
    } catch (e) {
      console.error("Error formatting date:", e);
      return "";
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <div className="flex items-center space-x-2">
          <Switch
            id="is-all-day"
            checked={isAllDay}
            onCheckedChange={onAllDayChange}
          />
          <label htmlFor="is-all-day" className="text-sm font-medium">
            Dia inteiro
          </label>
        </div>
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium">Data de Captura</label>
        <div className="flex flex-col space-y-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !captureDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {captureDate ? (
                  getFormattedDateTime(captureDate)
                ) : (
                  <span>Selecione uma data</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={captureDate ? new Date(captureDate) : undefined}
                onSelect={(date) => onCaptureChange("capture_date", date)}
                initialFocus
              />
              {!isAllDay && captureDate && (
                <div className="p-3 border-t border-border">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <Input
                      type="time"
                      className="w-full"
                      value={captureDate ? format(new Date(captureDate), "HH:mm") : ""}
                      onChange={(e) => {
                        const [hours, minutes] = e.target.value.split(':').map(Number);
                        const date = new Date(captureDate);
                        date.setHours(hours, minutes);
                        onCaptureChange("capture_date", date);
                      }}
                    />
                  </div>
                </div>
              )}
            </PopoverContent>
          </Popover>
          
          {!isAllDay && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !captureEndDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {captureEndDate ? (
                    getFormattedDateTime(captureEndDate)
                  ) : (
                    <span>Selecione uma data de término</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={captureEndDate ? new Date(captureEndDate) : undefined}
                  onSelect={(date) => onCaptureChange("capture_end_date", date)}
                  disabled={(date) => {
                    if (!captureDate) return false;
                    return date < new Date(captureDate);
                  }}
                  initialFocus
                />
                {captureEndDate && (
                  <div className="p-3 border-t border-border">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <Input
                        type="time"
                        className="w-full"
                        value={captureEndDate ? format(new Date(captureEndDate), "HH:mm") : ""}
                        onChange={(e) => {
                          const [hours, minutes] = e.target.value.split(':').map(Number);
                          const date = new Date(captureEndDate);
                          date.setHours(hours, minutes);
                          onCaptureChange("capture_end_date", date);
                        }}
                      />
                    </div>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium">Local</label>
        <Input
          name="location"
          value={location || ""}
          onChange={onLocationChange}
          placeholder="Informe o local da captura"
        />
      </div>
    </div>
  );
}
