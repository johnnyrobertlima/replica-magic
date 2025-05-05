
import React, { useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { CalendarEvent } from "@/types/oni-agencia";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { useMediaQuery } from "@/hooks/use-media-query";
import { StatusBadge } from "../status-badge/StatusBadge";

interface VirtualizedEventListProps {
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
}

interface DateGroupedEvents {
  [date: string]: CalendarEvent[];
}

interface FlattenedEvent {
  type: 'header' | 'event';
  date?: string;
  event?: CalendarEvent;
}

export function VirtualizedEventList({ events, onEventClick }: VirtualizedEventListProps) {
  const isMobile = useMediaQuery("(max-width: 640px)");
  
  // Agrupar eventos por data e criar uma lista plana com cabeçalhos e eventos
  const { flattenedItems, dateHeaders } = useMemo(() => {
    const grouped: DateGroupedEvents = {};
    const flattened: FlattenedEvent[] = [];
    const headers: Record<string, number> = {};
    
    // Agrupar por data
    events.forEach(event => {
      const dateKey = event.scheduled_date;
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    });
    
    // Ordenar as datas
    const sortedDates = Object.keys(grouped).sort();
    
    // Criar lista plana com cabeçalhos e eventos
    sortedDates.forEach(date => {
      const headerIndex = flattened.length;
      headers[date] = headerIndex;
      
      // Adicionar cabeçalho
      flattened.push({ type: 'header', date });
      
      // Adicionar eventos
      grouped[date].forEach(event => {
        flattened.push({ type: 'event', event });
      });
    });
    
    return { flattenedItems: flattened, dateHeaders: headers };
  }, [events]);
  
  // Se não há eventos, mostrar mensagem de lista vazia
  if (flattenedItems.length === 0) {
    return (
      <Card className="w-full h-full">
        <CardContent className="flex justify-center items-center h-40 p-4">
          <p className="text-muted-foreground">Nenhum agendamento encontrado</p>
        </CardContent>
      </Card>
    );
  }
  
  // Renderizar item (cabeçalho ou evento)
  const renderItem = ({ index, style }: { index: number, style: React.CSSProperties }) => {
    const item = flattenedItems[index];
    
    if (item.type === 'header' && item.date) {
      const date = parseISO(item.date);
      const formattedDate = format(date, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR });
      
      return (
        <div style={style} className="pt-4 pb-2">
          <h3 className="text-lg font-semibold capitalize">{formattedDate}</h3>
        </div>
      );
    }
    
    if (item.type === 'event' && item.event) {
      const event = item.event;
      return (
        <div 
          style={style} 
          className="mb-3 p-3 bg-white border rounded-md shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onEventClick(event)}
        >
          <div className="flex justify-between gap-2">
            <div className="font-medium truncate">{event.title}</div>
            {event.status && (
              <StatusBadge status={event.status} />
            )}
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-between mt-2 text-sm text-muted-foreground">
            <div>
              {event.service?.name && (
                <span className="inline-block mr-2">
                  {event.service.name}
                </span>
              )}
            </div>
            <div>
              {event.collaborator?.name && (
                <span>
                  {event.collaborator.name}
                </span>
              )}
            </div>
          </div>
        </div>
      );
    }
    
    return null;
  };
  
  return (
    <div className="h-[calc(100vh-200px)] w-full">
      <AutoSizer>
        {({ height, width }) => (
          <List
            height={height}
            width={width}
            itemCount={flattenedItems.length}
            itemSize={isMobile ? 100 : 90}
            overscanCount={5}
          >
            {renderItem}
          </List>
        )}
      </AutoSizer>
    </div>
  );
}
