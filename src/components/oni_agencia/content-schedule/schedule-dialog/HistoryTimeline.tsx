
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User, Clock, AlertTriangle } from "lucide-react";
import { linkifyText } from "@/utils/linkUtils";

interface HistoryEntry {
  id: string;
  field_name: string;
  old_value: string | null;
  new_value: string | null;
  changed_by: string | null;
  changed_by_name?: string | null;
  created_at: string;
}

interface HistoryTimelineProps {
  historyData: HistoryEntry[];
  isLoading: boolean;
  isError: boolean;
  error?: any;
  onRefetchResources?: () => void;
}

export function HistoryTimeline({ 
  historyData = [], 
  isLoading, 
  isError, 
  error,
  onRefetchResources
}: HistoryTimelineProps) {

  if (isLoading) {
    return (
      <div className="text-sm text-muted-foreground flex items-center justify-center p-4 space-x-2 h-[400px]">
        <Clock className="animate-spin h-4 w-4" />
        <span>Carregando histórico...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-sm text-red-500 flex items-center justify-center p-4 space-x-2 h-[400px]">
        <AlertTriangle className="h-4 w-4" />
        <span>Erro ao carregar histórico: {error instanceof Error ? error.message : 'Erro desconhecido'}</span>
      </div>
    );
  }

  if (historyData.length === 0) {
    return (
      <div className="text-sm text-muted-foreground flex items-center justify-center p-4 h-[400px]">
        <span>Nenhuma alteração registrada para este agendamento.</span>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px] pr-4">
      <div className="space-y-4">
        {historyData.map((entry) => (
          <div key={entry.id} className="text-sm border-l-2 border-primary pl-4 py-1">
            <div className="flex items-center text-muted-foreground text-xs gap-1 mb-1">
              <User className="h-3 w-3" />
              <span className="font-medium">{entry.changed_by_name || "Usuário"}</span> - 
              {format(new Date(entry.created_at), " dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
            </div>
            
            <p>
              <span className="font-medium">Campo alterado:</span> {entry.field_name}
            </p>
            
            {entry.old_value && (
              <p className="text-muted-foreground">
                <span className="font-medium">De:</span> 
                <span dangerouslySetInnerHTML={{ __html: linkifyText(entry.old_value) }} />
              </p>
            )}
            
            <p className="text-primary">
              <span className="font-medium">Para:</span> 
              <span dangerouslySetInnerHTML={{ __html: linkifyText(entry.new_value || '') }} />
            </p>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
