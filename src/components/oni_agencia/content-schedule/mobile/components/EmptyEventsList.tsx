
import React from 'react';
import { Calendar, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyEventsListProps {
  onLoadMore?: () => void;
}

export function EmptyEventsList({ onLoadMore }: EmptyEventsListProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 h-[calc(100vh-250px)] text-center">
      <Calendar className="h-12 w-12 text-gray-300 mb-4" />
      <h3 className="text-lg font-medium text-gray-600 mb-2">Sem agendamentos</h3>
      <p className="text-sm text-gray-500 mb-6 max-w-md">
        Não encontramos nenhum agendamento para o período e filtros selecionados.
      </p>
      
      {onLoadMore && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onLoadMore}
          className="mt-2 flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Tentar novamente</span>
        </Button>
      )}
    </div>
  );
}
