
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format, parse } from "date-fns";

interface TimePickerDemoProps {
  date?: Date;
  setDate: (date: Date | undefined) => void;
}

export function TimePickerDemo({ date, setDate }: TimePickerDemoProps) {
  // Handle time input change
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    if (!value) {
      setDate(undefined);
      return;
    }
    
    try {
      // Create a Date object based on the input time
      let newDate: Date;
      
      if (date) {
        // If we have an existing date, maintain the date part and update only the time
        newDate = new Date(date);
        
        const [hours, minutes] = value.split(':').map(Number);
        
        if (!isNaN(hours) && !isNaN(minutes)) {
          newDate.setHours(hours);
          newDate.setMinutes(minutes);
        }
      } else {
        // If no existing date, use today with the selected time
        const today = new Date();
        const timeString = `${today.toISOString().split('T')[0]}T${value}:00`;
        newDate = new Date(timeString);
      }
      
      setDate(newDate);
    } catch (error) {
      console.error("Invalid time format:", error);
    }
  };

  // Format current time for display
  const formattedTime = date ? format(date, 'HH:mm') : '';

  return (
    <Input
      type="time"
      value={formattedTime}
      onChange={handleTimeChange}
      className="w-full"
    />
  );
}
