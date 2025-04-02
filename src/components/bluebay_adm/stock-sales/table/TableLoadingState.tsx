
import React from "react";

export const TableLoadingState: React.FC = () => {
  return (
    <div className="py-12 text-center">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-t-2 border-blue-600"></div>
      <p className="mt-6 text-gray-600 text-lg font-medium">Carregando dados...</p>
      <p className="text-gray-500 text-sm mt-2">
        Isso pode levar alguns instantes para grandes volumes de dados.
      </p>
      <p className="text-gray-500 text-sm mt-1">
        Estamos processando todos os registros disponíveis.
      </p>
    </div>
  );
};
