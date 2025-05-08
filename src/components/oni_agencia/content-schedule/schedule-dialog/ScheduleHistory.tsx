
import React, { useEffect } from 'react';
import { useScheduleHistory } from '@/hooks/useScheduleHistory';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ScheduleHistoryProps {
  eventId: string;
}

export function ScheduleHistory({ eventId }: ScheduleHistoryProps) {
  const { data, isLoading, error, refetch } = useScheduleHistory(eventId);
  
  useEffect(() => {
    if (eventId) {
      refetch();
    }
  }, [eventId, refetch]);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-2">
        Erro ao carregar histórico. Tente novamente.
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center p-4 text-gray-500">
        Nenhum registro de histórico encontrado.
      </div>
    );
  }

  return (
    <ScrollArea className="h-[300px] border rounded-md">
      <div className="p-2 space-y-2">
        {data.map((history: any) => (
          <div key={history.id} className="border-b pb-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">{history.user?.name || 'Usuário'}</span>
              <span className="text-gray-500">{new Date(history.created_at).toLocaleString()}</span>
            </div>
            <div className="mt-1">
              <span>{history.action}</span>
            </div>
            {history.old_values && (
              <div className="mt-1 text-xs text-gray-500">
                <div>Valores anteriores: {JSON.stringify(history.old_values)}</div>
                <div>Novos valores: {JSON.stringify(history.new_values)}</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
