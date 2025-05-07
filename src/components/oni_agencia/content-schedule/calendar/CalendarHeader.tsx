
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
    <div className="flex items-center gap-2 p-4">
      <CalendarIcon className="h-5 w-5 text-primary" />
      <h2 className="text-lg font-medium">
        {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
      </h2>
      <div className="flex gap-1 ml-2">
        <Button
          variant="outline"
          size="icon"
          onClick={onPrevMonth}
          title="Mês anterior"
          className="h-7 w-7"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={onNextMonth}
          title="Próximo mês"
          className="h-7 w-7"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
