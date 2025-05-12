
import { Input } from "@/components/ui/input";
import React, { useEffect, useState } from "react";

interface TimePickerInputProps {
  date: Date;
  setDate: (date: Date) => void;
}

export function TimePickerInput({ date, setDate }: TimePickerInputProps) {
  const [hours, setHours] = useState<string>(
    date ? String(date.getHours()).padStart(2, "0") : "00"
  );
  const [minutes, setMinutes] = useState<string>(
    date ? String(date.getMinutes()).padStart(2, "0") : "00"
  );

  // Update hours and minutes when the date changes
  useEffect(() => {
    if (date) {
      setHours(String(date.getHours()).padStart(2, "0"));
      setMinutes(String(date.getMinutes()).padStart(2, "0"));
    }
  }, [date]);

  // Update the date when hours or minutes change
  const handleTimeChange = () => {
    const newDate = new Date(date);
    newDate.setHours(parseInt(hours, 10) || 0);
    newDate.setMinutes(parseInt(minutes, 10) || 0);
    newDate.setSeconds(0);
    setDate(newDate);
  };

  // Handle specific input for hours
  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (value === "") {
      setHours(value);
      return;
    }
    
    // Convert to number and ensure it's within 0-23
    const numValue = parseInt(value.slice(-2), 10);
    if (isNaN(numValue)) return;
    
    const newHours = Math.max(0, Math.min(23, numValue));
    setHours(String(newHours).padStart(2, "0"));
    
    // Update date after validation
    setTimeout(() => {
      handleTimeChange();
    }, 100);
  };

  // Handle specific input for minutes
  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (value === "") {
      setMinutes(value);
      return;
    }
    
    // Convert to number and ensure it's within 0-59
    const numValue = parseInt(value.slice(-2), 10);
    if (isNaN(numValue)) return;
    
    const newMinutes = Math.max(0, Math.min(59, numValue));
    setMinutes(String(newMinutes).padStart(2, "0"));
    
    // Update date after validation
    setTimeout(() => {
      handleTimeChange();
    }, 100);
  };

  return (
    <div className="flex items-center space-x-2">
      <Input
        type="text"
        inputMode="numeric"
        value={hours}
        onChange={handleHoursChange}
        onBlur={handleTimeChange}
        className="w-14 text-center"
        placeholder="00"
        maxLength={2}
      />
      <span className="text-lg">:</span>
      <Input
        type="text"
        inputMode="numeric"
        value={minutes}
        onChange={handleMinutesChange}
        onBlur={handleTimeChange}
        className="w-14 text-center"
        placeholder="00"
        maxLength={2}
      />
    </div>
  );
}
