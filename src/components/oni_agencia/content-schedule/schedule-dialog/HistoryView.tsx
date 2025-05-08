
import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, AlertTriangle, User } from "lucide-react";

interface HistoryViewProps {
  scheduleId: string;
}

interface HistoryEntry {
  id: string;
  schedule_id: string;
  field_name: string;
  old_value: string | null;
  new_value: string;
  changed_by: string;
  changed_by_name: string;
  created_at: string;
}

export function HistoryView({ scheduleId }: HistoryViewProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchHistory() {
      if (!scheduleId) return;
      
      setIsLoading(true);
      try {
        // Aqui seria a chamada real para buscar o histórico
        // Por enquanto apenas simulamos um atraso e retornamos um array vazio
        await new Promise(resolve => setTimeout(resolve, 1000));
        setHistory([]);
        setError(null);
      } catch (err) {
        console.error("Error fetching schedule history:", err);
        setError(err instanceof Error ? err : new Error('Erro ao buscar histórico'));
      } finally {
        setIsLoading(false);
      }
    }

    fetchHistory();
  }, [scheduleId]);

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-10 w-2/3" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-red-500 flex items-center justify-center p-4 space-x-2 h-[400px]">
        <AlertTriangle className="h-4 w-4" />
        <span>Erro ao carregar histórico: {error.message}</span>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-sm text-muted-foreground flex items-center justify-center p-4 h-[400px]">
        <span>Nenhuma alteração registrada para este agendamento.</span>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px] pr-4">
      <div className="space-y-4">
        {history.map((entry) => (
          <div key={entry.id} className="text-sm border-l-2 border-primary pl-4 py-1">
            <div className="flex items-center text-muted-foreground text-xs gap-1 mb-1">
              <User className="h-3 w-3" />
              <span className="font-medium">{entry.changed_by_name}</span>
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
