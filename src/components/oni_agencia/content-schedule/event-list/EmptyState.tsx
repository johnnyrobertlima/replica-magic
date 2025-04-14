
interface EmptyStateProps {
  message?: string;
}

export function EmptyState({ message = "Nenhum agendamento encontrado para os filtros selecionados." }: EmptyStateProps) {
  return (
    <div className="bg-white rounded-md border shadow-sm p-8 text-center">
      <p className="text-muted-foreground">
        {message}
      </p>
    </div>
  );
}
