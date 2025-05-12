
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Loader2 } from "lucide-react";

interface HistoryEntry {
  id: string;
  schedule_id: string;
  field_name: string;
  old_value: string | null;
  new_value: string | null;
  changed_by: string | null;
  created_at: string;
}

interface HistoryTimelineProps {
  historyData: HistoryEntry[];
  isLoading: boolean;
  isError: boolean;
}

export function HistoryTimeline({ historyData, isLoading, isError }: HistoryTimelineProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2">Carregando histórico...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center p-4 text-red-500">
        Não foi possível carregar o histórico. Por favor, tente novamente mais tarde.
      </div>
    );
  }

  if (!historyData || historyData.length === 0) {
    return (
      <div className="text-center p-6 text-gray-500">
        Nenhum histórico disponível para este agendamento.
      </div>
    );
  }

  const getFieldDisplayName = (fieldName: string) => {
    const fieldNameMap: Record<string, string> = {
      "creation": "Criação",
      "status_id": "Status",
      "collaborator_id": "Colaborador",
      "title": "Título",
      "description": "Descrição",
      "scheduled_date": "Data Agendada",
      "capture_date": "Data de Captura",
      "capture_end_date": "Data Final de Captura",
      "is_all_day": "Dia Inteiro",
      "location": "Localização",
      "editorial_line_id": "Linha Editorial",
      "product_id": "Produto"
    };

    return fieldNameMap[fieldName] || fieldName;
  };

  return (
    <div className="flow-root">
      <ul role="list" className="-mb-8">
        {historyData.map((entry, entryIdx) => (
          <li key={entry.id}>
            <div className="relative pb-8">
              {entryIdx !== historyData.length - 1 && (
                <span
                  className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
                  aria-hidden="true"
                />
              )}
              <div className="relative flex space-x-3">
                <div>
                  <span className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center ring-8 ring-white">
                    <span className="h-5 w-5 text-white" aria-hidden="true">{entryIdx + 1}</span>
                  </span>
                </div>
                <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                  <div>
                    <p className="text-sm text-gray-700">
                      <strong>{getFieldDisplayName(entry.field_name)}</strong>
                      {entry.field_name !== "creation" ? (
                        <>
                          {" foi alterado de "}
                          <span className="font-medium">{entry.old_value || "vazio"}</span>
                          {" para "}
                          <span className="font-medium">{entry.new_value || "vazio"}</span>
                        </>
                      ) : (
                        " do agendamento"
                      )}
                    </p>
                  </div>
                  <div className="whitespace-nowrap text-right text-sm text-gray-500">
                    {formatDistanceToNow(new Date(entry.created_at), {
                      addSuffix: true, 
                      locale: ptBR
                    })}
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
