
import React from "react";
import { CalendarIcon, User } from "lucide-react";
import { formatDistanceToNow, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export interface HistoryTimelineProps {
  history?: any[];
  isLoading?: boolean;
}

export function HistoryTimeline({ history = [], isLoading = false }: HistoryTimelineProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="animate-pulse flex flex-col space-y-4 w-full">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <div className="text-center p-6">
        <h3 className="text-lg font-medium">Nenhum histórico disponível</h3>
        <p className="text-sm text-muted-foreground">
          Não há registros de alterações para este agendamento.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-1">
      {history.map((entry) => {
        const dateFormatted = formatDistanceToNow(parseISO(entry.created_at), {
          addSuffix: true,
          locale: ptBR,
        });

        return (
          <div key={entry.id} className="relative pl-6">
            <div className="absolute left-0 top-1 h-full w-[1px] bg-muted">
              <div className="absolute top-0 left-0 -ml-[3px] h-2 w-2 rounded-full bg-primary"></div>
            </div>

            <div className="ml-4 space-y-1">
              <div className="flex items-center text-sm">
                <User className="mr-1 h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{entry.changed_by_name}</span>
              </div>
              <p className="text-sm font-medium">
                {getFieldDisplayName(entry.field_name)}:{" "}
                <span className="text-muted-foreground">
                  {entry.old_value !== null ? `"${entry.old_value}"` : "nenhum"} →{" "}
                </span>
                <span className="font-semibold">{`"${entry.new_value}"`}</span>
              </p>
              <div className="flex items-center text-xs text-muted-foreground">
                <CalendarIcon className="mr-1 h-3 w-3" />
                <time dateTime={entry.created_at}>{dateFormatted}</time>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function getFieldDisplayName(fieldName: string): string {
  const fieldMappings: Record<string, string> = {
    title: "Título",
    description: "Descrição",
    scheduled_date: "Data de Agendamento",
    service_id: "Serviço",
    collaborator_id: "Colaborador",
    editorial_line_id: "Linha Editorial",
    product_id: "Produto",
    status_id: "Status",
    creators: "Participantes",
    client_id: "Cliente",
    capture_date: "Data de Captura",
    capture_end_date: "Fim da Captura",
    is_all_day: "Dia Inteiro",
    location: "Local",
  };

  return fieldMappings[fieldName] || fieldName;
}
