
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export interface HistoryEntry {
  id: string;
  schedule_id: string;
  field_name: string;
  old_value: string | null;
  new_value: string;
  created_at: string;
  changed_by: string | null;
}

interface HistoryTimelineProps {
  historyData: HistoryEntry[] | undefined;
  isLoading: boolean;
  isError: boolean;
  onRefetchResources?: () => void;
}

export function HistoryTimeline({ 
  historyData = [], 
  isLoading, 
  isError,
  onRefetchResources 
}: HistoryTimelineProps) {
  if (isLoading) {
    return <div className="text-center py-4">Carregando histórico...</div>;
  }

  if (isError) {
    return (
      <div className="text-center py-4">
        Erro ao carregar o histórico. 
        {onRefetchResources && (
          <button onClick={onRefetchResources} className="text-blue-500">
            Tentar novamente
          </button>
        )}
      </div>
    );
  }

  if (!historyData || historyData.length === 0) {
    return <div className="text-center py-4">Nenhum histórico disponível.</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Histórico de Alterações</h3>
      <div className="relative">
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-400 -ml-0.5"></div>
        <div className="space-y-6">
          {historyData.map((entry) => (
            <div key={entry.id} className="flex items-start space-x-4">
              <div className="w-1/2">
                <div className="text-sm text-gray-500">
                  {format(new Date(entry.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                </div>
                <div className="text-sm italic">
                  {entry.changed_by ? `Alterado por: ${entry.changed_by}` : 'Alteração automática'}
                </div>
              </div>
              <div className="w-1/2">
                <div className="font-medium">{entry.field_name}</div>
                <div className="text-gray-700">
                  De: {entry.old_value ? entry.old_value : "N/A"} <br />
                  Para: {entry.new_value}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
