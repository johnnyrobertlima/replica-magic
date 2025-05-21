
import React from "react";
import { formatDistance, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface HistoryEntry {
  id: string;
  schedule_id: string;
  field_name: string;
  old_value: string | null;
  new_value: string;
  created_at: string;
  changed_by?: string;
  changed_by_name?: string;
}

export interface HistoryTimelineProps {
  data?: HistoryEntry[];
  isLoading?: boolean;
  isError?: boolean;
  onRefetchResources?: () => void;
}

export function HistoryTimeline({ 
  data = [], 
  isLoading = false, 
  isError = false,
  onRefetchResources
}: HistoryTimelineProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        <p className="mt-4 text-muted-foreground">Carregando histórico...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-destructive">Erro ao carregar o histórico.</p>
        {onRefetchResources && (
          <Button 
            onClick={onRefetchResources} 
            variant="outline" 
            className="mt-4"
          >
            Tentar novamente
          </Button>
        )}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-muted-foreground">Nenhum histórico disponível.</p>
      </div>
    );
  }

  // Sort entries by created_at, most recent first
  const sortedEntries = [...data].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const formatFieldName = (fieldName: string) => {
    const mappings: Record<string, string> = {
      'title': 'Título',
      'description': 'Descrição',
      'scheduled_date': 'Data de agendamento',
      'status_id': 'Status',
      'service_id': 'Serviço',
      'collaborator_id': 'Colaborador',
      'editorial_line_id': 'Linha Editorial',
      'product_id': 'Produto',
      'client_id': 'Cliente',
      'execution_phase': 'Fase de Execução',
      'capture_date': 'Data de Captura',
      'capture_end_date': 'Data de Término da Captura',
      'is_all_day': 'Todo o dia',
      'location': 'Local',
      'creators': 'Criadores'
    };
    
    return mappings[fieldName] || fieldName;
  };

  return (
    <div className="space-y-4 px-2">
      {sortedEntries.map((entry) => {
        const date = new Date(entry.created_at);
        return (
          <div key={entry.id} className="relative pl-6 pb-6 border-l border-gray-200">
            <div className="absolute left-0 -translate-x-1/2 w-4 h-4 rounded-full bg-purple-100 border-2 border-purple-600"></div>
            <div className="ml-4">
              <p className="text-sm text-muted-foreground">
                {format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                <span className="text-xs ml-2 text-gray-500">
                  ({formatDistance(date, new Date(), { addSuffix: true, locale: ptBR })})
                </span>
              </p>
              
              <h4 className="font-medium">
                {formatFieldName(entry.field_name)}
              </h4>
              
              <div className="mt-2 space-y-1 text-sm">
                {entry.old_value !== null && (
                  <div>
                    <span className="text-muted-foreground">De: </span>
                    <span className="bg-red-50 text-red-700 px-1 rounded">{entry.old_value || '(vazio)'}</span>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">Para: </span>
                  <span className="bg-green-50 text-green-700 px-1 rounded">{entry.new_value || '(vazio)'}</span>
                </div>
              </div>
              
              {entry.changed_by_name && (
                <p className="text-xs text-muted-foreground mt-1">
                  por {entry.changed_by_name}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
