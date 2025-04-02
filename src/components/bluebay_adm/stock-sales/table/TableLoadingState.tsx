
import React from "react";

export const TableLoadingState: React.FC = () => {
  return (
    <div className="py-8 text-center">
      <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-t-2 border-blue-600"></div>
      <p className="mt-4 text-gray-600 text-lg font-medium">Carregando dados...</p>
      <p className="text-gray-500 text-sm mt-2">
        Isso pode levar alguns instantes para grandes volumes de dados.
      </p>
    </div>
  );
};
