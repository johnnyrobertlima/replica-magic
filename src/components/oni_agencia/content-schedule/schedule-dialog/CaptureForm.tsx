
import { useState } from "react";
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { TimePickerDemo } from "@/components/TimePickerDemo";

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
  // Parse dates if they exist
  const parsedCaptureDate = captureDate ? new Date(captureDate) : null;
  const parsedCaptureEndDate = captureEndDate ? new Date(captureEndDate) : null;
  
  return (
    <div className="space-y-4 py-2">
      <div className="flex items-center space-x-2">
        <Switch 
          id="all-day"
          checked={isAllDay} 
          onCheckedChange={onAllDayChange}
        />
        <Label htmlFor="all-day">Dia inteiro</Label>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        <FormItem>
          <FormLabel>Data da Captura</FormLabel>
          <FormControl>
            <Input 
              type="date" 
              value={captureDate ? captureDate.split('T')[0] : ''} 
              onChange={(e) => {
                // Create a new date object with the selected date
                const newDate = e.target.value ? new Date(e.target.value) : null;
                onCaptureChange('capture_date', newDate);
              }} 
            />
          </FormControl>
        </FormItem>
        
        {!isAllDay && (
          <div className="grid grid-cols-2 gap-4">
            <FormItem>
              <FormLabel>Horário de Início</FormLabel>
              <FormControl>
                <TimePickerDemo
                  date={parsedCaptureDate}
                  setDate={(date) => {
                    onCaptureChange('capture_date', date);
                  }}
                />
              </FormControl>
            </FormItem>
            
            <FormItem>
              <FormLabel>Horário de Término</FormLabel>
              <FormControl>
                <TimePickerDemo
                  date={parsedCaptureEndDate}
                  setDate={(date) => {
                    onCaptureChange('capture_end_date', date);
                  }}
                />
              </FormControl>
            </FormItem>
          </div>
        )}
        
        <FormItem>
          <FormLabel>Local da captura</FormLabel>
          <FormControl>
            <Input
              name="location"
              value={location || ''}
              onChange={onLocationChange}
              placeholder="Informe o local da captura"
            />
          </FormControl>
        </FormItem>
      </div>
    </div>
  );
}
