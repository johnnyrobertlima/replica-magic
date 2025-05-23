
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User, Clock, AlertTriangle, RefreshCw } from "lucide-react";
import { linkifyText } from "@/utils/linkUtils";
import { Button } from "@/components/ui/button";

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
  fieldMappings?: Record<string, {
    name: string;
    transform?: (id: string, type: 'old' | 'new') => string | null;
  }>;
  itemMappings?: Record<string, Record<string, string>>;
}

export function HistoryTimeline({ 
  historyData = [], 
  isLoading, 
  isError, 
  error,
  onRefetchResources,
  fieldMappings = {},
  itemMappings = {}
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
      <div className="flex flex-col items-center justify-center p-4 space-y-4 h-[400px]">
        <div className="text-sm text-red-500 flex items-center space-x-2">
          <AlertTriangle className="h-4 w-4" />
          <span>Erro ao carregar histórico: {error instanceof Error ? error.message : 'Erro desconhecido'}</span>
        </div>
        
        {onRefetchResources && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRefetchResources}
            className="flex items-center space-x-1"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            <span>Tentar novamente</span>
          </Button>
        )}
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

  // Helper function to transform field names to human-readable format
  const getReadableFieldName = (field: string): string => {
    const fieldMap: Record<string, string> = {
      'title': 'Título',
      'description': 'Descrição',
      'scheduled_date': 'Data Agendada',
      'client_id': 'Cliente',
      'service_id': 'Serviço',
      'status_id': 'Status',
      'collaborator_id': 'Colaborador',
      'editorial_line_id': 'Linha Editorial',
      'product_id': 'Produto',
      'execution_phase': 'Fase de Execução',
      'creators': 'Criadores',
      'capture_date': 'Data de Captura',
      'capture_end_date': 'Data Final de Captura',
      'is_all_day': 'Dia Inteiro',
      'location': 'Localização'
    };
    
    return fieldMap[field] || field;
  };

  // Helper function to get readable value based on field name and mappings
  const getReadableValue = (field: string, value: string | null, type: 'old' | 'new'): string => {
    if (value === null) return 'Não definido';

    // If we have a transform function for this field, use it
    if (fieldMappings[field]?.transform) {
      const transformed = fieldMappings[field].transform!(value, type);
      return transformed !== null ? transformed : 'Não definido';
    }

    // If we have a mapping for this field's values, use it
    if (itemMappings[field] && itemMappings[field][value]) {
      return itemMappings[field][value];
    }

    // Special handling for dates
    if (field === 'scheduled_date' || field === 'capture_date' || field === 'capture_end_date') {
      try {
        return format(new Date(value), 'dd/MM/yyyy', { locale: ptBR });
      } catch (e) {
        return value;
      }
    }

    // Special handling for boolean values
    if (field === 'is_all_day') {
      return value === 'true' ? 'Sim' : 'Não';
    }

    return value;
  };

  // Filter to get only description changes
  const descriptionEntries = historyData.filter(entry => entry.field_name === "description");
  const otherEntries = historyData.filter(entry => entry.field_name !== "description");

  return (
    <ScrollArea className="h-[400px] pr-4">
      <div className="space-y-6">
        {/* Display description history as a special section if it exists */}
        {descriptionEntries.length > 0 && (
          <div className="mb-6 border rounded-md p-4 bg-muted/20">
            <h3 className="text-sm font-medium mb-3 border-b pb-2">Histórico de Descrição</h3>
            
            <div className="space-y-4">
              {descriptionEntries.map((entry) => (
                <div key={entry.id} className="text-sm">
                  <div className="flex items-center text-muted-foreground text-xs gap-1 mb-2">
                    <User className="h-3 w-3" />
                    <span className="font-medium">{entry.changed_by_name || "Usuário"}</span> - 
                    {format(new Date(entry.created_at), " dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                  </div>
                  
                  <div 
                    className="whitespace-pre-wrap pl-4 border-l-2 border-primary/30" 
                    dangerouslySetInnerHTML={{ __html: linkifyText(entry.new_value || '') }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Other history entries */}
        {otherEntries.map((entry) => (
          <div key={entry.id} className="text-sm border-l-2 border-primary pl-4 py-1">
            <div className="flex items-center text-muted-foreground text-xs gap-1 mb-1">
              <User className="h-3 w-3" />
              <span className="font-medium">{entry.changed_by_name || "Usuário"}</span> - 
              {format(new Date(entry.created_at), " dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
            </div>
            
            <p>
              <span className="font-medium">Campo alterado:</span> {getReadableFieldName(entry.field_name)}
            </p>
            
            {entry.old_value && (
              <p className="text-muted-foreground">
                <span className="font-medium">De:</span> {" "}
                <span dangerouslySetInnerHTML={{ 
                  __html: linkifyText(getReadableValue(entry.field_name, entry.old_value, 'old')) 
                }} />
              </p>
            )}
            
            <p className="text-primary">
              <span className="font-medium">Para:</span> {" "}
              <span dangerouslySetInnerHTML={{ 
                __html: linkifyText(getReadableValue(entry.field_name, entry.new_value, 'new')) 
              }} />
            </p>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
