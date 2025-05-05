
import React from 'react';

interface EndOfListMessageProps {
  show: boolean;
}

export function EndOfListMessage({ show }: EndOfListMessageProps) {
  if (!show) return null;
  
  return (
    <div className="text-center py-4 text-sm text-muted-foreground">
      Você visualizou todos os agendamentos
    </div>
  );
}
