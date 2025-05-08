
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";

interface TimePickerDemoProps {
  date: Date | null;
  setDate: (date: Date | null) => void;
}

export function TimePickerDemo({ date, setDate }: TimePickerDemoProps) {
  const minuteRef = React.useRef<HTMLInputElement>(null);
  const hourRef = React.useRef<HTMLInputElement>(null);

  const [hour, setHour] = React.useState<string>(
    date ? format(date, "HH") : ""
  );
  const [minute, setMinute] = React.useState<string>(
    date ? format(date, "mm") : ""
  );

  // Update the date when the hour or minute changes
  React.useEffect(() => {
    let newDate: Date;

    if (!date) {
      newDate = new Date();
      newDate.setHours(0, 0, 0, 0);
    } else {
      newDate = new Date(date);
    }

    const hourValue = parseInt(hour, 10);
    const minuteValue = parseInt(minute, 10);

    if (!isNaN(hourValue) && !isNaN(minuteValue)) {
      newDate.setHours(hourValue);
      newDate.setMinutes(minuteValue);
      setDate(new Date(newDate));
    }
  }, [hour, minute, date, setDate]);

  // Update the hour and minute when the date changes
  React.useEffect(() => {
    if (date) {
      setHour(format(date, "HH"));
      setMinute(format(date, "mm"));
    }
  }, [date]);

  return (
    <div className="flex items-end gap-2 flex-wrap">
      <div className="grid gap-1 text-center">
        <Label htmlFor="hour" className="text-xs">
          Hora
        </Label>
        <Input
          ref={hourRef}
          id="hour"
          className="w-[4rem] text-center"
          value={hour}
          onChange={(e) => {
            setHour(e.target.value);
          }}
          placeholder="00"
          max={23}
          min={0}
        />
      </div>
      <div className="grid gap-1 text-center">
        <Label htmlFor="minute" className="text-xs">
          Minuto
        </Label>
        <Input
          ref={minuteRef}
          id="minute"
          className="w-[4rem] text-center"
          value={minute}
          onChange={(e) => {
            setMinute(e.target.value);
          }}
          placeholder="00"
          max={59}
          min={0}
        />
      </div>
    </div>
  );
}
