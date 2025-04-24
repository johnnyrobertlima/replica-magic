
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useScheduleHistory } from "@/hooks/useScheduleHistory";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CalendarEvent } from "@/types/oni-agencia";

interface ScheduleHistoryProps {
  event: CalendarEvent;
}

export function ScheduleHistory({ event }: ScheduleHistoryProps) {
  const { data: history = [], isLoading } = useScheduleHistory(event.id);

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Carregando histórico...</div>;
  }

  if (history.length === 0) {
    return <div className="text-sm text-muted-foreground">Nenhuma alteração registrada.</div>;
  }

  return (
    <ScrollArea className="h-[200px] pr-4">
      <div className="space-y-4">
        {history.map((entry) => (
          <div key={entry.id} className="text-sm border-l-2 border-primary pl-4 py-1">
            <p className="text-muted-foreground text-xs">
              {format(new Date(entry.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
            </p>
            <p>
              <span className="font-medium">Campo alterado:</span> {entry.field_name}
            </p>
            {entry.old_value && (
              <p className="text-muted-foreground">
                <span className="font-medium">De:</span> {entry.old_value}
              </p>
            )}
            <p className="text-primary">
              <span className="font-medium">Para:</span> {entry.new_value}
            </p>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
