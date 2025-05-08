
import { useState } from "react";
import { format, addMinutes } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { CalendarIcon, Clock } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

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

  // Handle capture end date selection with validation for minimum 30 minutes difference
  const handleCaptureEndDateChange = (name: string, date: Date | null) => {
    if (date && captureDate) {
      const startDate = new Date(captureDate);
      const minEndDate = addMinutes(startDate, 30);
      
      // If the selected end date is before minEndDate
      if (date < minEndDate) {
        // Set the end date to be 30 minutes after start date
        onCaptureChange(name, minEndDate);
        toast({
          title: "Ajuste de horário",
          description: "O tempo final deve ser pelo menos 30 minutos após o tempo inicial. Ajustamos automaticamente.",
        });
        return;
      }
    }
    
    onCaptureChange(name, date);
  };
  
  // Handle capture start date changes with end date adjustment
  const handleCaptureStartDateChange = (name: string, date: Date | null) => {
    onCaptureChange(name, date);
    
    if (date && captureEndDate) {
      const newStartDate = new Date(date);
      const currentEndDate = new Date(captureEndDate);
      const minEndDate = addMinutes(newStartDate, 30);
      
      // If current end date is less than 30 minutes after new start date
      if (currentEndDate < minEndDate) {
        onCaptureChange("capture_end_date", minEndDate);
        toast({
          title: "Ajuste de horário",
          description: "O horário final foi ajustado para manter um intervalo mínimo de 30 minutos.",
        });
      }
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
                onSelect={(date) => handleCaptureStartDateChange("capture_date", date)}
                initialFocus
                className="pointer-events-auto"
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
                        handleCaptureStartDateChange("capture_date", date);
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
                  onSelect={(date) => handleCaptureEndDateChange("capture_end_date", date)}
                  disabled={(date) => {
                    if (!captureDate) return false;
                    return date < new Date(captureDate);
                  }}
                  initialFocus
                  className="pointer-events-auto"
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
                          
                          // Check if the new time maintains the 30-minute minimum difference
                          if (captureDate) {
                            const startDate = new Date(captureDate);
                            const endDate = new Date(date);
                            const diffMs = endDate.getTime() - startDate.getTime();
                            const diffMinutes = diffMs / (1000 * 60);
                            
                            if (diffMinutes < 30) {
                              // Set to 30 minutes after start time
                              const adjustedDate = addMinutes(startDate, 30);
                              handleCaptureEndDateChange("capture_end_date", adjustedDate);
                              toast({
                                title: "Tempo mínimo requerido",
                                description: "O término deve ser pelo menos 30 minutos após o início da captura.",
                              });
                              return;
                            }
                          }
                          
                          handleCaptureEndDateChange("capture_end_date", date);
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
