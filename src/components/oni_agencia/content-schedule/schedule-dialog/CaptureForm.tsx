import { useState } from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Clock } from "lucide-react";
import { Switch } from "@/components/ui/switch";

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
  const [openStartDate, setOpenStartDate] = useState(false);
  const [openEndDate, setOpenEndDate] = useState(false);
  const [openStartTime, setOpenStartTime] = useState(false);
  const [openEndTime, setOpenEndTime] = useState(false);
  
  // Parse dates
  const parsedCaptureDate = captureDate ? parseISO(captureDate) : null;
  const parsedEndDate = captureEndDate ? parseISO(captureEndDate) : null;
  
  // Create combined date and time objects
  const combinedStartDate = parsedCaptureDate || null;
  const combinedEndDate = parsedEndDate || null;
  
  // Time string representations
  const startTimeStr = parsedCaptureDate ? format(parsedCaptureDate, "HH:mm") : "";
  const endTimeStr = parsedEndDate ? format(parsedEndDate, "HH:mm") : "";
  
  // Handler for date selection
  const handleDateSelect = (date: Date | null, isEndDate: boolean = false) => {
    const fieldName = isEndDate ? "capture_end_date" : "capture_date";
    
    if (!date) {
      onCaptureChange(fieldName, null);
      return;
    }
    
    let originalTime: Date | null = null;
    
    if (isEndDate && parsedEndDate) {
      originalTime = parsedEndDate;
    } else if (!isEndDate && parsedCaptureDate) {
      originalTime = parsedCaptureDate;
    }
    
    // If we have original time data, preserve it
    if (originalTime && !isAllDay) {
      const hours = originalTime.getHours();
      const minutes = originalTime.getMinutes();
      
      const newDate = new Date(date);
      newDate.setHours(hours);
      newDate.setMinutes(minutes);
      
      onCaptureChange(fieldName, newDate);
    } else {
      // Otherwise just use the date
      if (isAllDay) {
        // For all day events, set time to start of day
        const newDate = new Date(date);
        newDate.setHours(0, 0, 0, 0);
        onCaptureChange(fieldName, newDate);
      } else {
        onCaptureChange(fieldName, date);
      }
    }
  };
  
  // Handler for time input
  const handleTimeChange = (timeStr: string, isEndTime: boolean = false) => {
    // Return early if time string is invalid
    if (!timeStr.includes(":")) return;
    
    const [hours, minutes] = timeStr.split(":").map(Number);
    
    if (isNaN(hours) || isNaN(minutes)) return;
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return;
    
    const fieldName = isEndTime ? "capture_end_date" : "capture_date";
    let baseDate: Date;
    
    if (isEndTime && parsedEndDate) {
      baseDate = new Date(parsedEndDate);
    } else if (!isEndTime && parsedCaptureDate) {
      baseDate = new Date(parsedCaptureDate);
    } else {
      // If no date is selected, use today
      baseDate = new Date();
      
      // If we're setting end time and we have a start date, use that day
      if (isEndTime && parsedCaptureDate) {
        baseDate = new Date(parsedCaptureDate);
      }
    }
    
    baseDate.setHours(hours);
    baseDate.setMinutes(minutes);
    baseDate.setSeconds(0);
    baseDate.setMilliseconds(0);
    
    onCaptureChange(fieldName, baseDate);
  };
  
  // Toggle all-day event
  const toggleAllDay = () => {
    onAllDayChange(!isAllDay);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Dados da Captura</h3>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="all-day"
            checked={isAllDay}
            onCheckedChange={toggleAllDay}
          />
          <Label htmlFor="all-day">Dia inteiro</Label>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Data de Início</Label>
            <Popover open={openStartDate} onOpenChange={setOpenStartDate}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !parsedCaptureDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {parsedCaptureDate ? format(parsedCaptureDate, "dd/MM/yyyy") : <span>Selecione uma data</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={parsedCaptureDate || undefined}
                  onSelect={(date) => {
                    handleDateSelect(date);
                    setOpenStartDate(false);
                  }}
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>
          
          {!isAllDay && (
            <div className="space-y-2">
              <Label>Hora de Início</Label>
              <Popover open={openStartTime} onOpenChange={setOpenStartTime}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startTimeStr && "text-muted-foreground"
                    )}
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    {startTimeStr || <span>Selecione um horário</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-4" align="start">
                  <div className="space-y-2">
                    <Label>Horário</Label>
                    <Input 
                      type="time" 
                      value={startTimeStr} 
                      onChange={(e) => handleTimeChange(e.target.value)}
                    />
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Data de Término</Label>
            <Popover open={openEndDate} onOpenChange={setOpenEndDate}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !parsedEndDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {parsedEndDate ? format(parsedEndDate, "dd/MM/yyyy") : <span>Selecione uma data</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={parsedEndDate || undefined}
                  onSelect={(date) => {
                    handleDateSelect(date, true);
                    setOpenEndDate(false);
                  }}
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>
          
          {!isAllDay && (
            <div className="space-y-2">
              <Label>Hora de Término</Label>
              <Popover open={openEndTime} onOpenChange={setOpenEndTime}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endTimeStr && "text-muted-foreground"
                    )}
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    {endTimeStr || <span>Selecione um horário</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-4" align="start">
                  <div className="space-y-2">
                    <Label>Horário</Label>
                    <Input 
                      type="time" 
                      value={endTimeStr} 
                      onChange={(e) => handleTimeChange(e.target.value, true)}
                    />
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          )}
        </div>
        
        <div className="space-y-2">
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
    </div>
  );
}
