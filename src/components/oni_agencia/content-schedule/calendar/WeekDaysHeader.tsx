
import React from 'react';

interface WeekDaysHeaderProps {
  weekDays?: string[];
}

export function WeekDaysHeader({ weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"] }: WeekDaysHeaderProps) {
  return (
    <div className="grid grid-cols-7 border-b">
      {weekDays.map((day, index) => (
        <div key={index} className="text-center py-2 text-sm font-medium text-gray-500">
          {day}
        </div>
      ))}
    </div>
  );
}
