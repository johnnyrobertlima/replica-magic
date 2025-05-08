
import React from 'react';
import { FormField } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ContentScheduleFormData } from '@/types/oni-agencia';
import { Switch } from '@/components/ui/switch';

interface CaptureFormProps {
  formData: ContentScheduleFormData;
  onDateTimeChange: (name: string, value: Date | null) => void;
  onAllDayChange: (value: boolean) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export function CaptureForm({
  formData,
  onDateTimeChange,
  onAllDayChange,
  onInputChange
}: CaptureFormProps) {
  const captureDate = formData.capture_date ? new Date(formData.capture_date) : null;
  const captureEndDate = formData.capture_end_date ? new Date(formData.capture_end_date) : null;
  const isAllDay = formData.is_all_day !== undefined ? formData.is_all_day : true;
  const location = formData.location || '';

  const formatTimeDisplay = (date: Date | null) => {
    if (!date) return '';
    return format(date, 'HH:mm');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-3">
        <Switch 
          id="is-all-day" 
          checked={isAllDay} 
          onCheckedChange={onAllDayChange} 
        />
        <Label htmlFor="is-all-day">Dia inteiro</Label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Data de Captura</Label>
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
                  {captureDate ? format(captureDate, 'PPP', { locale: ptBR }) : <span>Selecione uma data</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={captureDate || undefined}
                  onSelect={(date) => onDateTimeChange('capture_date', date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            {!isAllDay && (
              <div className="flex space-x-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !captureDate && "text-muted-foreground"
                      )}
                    >
                      <Clock className="mr-2 h-4 w-4" />
                      {captureDate ? formatTimeDisplay(captureDate) : "00:00"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <div className="p-4 grid grid-cols-4 gap-2">
                      {Array.from({ length: 24 }).map((_, hour) => (
                        <React.Fragment key={hour}>
                          <Button
                            variant="ghost"
                            className="text-center"
                            onClick={() => {
                              const newDate = captureDate ? new Date(captureDate) : new Date();
                              newDate.setHours(hour, 0, 0, 0);
                              onDateTimeChange('capture_date', newDate);
                            }}
                          >
                            {`${hour.toString().padStart(2, '0')}:00`}
                          </Button>
                          <Button
                            variant="ghost"
                            className="text-center"
                            onClick={() => {
                              const newDate = captureDate ? new Date(captureDate) : new Date();
                              newDate.setHours(hour, 30, 0, 0);
                              onDateTimeChange('capture_date', newDate);
                            }}
                          >
                            {`${hour.toString().padStart(2, '0')}:30`}
                          </Button>
                        </React.Fragment>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>
        </div>

        {!isAllDay && (
          <div className="space-y-2">
            <Label>Data de Término</Label>
            <div className="flex flex-col space-y-2">
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
                    {captureEndDate ? format(captureEndDate, 'PPP', { locale: ptBR }) : <span>Selecione uma data</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={captureEndDate || undefined}
                    onSelect={(date) => onDateTimeChange('capture_end_date', date)}
                    initialFocus
                    disabled={(date) => captureDate ? date < captureDate : false}
                  />
                </PopoverContent>
              </Popover>

              <div className="flex space-x-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !captureEndDate && "text-muted-foreground"
                      )}
                    >
                      <Clock className="mr-2 h-4 w-4" />
                      {captureEndDate ? formatTimeDisplay(captureEndDate) : "00:00"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <div className="p-4 grid grid-cols-4 gap-2">
                      {Array.from({ length: 24 }).map((_, hour) => (
                        <React.Fragment key={hour}>
                          <Button
                            variant="ghost"
                            className="text-center"
                            onClick={() => {
                              const newDate = captureEndDate ? new Date(captureEndDate) : new Date();
                              newDate.setHours(hour, 0, 0, 0);
                              onDateTimeChange('capture_end_date', newDate);
                            }}
                          >
                            {`${hour.toString().padStart(2, '0')}:00`}
                          </Button>
                          <Button
                            variant="ghost"
                            className="text-center"
                            onClick={() => {
                              const newDate = captureEndDate ? new Date(captureEndDate) : new Date();
                              newDate.setHours(hour, 30, 0, 0);
                              onDateTimeChange('capture_end_date', newDate);
                            }}
                          >
                            {`${hour.toString().padStart(2, '0')}:30`}
                          </Button>
                        </React.Fragment>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Local da Captura</Label>
        <Input
          id="location"
          name="location"
          value={location}
          onChange={onInputChange}
          placeholder="Insira o local da captura"
        />
      </div>
    </div>
  );
}
