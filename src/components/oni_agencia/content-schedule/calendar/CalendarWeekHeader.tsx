
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CalendarWeekHeaderProps {
  date: Date;
}

export function CalendarWeekHeader({ date }: CalendarWeekHeaderProps) {
  // Format the date to show the current week range
  const startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() - date.getDay());
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  
  const formattedStart = format(startOfWeek, 'dd MMM', { locale: ptBR });
  const formattedEnd = format(endOfWeek, 'dd MMM yyyy', { locale: ptBR });
  
  return (
    <div className="flex items-center justify-between p-2 bg-secondary/10 border-b">
      <span className="font-medium text-sm">
        {formattedStart} - {formattedEnd}
      </span>
    </div>
  );
}
