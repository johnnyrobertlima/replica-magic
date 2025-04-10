
interface WeekDaysHeaderProps {
  weekDays: string[];
}

export function WeekDaysHeader({ weekDays }: WeekDaysHeaderProps) {
  return (
    <div className="grid grid-cols-7 w-full border-b">
      {weekDays.map((day, index) => (
        <div 
          key={index} 
          className="text-center py-2 font-medium text-sm border-r last:border-r-0 bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          {day}
        </div>
      ))}
    </div>
  );
}
