
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useScheduleHistory } from "@/hooks/useScheduleHistory";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CalendarEvent } from "@/types/oni-agencia";
import { User, Clock, AlertTriangle } from "lucide-react";

interface ScheduleHistoryProps {
  event: CalendarEvent;
}

export function ScheduleHistory({ event }: ScheduleHistoryProps) {
  const { data: history = [], isLoading, isError, error } = useScheduleHistory(event.id);

  if (isLoading) {
    return (
      <div className="text-sm text-muted-foreground flex items-center justify-center p-4 space-x-2">
        <Clock className="animate-spin h-4 w-4" />
        <span>Carregando histórico...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-sm text-red-500 flex items-center justify-center p-4 space-x-2">
        <AlertTriangle className="h-4 w-4" />
        <span>Erro ao carregar histórico: {error instanceof Error ? error.message : 'Erro desconhecido'}</span>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-sm text-muted-foreground flex items-center justify-center p-4 h-[150px]">
        <span>Nenhuma alteração registrada para este agendamento.</span>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[200px] pr-4">
      <div className="space-y-4">
        {history.map((entry) => (
          <div key={entry.id} className="text-sm border-l-2 border-primary pl-4 py-1">
            <div className="flex items-center text-muted-foreground text-xs gap-1 mb-1">
              <User className="h-3 w-3" />
              <span className="font-medium">{entry.changed_by_name}</span> - 
              {format(new Date(entry.created_at), " dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
            </div>
            
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
