
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { CalendarEvent } from "@/types/oni-agencia";
import { MobileEventList } from "./MobileEventList";
import { MobileContentLoading } from './MobileContentLoading';
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

interface MobileContentScheduleListProps {
  events: CalendarEvent[];
  clientId: string;
  selectedCollaborator?: string | null;
  isLoading: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  isLoadingMore?: boolean;
}

export function MobileContentScheduleList({ 
  events, 
  clientId, 
  selectedCollaborator,
  isLoading,
  hasMore = false,
  onLoadMore,
  isLoadingMore = false
}: MobileContentScheduleListProps) {
  // Estado para controlar eventos filtrados por colaborador (memoizado)
  const [filteredEvents, setFilteredEvents] = useState<CalendarEvent[]>([]);

  // Ref para o elemento de interseção para lazy loading
  const loadMoreRef = useRef<HTMLDivElement>(null);
  
  // Efeito para filtrar eventos por colaborador
  useEffect(() => {
    if (!selectedCollaborator) {
      setFilteredEvents(events);
      return;
    }
    
    const filtered = events.filter(event => {
      // Verificar se a pessoa é um colaborador principal
      const isCollaborator = event.collaborator_id === selectedCollaborator;
      
      // Verificar se a pessoa está no array de creators
      let isCreator = false;
      
      if (event.creators) {
        // Garantir que creators é sempre tratado como array de strings
        const creatorsArray = Array.isArray(event.creators) ? event.creators : 
                             (typeof event.creators === 'string' ? [event.creators] : []);
        
        // Verificação direta de ID
        isCreator = creatorsArray.includes(selectedCollaborator);
      }
      
      // Retornar true se a pessoa for um colaborador ou estiver em creators
      return isCollaborator || isCreator;
    });
    
    setFilteredEvents(filtered);
  }, [events, selectedCollaborator]);
  
  // Observer para detectar quando o usuário rola até o final da lista
  useEffect(() => {
    if (!hasMore || !onLoadMore) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );
    
    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }
    
    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [hasMore, onLoadMore, isLoadingMore]);
  
  // Se estiver carregando e não há eventos, mostrar o estado de carregamento
  if (isLoading && events.length === 0) {
    return <MobileContentLoading />;
  }
  
  return (
    <div className="overflow-auto h-full bg-white shadow-sm rounded-md border p-2">
      <MobileEventList 
        events={filteredEvents}
        clientId={clientId}
      />
      
      {/* Elemento de carregamento para lazy loading */}
      {hasMore && (
        <div
          ref={loadMoreRef}
          className="w-full flex justify-center py-4"
        >
          {isLoadingMore ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
              <span className="ml-2 text-sm text-muted-foreground">Carregando mais...</span>
            </div>
          ) : (
            <Button 
              variant="outline" 
              size="sm"
              onClick={onLoadMore}
              className="text-xs flex items-center"
            >
              <ChevronDown className="h-4 w-4 mr-1" />
              Carregar mais
            </Button>
          )}
        </div>
      )}
      
      {/* Mensagem quando não há mais itens */}
      {filteredEvents.length > 0 && !hasMore && !isLoading && (
        <div className="text-center py-4 text-sm text-muted-foreground">
          Você visualizou todos os agendamentos
        </div>
      )}
      
      {/* Mensagem quando não há eventos */}
      {filteredEvents.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center h-full py-10">
          <p className="text-muted-foreground">Nenhum agendamento encontrado</p>
        </div>
      )}
    </div>
  );
}
