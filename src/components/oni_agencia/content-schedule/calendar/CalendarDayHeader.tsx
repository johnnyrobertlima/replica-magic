
import React from "react";

export function CalendarDayHeader() {
  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  return (
    <div className="grid grid-cols-7 gap-px bg-white">
      {weekDays.map((day) => (
        <div 
          key={day} 
          className="py-2 text-center text-sm font-medium text-muted-foreground"
        >
          {day}
        </div>
      ))}
    </div>
  );
}
