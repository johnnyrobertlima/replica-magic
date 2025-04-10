
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";

interface CalendarHeaderProps {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

export function CalendarHeader({ currentDate, onPrevMonth, onNextMonth }: CalendarHeaderProps) {
  return (
    <div className="flex justify-between items-center p-4 border-b">
      <h2 className="text-lg font-medium flex items-center gap-2">
        <CalendarIcon className="h-5 w-5 text-primary" />
        {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
      </h2>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={onPrevMonth}
          title="Mês anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={onNextMonth}
          title="Próximo mês"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
