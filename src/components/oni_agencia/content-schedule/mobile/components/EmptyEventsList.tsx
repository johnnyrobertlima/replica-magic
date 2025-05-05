
import React from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface EmptyEventsListProps {
  onLoadMore?: () => void;
}

export function EmptyEventsList({ onLoadMore }: EmptyEventsListProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-4 text-center">
      <p className="text-lg font-medium text-muted-foreground mb-2">Nenhum agendamento encontrado</p>
      <p className="text-sm text-muted-foreground mb-4">
        Não foi possível carregar os agendamentos ou não existem agendamentos para os filtros selecionados.
      </p>
      {onLoadMore && (
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => {
            toast({
              title: "Tentando novamente",
              description: "Aguarde enquanto tentamos carregar os agendamentos novamente.",
              duration: 3000,
            });
            onLoadMore();
          }}
          className="text-xs"
        >
          Tentar novamente
        </Button>
      )}
    </div>
  );
}
