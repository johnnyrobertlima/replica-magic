
import React from "react";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";
import { ContentScheduleFormData } from "@/types/oni-agencia";

interface CaptureFormProps {
  formData: ContentScheduleFormData;
  onDateTimeChange: (name: string, date: Date | null) => void;
  onAllDayChange: (isAllDay: boolean) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isReadOnly?: boolean;
}

export function CaptureForm({
  formData,
  onDateTimeChange,
  onAllDayChange,
  onInputChange,
  isReadOnly = false
}: CaptureFormProps) {
  const captureDate = formData.capture_date ? new Date(formData.capture_date) : null;
  const captureEndDate = formData.capture_end_date ? new Date(formData.capture_end_date) : null;
  
  return (
    <div className="space-y-4 p-2">
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="is_all_day" className="text-sm font-medium">
            Dia inteiro
          </Label>
          <Switch
            id="is_all_day"
            checked={formData.is_all_day}
            onCheckedChange={onAllDayChange}
            disabled={isReadOnly}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {formData.is_all_day ? (
            // Date picker for all-day events
            <div className="space-y-2">
              <Label htmlFor="capture_date" className="text-sm font-medium">
                Data de Captura
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="capture_date"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !captureDate && "text-muted-foreground"
                    )}
                    disabled={isReadOnly}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {captureDate ? format(captureDate, "PPP") : "Selecione uma data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={captureDate || undefined}
                    onSelect={(date) => onDateTimeChange("capture_date", date)}
                    disabled={isReadOnly}
                  />
                </PopoverContent>
              </Popover>
            </div>
          ) : (
            // Start and end time pickers for time-specific events
            <>
              <div className="space-y-2">
                <Label htmlFor="capture_date" className="text-sm font-medium">
                  Início da Captura
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="capture_date"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !captureDate && "text-muted-foreground"
                      )}
                      disabled={isReadOnly}
                    >
                      <Clock className="mr-2 h-4 w-4" />
                      {captureDate ? format(captureDate, "PPP HH:mm") : "Selecione data e hora"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <div className="p-4">
                      <Calendar
                        mode="single"
                        selected={captureDate || undefined}
                        onSelect={(date) => {
                          if (date) {
                            const currentTime = captureDate || new Date();
                            date.setHours(currentTime.getHours(), currentTime.getMinutes());
                            onDateTimeChange("capture_date", date);
                          } else {
                            onDateTimeChange("capture_date", null);
                          }
                        }}
                        disabled={isReadOnly}
                      />
                      <div className="mt-4">
                        <Label htmlFor="time">Hora</Label>
                        <Input
                          id="time"
                          type="time"
                          className="mt-1"
                          value={captureDate ? format(captureDate, "HH:mm") : ""}
                          onChange={(e) => {
                            const [hours, minutes] = e.target.value.split(':').map(Number);
                            const newDate = captureDate ? new Date(captureDate) : new Date();
                            newDate.setHours(hours, minutes);
                            onDateTimeChange("capture_date", newDate);
                          }}
                          disabled={isReadOnly}
                        />
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="capture_end_date" className="text-sm font-medium">
                  Fim da Captura
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="capture_end_date"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !captureEndDate && "text-muted-foreground"
                      )}
                      disabled={isReadOnly}
                    >
                      <Clock className="mr-2 h-4 w-4" />
                      {captureEndDate ? format(captureEndDate, "PPP HH:mm") : "Selecione data e hora"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <div className="p-4">
                      <Calendar
                        mode="single"
                        selected={captureEndDate || undefined}
                        onSelect={(date) => {
                          if (date) {
                            const currentTime = captureEndDate || new Date();
                            date.setHours(currentTime.getHours(), currentTime.getMinutes());
                            onDateTimeChange("capture_end_date", date);
                          } else {
                            onDateTimeChange("capture_end_date", null);
                          }
                        }}
                        disabled={isReadOnly}
                      />
                      <div className="mt-4">
                        <Label htmlFor="end-time">Hora</Label>
                        <Input
                          id="end-time"
                          type="time"
                          className="mt-1"
                          value={captureEndDate ? format(captureEndDate, "HH:mm") : ""}
                          onChange={(e) => {
                            const [hours, minutes] = e.target.value.split(':').map(Number);
                            const newDate = captureEndDate ? new Date(captureEndDate) : new Date();
                            newDate.setHours(hours, minutes);
                            onDateTimeChange("capture_end_date", newDate);
                          }}
                          disabled={isReadOnly}
                        />
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </>
          )}
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="location" className="text-sm font-medium">
          Local
        </Label>
        <Input
          id="location"
          name="location"
          placeholder="Local da captura"
          value={formData.location || ""}
          onChange={onInputChange}
          disabled={isReadOnly}
        />
      </div>
    </div>
  );
}
