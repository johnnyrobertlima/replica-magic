
import React from "react";

export const EmptyState: React.FC = () => {
  return (
    <div className="text-center py-8">
      <p className="text-muted-foreground">Nenhum item encontrado para o período selecionado.</p>
    </div>
  );
};
