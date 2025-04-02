
import React from "react";

export const TableLoadingState: React.FC = () => {
  return (
    <div className="py-8 text-center">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      <p className="mt-2 text-gray-600">Carregando dados...</p>
    </div>
  );
};
